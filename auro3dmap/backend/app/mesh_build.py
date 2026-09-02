"""Solid printable meshes from DEM + OSM + GPX."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
import math

import numpy as np
import trimesh
from shapely.geometry import LineString, Point, Polygon, box
from shapely.validation import make_valid

from .dem import HeightGrid


# src/types.ts içindeki LAYER_COLORS ile aynı kalmalı
COLORS = {
    "terrain": (125, 106, 82, 255),
    "water": (31, 158, 201, 255),
    "road": (230, 226, 216, 255),
    "paved": (142, 146, 153, 255),
    "green": (74, 155, 63, 255),
    "tree": (47, 143, 68, 255),
    "trunk": (107, 68, 35, 255),
    "building": (192, 139, 87, 255),
    "route": (193, 18, 31, 255),
}


@dataclass
class MeshPart:
    name: str
    mesh: trimesh.Trimesh
    color: tuple[int, int, int, int]


def _clip_poly(poly: Polygon, width_m: float, depth_m: float) -> list[Polygon]:
    frame = box(0, 0, width_m, depth_m)
    try:
        g = make_valid(poly).intersection(frame)
    except Exception:
        return []
    if g.is_empty:
        return []
    if g.geom_type == "Polygon":
        return [g] if g.area > 2 else []
    if g.geom_type == "MultiPolygon":
        return [p for p in g.geoms if p.area > 2]
    return []


def _clip_line_to_box(
    pts: list[tuple[float, float]], width_m: float, depth_m: float
) -> list[list[tuple[float, float]]]:
    """Yol/rota çizgisini seçim kutusuna kırp — OSM way'i sınırın çok
    dışına taşan uçlara sahip olabilir; kırpılmazsa 3MF'de yollar seçilen
    alandan fazla basılır."""
    if len(pts) < 2:
        return []
    frame = box(0, 0, width_m, depth_m)
    try:
        g = LineString(pts).intersection(frame)
    except Exception:
        return []
    if g.is_empty:
        return []
    if g.geom_type == "LineString":
        coords = [(float(x), float(y)) for x, y in g.coords]
        return [coords] if len(coords) >= 2 else []
    if g.geom_type == "MultiLineString":
        out = []
        for seg in g.geoms:
            coords = [(float(x), float(y)) for x, y in seg.coords]
            if len(coords) >= 2:
                out.append(coords)
        return out
    return []


def _poly_to_extrusion(
    poly: Polygon,
    z0: float,
    height: float,
    scale: float,
) -> trimesh.Trimesh | None:
    if height <= 0 or poly.is_empty or poly.exterior is None:
        return None
    coords = list(poly.exterior.coords)
    if len(coords) < 4:
        return None
    path = [[float(x) * scale, float(y) * scale] for x, y in coords]
    try:
        mesh = trimesh.creation.extrude_polygon(
            Polygon(path), height=max(height, 0.15 * scale)
        )
        mesh.apply_translation([0, 0, z0])
        return mesh
    except Exception:
        return None


def _drape(
    mesh: trimesh.Trimesh,
    ground: Callable[[float, float], float],
    height: float,
) -> trimesh.Trimesh:
    """Düz prizmayı araziye giydir: her köşe kendi zemin kotuna otursun.

    Yol/su/zemin katmanları böylece eğimde havada kalmaz. Taban biraz gömülür
    ki arazi ile arada boşluk oluşmasın.
    """
    verts = mesh.vertices.copy()
    sink = min(height * 0.25, 0.08)
    for i in range(len(verts)):
        g = ground(float(verts[i][0]), float(verts[i][1]))
        verts[i][2] = g + height if verts[i][2] > height * 0.5 else g - sink
    mesh.vertices = verts
    return mesh


def _tree_parts(
    cx: float,
    cy: float,
    ground_z: float,
    crown_r_m: float,
    height_m: float,
    scale: float,
    sides: int = 8,
) -> tuple[trimesh.Trimesh | None, trimesh.Trimesh | None]:
    """Gövde kahverengi, taç yeşil — src/lib/treeSolid.ts ile aynı profil."""
    crown = max(crown_r_m * scale, 1.1)
    height = max(height_m * scale, crown * 3.2)
    trunk_top = height * 0.24
    trunk = max(crown * 0.34, 0.65)
    sink = min(0.6, height * 0.15)
    crown_widest = trunk_top + (height - trunk_top) * 0.42

    def lathe(profile: list[tuple[float, float]], apex_z: float) -> trimesh.Trimesh | None:
        angles = np.linspace(0, 2 * np.pi, sides, endpoint=False)
        cos = np.cos(angles)
        sin = np.sin(angles)
        verts: list[list[float]] = [[cx, cy, ground_z + profile[0][1]]]
        ring_start: list[int] = []
        for r, z in profile:
            ring_start.append(len(verts))
            for s in range(sides):
                verts.append([cx + cos[s] * r, cy + sin[s] * r, ground_z + z])
        apex = len(verts)
        verts.append([cx, cy, ground_z + apex_z])
        faces: list[list[int]] = []
        for s in range(sides):
            s1 = (s + 1) % sides
            faces.append([0, ring_start[0] + s1, ring_start[0] + s])
            for i in range(len(profile) - 1):
                a = ring_start[i] + s
                b = ring_start[i] + s1
                c = ring_start[i + 1] + s1
                d = ring_start[i + 1] + s
                faces.append([a, b, c])
                faces.append([a, c, d])
            top = ring_start[-1]
            faces.append([top + s, top + s1, apex])
        try:
            return trimesh.Trimesh(
                vertices=np.array(verts), faces=np.array(faces), process=False
            )
        except Exception:
            return None

    trunk_m = lathe([(trunk, -sink), (trunk, trunk_top)], trunk_top)
    crown_m = lathe(
        [
            (trunk * 1.08, trunk_top * 0.9),
            (crown, crown_widest),
            (crown * 0.22, trunk_top + (height - trunk_top) * 0.88),
        ],
        height,
    )
    return trunk_m, crown_m


def build_terrain(grid: HeightGrid, scale: float, base_h: float, relief: float) -> trimesh.Trimesh:
    rel = grid.relative()
    rows, cols = rel.shape
    w = grid.width_m * scale
    d = grid.depth_m * scale

    xs = np.linspace(0, w, cols)
    ys = np.linspace(0, d, rows)
    xx, yy = np.meshgrid(xs, ys)
    zz = base_h + rel * relief * scale

    # Top + bottom vertices
    top = np.column_stack([xx.ravel(), yy.ravel(), zz.ravel()])
    bot = np.column_stack([xx.ravel(), yy.ravel(), np.zeros(rows * cols)])
    verts = np.vstack([top, bot])
    bot_off = rows * cols

    faces: list[list[int]] = []
    for r in range(rows - 1):
        for c in range(cols - 1):
            i = r * cols + c
            faces.append([i, i + cols, i + 1])
            faces.append([i + 1, i + cols, i + cols + 1])
            faces.append([bot_off + i, bot_off + i + 1, bot_off + i + cols])
            faces.append([bot_off + i + 1, bot_off + i + cols + 1, bot_off + i + cols])

    for c in range(cols - 1):
        faces.append([c, bot_off + c, c + 1])
        faces.append([c + 1, bot_off + c, bot_off + c + 1])
        j = (rows - 1) * cols + c
        faces.append([j, j + 1, bot_off + j])
        faces.append([j + 1, bot_off + j + 1, bot_off + j])
    for r in range(rows - 1):
        i = r * cols
        faces.append([i, i + cols, bot_off + i])
        faces.append([i + cols, bot_off + i + cols, bot_off + i])
        j = r * cols + (cols - 1)
        faces.append([j, bot_off + j, j + cols])
        faces.append([j + cols, bot_off + j, bot_off + j + cols])

    mesh = trimesh.Trimesh(vertices=verts, faces=np.array(faces), process=False)
    mesh.remove_unreferenced_vertices()
    return mesh


# Baskı öncesi otomatik onarım: delik doldurma/normal düzeltme büyük
# mesh'lerde yavaş olabileceğinden yalnızca makul boyuttaki parçalara uygulanır.
_REPAIR_MAX_FACES = 300_000


def _repair_mesh(mesh: trimesh.Trimesh | None) -> trimesh.Trimesh | None:
    """Baskı öncesi doğrulama/onarım: dejenere/duplike yüzeyleri temizle,
    su geçirmez değilse delikleri doldurup normalleri düzelt. Hata olursa
    orijinal mesh'i olduğu gibi döndür (export'u bozmasın)."""
    if mesh is None or len(mesh.faces) == 0:
        return mesh
    try:
        mesh.remove_infinite_values()
        mesh.remove_degenerate_faces()
        mesh.remove_duplicate_faces()
        mesh.merge_vertices()
        if len(mesh.faces) <= _REPAIR_MAX_FACES:
            if not mesh.is_watertight:
                trimesh.repair.fill_holes(mesh)
            if not mesh.is_winding_consistent:
                mesh.fix_normals()
    except Exception:
        pass
    return mesh


def _merge(meshes: list[trimesh.Trimesh]) -> trimesh.Trimesh | None:
    valid = [m for m in meshes if m is not None and len(m.faces) > 0]
    if not valid:
        return None
    if len(valid) == 1:
        return valid[0]
    return trimesh.util.concatenate(valid)


def _visible_relief(grid: HeightGrid, user_relief: float) -> float:
    user = max(0.5, min(user_relief, 8.0))
    rng = grid.max_elev - grid.min_elev
    if rng < 1:
        return user
    min_side = min(grid.width_m, grid.depth_m)
    needed = (min_side * 0.1) / rng
    return max(user, min(needed, 10.0))


def _layer_height(kind: str, print_side: float) -> float:
    """src/lib/meshBuilder.ts featureHeightMm ile aynı kalınlıklar (mm)."""
    if kind == "road":
        return min(0.42, max(0.32, print_side * 0.001))
    if kind == "paved":
        return min(0.28, max(0.18, print_side * 0.0007))
    if kind == "water":
        return min(0.28, max(0.18, print_side * 0.0007))
    return min(0.22, max(0.14, print_side * 0.00055))


def _cross_side(ax, ay, bx, by, px, py) -> float:
    return (bx - ax) * (py - ay) - (by - ay) * (px - ax)


def _is_water_coast(
    x: float,
    y: float,
    coast: list[list[tuple[float, float]]],
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


def _grid_skin(
    grid: HeightGrid,
    scale: float,
    base_h: float,
    relief: float,
    height: float,
    occupied: np.ndarray,
) -> trimesh.Trimesh | None:
    rows, cols = grid.rows, grid.cols
    if rows < 2 or cols < 2:
        return None
    rel = grid.relative()
    w = grid.width_m * scale
    d = grid.depth_m * scale
    sink = min(height * 0.45, 0.12)
    verts: list[list[float]] = []
    faces: list[list[int]] = []

    def z_at(r: int, c: int) -> float:
        return base_h + max(0.0, float(rel[r, c])) * relief * scale

    for r in range(rows - 1):
        for c in range(cols - 1):
            if not occupied[r, c]:
                continue
            x0 = (c / (cols - 1)) * w
            x1 = ((c + 1) / (cols - 1)) * w
            y0 = (r / (rows - 1)) * d
            y1 = ((r + 1) / (rows - 1)) * d
            zs = (z_at(r, c), z_at(r, c + 1), z_at(r + 1, c + 1), z_at(r + 1, c))
            bot = [
                [x0, y0, zs[0] - sink],
                [x1, y0, zs[1] - sink],
                [x1, y1, zs[2] - sink],
                [x0, y1, zs[3] - sink],
            ]
            top = [
                [x0, y0, zs[0] + height],
                [x1, y0, zs[1] + height],
                [x1, y1, zs[2] + height],
                [x0, y1, zs[3] + height],
            ]
            b = len(verts)
            verts.extend(bot)
            verts.extend(top)
            faces.extend(
                [
                    [b, b + 2, b + 1],
                    [b, b + 3, b + 2],
                    [b + 4, b + 5, b + 6],
                    [b + 4, b + 6, b + 7],
                    [b, b + 1, b + 5],
                    [b, b + 5, b + 4],
                    [b + 1, b + 2, b + 6],
                    [b + 1, b + 6, b + 5],
                    [b + 2, b + 3, b + 7],
                    [b + 2, b + 7, b + 6],
                    [b + 3, b, b + 4],
                    [b + 3, b + 4, b + 7],
                ]
            )
    if not faces:
        return None
    return trimesh.Trimesh(vertices=np.array(verts), faces=np.array(faces), process=False)


def _densify(path: list[tuple[float, float]], step: float) -> list[tuple[float, float]]:
    out: list[tuple[float, float]] = []
    for i, cur in enumerate(path):
        if i == 0:
            out.append(cur)
            continue
        prev = path[i - 1]
        dist = math.hypot(cur[0] - prev[0], cur[1] - prev[1])
        n = max(1, int(math.ceil(dist / max(0.8, step))))
        for k in range(1, n + 1):
            t = k / n
            out.append((prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t))
    cleaned: list[tuple[float, float]] = []
    for p in out:
        if not cleaned or math.hypot(p[0] - cleaned[-1][0], p[1] - cleaned[-1][1]) > 0.12:
            cleaned.append(p)
    return cleaned


def _path_len(path: list[tuple[float, float]]) -> float:
    n = 0.0
    for i in range(1, len(path)):
        n += math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1])
    return n


def _densify_poly(poly: Polygon, step: float) -> Polygon:
    coords = list(poly.exterior.coords)
    pts = _densify([(float(x), float(y)) for x, y in coords], step)
    if len(pts) < 4:
        return poly
    if pts[0] != pts[-1]:
        pts.append(pts[0])
    try:
        p = Polygon(pts)
        if p.is_valid and not p.is_empty:
            return p
    except Exception:
        pass
    return poly


def _drape_poly(
    poly: Polygon,
    scale: float,
    ground: Callable[[float, float], float],
    height: float,
) -> trimesh.Trimesh | None:
    dense = _densify_poly(poly, 7.0)
    mesh = _poly_to_extrusion(dense, 0.0, height, scale)
    if mesh is None:
        return None
    return _drape(mesh, ground, height)


def _perp(pts: list[tuple[float, float]], i: int) -> tuple[float, float]:
    a = pts[max(0, i - 1)]
    b = pts[min(len(pts) - 1, i + 1)]
    dx, dy = b[0] - a[0], b[1] - a[1]
    ln = math.hypot(dx, dy) or 1.0
    return -dy / ln, dx / ln


def _ribbon(
    path: list[tuple[float, float]],
    half: float,
    scale: float,
    ground_at: Callable[[float, float], float],
    height: float,
    step: float,
    bridge: bool,
) -> trimesh.Trimesh | None:
    pts = _densify(path, step)
    if len(pts) < 2:
        return None
    sink = min(height * 0.22, 0.07)
    z_a = ground_at(pts[0][0] * scale, pts[0][1] * scale)
    z_b = ground_at(pts[-1][0] * scale, pts[-1][1] * scale)
    total = 0.0
    dist = [0.0]
    for i in range(1, len(pts)):
        total += math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
        dist.append(total)
    if total < 1e-3:
        return None

    left: list[tuple[float, float, float]] = []
    right: list[tuple[float, float, float]] = []
    deck: list[float] = []
    for i, (x, y) in enumerate(pts):
        if bridge:
            z = z_a + (z_b - z_a) * (dist[i] / total)
        else:
            z = ground_at(x * scale, y * scale)
        nx, ny = _perp(pts, i)
        lx, ly = (x + nx * half) * scale, (y + ny * half) * scale
        rx, ry = (x - nx * half) * scale, (y - ny * half) * scale
        if bridge:
            left.append((lx, ly, z))
            right.append((rx, ry, z))
        else:
            left.append((lx, ly, ground_at(lx, ly)))
            right.append((rx, ry, ground_at(rx, ry)))
        deck.append(z if bridge else (left[-1][2] + right[-1][2]) * 0.5)

    verts: list[list[float]] = []
    faces: list[list[int]] = []
    for i in range(len(pts) - 1):
        bot = [
            [left[i][0], left[i][1], left[i][2] - sink],
            [right[i][0], right[i][1], right[i][2] - sink],
            [right[i + 1][0], right[i + 1][1], right[i + 1][2] - sink],
            [left[i + 1][0], left[i + 1][1], left[i + 1][2] - sink],
        ]
        top = [
            [left[i][0], left[i][1], left[i][2] + height],
            [right[i][0], right[i][1], right[i][2] + height],
            [right[i + 1][0], right[i + 1][1], right[i + 1][2] + height],
            [left[i + 1][0], left[i + 1][1], left[i + 1][2] + height],
        ]
        b = len(verts)
        verts.extend(bot)
        verts.extend(top)
        faces.extend(
            [
                [b, b + 2, b + 1],
                [b, b + 3, b + 2],
                [b + 4, b + 5, b + 6],
                [b + 4, b + 6, b + 7],
                [b, b + 1, b + 5],
                [b, b + 5, b + 4],
                [b + 1, b + 2, b + 6],
                [b + 1, b + 6, b + 5],
                [b + 2, b + 3, b + 7],
                [b + 2, b + 7, b + 6],
                [b + 3, b, b + 4],
                [b + 3, b + 4, b + 7],
            ]
        )

    if bridge:
        pier_step = max(28.0, half * 8)
        pier_h = max(0.55, min(half * scale * 0.35, 1.0))
        acc = 0.0
        for i in range(1, len(pts) - 1):
            acc += math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
            if acc < pier_step:
                continue
            acc = 0.0
            cx, cy = pts[i][0] * scale, pts[i][1] * scale
            g = ground_at(cx, cy)
            top = deck[i] - sink
            if top - g < 2.2:
                continue
            b = len(verts)
            x0, x1 = cx - pier_h, cx + pier_h
            y0, y1 = cy - pier_h, cy + pier_h
            verts.extend(
                [
                    [x0, y0, g - 0.15],
                    [x1, y0, g - 0.15],
                    [x1, y1, g - 0.15],
                    [x0, y1, g - 0.15],
                    [x0, y0, top],
                    [x1, y0, top],
                    [x1, y1, top],
                    [x0, y1, top],
                ]
            )
            faces.extend(
                [
                    [b, b + 2, b + 1],
                    [b, b + 3, b + 2],
                    [b + 4, b + 5, b + 6],
                    [b + 4, b + 6, b + 7],
                    [b, b + 1, b + 5],
                    [b, b + 5, b + 4],
                    [b + 1, b + 2, b + 6],
                    [b + 1, b + 6, b + 5],
                    [b + 2, b + 3, b + 7],
                    [b + 2, b + 7, b + 6],
                    [b + 3, b, b + 4],
                    [b + 3, b + 4, b + 7],
                ]
            )

    if not faces:
        return None
    return trimesh.Trimesh(vertices=np.array(verts), faces=np.array(faces), process=False)


def _plant_building(
    mesh: trimesh.Trimesh,
    z_roof: float,
    ground_at: Callable[[float, float], float],
) -> trimesh.Trimesh:
    verts = mesh.vertices.copy()
    z = verts[:, 2]
    mid = float((z.min() + z.max()) * 0.5)
    for i in range(len(verts)):
        g = ground_at(float(verts[i][0]), float(verts[i][1]))
        verts[i][2] = z_roof if verts[i][2] > mid else g - 0.18
    mesh.vertices = verts
    return mesh


def build_parts(
    grid: HeightGrid,
    buildings: list[Polygon],
    building_heights: list[float],
    roads: list[object],
    waters: list[Polygon],
    route_pts: list[tuple[float, float]],
    scale: float,
    relief: float,
    greens: list[Polygon] | None = None,
    paveds: list[Polygon] | None = None,
    trees: list[object] | None = None,
    coast_lines: list[list[tuple[float, float]]] | None = None,
    raise_route: bool = True,
    min_feature_mm: float = 0.8,
) -> list[MeshPart]:
    base_h = max(1.2 * scale, 0.8)
    relief = _visible_relief(grid, relief)
    print_side = min(grid.width_m, grid.depth_m) * scale
    min_half_width_m = min_feature_mm / (2 * max(scale, 1e-6))
    parts: list[MeshPart] = []

    terrain = build_terrain(grid, scale, base_h, relief)
    parts.append(MeshPart("arazi", terrain, COLORS["terrain"]))

    def ground_at(x_mm: float, y_mm: float) -> float:
        e = grid.sample(x_mm / scale, y_mm / scale)
        return base_h + max(0.0, float(e)) * relief * scale

    def z_range(poly: Polygon) -> tuple[float, float]:
        xs, ys = poly.exterior.coords.xy
        samples = list(zip(xs, ys))
        minx, miny, maxx, maxy = poly.bounds
        for iy in range(1, 4):
            for ix in range(1, 4):
                samples.append(
                    (minx + (maxx - minx) * ix / 4, miny + (maxy - miny) * iy / 4)
                )
        zs = [
            base_h + max(0.0, float(grid.sample(float(x), float(y)))) * relief * scale
            for x, y in samples
        ]
        return min(zs), max(zs)

    rows, cols = grid.rows, grid.cols
    cell = min(grid.width_m / max(1, cols - 1), grid.depth_m / max(1, rows - 1))
    step = max(3.0, min(8.0, cell * 0.85))

    def add_ground(polys: list[Polygon] | None, kind: str, name: str) -> None:
        meshes: list[trimesh.Trimesh] = []
        h = _layer_height(kind, print_side)
        for poly in polys or []:
            for p in _clip_poly(poly, grid.width_m, grid.depth_m):
                m = _drape_poly(p, scale, ground_at, h)
                if m:
                    meshes.append(m)
        merged = _merge(meshes)
        if merged:
            parts.append(MeshPart(name, merged, COLORS[kind]))

    add_ground(paveds, "paved", "beton zemin")
    add_ground(greens, "green", "yesil alanlar")
    add_ground(waters, "water", "sular")
    _ = coast_lines

    road_meshes: list[trimesh.Trimesh] = []
    for road in roads:
        path = getattr(road, "path", None)
        if not path:
            continue
        half_width = max(float(getattr(road, "half_width", 3.5)), min_half_width_m)
        is_bridge = bool(getattr(road, "bridge", False))
        # OSM way'i genelde seçim bbox'ının çok dışına taşan uçlarla gelir
        # (Overpass sınırı kesen yolları bütünüyle döndürür) — kırpılmazsa
        # baskıda yollar seçilen alandan fazla çıkar.
        for pts in _clip_line_to_box(list(path), grid.width_m, grid.depth_m):
            tagged = is_bridge and _path_len(pts) >= 14
            m = _ribbon(
                pts,
                half_width,
                scale,
                ground_at,
                _layer_height("road", print_side),
                step,
                tagged,
            )
            if m:
                road_meshes.append(m)
    rm = _merge(road_meshes)
    if rm:
        parts.append(MeshPart("yollar", rm, COLORS["road"]))

    bldg_meshes: list[trimesh.Trimesh] = []
    for poly, h in zip(buildings, building_heights):
        for p in _clip_poly(poly, grid.width_m, grid.depth_m):
            _z_min, z_max = z_range(p)
            own = max(h * scale, print_side * 0.012, 0.8)
            m = _poly_to_extrusion(p, 0.0, max(own, 1.0), scale)
            if m:
                bldg_meshes.append(_plant_building(m, z_max + own, ground_at))
    bm = _merge(bldg_meshes)
    if bm:
        parts.append(MeshPart("binalar", bm, COLORS["building"]))

    trunk_meshes: list[trimesh.Trimesh] = []
    crown_meshes: list[trimesh.Trimesh] = []
    for t in trees or []:
        cx = float(getattr(t, "x")) * scale
        cy = float(getattr(t, "y")) * scale
        if not (0 <= cx <= grid.width_m * scale and 0 <= cy <= grid.depth_m * scale):
            continue
        trunk_m, crown_m = _tree_parts(
            cx,
            cy,
            ground_at(cx, cy),
            float(getattr(t, "crown_r")),
            float(getattr(t, "height")),
            scale,
        )
        if trunk_m:
            trunk_meshes.append(trunk_m)
        if crown_m:
            crown_meshes.append(crown_m)
    tm = _merge(trunk_meshes)
    if tm:
        parts.append(MeshPart("agac govde", tm, COLORS["trunk"]))
    cm = _merge(crown_meshes)
    if cm:
        parts.append(MeshPart("agac yaprak", cm, COLORS["tree"]))

    if len(route_pts) >= 2:
        clipped: list[tuple[float, float]] = []
        for x, y in route_pts:
            if -20 <= x <= grid.width_m + 20 and -20 <= y <= grid.depth_m + 20:
                clipped.append(
                    (
                        min(grid.width_m, max(0, x)),
                        min(grid.depth_m, max(0, y)),
                    )
                )
        if len(clipped) >= 2:
            road_h = _layer_height("road", print_side)
            h = road_h + (0.55 if raise_route else 0.22)
            m = _ribbon(
                clipped,
                max(2.6, min_half_width_m),
                scale,
                ground_at,
                h,
                step,
                False,
            )
            if m:
                parts.append(MeshPart("rota", m, COLORS["route"]))

    for part in parts:
        part.mesh = _repair_mesh(part.mesh)

    return parts
