/**
 * Backend taban URL'si. Geliştirmede (`npm run dev`) boş bırakılır; Vite proxy'si
 * `/api` isteklerini `vite.config.ts`'deki hedefe yönlendirir. Production build'de
 * proxy çalışmaz — `VITE_API_BASE` env değişkeni ile gerçek backend adresi
 * (örn. `https://api.auro3dmap.com`) build zamanında gömülmelidir.
 */
const RAW_BASE = (import.meta.env.VITE_API_BASE ?? '').trim()
export const API_BASE = RAW_BASE.replace(/\/+$/, '')

/** `/api/...` gibi bir yolu geçerli backend URL'sine çevirir. */
export function apiUrl(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`
  return `${API_BASE}${path}`
}
