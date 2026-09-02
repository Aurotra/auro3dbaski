import {
  bboxClip,
  featureCollection,
  lineIntersect,
  lineString,
  polygonize,
} from '@turf/turf'
import type { Feature, LineString, Position } from 'geojson'
import type { MapFeature } from '../types'
import type { ElevationGrid } from '../types'
import { polygonAreaM2, ringBounds } from './geo'
import { clipRingsToSize } from './clip'

type Pt = [number, number]

/** OSM kuralı: kıyı çizgisinde kara SOLDA → sağ taraf deniz/su */
function crossSide(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  px: number,
  py: number,
) {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax)
}

function distToSeg2(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  px: number,
  py: number,
) {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy || 1
  let t = ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const qx = ax + t * dx
  const qy = ay + t * dy
  const ex = px - qx
  const ey = py - qy
  return { d2: ex * ex + ey * ey, side: crossSide(ax, ay, bx, by, px, py) }
}

export function isWaterByCoastline(
  x: number,
  y: number,
  coastLines: Pt[][],
  flip = false,
): boolean {
  let best = Infinity
  let side = 0
  for (const line of coastLines) {
    for (let i = 0; i < line.length - 1; i++) {
      const a = line[i]
      const b = line[i + 1]
      const hit = distToSeg2(a[0], a[1], b[0], b[1], x, y)
      if (hit.d2 < best) {
        best = hit.d2
        side = hit.side
      }
    }
  }
  if (!Number.isFinite(best)) return false
  const onWater = side < 0
  return flip ? !onWater : onWater
}

export function shouldFlipCoastline(
  coastLines: Pt[][],
  landSamples: Pt[],
): boolean {
  if (!coastLines.length || landSamples.length < 3) return false
  let waterHits = 0
  for (const [x, y] of landSamples) {
    if (isWaterByCoastline(x, y, coastLines, false)) waterHits++
  }
  return waterHits > landSamples.length * 0.45
}

function asPt(c: Position): Pt {
  return [c[0], c[1]]
}

function samePt(a: Pt, b: Pt, eps = 1e-4) {
  return Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps
}

function closeRing(ring: Pt[]): Pt[] {
  if (!ring.length) return ring
  if (samePt(ring[0], ring[ring.length - 1])) return ring
  return [...ring, [ring[0][0], ring[0][1]]]
}

function keyPt(p: Pt) {
  return `${p[0].toFixed(3)},${p[1].toFixed(3)}`
}

/** Çizgiyi kesişim noktalarında parçala (polygonize için) */
function splitLineAtPoints(coords: Pt[], cuts: Pt[]): Pt[][] {
  if (coords.length < 2) return []
  const pts = coords.map((p) => [p[0], p[1]] as Pt)

  // Her kesişim için en yakın segmente projekte et ve araya ekle
  for (const cut of cuts) {
    let bestI = -1
    let bestT = 0
    let bestD = Infinity
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      const dx = b[0] - a[0]
      const dy = b[1] - a[1]
      const len2 = dx * dx + dy * dy || 1
      let t = ((cut[0] - a[0]) * dx + (cut[1] - a[1]) * dy) / len2
      t = Math.max(0, Math.min(1, t))
      const qx = a[0] + t * dx
      const qy = a[1] + t * dy
      const d = (cut[0] - qx) ** 2 + (cut[1] - qy) ** 2
      if (d < bestD) {
        bestD = d
        bestI = i
        bestT = t
      }
    }
    if (bestI < 0 || bestD > 1e-2) continue
    if (bestT < 1e-6 || bestT > 1 - 1e-6) continue
    const a = pts[bestI]
    const b = pts[bestI + 1]
    const inserted: Pt = [
      a[0] + bestT * (b[0] - a[0]),
      a[1] + bestT * (b[1] - a[1]),
    ]
    if (samePt(inserted, a) || samePt(inserted, b)) continue
    pts.splice(bestI + 1, 0, inserted)
  }

  const segs: Pt[][] = []
  for (let i = 0; i < pts.length - 1; i++) {
    if (!samePt(pts[i], pts[i + 1])) segs.push([pts[i], pts[i + 1]])
  }
  return segs
}

function densifyLine(pts: Pt[], stepM: number): Pt[] {
  if (pts.length < 2) return pts
  const out: Pt[] = [[pts[0][0], pts[0][1]]]
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const n = Math.max(1, Math.ceil(len / stepM))
    for (let k = 1; k <= n; k++) {
      const t = k / n
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
  }
  return out
}

