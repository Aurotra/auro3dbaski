"""Overpass OSM → local-meter polygons."""

from __future__ import annotations

import asyncio
import random
import re
import time
from dataclasses import dataclass, field
import math

import httpx
from shapely.geometry import LineString, Point, Polygon, box
from shapely.ops import polygonize, unary_union
from shapely.strtree import STRtree

from .dem import lonlat_to_local
from .ml_buildings import estimate_height_m, fetch_ml_buildings

# Uydu (ML) bina izleri: bu alandan büyük seçimlerde model şişer, atlanır
ML_MAX_AREA_M2 = 12_000_000
ML_MAX_BUILDINGS = 25_000

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

# Aynalar yoğunken 504/timeout normal; toplam bütçe içinde sırayla tekrar dene.
OVERPASS_BUDGET_S = 150.0
OVERPASS_ATTEMPT_S = 45.0


@dataclass
class Tree:
    """Yerel metre koordinatında ağaç: merkez, taç yarıçapı, yükseklik."""

    x: float
    y: float
    crown_r: float
    height: float


@dataclass
class Road:
    path: list[tuple[float, float]]
    half_width: float
    bridge: bool


@dataclass
class OsmLayer:
    buildings: list[Polygon] = field(default_factory=list)
    building_heights: list[float] = field(default_factory=list)
    roads: list[Road] = field(default_factory=list)
    waters: list[Polygon] = field(default_factory=list)
    greens: list[Polygon] = field(default_factory=list)
    paveds: list[Polygon] = field(default_factory=list)
    trees: list[Tree] = field(default_factory=list)
    coast_lines: list[list[tuple[float, float]]] = field(default_factory=list)


GREEN_LANDUSE = (
    "forest|grass|meadow|orchard|vineyard|village_green|recreation_ground"
    "|allotments|cemetery|farmland|greenfield|plant_nursery"
)
PAVED_LANDUSE = (
    "residential|commercial|industrial|retail|construction|brownfield"
    "|garages|railway"
)
GREEN_NATURAL = "wood|scrub|grassland|heath|tree_row"
GREEN_LEISURE = "park|garden|golf_course|playground|nature_reserve|dog_park"
HARD_SURFACES = (
    "asphalt",
    "concrete",
    "paving_stones",
    "sett",
    "cobblestone",
    "paved",
    "metal",
    "wood",
    "compacted",
    "tartan",
    "artificial_turf",
)
# src/lib/overpass.ts ile aynı bütçe: baskıda ağaç kalabalığı olmasın
TREE_BUDGET = 1500


def _query(west: float, south: float, east: float, north: float) -> str:
    pad = 0.002
    bb = f"{south},{west},{north},{east}"
    bbc = f"{south - pad},{west - pad},{north + pad},{east + pad}"
    return f"""
[out:json][timeout:90];
(
  way["building"]({bb});
  relation["building"]({bb});
  way["highway"]({bb});
  way["landuse"~"^({PAVED_LANDUSE})$"]({bb});
  relation["landuse"~"^({PAVED_LANDUSE})$"]({bb});
  way["landuse"~"^({GREEN_LANDUSE})$"]({bb});
  relation["landuse"~"^({GREEN_LANDUSE})$"]({bb});
  way["natural"~"^({GREEN_NATURAL})$"]({bb});
  relation["natural"~"^({GREEN_NATURAL})$"]({bb});
  way["leisure"~"^({GREEN_LEISURE}|pitch)$"]({bb});
  relation["leisure"~"^({GREEN_LEISURE}|pitch)$"]({bb});
  way["amenity"="parking"]({bb});
  relation["amenity"="parking"]({bb});
  way["place"="square"]({bb});
  way["area:highway"]({bb});
  way["man_made"="pier"]({bb});
  way["man_made"="bridge"]({bb});
  node["natural"="tree"]({bb});
  way["natural"="water"]({bb});
  way["water"]({bb});
  way["waterway"]({bb});
  way["landuse"="reservoir"]({bb});
  way["leisure"="swimming_pool"]({bb});
  relation["natural"="water"]({bb});
  relation["water"]({bb});
  way["natural"="coastline"]({bbc});
);
out body;
>;
out skel qt;
""".strip()


def _building_height(tags: dict) -> float:
    if tags.get("height"):
        try:
            h = float(str(tags["height"]).replace(",", ".").split()[0])
            if h > 0:
                return min(h, 80)
        except ValueError:
            pass
    if tags.get("building:levels"):
        try:
            levels = float(str(tags["building:levels"]).replace(",", "."))
            if levels > 0:
                return min(levels * 3, 80)
        except ValueError:
            pass
    return 9.0


