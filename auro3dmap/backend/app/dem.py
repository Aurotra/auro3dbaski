"""AWS Terrarium DEM tiles → bbox height grid."""

from __future__ import annotations

import math
from dataclasses import dataclass

import httpx
import numpy as np
from PIL import Image
from io import BytesIO

TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"


@dataclass
class HeightGrid:
    heights: np.ndarray  # rows x cols, meters (absolute)
    west: float
    south: float
    east: float
    north: float
    width_m: float
    depth_m: float
    min_elev: float
    max_elev: float

    @property
    def rows(self) -> int:
        return int(self.heights.shape[0])

    @property
    def cols(self) -> int:
        return int(self.heights.shape[1])

    def relative(self) -> np.ndarray:
        return self.heights - self.min_elev

    def sample(self, x_m: float, y_m: float) -> float:
        """Bilinear sample of relative elevation at local meters."""
        if self.width_m <= 0 or self.depth_m <= 0:
            return 0.0
        u = min(1.0, max(0.0, x_m / self.width_m))
        v = min(1.0, max(0.0, y_m / self.depth_m))
        gf = u * (self.cols - 1)
        rf = v * (self.rows - 1)
        c0 = int(math.floor(gf))
        r0 = int(math.floor(rf))
        c1 = min(self.cols - 1, c0 + 1)
        r1 = min(self.rows - 1, r0 + 1)
        tx = gf - c0
        ty = rf - r0
        rel = self.relative()
        h00 = float(rel[r0, c0])
        h10 = float(rel[r0, c1])
        h01 = float(rel[r1, c0])
        h11 = float(rel[r1, c1])
        # Frontend sampleElevation ile aynı iki üçgen
        if tx + ty <= 1:
            return h00 * (1 - tx - ty) + h10 * tx + h01 * ty
        return h10 * (1 - ty) + h11 * (tx + ty - 1) + h01 * (1 - tx)


def meters_per_degree(lat: float) -> tuple[float, float]:
    lat_rad = math.radians(lat)
    return 111320.0 * math.cos(lat_rad), 110540.0


def bounds_size_m(west: float, south: float, east: float, north: float) -> tuple[float, float]:
    mid = (south + north) / 2
    mlon, mlat = meters_per_degree(mid)
    return (east - west) * mlon, (north - south) * mlat


def lonlat_to_local(
    lon: float, lat: float, origin_lon: float, origin_lat: float
) -> tuple[float, float]:
    mlon, mlat = meters_per_degree(origin_lat)
    return (lon - origin_lon) * mlon, (lat - origin_lat) * mlat


def _deg2num(lon: float, lat: float, zoom: int) -> tuple[int, int]:
    lat = min(85.05112878, max(-85.05112878, lat))
    n = 2**zoom
    xtile = int((lon + 180.0) / 360.0 * n)
    lat_rad = math.radians(lat)
    ytile = int((1.0 - math.log(math.tan(lat_rad) + 1.0 / math.cos(lat_rad)) / math.pi) / 2.0 * n)
    return xtile, ytile


def _num2lonlat(x: int, y: int, zoom: int) -> tuple[float, float]:
    n = 2**zoom
    lon = x / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * y / n)))
    return lon, math.degrees(lat_rad)


