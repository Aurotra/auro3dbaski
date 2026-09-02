/**
 * TrailPrint3D / PrintPal tarzı zemin katmanları: öğeyi arazi ızgarasına boya.
 *
 * Büyük poligonları tek prizma olarak basmak eğimde üçgenleri havaya kaldırır
 * (sadece dış hat araziye oturur, içi kiriş gibi gerilir). Izgara derisi her
 * hücrede arazi köşelerini birebir kullanır; yol şeridi ise merkez çizgiden
 * sık örneklenir. Köprülerde tabliye uç kotları arasında kalır, ayaklar yere iner.
 */

import type { ElevationGrid } from '../types'
import type { SolidMesh } from './treeSolid'
import { sampleElevation } from './elevation'

export type GroundMm = (xMm: number, yMm: number) => number

export function pointInRing(
  x: number,
  y: number,
  ring: [number, number][],
): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi) {
      inside = !inside
    }
  }
  return inside
}

export function pointInRings(
  x: number,
  y: number,
  rings: [number, number][][],
): boolean {
  for (const ring of rings) {
    if (ring.length >= 4 && pointInRing(x, y, ring)) return true
  }
  return false
}

function appendQuad(
  mesh: SolidMesh,
  corners: [number, number, number][],
  top: [number, number, number][],
) {
  const b = mesh.vertices.length
  mesh.vertices.push(...corners, ...top)
  // alt (aşağı bakar)
  mesh.triangles.push([b + 0, b + 2, b + 1], [b + 0, b + 3, b + 2])
  // üst
  mesh.triangles.push([b + 4, b + 5, b + 6], [b + 4, b + 6, b + 7])
  // yanlar
  const order: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
  ]
  for (const [i, j] of order) {
    mesh.triangles.push([b + i, b + j, b + j + 4], [b + i, b + j + 4, b + i + 4])
  }
}

function cellZ(
  grid: ElevationGrid,
  r: number,
  c: number,
  baseH: number,
  relief: number,
  scale: number,
): number {
  const e = grid.relativeM[r * grid.cols + c]
  const v = Number.isFinite(e) ? Math.max(0, Math.min(e, 8000)) : 0
  return baseH + v * relief * scale
}

/**
 * Poligonları (veya hazır maskeyi) arazi hücrelerine boya.
 * Her dolu hücre, araziyle aynı 4 köşeyi kullanır — eğim kilitlenir.
 */
export function gridSkin(
  grid: ElevationGrid,
  sizeM: { width: number; depth: number },
  scale: number,
  baseH: number,
  relief: number,
  heightMm: number,
  occupied: Uint8Array,
): SolidMesh | null {
  const { cols, rows } = grid
  if (cols < 2 || rows < 2) return null
  const W = sizeM.width * scale
  const D = sizeM.depth * scale
  const sink = Math.min(heightMm * 0.45, 0.12)
  const mesh: SolidMesh = { vertices: [], triangles: [] }

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      if (!occupied[r * (cols - 1) + c]) continue
      const x0 = (c / (cols - 1)) * W
      const x1 = ((c + 1) / (cols - 1)) * W
      const y0 = (r / (rows - 1)) * D
      const y1 = ((r + 1) / (rows - 1)) * D
      const z00 = cellZ(grid, r, c, baseH, relief, scale)
      const z10 = cellZ(grid, r, c + 1, baseH, relief, scale)
      const z01 = cellZ(grid, r + 1, c, baseH, relief, scale)
      const z11 = cellZ(grid, r + 1, c + 1, baseH, relief, scale)
      appendQuad(
        mesh,
        [
          [x0, y0, z00 - sink],
          [x1, y0, z10 - sink],
          [x1, y1, z11 - sink],
          [x0, y1, z01 - sink],
        ],
        [
          [x0, y0, z00 + heightMm],
          [x1, y0, z10 + heightMm],
          [x1, y1, z11 + heightMm],
          [x0, y1, z01 + heightMm],
        ],
      )
    }
  }

  return mesh.triangles.length ? mesh : null
}

export function ringsToMask(
  grid: ElevationGrid,
  sizeM: { width: number; depth: number },
  rings: [number, number][][],
): Uint8Array {
  const cols = grid.cols
  const rows = grid.rows
  const mask = new Uint8Array((rows - 1) * (cols - 1))
  if (!rings.length || cols < 2 || rows < 2) return mask
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const x = ((c + 0.5) / (cols - 1)) * sizeM.width
      const y = ((r + 0.5) / (rows - 1)) * sizeM.depth
      if (pointInRings(x, y, rings)) mask[r * (cols - 1) + c] = 1
    }
  }
  return mask
}