def _road_width(tags: dict) -> float:
    raw = tags.get("width")
    if raw:
        try:
            w = float(str(raw).replace(",", ".").split()[0])
            if w > 1:
                return min(w, 28)
        except ValueError:
            pass
    hw = tags.get("highway", "")
    return {
        "motorway": 16,
        "motorway_link": 16,
        "trunk": 14,
        "trunk_link": 14,
        "primary": 12,
        "primary_link": 12,
        "secondary": 10,
        "secondary_link": 10,
        "tertiary": 9,
        "tertiary_link": 9,
        "residential": 8,
        "unclassified": 8,
        "living_street": 8,
        "service": 5.5,
        "cycleway": 3.2,
        "footway": 2.8,
        "path": 2.8,
        "steps": 2.8,
        "pedestrian": 2.8,
    }.get(hw, 7)


def _is_hard_surface(tags: dict) -> bool:
    return (tags.get("surface") or "").lower() in HARD_SURFACES


def is_wooded(tags: dict) -> bool:
    """Ağaç üretilecek alanlar (src/lib/overpass.ts ile aynı kural)."""
    if tags.get("natural") in ("wood", "tree_row"):
        return True
    if tags.get("landuse") in ("forest", "orchard"):
        return True
    return tags.get("leisure") == "nature_reserve"


def _classify(tags: dict) -> str | None:
    if tags.get("building"):
        return "building"
    if tags.get("natural") == "coastline":
        return "coastline"
    if (
        tags.get("natural") in ("water", "wetland", "bay")
        or tags.get("water")
        or tags.get("landuse") in ("reservoir", "basin")
        or tags.get("leisure") == "swimming_pool"
        or (tags.get("waterway") or "")
        in ("river", "riverbank", "stream", "canal", "drain", "ditch")
    ):
        return "water"

    surface = (tags.get("surface") or "").lower()
    if (
        tags.get("area:highway")
        or tags.get("place") == "square"
        or tags.get("man_made") == "pier"
        or (
            tags.get("amenity") == "parking"
            and surface not in ("grass", "gravel", "ground", "dirt")
        )
        or (
            tags.get("highway") in ("pedestrian", "footway", "service", "platform")
            and tags.get("area") == "yes"
        )
        or (tags.get("leisure") == "pitch" and _is_hard_surface(tags))
        or re.match(f"^({PAVED_LANDUSE})$", tags.get("landuse") or "")
    ):
        return "paved"

    if (
        re.match(f"^({GREEN_LANDUSE})$", tags.get("landuse") or "")
        or re.match(f"^({GREEN_NATURAL})$", tags.get("natural") or "")
        or re.match(f"^({GREEN_LEISURE})$", tags.get("leisure") or "")
        or (tags.get("leisure") == "pitch" and not _is_hard_surface(tags))
    ):
        return "green"

    if tags.get("highway"):
        return "road"
    if tags.get("man_made") == "bridge":
        return "road"
    return None


def _is_bridge(tags: dict) -> bool:
    b = (tags.get("bridge") or "").lower()
    if b and b != "no":
        return True
    if (tags.get("man_made") or "").lower() == "bridge":
        return True
    return False


def _is_tunnel(tags: dict) -> bool:
    t = (tags.get("tunnel") or "").lower()
    return bool(t and t != "no")


def _crown_radius(tags: dict) -> float:
    raw = tags.get("diameter_crown")
    if raw:
        try:
            d = float(str(raw).replace(",", ".").split()[0])
            if 1 < d < 40:
                return d / 2
        except ValueError:
            pass
    if tags.get("landuse") in ("orchard", "vineyard"):
        return 3.0
    return 4.5


def _tree_height(tags: dict) -> float:
    raw = tags.get("height")
    if raw:
        try:
            h = float(str(raw).replace(",", ".").split()[0])
            if 1 < h < 80:
                return h
        except ValueError:
            pass
    if tags.get("landuse") in ("orchard", "vineyard"):
        return 5.0
    if tags.get("natural") == "tree":
        return 8.0
    return 10.0