function clipCoastToBBox(coast: Pt[], W: number, H: number): Pt[][] {
  try {
    const dense = densifyLine(coast, 3)
    const clipped = bboxClip(lineString(dense), [0, 0, W, H])
    if (!clipped?.geometry) return []
    if (clipped.geometry.type === 'LineString') {
      const c = clipped.geometry.coordinates.map(asPt)
      return c.length >= 2 ? [c] : []
    }
    if (clipped.geometry.type === 'MultiLineString') {
      return clipped.geometry.coordinates
        .map((c) => c.map(asPt))
        .filter((c) => c.length >= 2)
    }
  } catch {
    return []
  }
  return []
}

/**
 * Kıyı + seçim çerçevesi → düzgün su poligonları (ızgara yok)
 */
function waterRingsFromCoastline(
  size: { width: number; depth: number },
  coastLines: Pt[][],
  flip: boolean,
): Pt[][] {
  const W = size.width
  const H = size.depth
  if (W <= 0 || H <= 0 || !coastLines.length) return []

  const border: Feature<LineString>[] = [
    lineString([
      [0, 0],
      [W, 0],
    ]),
    lineString([
      [W, 0],
      [W, H],
    ]),
    lineString([
      [W, H],
      [0, H],
    ]),
    lineString([
      [0, H],
      [0, 0],
    ]),
  ]

  const coastFeats: Feature<LineString>[] = []
  for (const coast of coastLines) {
    for (const piece of clipCoastToBBox(coast, W, H)) {
      // Köşeleri yuvarla — floating nokta birleşimi için
      const cleaned = piece.map(
        (p) =>
          [
            Math.min(W, Math.max(0, p[0])),
            Math.min(H, Math.max(0, p[1])),
          ] as Pt,
      )
      if (cleaned.length >= 2) coastFeats.push(lineString(cleaned))
    }
  }
  if (!coastFeats.length) return []

  // Tüm kesişim noktalarını topla
  const cutByLine = new Map<string, Pt[]>()
  const ensure = (id: string) => {
    if (!cutByLine.has(id)) cutByLine.set(id, [])
    return cutByLine.get(id)!
  }

  const allLines = [...border, ...coastFeats]
  for (let i = 0; i < allLines.length; i++) {
    for (let j = i + 1; j < allLines.length; j++) {
      try {
        const hits = lineIntersect(allLines[i], allLines[j])
        for (const f of hits.features) {
          const p = asPt(f.geometry.coordinates)
          ensure(`b${i}`).push(p)
          ensure(`b${j}`).push(p)
        }
      } catch {
        /* ignore */
      }
    }
  }

  // Parçalara bölünmüş kenar ağı
  const network: Feature<LineString>[] = []
  const seen = new Set<string>()
  allLines.forEach((line, idx) => {
    const coords = line.geometry.coordinates.map(asPt)
    const cuts = cutByLine.get(`b${idx}`) ?? []
    for (const seg of splitLineAtPoints(coords, cuts)) {
      const a = keyPt(seg[0])
      const b = keyPt(seg[1])
      const k = a < b ? `${a}|${b}` : `${b}|${a}`
      if (seen.has(k)) continue
      seen.add(k)
      network.push(lineString(seg))
    }
  })

  if (network.length < 3) return []

  let polys
  try {
    polys = polygonize(featureCollection(network))
  } catch {
    return []
  }

  const rings: Pt[][] = []
  for (const f of polys.features) {
    if (f.geometry.type !== 'Polygon') continue
    const outer = f.geometry.coordinates[0]?.map(asPt)
    if (!outer || outer.length < 4) continue
    if (polygonAreaM2(outer) < 4) continue
    if (!ringIsWater(outer, coastLines, flip)) continue
    rings.push(closeRing(outer))
  }

  return rings
}

/**
 * Poligonun su tarafında olup olmadığını iç noktalarla oyla.
 * Köşe ortalaması (centroid) kullanılamaz: yoğunlaştırılmış kıyı çizgisinin
 * binlerce noktası ortalamayı kıyının üstüne çeker ve karar rastgeleleşir.
 */
