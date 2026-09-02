"""GPX track → local-meter polyline."""

from __future__ import annotations

from io import BytesIO

import gpxpy

from .dem import lonlat_to_local

# Kötü niyetli/aşırı büyük GPX dosyası CPU/bellek tüketmesin
MAX_POINTS = 50_000


def parse_gpx_bytes(
    raw: bytes, origin_lon: float, origin_lat: float
) -> list[tuple[float, float]]:
    gpx = gpxpy.parse(BytesIO(raw))
    pts: list[tuple[float, float]] = []
    for track in gpx.tracks:
        for seg in track.segments:
            for p in seg.points:
                if len(pts) >= MAX_POINTS:
                    break
                pts.append(lonlat_to_local(p.longitude, p.latitude, origin_lon, origin_lat))
    if not pts:
        for rte in gpx.routes:
            for p in rte.points:
                if len(pts) >= MAX_POINTS:
                    break
                pts.append(lonlat_to_local(p.longitude, p.latitude, origin_lon, origin_lat))
    if not pts:
        for wpt in gpx.waypoints:
            if len(pts) >= MAX_POINTS:
                break
            pts.append(lonlat_to_local(wpt.longitude, wpt.latitude, origin_lon, origin_lat))
    # Dedup consecutive
    cleaned: list[tuple[float, float]] = []
    for p in pts:
        if cleaned and abs(cleaned[-1][0] - p[0]) < 0.05 and abs(cleaned[-1][1] - p[1]) < 0.05:
            continue
        cleaned.append(p)
    return cleaned