function densifyPath(
  path: [number, number][],
  maxStep: number,
): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < path.length; i++) {
    if (i === 0) {
      out.push(path[i])
      continue
    }
    const a = path[i - 1]
    const b = path[i]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const n = Math.max(1, Math.ceil(len / Math.max(0.8, maxStep)))
    for (let k = 1; k <= n; k++) {
      const t = k / n
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
  }
  return out.filter((p, i, arr) => {
    if (i === 0) return true
    return Math.hypot(p[0] - arr[i - 1][0], p[1] - arr[i - 1][1]) > 0.12
  })
}

function perpAt(
  pts: [number, number][],
  i: number,
): [number, number] {
  const a = pts[Math.max(0, i - 1)]
  const b = pts[Math.min(pts.length - 1, i + 1)]
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  return [-dy / len, dx / len]
}

/**
 * Yolu araziye yapışık şerit olarak üret. Köprü değilse her kesit yerel kota
 * oturur; üst yüzey yalnızca heightMm kadar yükselir.
 */
export function roadRibbon(
  path: [number, number][],
  halfWidthM: number,
  scale: number,
  groundAt: GroundMm,
  heightMm: number,
  maxStepM: number,
): SolidMesh | null {
  const pts = densifyPath(path, maxStepM)
  if (pts.length < 2) return null
  const sink = Math.min(heightMm * 0.22, 0.07)
  const mesh: SolidMesh = { vertices: [], triangles: [] }

  const left: [number, number, number][] = []
  const right: [number, number, number][] = []
  for (let i = 0; i < pts.length; i++) {
    const [nx, ny] = perpAt(pts, i)
    const lx = (pts[i][0] + nx * halfWidthM) * scale
    const ly = (pts[i][1] + ny * halfWidthM) * scale
    const rx = (pts[i][0] - nx * halfWidthM) * scale
    const ry = (pts[i][1] - ny * halfWidthM) * scale
    left.push([lx, ly, groundAt(lx, ly)])
    right.push([rx, ry, groundAt(rx, ry)])
  }

  for (let i = 0; i + 1 < pts.length; i++) {
    appendQuad(
      mesh,
      [
        [left[i][0], left[i][1], left[i][2] - sink],
        [right[i][0], right[i][1], right[i][2] - sink],
        [right[i + 1][0], right[i + 1][1], right[i + 1][2] - sink],
        [left[i + 1][0], left[i + 1][1], left[i + 1][2] - sink],
      ],
      [
        [left[i][0], left[i][1], left[i][2] + heightMm],
        [right[i][0], right[i][1], right[i][2] + heightMm],
        [right[i + 1][0], right[i + 1][1], right[i + 1][2] + heightMm],
        [left[i + 1][0], left[i + 1][1], left[i + 1][2] + heightMm],
      ],
    )
  }
  return mesh.triangles.length ? mesh : null
}

function boxSolid(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  z0: number,
  z1: number,
): SolidMesh {
  const mesh: SolidMesh = { vertices: [], triangles: [] }
  appendQuad(
    mesh,
    [
      [x0, y0, z0],
      [x1, y0, z0],
      [x1, y1, z0],
      [x0, y1, z0],
    ],
    [
      [x0, y0, z1],
      [x1, y0, z1],
      [x1, y1, z1],
      [x0, y1, z1],
    ],
  )
  return mesh
}

function mergeSolids(parts: SolidMesh[]): SolidMesh | null {
  const out: SolidMesh = { vertices: [], triangles: [] }
  for (const p of parts) {
    const o = out.vertices.length
    out.vertices.push(...p.vertices)
    for (const t of p.triangles) out.triangles.push([t[0] + o, t[1] + o, t[2] + o])
  }
  return out.triangles.length ? out : null
}

/**
 * Köprü: tabliye uçlardaki zemin kotları arasında doğrusal kalır (vadiye inmez).
 * Açıklık yeterince yüksekse baskıya uygun ayaklar yere iner.
 */
