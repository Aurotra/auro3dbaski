# Auro3DMap

Haritadan alan + isteğe bağlı GPX rota → DEM / OSM → 3D önizleme → basılabilir renkli **3MF**.

## Çalıştırma

Frontend:

```bash
npm install
npm run dev
```

Backend (3MF üretimi için gerekli):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Vite `/api` isteklerini `http://127.0.0.1:8001` adresine yönlendirir.

## Kullanım

1. Haritada dikdörtgen sürükleyerek alan seçin
2. İsteğe bağlı GPX yükleyin
3. **Bina / yol / su yükle** ile tarayıcı önizlemesi
4. **3MF üret (sunucu)** ile katı arazi + renkli parçalar (arazi / su / yol / bina / rota)

## Teknik

- Vite + React + TypeScript, MapLibre, Three.js
- FastAPI: AWS Terrarium DEM, Overpass OSM, GPX, Trimesh, çok parçalı 3MF

Arayüz dili: Türkçe.