def _scatter_trees(poly: Polygon, tags: dict, budget: int) -> list[Tree]:
    """Ağaçlı alana ızgara + sabit sapma ile ağaç serp (deterministik)."""
    crown = _crown_radius(tags)
    height = _tree_height(tags)
    # Aralık taç çapından geniş kalsın (src/lib/overpass.ts ile aynı)
    spacing = max(22.0, crown * 4.5)
    minx, miny, maxx, maxy = poly.bounds
    rnd = random.Random(int(abs(minx) * 1000) ^ int(abs(miny) * 1000))
    out: list[Tree] = []

    y = miny + spacing * 0.5
    while y <= maxy and len(out) < budget:
        x = minx + spacing * 0.5
        while x <= maxx and len(out) < budget:
            jx = x + (rnd.random() - 0.5) * spacing * 0.5
            jy = y + (rnd.random() - 0.5) * spacing * 0.5
            if poly.contains(Point(jx, jy)):
                out.append(Tree(jx, jy, crown, height))
            x += spacing
        y += spacing
    return out


def _way_pts(way: dict, nodes: dict, origin: tuple[float, float]) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    for nid in way.get("nodes", []):
        n = nodes.get(nid)
        if not n:
            continue
        pts.append(lonlat_to_local(n["lon"], n["lat"], origin[0], origin[1]))
    return pts


def _poly_from_ring(pts: list[tuple[float, float]]) -> Polygon | None:
    if len(pts) < 3:
        return None
    ring = list(pts)
    if ring[0] != ring[-1]:
        ring.append(ring[0])
    if len(ring) < 4:
        return None
    try:
        p = Polygon(ring)
        if not p.is_valid:
            p = p.buffer(0)
        if p.is_empty or p.area < 2:
            return None
        if p.geom_type == "MultiPolygon":
            p = max(p.geoms, key=lambda g: g.area)
        return p if p.geom_type == "Polygon" else None
    except Exception:
        return None


def _cap_building_height(height: float, area: float) -> float:
    h = min(float(height), 80.0)
    if area > 4:
        slim = h / math.sqrt(area)
        if slim > 5.5:
            h = min(h, max(8.0, math.sqrt(area) * 1.4))
    return h


def _dist_point_seg(
    px: float, py: float, ax: float, ay: float, bx: float, by: float
) -> float:
    dx, dy = bx - ax, by - ay
    len2 = dx * dx + dy * dy
    if len2 < 1e-8:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / len2))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def _near_path(
    pt: tuple[float, float], path: list[tuple[float, float]], limit: float
) -> bool:
    px, py = pt
    for i in range(len(path) - 1):
        ax, ay = path[i]
        bx, by = path[i + 1]
        if px < min(ax, bx) - limit or px > max(ax, bx) + limit:
            continue
        if py < min(ay, by) - limit or py > max(ay, by) + limit:
            continue
        if _dist_point_seg(px, py, ax, ay, bx, by) <= limit:
            return True
    return False


def _cross_side(ax, ay, bx, by, px, py) -> float:
    return (bx - ax) * (py - ay) - (by - ay) * (px - ax)


def _is_water_side(
    x: float, y: float, coast: list[list[tuple[float, float]]]
) -> bool:
    best = float("inf")
    side = 0.0
    for line in coast:
        for i in range(len(line) - 1):
            ax, ay = line[i]
            bx, by = line[i + 1]
            dx, dy = bx - ax, by - ay
            len2 = dx * dx + dy * dy or 1.0
            t = max(0.0, min(1.0, ((x - ax) * dx + (y - ay) * dy) / len2))
            qx, qy = ax + t * dx, ay + t * dy
            d2 = (x - qx) ** 2 + (y - qy) ** 2
            if d2 < best:
                best = d2
                side = _cross_side(ax, ay, bx, by, x, y)
    if best == float("inf"):
        return False
    return side < 0


def _coast_water_polys(
    coast_lines: list[list[tuple[float, float]]],
    width: float,
    depth: float,
) -> list[Polygon]:
    if not coast_lines:
        return []
    frame = box(0, 0, width, depth)
    segs = [LineString(c) for c in coast_lines if len(c) >= 2]
    if not segs:
        return []
    try:
        merged = unary_union(segs + [frame.boundary])
        polys = list(polygonize(merged))
    except Exception:
        return []
    out: list[Polygon] = []
    for p in polys:
        if p.is_empty or p.area < 8:
            continue
        c = p.centroid
        if not _is_water_side(float(c.x), float(c.y), coast_lines):
            continue
        try:
            g = p.intersection(frame)
        except Exception:
            continue
        if g.geom_type == "Polygon" and g.area > 8:
            out.append(g)
        elif g.geom_type == "MultiPolygon":
            out.extend(x for x in g.geoms if x.area > 8)
    return out


