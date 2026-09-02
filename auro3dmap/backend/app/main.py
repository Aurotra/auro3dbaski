"""FastAPI: DEM + OSM + GPX → colored 3MF."""

from __future__ import annotations

import asyncio
import os

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from .dem import bounds_size_m, fetch_height_grid, lonlat_to_local
from .export_3mf import parts_to_3mf
from .gpx import parse_gpx_bytes
from .logging_config import configure_logging, logger
from .mesh_build import build_parts
from .ml_buildings import fetch_ml_buildings
from .osm import _finalize_layer, add_ml_buildings, fetch_osm
from .ratelimit import rate_limit

configure_logging()

app = FastAPI(title="Auro3DMap API")

# Production'da kendi domain'inizi virgülle ayırıp ALLOWED_ORIGINS env
# değişkenine yazın (örn. "https://auro3dmap.com,https://www.auro3dmap.com").
# Ayarlanmazsa geliştirme/varsayılan olarak tüm origin'lere izin verilir.
_allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "*").strip()
_allow_origins = (
    ["*"]
    if _allowed_origins_env in ("", "*")
    else [o.strip() for o in _allowed_origins_env.split(",") if o.strip()]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Üst sınır (~20 km kenar / ~250 km²) — frontend ile aynı
MAX_SIDE_M = 20_000
MAX_AREA_M2 = 250_000_000
MAX_GPX_BYTES = 8 * 1024 * 1024

# Üretim sırasında event loop'u bloklamasın diye ağır iş thread pool'a taşınır
_BUILD_SEMAPHORE = asyncio.Semaphore(2)


def _check_span(west: float, south: float, east: float, north: float) -> None:
    if (
        not all(
            -180 <= v <= 180 if i % 2 == 0 else -90 <= v <= 90
            for i, v in enumerate((west, south, east, north))
        )
    ):
        raise HTTPException(400, "Geçersiz koordinat")
    if not (east > west and north > south):
        raise HTTPException(400, "Geçersiz seçim kutusu")
    width_m, depth_m = bounds_size_m(west, south, east, north)
    if not (width_m > 0 and depth_m > 0) or max(width_m, depth_m) > MAX_SIDE_M or width_m * depth_m > MAX_AREA_M2:
        raise HTTPException(400, "Alan çok büyük (en fazla ~20 km kenar veya ~250 km²).")


@app.get("/health")
@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/elevation")
@app.get("/api/elevation")
async def elevation(
    west: float,
    south: float,
    east: float,
    north: float,
    _rl: None = Depends(rate_limit(30, 60)),
) -> dict:
    _check_span(west, south, east, north)
    try:
        grid = await fetch_height_grid(west, south, east, north, max_dim=192)
    except Exception:
        logger.exception("Yükseklik alınamadı (%s,%s,%s,%s)", west, south, east, north)
        raise HTTPException(502, "Yükseklik alınamadı. Biraz sonra tekrar deneyin.") from None
    rel = grid.relative()
    return {
        "cols": grid.cols,
        "rows": grid.rows,
        "relativeM": rel.astype(float).ravel().tolist(),
        "minElevM": grid.min_elev,
        "maxElevM": grid.max_elev,
    }


@app.get("/mlbuildings")
@app.get("/api/mlbuildings")
async def ml_buildings(
    west: float,
    south: float,
    east: float,
    north: float,
    _rl: None = Depends(rate_limit(20, 60)),
) -> dict:
    """OSM'de çizilmemiş binalar için uydu tabanlı (ML) bina izleri."""
    if east <= west or north <= south:
        raise HTTPException(400, "Geçersiz seçim kutusu")
    if abs(east - west) > 0.2 or abs(north - south) > 0.2:
        raise HTTPException(400, "Alan çok büyük (uydu bina izleri için)")
    try:
        found = await fetch_ml_buildings(west, south, east, north)
    except Exception:
        logger.exception("Uydu bina izleri alınamadı (%s,%s,%s,%s)", west, south, east, north)
        raise HTTPException(502, "Uydu bina izleri alınamadı.") from None
    return {
        "source": "microsoft-global-ml-building-footprints",
        "count": len(found),
        "buildings": [
            {
                "ring": [[round(x, 6), round(y, 6)] for x, y in b.ring],
                "heightM": b.height,
            }
            for b in found
        ],
    }


@app.post("/build")
@app.post("/api/build")
async def build_model(
    west: float = Form(...),
    south: float = Form(...),
    east: float = Form(...),
    north: float = Form(...),
    scale_mm_per_m: float = Form(0.4),
    relief: float = Form(1.8),
    fill_buildings: bool = Form(True),
    raise_route: bool = Form(True),
    nozzle_mm: float = Form(0.4),
    gpx: UploadFile | None = File(None),
    _rl: None = Depends(rate_limit(6, 60)),
) -> Response:
    _check_span(west, south, east, north)

    scale = max(0.02, min(float(scale_mm_per_m), 4.0))
    relief_v = max(0.5, min(float(relief), 6.0))
    min_feature_mm = max(0.8, min(float(nozzle_mm), 2.0) * 3)

    try:
        grid = await fetch_height_grid(west, south, east, north, max_dim=192)
        osm = await fetch_osm(west, south, east, north)
    except Exception:
        logger.exception("Veri alınamadı (%s,%s,%s,%s)", west, south, east, north)
        raise HTTPException(502, "Harita/yükseklik verisi alınamadı. Biraz sonra tekrar deneyin.") from None

    if fill_buildings:
        try:
            await add_ml_buildings(osm, west, south, east, north)
        except Exception as exc:  # eksik bina kaynağı modeli bozmasın
            logger.warning("Uydu bina izleri atlandı: %s", exc)

    width_m, depth_m = lonlat_to_local(east, north, west, south)
    _finalize_layer(osm, width_m, depth_m)

    route: list[tuple[float, float]] = []
    if gpx is not None and gpx.filename:
        raw = await gpx.read(MAX_GPX_BYTES + 1)
        if len(raw) > MAX_GPX_BYTES:
            raise HTTPException(413, "GPX dosyası çok büyük (en fazla 8 MB).")
        if raw:
            try:
                route = parse_gpx_bytes(raw, west, south)
            except Exception:
                logger.warning("GPX ayrıştırılamadı", exc_info=True)
                raise HTTPException(400, "GPX okunamadı. Dosya biçimini kontrol edin.") from None

    async with _BUILD_SEMAPHORE:
        try:
            parts = await asyncio.to_thread(
                build_parts,
                grid,
                osm.buildings,
                osm.building_heights,
                osm.roads,
                osm.waters,
                route,
                scale,
                relief_v,
                greens=osm.greens,
                paveds=osm.paveds,
                trees=osm.trees,
                coast_lines=osm.coast_lines,
                raise_route=raise_route,
                min_feature_mm=min_feature_mm,
            )
            total_tris = sum(len(p.mesh.faces) for p in parts if p.mesh is not None)
            if total_tris > 4_000_000:
                raise HTTPException(
                    413,
                    "Model çok karmaşık (çok fazla üçgen). Alanı küçültün veya ölçeği düşürün.",
                )
            blob = await asyncio.to_thread(parts_to_3mf, parts)
        except HTTPException:
            raise
        except Exception:
            logger.exception("Model üretilemedi (%s,%s,%s,%s)", west, south, east, north)
            raise HTTPException(500, "Model üretilemedi. Biraz sonra tekrar deneyin.") from None

    return Response(
        content=blob,
        media_type="application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
        headers={"Content-Disposition": 'attachment; filename="auro3dmap.3mf"'},
    )
