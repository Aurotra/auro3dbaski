"""Microsoft GlobalMLBuildingFootprints → bbox içindeki bina çokgenleri.

OSM'de bina çizilmemiş bölgeler çok yaygın (özellikle Türkiye'de mahalle
ölçeğinde). Bu modül uydu görüntüsünden makine öğrenmesiyle çıkarılmış bina
izlerini yedek kaynak olarak sağlar. Veri z9 quadkey karolarına bölünmüş
gzip'li GeoJSONL dosyaları hâlinde yayınlanıyor; karolar diske indirilip
tekrar kullanılıyor.
"""

from __future__ import annotations

import asyncio
import csv
import gzip
import io
import json
import math
import os
import time
from dataclasses import dataclass
from pathlib import Path

import httpx

INDEX_URL = (
    "https://minedbuildings.z5.web.core.windows.net/global-buildings/dataset-links.csv"
)
INDEX_TTL_S = 7 * 24 * 3600
TILE_ZOOM = 9
MAX_TILES = 4
MAX_BUILDINGS = 60_000

_CACHE_DIR = Path(
    os.environ.get("AURO_CACHE_DIR")
    or Path(__file__).resolve().parents[2] / ".cache" / "ml-buildings"
)
# Karo başına 10-40 MB olabilir; disk sınırsız büyümesin (LRU: en eski
# kullanılan dosyalar silinir). Salt-okunur/serverless ortamlarda yazma
# başarısız olursa aşağıdaki fonksiyonlar sessizce atlar.
_MAX_CACHE_BYTES = int(os.environ.get("AURO_ML_CACHE_MAX_BYTES", str(2 * 1024 * 1024 * 1024)))

_index_lock = asyncio.Lock()
_index_cache: dict[str, list[str]] | None = None
_tile_locks: dict[str, asyncio.Lock] = {}


def _tile_lock(url: str) -> asyncio.Lock:
    lock = _tile_locks.get(url)
    if lock is None:
        lock = asyncio.Lock()
        _tile_locks[url] = lock
    return lock


@dataclass
class MlBuilding:
    """lon/lat halkası; height bilinmiyorsa None."""

    ring: list[tuple[float, float]]
    height: float | None


def _cache_dir() -> Path:
    _CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return _CACHE_DIR


def _enforce_cache_limit() -> None:
    """Toplam önbellek boyutu sınırı aşılırsa en eski (mtime) karoları sil."""
    try:
        files = [p for p in _cache_dir().glob("*") if p.is_file() and p.suffix != ".part"]
        total = sum(p.stat().st_size for p in files)
        if total <= _MAX_CACHE_BYTES:
            return
        files.sort(key=lambda p: p.stat().st_mtime)
        for p in files:
            if total <= _MAX_CACHE_BYTES:
                break
            try:
                size = p.stat().st_size
                p.unlink()
                total -= size
            except OSError:
                continue
    except OSError:
        pass


def _quadkey(x: int, y: int, z: int) -> str:
    out = []
    for i in range(z, 0, -1):
        mask = 1 << (i - 1)
        digit = 0
        if x & mask:
            digit += 1
        if y & mask:
            digit += 2
        out.append(str(digit))
    return "".join(out)


def _tile_xy(lon: float, lat: float, z: int) -> tuple[int, int]:
    lat = max(min(lat, 85.05), -85.05)
    n = 2**z
    sin_lat = math.sin(math.radians(lat))
    x = int((lon + 180.0) / 360.0 * n)
    y = int((0.5 - math.log((1 + sin_lat) / (1 - sin_lat)) / (4 * math.pi)) * n)
    return max(0, min(x, n - 1)), max(0, min(y, n - 1))


def quadkeys_for_bbox(
    west: float, south: float, east: float, north: float, z: int = TILE_ZOOM
) -> list[str]:
    x0, y0 = _tile_xy(west, north, z)
    x1, y1 = _tile_xy(east, south, z)
    keys = []
    for x in range(min(x0, x1), max(x0, x1) + 1):
        for y in range(min(y0, y1), max(y0, y1) + 1):
            keys.append(_quadkey(x, y, z))
    return keys[:MAX_TILES]


def _parse_index(text: str) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for row in csv.DictReader(io.StringIO(text)):
        qk = (row.get("QuadKey") or "").strip()
        url = (row.get("Url") or "").strip()
        if qk and url:
            out.setdefault(qk, []).append(url)
    return out