function ringIsWater(ring: Pt[], coastLines: Pt[][], flip: boolean): boolean {
  const bb = ringBounds(ring)
  const inside: Pt[] = []
  const n = 9
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= n; j++) {
      const x = bb.minX + ((bb.maxX - bb.minX) * i) / (n + 1)
      const y = bb.minY + ((bb.maxY - bb.minY) * j) / (n + 1)
      if (pointInRing(x, y, ring)) inside.push([x, y])
    }
  }
  if (!inside.length) return false

  let water = 0
  for (const [x, y] of inside) {
    if (isWaterByCoastline(x, y, coastLines, flip)) water++
  }
  return water * 2 > inside.length
}

function pointInRing(x: number, y: number, ring: Pt[]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Su yüzeyi: etiketlenmiş su + kıyı poligonları.
 * İçinde bina örneği olan poligonlar elenir (su karayı örtmesin).
 */
export function buildCoastalWaterRings(
  size: { width: number; depth: number },
  coastLines: Pt[][],
  taggedWaterRings: Pt[][],
  flipCoastline = false,
  landSamples: Pt[] = [],
): Pt[][] {
  const rings: Pt[][] = []

  if (taggedWaterRings.length) {
    rings.push(...clipRingsToSize(taggedWaterRings, size))
  }

  if (coastLines.length) {
    rings.push(...waterRingsFromCoastline(size, coastLines, flipCoastline))
  }

  const bboxArea = size.width * size.depth

  return rings.filter((r) => {
    if (r.length < 4) return false
    const a = polygonAreaM2(r)
    if (a < 8) return false
    // Kıyı seçiminde deniz kutunun çoğunu kaplar — bunu hata sanıp atma.
    // Sadece neredeyse tüm kutuyu kaplayan VE içinde bol bina olan halkayı ele.
    if (landSamples.length && a > bboxArea * 0.92) {
      let hits = 0
      for (const [x, y] of landSamples) {
        if (pointInRing(x, y, r)) hits++
      }
      if (hits > Math.max(8, landSamples.length * 0.4)) return false
    }
    return true
  })
}

export function waterFeaturesFromRings(
  rings: Pt[][],
  prefix: string,
): MapFeature[] {
  const valid = rings.filter((ring) => {
    if (ring.length < 4) return false
    return polygonAreaM2(ring) >= 4
  })
  if (!valid.length) return []

  let totalArea = 0
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const ring of valid) {
    totalArea += polygonAreaM2(ring)
    const bb = ringBounds(ring)
    minX = Math.min(minX, bb.minX)
    minY = Math.min(minY, bb.minY)
    maxX = Math.max(maxX, bb.maxX)
    maxY = Math.max(maxY, bb.maxY)
  }

  return [
    {
      id: prefix,
      kind: 'water',
      name: 'Su',
      rings: valid,
      heightM: 1.15,
      areaM2: totalArea,
      widthM: maxX - minX,
      depthM: maxY - minY,
      tags: { natural: 'water', source: 'coastline-vector' },
    },
  ]
}

/**
 * Arazi hücrelerini su/kara olarak işaretle. Kıyı çizgisinin sağ tarafı deniz;
 * etiketlenmiş göl/nehir halkaları da su. Bina merkezli hücreler kara kalır
 * ki yalı denizi silmesin ama binanın oturduğu kare su olmasın.
 */
export function buildWaterMask(
  grid: ElevationGrid,
  size: { width: number; depth: number },
  coastLines: Pt[][],
  taggedWaterRings: Pt[][],
  flipCoastline: boolean,
  _buildingCenters: Pt[] = [],
): Uint8Array {
  const cols = grid.cols
  const rows = grid.rows
  const mask = new Uint8Array(Math.max(0, (rows - 1) * (cols - 1)))
  if (cols < 2 || rows < 2) return mask
  if (!coastLines.length && !taggedWaterRings.length) return mask

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const x = ((c + 0.5) / (cols - 1)) * size.width
      const y = ((r + 0.5) / (rows - 1)) * size.depth
      let water = false
      if (taggedWaterRings.length) {
        for (const ring of taggedWaterRings) {
          if (ring.length >= 4 && pointInRing(x, y, ring)) {
            water = true
            break
          }
        }
      }
      if (!water && coastLines.length) {
        water = isWaterByCoastline(x, y, coastLines, flipCoastline)
      }
      if (water) mask[r * (cols - 1) + c] = 1
    }
  }
  return mask
}