export function bridgeSolid(
  path: [number, number][],
  halfWidthM: number,
  scale: number,
  groundAt: GroundMm,
  heightMm: number,
  maxStepM: number,
): SolidMesh | null {
  const pts = densifyPath(path, maxStepM)
  if (pts.length < 2) return null

  const start = pts[0]
  const end = pts[pts.length - 1]
  const zA = groundAt(start[0] * scale, start[1] * scale)
  const zB = groundAt(end[0] * scale, end[1] * scale)
  let total = 0
  const dist = [0]
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    dist.push(total)
  }
  if (total < 1e-3) return null

  const sink = Math.min(heightMm * 0.35, 0.1)
  const deck: SolidMesh = { vertices: [], triangles: [] }
  const left: [number, number, number][] = []
  const right: [number, number, number][] = []
  const deckZ: number[] = []

  for (let i = 0; i < pts.length; i++) {
    const t = dist[i] / total
    const z = zA + (zB - zA) * t
    const [nx, ny] = perpAt(pts, i)
    const lx = (pts[i][0] + nx * halfWidthM) * scale
    const ly = (pts[i][1] + ny * halfWidthM) * scale
    const rx = (pts[i][0] - nx * halfWidthM) * scale
    const ry = (pts[i][1] - ny * halfWidthM) * scale
    left.push([lx, ly, z])
    right.push([rx, ry, z])
    deckZ.push(z)
  }

  for (let i = 0; i + 1 < pts.length; i++) {
    appendQuad(
      deck,
      [
        [left[i][0], left[i][1], left[i][2] - sink],
        [right[i][0], right[i][1], right[i][2] - sink],
        [right[i + 1][0], right[i + 1][1], right[i + 1][2] - sink],
        [left[i + 1][0], left[i + 1][1], left[i + 1][2] - sink],
      ],
      [
        [left[i][0], left[i][1], left[i][2] + heightMm],
        [right[i][0], right[i][1], right[i][2] + heightMm],
        [right[i + 1][0], right[i + 1][1], right[i + 1][2] + heightMm],
        [left[i + 1][0], left[i + 1][1], left[i + 1][2] + heightMm],
      ],
    )
  }

  const parts: SolidMesh[] = [deck]
  const pierStepM = Math.max(28, halfWidthM * 8)
  const pierHalf = Math.max(0.55, Math.min(halfWidthM * scale * 0.35, 1.0))
  let acc = 0
  for (let i = 1; i + 1 < pts.length; i++) {
    acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    if (acc < pierStepM) continue
    acc = 0
    const cx = pts[i][0] * scale
    const cy = pts[i][1] * scale
    const g = groundAt(cx, cy)
    const top = deckZ[i] - sink
    if (top - g < 2.2) continue
    parts.push(
      boxSolid(
        cx - pierHalf,
        cy - pierHalf,
        cx + pierHalf,
        cy + pierHalf,
        g - 0.15,
        top,
      ),
    )
  }

  return mergeSolids(parts)
}

export function isBridgeTags(tags: Record<string, string>): boolean {
  const b = (tags.bridge || '').toLowerCase()
  if (b && b !== 'no') return true
  return (tags.man_made || '').toLowerCase() === 'bridge'
}

export function pathLooksLikeBridge(
  path: [number, number][],
  scale: number,
  groundAt: GroundMm,
): boolean {
  if (path.length < 3) return false
  const z0 = groundAt(path[0][0] * scale, path[0][1] * scale)
  const z1 = groundAt(
    path[path.length - 1][0] * scale,
    path[path.length - 1][1] * scale,
  )
  const hold = Math.min(z0, z1)
  let deepest = hold
  const step = Math.max(1, Math.floor(path.length / 12))
  for (let i = 1; i < path.length - 1; i += step) {
    deepest = Math.min(
      deepest,
      groundAt(path[i][0] * scale, path[i][1] * scale),
    )
  }
  // Baskıda ~1.2 mm'den derin bir çukur: yol vadiye inmesin, köprü olsun
  return hold - deepest > 1.15
}

export function pathLengthM(path: [number, number][]): number {
  let n = 0
  for (let i = 1; i < path.length; i++) {
    n += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1])
  }
  return n
}

export function isTunnelTags(tags: Record<string, string>): boolean {
  const t = (tags.tunnel || '').toLowerCase()
  return Boolean(t && t !== 'no')
}

/** Yol adımı: arazi hücresinden büyük olmasın, yoksa şerit vadinin üstünden atlar */
export function roadSampleStepM(
  grid: ElevationGrid | undefined,
  sizeM: { width: number; depth: number },
): number {
  if (!grid || grid.cols < 2 || grid.rows < 2) return 6
  const cell = Math.min(
    sizeM.width / (grid.cols - 1),
    sizeM.depth / (grid.rows - 1),
  )
  return Math.max(3, Math.min(8, cell * 0.85))
}

export function terrainGroundMm(
  grid: ElevationGrid | undefined,
  sizeM: { width: number; depth: number },
  scale: number,
  baseH: number,
  relief: number,
): GroundMm {
  return (xMm, yMm) => {
    if (!grid) return baseH
    const e = sampleElevation(grid, sizeM, xMm / scale, yMm / scale)
    const v = Number.isFinite(e) ? Math.max(0, Math.min(e, 8000)) : 0
    return baseH + v * relief * scale
  }
}