def _finalize_layer(layer: OsmLayer, width: float, depth: float) -> None:
    if layer.coast_lines:
        layer.waters.extend(_coast_water_polys(layer.coast_lines, width, depth))
    if layer.waters:
        try:
            merged = unary_union(layer.waters)
            if merged.geom_type == "Polygon":
                layer.waters = [merged]
            elif merged.geom_type == "MultiPolygon":
                layer.waters = [g for g in merged.geoms if g.area > 8]
        except Exception:
            pass

    kept_b: list[Polygon] = []
    kept_h: list[float] = []
    for poly, h in zip(layer.buildings, layer.building_heights):
        c = poly.centroid
        wet = False
        for w in layer.waters:
            try:
                if w.contains(c) or w.covers(c):
                    wet = True
                    break
            except Exception:
                pass
        if wet:
            continue
        kept_b.append(poly)
        kept_h.append(_cap_building_height(h, float(poly.area)))
    layer.buildings = kept_b
    layer.building_heights = kept_h

    kept_t: list[Tree] = []
    for t in layer.trees:
        pt = Point(t.x, t.y)
        skip = False
        for w in layer.waters:
            try:
                if w.contains(pt) or w.covers(pt):
                    skip = True
                    break
            except Exception:
                pass
        if skip:
            continue
        for road in layer.roads:
            if _near_path((t.x, t.y), road.path, road.half_width + 4.0):
                skip = True
                break
        if not skip:
            kept_t.append(t)
    layer.trees = kept_t


async def add_ml_buildings(
    layer: OsmLayer, west: float, south: float, east: float, north: float
) -> int:
    """OSM'de eksik binaları uydu tabanlı ML izleriyle tamamla.

    OSM binaları elle çizildiği için üstündür; ML izlerinden onlarla örtüşenler
    atılır. Eklenen bina sayısını döndürür.
    """
    width, depth = lonlat_to_local(east, north, west, south)
    if width * depth > ML_MAX_AREA_M2:
        return 0

    found = await fetch_ml_buildings(west, south, east, north)
    if not found:
        return 0

    existing = list(layer.buildings)
    tree = STRtree(existing) if existing else None
    added = 0

    for item in found:
        if len(layer.buildings) >= ML_MAX_BUILDINGS:
            break
        pts = [lonlat_to_local(lon, lat, west, south) for lon, lat in item.ring]
        poly = _poly_from_ring(pts)
        if poly is None:
            continue

        if tree is not None:
            overlapped = False
            for idx in tree.query(poly):
                other = existing[idx]
                inter = poly.intersection(other).area
                if inter > 0.25 * min(poly.area, other.area):
                    overlapped = True
                    break
            if overlapped:
                continue

        layer.buildings.append(poly)
        layer.building_heights.append(item.height or estimate_height_m(poly.area))
        added += 1

    return added


