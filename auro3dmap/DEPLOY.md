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

## 5) Frontend'i Vercel'e dağıt — CLI ile bağımsız proje (GitHub import DEĞİL)

Ana site (`auro3dbaski.com`) başka birinin GitHub hesabındaki bir repoda ve siz
sadece collaborator'sünüz — Vercel'in GitHub App'i o hesaba kurulu olmadığı için
repo Vercel'in "Import Git Repository" listesinde görünmez. Bunu **Vercel Pro
almadan** çözmenin yolu, repoyu import etmek yerine `auro3dmap/` klasörünü
kendi Vercel hesabınızdan **CLI ile bağımsız bir proje** olarak deploy etmek:

```bash
cd auro3dmap
vercel link --yes --project auro3dmap --scope <kendi-takımınız>
vercel deploy --prod --yes --scope <kendi-takımınız>
```

Notlar:
- `.vercelignore` dosyası `backend/`, `deploy/`, `render.yaml` klasörlerini
  yükleme dışı bırakır — bunlar olmasa Vercel'in monorepo/microfrontend
  algılayıcısı `backend/`'i ayrı bir servis sanıp hata veriyor.
- `vite.config.ts`'de prod build `base: '/map/'` ile yapılır (bkz. adım 6) —
  bu sayede JS/CSS dosyaları `/map/assets/...` yoluyla referanslanır ve ana
  sitenin rewrite'ı üzerinden doğru şekilde servis edilir.
- Backend hazır olduğunda `vercel env add VITE_API_BASE production` ile
  `https://api.siteniz.com` değerini girip tekrar `vercel deploy --prod` çalıştırın.
- Bu proje GitHub'a bağlı DEĞİL; kod her değiştiğinde tekrar
  `vercel deploy --prod --yes --scope <takım>` çalıştırmanız gerekir.

## 6) Ana Next.js siteye alt yol olarak bağla

Ana sitenin `next.config.ts`'ine ekleyin (kendi Vercel adresinizi yazın):

```ts
async rewrites() {
  return [
    { source: '/map', destination: 'https://auro3dmap.vercel.app' },
    { source: '/map/:path*', destination: 'https://auro3dmap.vercel.app/:path*' },
  ]
},
```

Bu gerçek bir reverse-proxy'dir (iframe değil) — kullanıcı hep
`auro3dbaski.com/map` görür. Ana siteyi yeniden deploy edin.

**Önemli — eğer `auro3dmap/` ana sitenin repo'suna alt klasör olarak eklendiyse**,
ana sitenin `tsconfig.json` (`exclude`) ve `eslint.config.mjs` (`ignores`)
dosyalarına `auro3dmap` eklemeniz şart; yoksa Next'in type-check/lint adımı
`auro3dmap`'in kendi bağımlılıklarını (maplibre-gl, three, vb.) bulamayıp
**her deploy'u başarısız yapar** (bu proje için de başımıza geldi — bkz. commit
geçmişi). `next.config.ts`'ye `outputFileTracingRoot` eklemek de "multiple
lockfiles" uyarısını giderir.

Uygulamanın backend çağrıları tarayıcıdan doğrudan `api.siteniz.com`'a gider;
bu yüzden backend `ALLOWED_ORIGINS`'te **ana domain'in** (`auro3dbaski.com`,
`*.vercel.app` değil) olması şart — CORS kontrolüne giren, kullanıcının adres
çubuğunda gördüğü origin'dir.

## Kontrol listesi

- [x] `curl https://api.auro3dbaski.com/health` → 200 (HTTPS sertifikası geçerli, Let's Encrypt)
- [x] Backend `.env`: `DOMAIN=api.auro3dbaski.com`, `ALLOWED_ORIGINS=https://auro3dbaski.com,https://www.auro3dbaski.com`
- [x] Vercel'de bağımsız `auro3dmap` projesi (`btw6` takımı) CLI ile deploy edildi
- [x] `VITE_API_BASE=https://api.auro3dbaski.com` eklendi ve redeploy edildi
- [x] Ana sitenin `next.config.ts`'inde `/map` rewrite'ı eklenip deploy edildi
- [x] Ana sitenin `tsconfig.json`/`eslint.config.mjs`'inde `auro3dmap` exclude edildi
- [x] `auro3dbaski.com/map` üzerinden site açılıyor, JS/CSS 200 dönüyor
- [x] Gerçek bir `/api/elevation` isteği ucdan uca test edildi (CORS + backend yanıtı doğru)
- [ ] VM'i yeniden başlatıp (`sudo reboot`) backend'in kendiliğinden
      ayağa kalktığını doğrulayın (Docker `restart: always` sayesinde otomatik
      olması gerekir, ama bir kez elle test edilmesi tavsiye edilir)
- [x] Tarayıcı/CORS hatası yok (preflight + gerçek istek test edildi)

**Sunucu bilgileri (referans):**
- VM: Oracle Cloud, Germany Central (Frankfurt), `VM.Standard.A1.Flex` (2 OCPU/12GB), Ubuntu 24.04
- Public IP: `130.61.220.243`
- SSH: `ssh -i <indirdiğiniz .key dosyası> ubuntu@130.61.220.243`
- Proje yolu (VM üzerinde): `~/auro3dmap/{backend,deploy}`
- Güncelleme yapmak için: değişen dosyaları yeniden `scp` ile gönderin (GitHub'dan
  bu VM'in IP'sinden anonim `git clone` GitHub tarafından 401 ile engellendi —
  bulut IP aralıklarına karşı bilinen bir kısıtlama), sonra
  `cd ~/auro3dmap/deploy && sudo docker compose up -d --build`.

---

## Alternatif: Render (daha kolay, ama uykuya geçer)

Oracle kurulumu şu an size zor gelirse veya "out of capacity" gibi bir engelle
karşılaşırsanız, repo kökündeki `render.yaml` ile Render'da **ücretsiz ama 15
dk hareketsizlikte uykuya geçen** bir backend'i dakikalar içinde kurabilirsiniz
(Render Dashboard → New → Blueprint → bu repo). Geçiş tamamen `VITE_API_BASE`
değerini değiştirmekten ibaret olduğu için istediğiniz an Oracle'a taşınabilir
ya da tam tersi yapılabilir.
