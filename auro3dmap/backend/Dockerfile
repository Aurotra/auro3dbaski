FROM python:3.12-slim

# GEOS/shapely ve pillow için gerekli sistem kütüphaneleri
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgeos-c1v5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Render/Fly/Cloud Run gibi platformlar PORT değişkenini kendileri atar;
# yerelde varsayılan 8001 kullanılır.
ENV PORT=8001
EXPOSE 8001

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