async def fetch_osm(
    west: float, south: float, east: float, north: float
) -> OsmLayer:
    query = _query(west, south, east, north)
    data = None
    last_err: Exception | None = None
    deadline = time.monotonic() + OVERPASS_BUDGET_S
    round_no = 0

    async with httpx.AsyncClient(timeout=OVERPASS_ATTEMPT_S) as client:
        while data is None and time.monotonic() < deadline:
            for url in OVERPASS_URLS:
                if time.monotonic() >= deadline:
                    break
                try:
                    res = await client.post(
                        url,
                        data={"data": query},
                        headers={
                            "Content-Type": "application/x-www-form-urlencoded",
                            "User-Agent": "auro3dmap/1.0 (+https://github.com)",
                            "Accept": "application/json",
                        },
                    )
                    res.raise_for_status()
                    data = res.json()
                    break
                except Exception as exc:
                    last_err = exc
            if data is not None:
                break
            round_no += 1
            wait = 1.5 if round_no == 1 else 4.0
            if time.monotonic() + wait >= deadline:
                break
            await asyncio.sleep(wait)

    if data is None:
        raise RuntimeError(
            "Overpass sunucuları şu an yoğun (yanıt vermedi). "
            f"Birkaç saniye sonra tekrar deneyin ya da alanı küçültün. ({last_err})"
        )

    nodes: dict[int, dict] = {}
    ways: dict[int, dict] = {}
    relations: list[dict] = []
    for el in data.get("elements", []):
        t = el.get("type")
        if t == "node":
            nodes[el["id"]] = el
        elif t == "way":
            ways[el["id"]] = el
        elif t == "relation":
            relations.append(el)

    origin = (west, south)
    layer = OsmLayer()
    used: set[int] = set()

    def add_water(poly: Polygon | None) -> None:
        if poly is None or poly.is_empty:
            return
        layer.waters.append(poly)

    wooded: list[tuple[Polygon, dict]] = []

    def add_ground(kind: str, poly: Polygon | None, tags: dict) -> None:
        if poly is None or poly.is_empty:
            return
        if kind == "green":
            layer.greens.append(poly)
            if is_wooded(tags):
                wooded.append((poly, tags))
        else:
            layer.paveds.append(poly)

    for rel in relations:
        tags = rel.get("tags") or {}
        kind = _classify(tags)
        if kind not in ("building", "water", "green", "paved"):
            continue
        rings: list[list[tuple[float, float]]] = []
        for m in rel.get("members", []):
            if m.get("type") != "way":
                continue
            role = (m.get("role") or "outer").lower()
            if role != "outer":
                continue
            w = ways.get(m.get("ref"))
            if not w:
                continue
            used.add(w["id"])
            pts = _way_pts(w, nodes, origin)
            if len(pts) >= 2:
                rings.append(pts)
        for ring in rings:
            poly = _poly_from_ring(ring)
            if kind == "building" and poly:
                layer.buildings.append(poly)
                layer.building_heights.append(_building_height(tags))
            elif kind == "water":
                add_water(poly)
            elif kind in ("green", "paved"):
                add_ground(kind, poly, tags)

    for way in ways.values():
        if way["id"] in used:
            continue
        tags = way.get("tags") or {}
        kind = _classify(tags)
        if not kind:
            continue
        pts = _way_pts(way, nodes, origin)
        if len(pts) < 2:
            continue

        if kind == "coastline":
            if len(pts) >= 2:
                layer.coast_lines.append(pts)
            continue

        if kind == "road":
            if _is_tunnel(tags):
                continue
            if len(pts) >= 2:
                layer.roads.append(
                    Road(pts, _road_width(tags) / 2.0, _is_bridge(tags))
                )
            continue

        if kind == "water":
            closed = len(pts) >= 4 and pts[0] == pts[-1]
            if closed:
                add_water(_poly_from_ring(pts))
            else:
                try:
                    line = LineString(pts)
                    buf = line.buffer(4, cap_style=2)
                    if buf.geom_type == "Polygon":
                        add_water(buf)
                    elif buf.geom_type == "MultiPolygon":
                        for g in buf.geoms:
                            add_water(g)
                except Exception:
                    pass
            continue

        if kind == "building":
            poly = _poly_from_ring(pts)
            if poly:
                layer.buildings.append(poly)
                layer.building_heights.append(_building_height(tags))
            continue

        if kind in ("green", "paved"):
            closed = len(pts) >= 4 and pts[0] == pts[-1]
            if closed:
                add_ground(kind, _poly_from_ring(pts), tags)
            elif kind == "green" and is_wooded(tags):
                # Ağaç sırası: çizgi boyunca ağaç
                try:
                    line = LineString(pts)
                    step = max(22.0, _crown_radius(tags) * 4.5)
                    dist = step * 0.5
                    while dist < line.length and len(layer.trees) < TREE_BUDGET:
                        p = line.interpolate(dist)
                        layer.trees.append(
                            Tree(
                                float(p.x),
                                float(p.y),
                                _crown_radius(tags),
                                _tree_height(tags),
                            )
                        )
                        dist += step
                except Exception:
                    pass

    for node in nodes.values():
        if (node.get("tags") or {}).get("natural") != "tree":
            continue
        if len(layer.trees) >= TREE_BUDGET:
            break
        x, y = lonlat_to_local(node["lon"], node["lat"], origin[0], origin[1])
        layer.trees.append(
            Tree(x, y, _crown_radius(node["tags"]), _tree_height(node["tags"]))
        )

    # Büyük ormanlar öncelikli: bütçe bitse de boş orman kalmasın
    for poly, tags in sorted(wooded, key=lambda item: -item[0].area):
        left = TREE_BUDGET - len(layer.trees)
        if left <= 0:
            break
        layer.trees.extend(_scatter_trees(poly, tags, left))

    # Coastline: fill water as bbox minus land-side is hard; skip if no tagged water
    # Merge overlapping water
    if layer.waters:
        try:
            merged = unary_union(layer.waters)
            if merged.geom_type == "Polygon":
                layer.waters = [merged]
            elif merged.geom_type == "MultiPolygon":
                layer.waters = [g for g in merged.geoms if g.area > 8]
        except Exception:
            pass

    width, depth = lonlat_to_local(east, north, west, south)
    _finalize_layer(layer, width, depth)

    return layer
