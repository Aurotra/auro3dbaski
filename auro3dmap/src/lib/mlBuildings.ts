import type { SelectionBounds } from '../types'
import { apiUrl } from './api'

/**
 * OSM'de bina çizilmemiş bölgeler çok yaygın: uydu görüntüsünde onlarca blok
 * görünürken OSM'de tek bina olmayabiliyor. Bu modül backend üzerinden
 * Microsoft'un uydudan makine öğrenmesiyle çıkardığı bina izlerini getirir.
 */
export interface MlBuilding {
  /** lon/lat halkası */
  ring: [number, number][]
  /** Veri setinde yükseklik varsa metre, yoksa null */
  heightM: number | null
}

/** İlk çağrıda ~18 MB karo indirilir; sonrası sunucuda önbellekten gelir. */
const REQUEST_TIMEOUT_MS = 180_000

export async function fetchMlBuildings(
  bounds: SelectionBounds,
): Promise<MlBuilding[]> {
  const q = new URLSearchParams({
    west: String(bounds.west),
    south: String(bounds.south),
    east: String(bounds.east),
    north: String(bounds.north),
  })

  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(apiUrl(`/api/mlbuildings?${q}`), { signal: ctrl.signal })
    if (!res.ok) throw new Error(`Sunucu ${res.status}`)
    const data = (await res.json()) as {
      buildings?: { ring: [number, number][]; heightM: number | null }[]
    }
    return (data.buildings ?? []).filter((b) => b.ring?.length >= 4)
  } catch (err) {
    if (ctrl.signal.aborted) throw new Error('Uydu bina izleri zaman aşımı')
    throw err instanceof Error ? err : new Error(String(err))
  } finally {
    window.clearTimeout(timer)
  }
}

/** ML izlerinde kat/yükseklik bilgisi yok; taban alanından kaba tahmin. */
export function estimateMlHeightM(areaM2: number): number {
  if (areaM2 < 30) return 3
  if (areaM2 < 80) return 5.5
  if (areaM2 < 200) return 9
  if (areaM2 < 600) return 13
  if (areaM2 < 2000) return 16
  return 20
}
