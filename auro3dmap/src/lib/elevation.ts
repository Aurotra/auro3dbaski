import type { ElevationGrid, SelectionBounds } from '../types'
import { apiUrl } from './api'

export type { ElevationGrid }

function gridSizeForBounds(bounds: SelectionBounds) {
  const span = Math.max(
    Math.abs(bounds.east - bounds.west),
    Math.abs(bounds.north - bounds.south),
  )
  if (span > 0.04) return 16
  if (span > 0.02) return 20
  return 24
}

async function fetchOpenMeteoBatch(
  lats: number[],
  lons: number[],
): Promise<number[]> {
  const url =
    `https://api.open-meteo.com/v1/elevation?` +
    `latitude=${lats.map((v) => v.toFixed(5)).join(',')}&` +
    `longitude=${lons.map((v) => v.toFixed(5)).join(',')}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Yükseklik API ${res.status}`)
  const data = (await res.json()) as { elevation?: (number | null)[] }
  if (!data.elevation?.length) throw new Error('Yükseklik verisi boş')
  return data.elevation.map((e) => (e == null || Number.isNaN(e) ? 0 : e))
}

async function fetchFromBackend(
  bounds: SelectionBounds,
): Promise<ElevationGrid> {
  const q = new URLSearchParams({
    west: String(bounds.west),
    south: String(bounds.south),
    east: String(bounds.east),
    north: String(bounds.north),
  })
  const res = await fetch(apiUrl(`/api/elevation?${q}`))
  if (!res.ok) throw new Error(`Yükseklik ${res.status}`)
  const data = (await res.json()) as {
    cols: number
    rows: number
    relativeM: number[]
    minElevM: number
    maxElevM: number
  }
  if (!data.cols || !data.relativeM?.length) {
    throw new Error('Yükseklik ızgarası boş')
  }
  return {
    cols: data.cols,
    rows: data.rows,
    relativeM: Float32Array.from(data.relativeM),
    minElevM: data.minElevM,
    maxElevM: data.maxElevM,
  }
}

async function fetchFromOpenMeteo(
  bounds: SelectionBounds,
): Promise<ElevationGrid> {
  const n = gridSizeForBounds(bounds)
  const cols = n
  const rows = n
  const absolute = new Float32Array(cols * rows)
  const lats: number[] = []
  const lons: number[] = []
  const indices: number[] = []

  for (let r = 0; r < rows; r++) {
    const v = r / (rows - 1)
    const lat = bounds.south + v * (bounds.north - bounds.south)
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1)
      const lon = bounds.west + u * (bounds.east - bounds.west)
      lats.push(lat)
      lons.push(lon)
      indices.push(r * cols + c)
    }
  }

  const BATCH = 40
  for (let i = 0; i < lats.length; i += BATCH) {
    const elevs = await fetchOpenMeteoBatch(
      lats.slice(i, i + BATCH),
      lons.slice(i, i + BATCH),
    )
    for (let k = 0; k < elevs.length; k++) {
      absolute[indices[i + k]] = elevs[k]
    }
  }

  let minElevM = Infinity
  let maxElevM = -Infinity
  for (let i = 0; i < absolute.length; i++) {
    minElevM = Math.min(minElevM, absolute[i])
    maxElevM = Math.max(maxElevM, absolute[i])
  }
  if (!Number.isFinite(minElevM)) {
    minElevM = 0
    maxElevM = 0
  }

  const relativeM = new Float32Array(absolute.length)
  for (let i = 0; i < absolute.length; i++) {
    relativeM[i] = absolute[i] - minElevM
  }

  return { cols, rows, relativeM, minElevM, maxElevM }
}

/** Terrarium (backend) önce; olmazsa seyrek Open-Meteo. */
export async function fetchElevationGrid(
  bounds: SelectionBounds,
): Promise<ElevationGrid> {
  try {
    return await fetchFromBackend(bounds)
  } catch {
    return await fetchFromOpenMeteo(bounds)
  }
}

export function sampleElevation(
  grid: ElevationGrid,
  size: { width: number; depth: number },
  x: number,
  y: number,
): number {
  const { cols, rows, relativeM } = grid
  if (cols < 2 || rows < 2 || size.width <= 0 || size.depth <= 0) return 0

  const u = Math.min(1, Math.max(0, x / size.width))
  const v = Math.min(1, Math.max(0, y / size.depth))
  const gf = u * (cols - 1)
  const rf = v * (rows - 1)
  const c0 = Math.floor(gf)
  const r0 = Math.floor(rf)
  const c1 = Math.min(cols - 1, c0 + 1)
  const r1 = Math.min(rows - 1, r0 + 1)
  const tx = gf - c0
  const ty = rf - r0

  const h00 = relativeM[r0 * cols + c0]
  const h10 = relativeM[r0 * cols + c1]
  const h01 = relativeM[r1 * cols + c0]
  const h11 = relativeM[r1 * cols + c1]
  // Arazi mesh'iyle aynı iki üçgen: aksi halde yol/su yüzeyin üstünde/altında kalır
  if (tx + ty <= 1) {
    return h00 * (1 - tx - ty) + h10 * tx + h01 * ty
  }
  return h10 * (1 - ty) + h11 * (tx + ty - 1) + h01 * (1 - tx)
}

/**
 * Öğenin oturduğu zeminin en düşük ve en yüksek kotu. Sadece köşeler değil
 * içi de örneklenir: büyük bir taban eğimin tepesini içine alabiliyor.
 */
export function ringElevRange(
  grid: ElevationGrid | undefined,
  size: { width: number; depth: number },
  rings: [number, number][][],
): { min: number; max: number } {
  if (!grid || !rings.length) return { min: 0, max: 0 }
  let min = Infinity
  let max = -Infinity

  const take = (x: number, y: number) => {
    const e = sampleElevation(grid, size, x, y)
    if (!Number.isFinite(e)) return
    min = Math.min(min, e)
    max = Math.max(max, e)
  }

  for (const ring of rings) {
    if (!ring.length) continue
    const step = Math.max(1, Math.floor(ring.length / 24))
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (let i = 0; i < ring.length; i += step) {
      take(ring[i][0], ring[i][1])
      minX = Math.min(minX, ring[i][0])
      minY = Math.min(minY, ring[i][1])
      maxX = Math.max(maxX, ring[i][0])
      maxY = Math.max(maxY, ring[i][1])
    }
    // Taban içinden 3×3 örnek
    for (let iy = 1; iy <= 3; iy++) {
      for (let ix = 1; ix <= 3; ix++) {
        take(minX + ((maxX - minX) * ix) / 4, minY + ((maxY - minY) * iy) / 4)
      }
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 0 }
  return { min, max }
}

/** Küçük ölçekte kotun görünmesi için abartıyı yükselt */
export function visibleRelief(
  grid: ElevationGrid | undefined,
  size: { width: number; depth: number },
  userRelief: number,
): number {
  const user = Math.max(0.5, Math.min(userRelief, 8))
  if (!grid) return user
  const range = grid.maxElevM - grid.minElevM
  if (range < 1) return user
  const minSide = Math.min(size.width, size.depth)
  const target = minSide * 0.1
  const needed = target / range
  return Math.max(user, Math.min(needed, 4))
}
