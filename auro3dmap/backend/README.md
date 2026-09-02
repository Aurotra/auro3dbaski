# Auro3DMap backend

TrailMark3D tarzı basılabilir 3MF üretimi: AWS Terrarium DEM + Overpass OSM + GPX.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Frontend (`npm run dev`) `/api` isteklerini bu sunucuya yönlendirir.

## Uçlar

- `GET /api/elevation?west&south&east&north` — Terrarium DEM'den göreli kot ızgarası
- `GET /api/mlbuildings?west&south&east&north` — OSM'de çizilmemiş binalar için
  Microsoft GlobalMLBuildingFootprints izleri (lon/lat halkalar)
- `POST /api/build` — DEM + OSM (+ eksik binalar için ML izleri) + GPX → renkli 3MF.
  `fill_buildings=false` gönderilirse yalnızca OSM binaları kullanılır.

## Önbellek

Uydu bina izleri z9 quadkey karoları hâlinde indirilir (karo başına ~10–40 MB) ve
`.cache/ml-buildings/` altında saklanır; aynı bölge ikinci kez saniyeler içinde
gelir. Farklı bir konum için `AURO_CACHE_DIR` ortam değişkeni kullanılabilir.
Toplam önbellek boyutu varsayılan olarak 2 GB'ta sınırlanır (en eski karolar
otomatik silinir); `AURO_ML_CACHE_MAX_BYTES` ile değiştirilebilir.

## Dağıtım (deploy)

Bu backend'i Vercel'de **serverless fonksiyon olarak çalıştırmayın** — DEM/OSM
sorguları + trimesh mesh onarımı süre/paket-boyutu limitlerini aşabilir ve
kalıcı disk/tek-worker varsayan önbellek + rate-limit mekanizmaları serverless
ortamda güvenilir çalışmaz. Bunun yerine `backend/Dockerfile` ile Render, Fly.io
veya bir VPS gibi sürekli çalışan bir platformda barındırın. Ayrıntılı adımlar
(Render + Vercel + ana Next.js sitesine alt yol olarak bağlama) için repo
kökündeki `DEPLOY.md`'ye bakın.

## Production ortam değişkenleri

- `ALLOWED_ORIGINS` — virgülle ayrılmış izinli origin listesi (örn.
  `https://auro3dmap.com,https://www.auro3dmap.com`). Ayarlanmazsa tüm
  origin'lere izin verilir (`*`) — sadece geliştirmede güvenlidir, canlıya
  almadan önce mutlaka ayarlayın.
- `LOG_LEVEL` — `INFO` (varsayılan), `DEBUG`, `WARNING` vb.
- `AURO_CACHE_DIR`, `AURO_ML_CACHE_MAX_BYTES` — yukarıda.

## Sınırlamalar (kasıtlı)

- Alan: en fazla ~20 km kenar / ~250 km² (`/api/build`, `/api/elevation`).
- `/api/build`: IP başına dakikada 6 istek; `/api/elevation`: dakikada 30;
  `/api/mlbuildings`: dakikada 20 (bkz. `app/ratelimit.py`). Bu, tek worker'lı
  çalışma için son bir savunma hattıdır — production'da önde bir reverse-proxy
  seviyesinde de hız sınırlama önerilir.
- GPX yükleme: en fazla 8 MB, en fazla 50.000 nokta.
- Model karmaşıklığı: toplam 4.000.000 üçgeni aşan modeller reddedilir (413).
