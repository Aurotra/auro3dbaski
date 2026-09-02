# Auro 3D Baskı

[auro3dbaski.com](https://auro3dbaski.com) — Denizli 3D baskı atölyesi sitesi.

## Yerel

```bash
npm install
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

## Yayın (Vercel)

1. GitHub’daki bu repoyu [Vercel](https://vercel.com/new) ile bağla.
2. Framework: Next.js, bölge: Frankfurt (`fra1`).
3. Domain ekle: `auro3dbaski.com` ve `www.auro3dbaski.com`.
4. DNS (registrar panelinde):

| Tip   | Ad  | Değer                |
| ----- | --- | -------------------- |
| A     | `@` | `10.0.1.2`        |
| CNAME | `www` | `cname.vercel-dns.com` |

Vercel, domaini ekledikten sonra doğru A/CNAME değerlerini de gösterir; paneldekini kullan.

## Sayfalar

- `/` ana
- `/hizmetler`
- `/malzemeler`
- `/teklif`
- `/iletisim`
- `/yasal/kvkk`, `/yasal/gizlilik`

Teklif formu şu an `mailto:` ile `3d@auro3d.com` açar. SMTP veya form servisi sonra bağlanır.
