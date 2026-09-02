# Canlıya alma (Vercel + Oracle Cloud "Always Free" VM)

Proje iki parçadan oluşur:

- **Frontend** (bu repo — Vite/React/MapLibre/Three.js): statik SPA, **Vercel**'de.
- **Backend** (`backend/` — FastAPI + DEM/OSM/GPX + trimesh mesh üretimi): süreklilik
  gerektiren, ağır hesaplama yapan bir servis. Vercel'in serverless fonksiyon
  modeline uygun değil (süre/paket limitleri, kalıcı disk yok, "asla uyumasın"
  gerekliliğiyle de uyuşmuyor). Bunun yerine **Oracle Cloud'un "Always Free" VM'i**
  üzerinde Docker ile 7/24 çalıştırılır — gerçekten süresiz ücretsiz, hiç uyumaz.

Ana siteniz Vercel + Next.js olduğu için bu uygulamayı `siteniz.com/<alt-yol>`
altında ayrı domain görünmeden göstermek için Next.js `rewrites()` kullanıyoruz.

---

## 1) Oracle Cloud VM'i oluştur

1. [cloud.oracle.com](https://www.oracle.com/cloud/free/) → ücretsiz hesap açın
   (kart istenir ama Always Free kaynaklar için **hiç ücret alınmaz**).
2. **Compute → Instances → Create Instance**:
   - **Image**: Ubuntu 24.04 (Canonical).
   - **Shape**: `VM.Standard.A1.Flex` (Ampere/ARM) — Always Free limitiniz
     dahilinde 2 OCPU / 12 GB RAM seçin (toplam 4 OCPU/24 GB'a kadar ücretsiz).
     "Out of capacity" hatası alırsanız farklı bir Availability Domain deneyin
     veya `VM.Standard.E2.1.Micro` (AMD, 1 OCPU/1GB, her zaman müsait) ile
     başlayın — backend biraz daha kısıtlı çalışır ama işe yarar.
   - **SSH key**: "Generate a key pair" ile oluşturup private key'i (`.key`)
     indirin (veya kendi public key'inizi yapıştırın).
   - Oluşturduktan sonra **Public IP adresini** not edin.

## 2) Ağ (network) açılışı — iki yerde birden

**a) OCI Security List** (Compute → Instance → Subnet → Security List →
Ingress Rules → Add Ingress Rules): `0.0.0.0/0` kaynağından TCP `80` ve `443`
için kural ekleyin (22/SSH zaten var, dokunmayın).

**b) VM'in kendi iptables'ı** (Oracle'ın Ubuntu imajı varsayılan olarak
SSH dışındaki her şeyi bloklar) — SSH ile bağlanıp çalıştırın:

```bash
ssh -i /path/to/key.key ubuntu@<VM_PUBLIC_IP>

sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

(Kural eklenmediyse `sudo iptables -L INPUT -n --line-numbers` ile son
`REJECT` satırından önceki numarayı bulup `-I INPUT <o numara>` ile deneyin.)

## 3) DNS: backend için bir alt domain ayarla

Alan adınızı yönettiğiniz DNS panelinden (Cloudflare, Vercel Domains, vb.)
bir **A kaydı** oluşturun:

```
api.siteniz.com  →  <VM_PUBLIC_IP>
```

Caddy'nin otomatik HTTPS (Let's Encrypt) sertifikası alması için bu kaydın
gerçekten çözülüyor olması gerekiyor — kurulumdan önce yayılmasını (birkaç
dakika) bekleyin.

## 4) Docker'ı kur, repoyu çek, ayağa kaldır

```bash
# VM üzerinde (SSH ile bağlıyken):
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker

git clone <REPO_URL> auro3dmap
cd auro3dmap/deploy
cp .env.example .env
nano .env   # DOMAIN=api.siteniz.com ve ALLOWED_ORIGINS'i gerçek değerlerle doldurun

docker compose up -d --build
docker compose logs -f caddy   # sertifika alma loglarını görmek için (Ctrl+C ile çıkın)
```

Bittiğinde:

```bash
curl -I https://api.siteniz.com/health
# HTTP/2 200 ve {"status":"ok"} dönmeli
```

Docker `restart: always` politikasıyla geldiği için VM yeniden başlasa da
(Oracle bakım/reboot yapsa da) backend otomatik ayağa kalkar.

**Güncelleme yapmak istediğinizde** (kod değiştiğinde):

```bash
cd ~/auro3dmap && git pull
cd deploy && docker compose up -d --build
```

## 5) Frontend'i Vercel'e dağıt

1. Vercel Dashboard → **Add New → Project** → bu repo (Root Directory: repo
   kökü — `vercel.json` zaten hazır, framework Vite otomatik algılanır).
2. **Environment Variables**:
   ```
   VITE_API_BASE=https://api.siteniz.com
   ```
3. Deploy edin — size `https://auro3dmap.vercel.app` gibi bir adres verir.

## 6) Ana Next.js siteye alt yol olarak bağla

Ana sitenizin `next.config.js`'ine ekleyin (`<alt-yol>` ve Vercel adresini
kendi değerlerinizle değiştirin):

```js
const nextConfig = {
  async rewrites() {
    return [
      { source: '/harita-3d-baski', destination: 'https://auro3dmap.vercel.app' },
      { source: '/harita-3d-baski/:path*', destination: 'https://auro3dmap.vercel.app/:path*' },
    ]
  },
}
module.exports = nextConfig
```

Bu gerçek bir reverse-proxy'dir (iframe değil) — kullanıcı hep
`siteniz.com/harita-3d-baski` görür. Ana siteyi yeniden deploy edin.

Uygulamanın backend çağrıları tarayıcıdan doğrudan `api.siteniz.com`'a gider;
bu yüzden 4. adımdaki `ALLOWED_ORIGINS`'te **ana domain'in** (`siteniz.com`,
`*.vercel.app` değil) olması şart — CORS kontrolüne giren, kullanıcının adres
çubuğunda gördüğü origin'dir.

## Kontrol listesi

- [ ] `curl https://api.siteniz.com/health` → 200 (HTTPS sertifikası geçerli)
- [ ] Backend `.env`: `DOMAIN` ve `ALLOWED_ORIGINS` gerçek değerlerle dolu
- [ ] Vercel `VITE_API_BASE` = `https://api.siteniz.com`
- [ ] Ana sitenin `next.config.js`'inde rewrite eklenip deploy edildi
- [ ] `siteniz.com/<alt-yol>` üzerinden alan seçip model üretilebiliyor
- [ ] VM'i yeniden başlatıp (`sudo reboot`) backend'in kendiliğinden
      ayağa kalktığını doğruladınız
- [ ] Tarayıcı konsolunda CORS/mixed-content hatası yok

---

## Alternatif: Render (daha kolay, ama uykuya geçer)

Oracle kurulumu şu an size zor gelirse veya "out of capacity" gibi bir engelle
karşılaşırsanız, repo kökündeki `render.yaml` ile Render'da **ücretsiz ama 15
dk hareketsizlikte uykuya geçen** bir backend'i dakikalar içinde kurabilirsiniz
(Render Dashboard → New → Blueprint → bu repo). Geçiş tamamen `VITE_API_BASE`
değerini değiştirmekten ibaret olduğu için istediğiniz an Oracle'a taşınabilir
ya da tam tersi yapılabilir.