async def _load_index(client: httpx.AsyncClient) -> dict[str, list[str]]:
    global _index_cache
    if _index_cache is not None:
        return _index_cache

    async with _index_lock:
        if _index_cache is not None:
            return _index_cache

        path = _cache_dir() / "dataset-links.csv"
        fresh = path.exists() and time.time() - path.stat().st_mtime < INDEX_TTL_S
        if not fresh:
            res = await client.get(INDEX_URL, timeout=120.0)
            res.raise_for_status()
            path.write_text(res.text, encoding="utf-8")

        _index_cache = _parse_index(path.read_text(encoding="utf-8"))
        return _index_cache


async def _tile_path(client: httpx.AsyncClient, url: str) -> Path:
    name = f"{url.rsplit('/', 2)[-2]}-{url.rsplit('/', 1)[-1]}"
    path = _cache_dir() / name
    if path.exists() and path.stat().st_size > 0:
        return path

    # Aynı karo için eşzamanlı istekler aynı .part dosyasına yazmasın
    async with _tile_lock(url):
        if path.exists() and path.stat().st_size > 0:
            return path
        tmp = path.with_suffix(path.suffix + f".{os.getpid()}.part")
        async with client.stream("GET", url, timeout=120.0) as res:
            res.raise_for_status()
            with tmp.open("wb") as fh:
                async for chunk in res.aiter_bytes(1 << 18):
                    fh.write(chunk)
        tmp.replace(path)
        await asyncio.to_thread(_enforce_cache_limit)
        return path


def _ring_centroid(ring: list[tuple[float, float]]) -> tuple[float, float]:
    n = len(ring)
    if n > 1 and ring[0] == ring[-1]:
        n -= 1
    sx = sum(p[0] for p in ring[:n])
    sy = sum(p[1] for p in ring[:n])
    return sx / n, sy / n


def _scan_tile(
    path: Path, west: float, south: float, east: float, north: float
) -> list[MlBuilding]:
    out: list[MlBuilding] = []
    with gzip.open(path, "rt", encoding="utf-8") as fh:
        for line in fh:
            if len(out) >= MAX_BUILDINGS:
                break
            line = line.strip()
            if not line or line[0] != "{":
                continue
            try:
                feat = json.loads(line)
            except ValueError:
                continue
            geom = feat.get("geometry") or {}
            if geom.get("type") != "Polygon":
                continue
            coords = geom.get("coordinates") or []
            if not coords or len(coords[0]) < 4:
                continue
            ring = [(float(p[0]), float(p[1])) for p in coords[0]]
            cx, cy = _ring_centroid(ring)
            if cx < west or cx > east or cy < south or cy > north:
                continue
            raw_h = (feat.get("properties") or {}).get("height")
            height = float(raw_h) if isinstance(raw_h, (int, float)) and raw_h > 0 else None
            out.append(MlBuilding(ring=ring, height=height))
    return out


async def fetch_ml_buildings(
    west: float, south: float, east: float, north: float
) -> list[MlBuilding]:
    """bbox içinde merkezi bulunan ML bina izleri (lon/lat halkalar)."""
    out: list[MlBuilding] = []
    async with httpx.AsyncClient(
        follow_redirects=True,
        headers={"User-Agent": "auro3dmap/1.0"},
    ) as client:
        index = await _load_index(client)
        urls: list[str] = []
        for qk in quadkeys_for_bbox(west, south, east, north):
            for url in index.get(qk, []):
                if url not in urls:
                    urls.append(url)

        for url in urls:
            path = await _tile_path(client, url)
            found = await asyncio.to_thread(_scan_tile, path, west, south, east, north)
            out.extend(found)
            if len(out) >= MAX_BUILDINGS:
                break

    return out[:MAX_BUILDINGS]


def estimate_height_m(area_m2: float) -> float:
    """ML izlerinde kat/yükseklik yok; taban alanından kaba tahmin."""
    if area_m2 < 30:
        return 3.0
    if area_m2 < 80:
        return 5.5
    if area_m2 < 200:
        return 9.0
    if area_m2 < 600:
        return 13.0
    if area_m2 < 2000:
        return 16.0
    return 20.0