def _decode_terrarium(img: Image.Image) -> np.ndarray:
    arr = np.asarray(img.convert("RGB"), dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    return r * 256.0 + g + b / 256.0 - 32768.0


def _choose_zoom(west: float, south: float, east: float, north: float) -> int:
    span = max(east - west, north - south)
    if span > 0.08:
        return 10
    if span > 0.04:
        return 11
    if span > 0.02:
        return 12
    if span > 0.008:
        return 13
    return 14


async def fetch_height_grid(
    west: float,
    south: float,
    east: float,
    north: float,
    max_dim: int = 192,
) -> HeightGrid:
    zoom = _choose_zoom(west, south, east, north)
    x0, y1 = _deg2num(west, south, zoom)
    x1, y0 = _deg2num(east, north, zoom)
    if x1 < x0:
        x0, x1 = x1, x0
    if y1 < y0:
        y0, y1 = y1, y0

    # Limit tile count
    while (x1 - x0 + 1) * (y1 - y0 + 1) > 36 and zoom > 9:
        zoom -= 1
        x0, y1 = _deg2num(west, south, zoom)
        x1, y0 = _deg2num(east, north, zoom)
        if x1 < x0:
            x0, x1 = x1, x0
        if y1 < y0:
            y0, y1 = y1, y0

    tiles_x = x1 - x0 + 1
    tiles_y = y1 - y0 + 1
    # zoom=9'da bile çok büyük bbox tile sayısını 36'nın üstünde bırakabilir
    # (küçültme sadece zoom>9 iken çalışır) — mosaic OOM'unu önlemek için
    # sabit bir üst sınır zorla.
    if tiles_x * tiles_y > 400:
        raise RuntimeError("Seçilen alan yükseklik verisi için çok büyük")
    mosaic = np.full((tiles_y * 256, tiles_x * 256), np.nan, dtype=np.float32)
    ok = 0

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        for ty in range(y0, y1 + 1):
            for tx in range(x0, x1 + 1):
                url = TERRARIUM.format(z=zoom, x=tx, y=ty)
                try:
                    res = await client.get(url)
                    res.raise_for_status()
                    img = Image.open(BytesIO(res.content))
                    mosaic[(ty - y0) * 256 : (ty - y0 + 1) * 256, (tx - x0) * 256 : (tx - x0 + 1) * 256] = (
                        _decode_terrarium(img)
                    )
                    ok += 1
                except Exception:
                    pass

    if ok == 0:
        raise RuntimeError("Terrarium DEM kutuları indirilemedi")

    lon0, lat1 = _num2lonlat(x0, y0, zoom)
    lon1, lat0 = _num2lonlat(x1 + 1, y1 + 1, zoom)
    # lat0 is south of mosaic, lat1 is north
    if lat0 > lat1:
        lat0, lat1 = lat1, lat0

    rows, cols = mosaic.shape
    # Sample bbox from mosaic
    def lon_to_c(lon: float) -> float:
        return (lon - lon0) / (lon1 - lon0) * (cols - 1)

    def lat_to_r(lat: float) -> float:
        # mosaic row 0 is north (y0)
        return (lat1 - lat) / (lat1 - lat0) * (rows - 1)

    c0 = max(0, min(cols - 2, int(math.floor(lon_to_c(west)))))
    c1 = max(c0 + 1, min(cols - 1, int(math.ceil(lon_to_c(east)))))
    r0 = max(0, min(rows - 2, int(math.floor(lat_to_r(north)))))
    r1 = max(r0 + 1, min(rows - 1, int(math.ceil(lat_to_r(south)))))

    crop = mosaic[r0 : r1 + 1, c0 : c1 + 1]
    # Flip so row 0 is south (matches frontend local Y)
    crop = np.flipud(crop)

    finite = crop[np.isfinite(crop)]
    if finite.size == 0:
        raise RuntimeError("Seçilen alanda yükseklik yok")
    min_e = float(np.min(finite))
    max_e = float(np.max(finite))
    crop = np.nan_to_num(crop, nan=min_e)

    # Downsample if huge
    h, w = crop.shape
    if max(h, w) > max_dim:
        img = Image.fromarray(crop)
        scale = max_dim / max(h, w)
        img = img.resize((max(2, int(w * scale)), max(2, int(h * scale))), Image.BILINEAR)
        crop = np.asarray(img, dtype=np.float32)

    width_m, depth_m = bounds_size_m(west, south, east, north)

    return HeightGrid(
        heights=crop,
        west=west,
        south=south,
        east=east,
        north=north,
        width_m=width_m,
        depth_m=depth_m,
        min_elev=min_e,
        max_elev=max_e,
    )
