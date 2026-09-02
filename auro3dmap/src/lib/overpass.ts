import type { MapFeature, SelectionBounds, SceneModel } from '../types'
import { LAYER_ORDER } from '../types'
import {
  boundsSizeM,
  lonLatToLocal,
  polygonAreaM2,
  ringBounds,
} from './geo'
import { clipLineToSize, clipRingToSize, clipRingsToSize } from './clip'
import {
  buildCoastalWaterRings,
  buildWaterMask,
  shouldFlipCoastline,
  waterFeaturesFromRings,
} from './water'
import { fetchElevationGrid } from './elevation'
import { isTunnelTags } from './surfaceSkin'
import {
  estimateMlHeightM,
  fetchMlBuildings,
  type MlBuilding,
} from './mlBuildings'

interface OsmNode {
  type: 'node'
  id: number
  lat: number
  lon: number
  tags?: Record<string, string>
}

interface OsmWay {
  type: 'way'
  id: number
  nodes: number[]
  tags?: Record<string, string>
}

interface OsmRelation {
  type: 'relation'
  id: number
  members: { type: string; ref: number; role: string }[]
  tags?: Record<string, string>
}

type OsmElement = OsmNode | OsmWay | OsmRelation

interface OverpassResponse {
  elements: OsmElement[]
}

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

/** Aynalar yoğunken 504/timeout normal; toplam bütçe içinde sırayla tekrar dene. */
const OVERPASS_BUDGET_MS = 150_000
const OVERPASS_ATTEMPT_MS = 45_000

function bboxClause(b: SelectionBounds) {
  return `${b.south},${b.west},${b.north},${b.east}`
}

function buildQuery(bounds: SelectionBounds) {
  // Kıyı çizgisi için kutuyu biraz genişlet (kenardan geçen coastline kaçmasın)
  const pad = 0.003
  const bb = bboxClause(bounds)
  const bbCoast = bboxClause({
    west: bounds.west - pad,
    south: bounds.south - pad,
    east: bounds.east + pad,
    north: bounds.north + pad,
  })
  const pavedRe =
    '^(residential|commercial|industrial|retail|construction|brownfield|garages|railway)$'
  const greenRe =
    '^(forest|grass|meadow|orchard|vineyard|village_green|recreation_ground|allotments|cemetery|farmland|greenfield|plant_nursery)$'
  const naturalGreenRe = '^(wood|scrub|grassland|heath|tree_row)$'
  const leisureRe =
    '^(park|garden|golf_course|playground|pitch|nature_reserve|dog_park)$'

  return `
[out:json][timeout:120];
(
  way["building"](${bb});
  relation["building"](${bb});
  way["highway"](${bb});
  way["landuse"~"${pavedRe}"](${bb});
  relation["landuse"~"${pavedRe}"](${bb});
  way["landuse"~"${greenRe}"](${bb});
  relation["landuse"~"${greenRe}"](${bb});
  way["natural"~"${naturalGreenRe}"](${bb});
  relation["natural"~"${naturalGreenRe}"](${bb});
  way["leisure"~"${leisureRe}"](${bb});
  relation["leisure"~"${leisureRe}"](${bb});
  way["amenity"="parking"](${bb});
  relation["amenity"="parking"](${bb});
  way["place"="square"](${bb});
  way["area:highway"](${bb});
  way["man_made"="pier"](${bb});
  way["man_made"="bridge"](${bb});
  node["natural"="tree"](${bb});
  way["natural"="water"](${bb});
  way["natural"="wetland"](${bb});
  way["natural"="bay"](${bb});
  way["water"](${bb});
  way["waterway"](${bb});
  way["landuse"="reservoir"](${bb});
  way["landuse"="basin"](${bb});
  way["leisure"="swimming_pool"](${bb});
  relation["natural"="water"](${bb});
  relation["natural"="wetland"](${bb});
  relation["water"](${bb});
  relation["waterway"](${bb});
  relation["landuse"="reservoir"](${bb});
  relation["landuse"="basin"](${bb});
  way["natural"="coastline"](${bbCoast});
);
out body;
>;
out skel qt;
`.trim()
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function postOverpass(
  url: string,
  query: string,
  timeoutMs: number,
): Promise<OverpassResponse> {
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`Harita verisi ${res.status}`)
    return (await res.json()) as OverpassResponse
  } catch (err) {
    if (ctrl.signal.aborted) throw new Error('Harita verisi zaman aşımı')
    throw err instanceof Error ? err : new Error(String(err))
  } finally {
    window.clearTimeout(timer)
  }
}

function overpassError(last: Error | null): Error {
  const msg = last?.message ?? ''
  if (/zaman aşımı|Harita verisi (429|502|503|504)|Overpass (429|502|503|504)/.test(msg)) {
    return new Error(
      'Harita sunucuları şu an yoğun. Birkaç saniye sonra tekrar deneyin ya da alanı küçültün.',
    )
  }
  return last ?? new Error('Harita verisi alınamadı')
}

async function fetchOverpass(query: string): Promise<OverpassResponse> {
  const deadline = Date.now() + OVERPASS_BUDGET_MS
  let lastError: Error | null = null
  let round = 0

  while (Date.now() < deadline) {
    for (const url of OVERPASS_URLS) {
      const left = deadline - Date.now()
      if (left <= 0) break
      try {
        return await postOverpass(url, query, Math.min(OVERPASS_ATTEMPT_MS, left))
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }
    round += 1
    const wait = round === 1 ? 1500 : 4000
    if (Date.now() + wait >= deadline) break
    await delay(wait)
  }

  throw overpassError(lastError)
}

function parseMeters(raw: string | undefined): number | null {
  if (!raw) return null
  const m = raw.replace(',', '.').match(/-?\d+(\.\d+)?/)
  if (!m) return null
  const v = Number(m[0])
  return Number.isFinite(v) ? v : null
}

function buildingHeight(tags: Record<string, string>): number {
  const h = parseMeters(tags.height)
  if (h != null && h > 1.5 && h < 80) return h

  const levels = parseMeters(tags['building:levels'])
  if (levels != null && levels > 0) return Math.min(Math.max(levels, 1) * 3.1, 300)

  const kind = (tags.building || '').toLowerCase()
  if (kind === 'house' || kind === 'detached' || kind === 'semidetached_house') {
    return 6.5
  }
  if (kind === 'apartments' || kind === 'residential') return 15
  if (kind === 'commercial' || kind === 'retail' || kind === 'office') return 12
  if (kind === 'industrial' || kind === 'warehouse') return 10
  if (kind === 'church' || kind === 'cathedral' || kind === 'mosque') return 16
  if (kind === 'garage' || kind === 'garages' || kind === 'shed' || kind === 'hut') {
    return 3.2
  }
  return 8
}

/** Zemin kaplaması beton/asfalt mı? (yeşil alan sanılmasın) */
function isHardSurface(tags: Record<string, string>): boolean {
  const s = (tags.surface || '').toLowerCase()
  return /^(asphalt|concrete|paving_stones|sett|cobblestone|paved|metal|wood|compacted|tartan|artificial_turf)$/.test(
    s,
  )
}

const PAVED_LANDUSE =
  /^(residential|commercial|industrial|retail|construction|brownfield|garages|railway)$/
const GREEN_LANDUSE =
  /^(forest|grass|meadow|orchard|vineyard|village_green|recreation_ground|allotments|cemetery|farmland|greenfield|plant_nursery)$/
const GREEN_NATURAL = /^(wood|scrub|grassland|heath|tree_row)$/
const GREEN_LEISURE =
  /^(park|garden|golf_course|playground|nature_reserve|dog_park)$/

/** Ağaç üretilecek alanlar: orman, koru, meyve bahçesi, ağaç sırası */
export function isWooded(tags: Record<string, string>): boolean {
  if (tags.natural === 'wood' || tags.natural === 'tree_row') return true
  if (tags.landuse === 'forest' || tags.landuse === 'orchard') return true
  if (tags.leisure === 'nature_reserve') return true
  return false
}

function classify(tags: Record<string, string>): MapFeature['kind'] | null {
  // Su önce — bazı öğelerde highway+köprü vs. çakışmasın diye building hariç
  if (tags.building) return 'building'

  const waterway = tags.waterway
  if (
    tags.natural === 'water' ||
    tags.natural === 'wetland' ||
    tags.natural === 'bay' ||
    tags.water ||
    tags.landuse === 'reservoir' ||
    tags.landuse === 'basin' ||
    tags.leisure === 'swimming_pool' ||
    (waterway &&
      /^(river|riverbank|stream|canal|drain|ditch|tidal_channel|fairway)$/.test(
        waterway,
      ))
  ) {
    return 'water'
  }

  // Beton/asfalt zeminler: otopark, meydan, iskele, yaya alanı
  if (
    tags['area:highway'] ||
    tags.place === 'square' ||
    tags.man_made === 'pier' ||
    (tags.amenity === 'parking' && !/grass|gravel|ground|dirt/.test(tags.surface || '')) ||
    (tags.highway &&
      /^(pedestrian|footway|service|platform)$/.test(tags.highway) &&
      tags.area === 'yes') ||
    (tags.leisure === 'pitch' && isHardSurface(tags)) ||
    PAVED_LANDUSE.test(tags.landuse || '')
  ) {
    return 'paved'
  }

  if (
    GREEN_LANDUSE.test(tags.landuse || '') ||
    GREEN_NATURAL.test(tags.natural || '') ||
    GREEN_LEISURE.test(tags.leisure || '') ||
    (tags.leisure === 'pitch' && !isHardSurface(tags))
  ) {
    return 'green'
  }

  if (tags.highway) return 'road'
  if ((tags.man_made || '') === 'bridge') return 'road'
  return null
}

function roadWidth(tags: Record<string, string>): number {
  if (tags.width) {
    const parsed = parseFloat(tags.width.replace(',', '.'))
    if (!Number.isNaN(parsed) && parsed > 1) return Math.min(parsed, 28)
  }
  if (tags.lanes) {
    const lanes = parseFloat(tags.lanes.replace(',', '.'))
    if (!Number.isNaN(lanes) && lanes > 0) return Math.min(lanes * 3.6 + 1.2, 28)
  }
  const hw = tags.highway
  if (hw === 'motorway' || hw === 'motorway_link') return 16
  if (hw === 'trunk' || hw === 'trunk_link') return 14
  if (hw === 'primary' || hw === 'primary_link') return 12
  if (hw === 'secondary' || hw === 'secondary_link') return 10
  if (hw === 'tertiary' || hw === 'tertiary_link') return 9
  if (hw === 'residential' || hw === 'unclassified' || hw === 'living_street') {
    return 8
  }
  if (hw === 'service') return 5.5
  if (hw === 'cycleway') return 3.2
  if (hw === 'footway' || hw === 'path' || hw === 'steps' || hw === 'pedestrian') {
    return 2.8
  }
  return 7
}

function waterwayHalfWidth(tags: Record<string, string>): number {
  const w = tags.waterway
  if (w === 'river' || w === 'riverbank' || w === 'tidal_channel') return 8
  if (w === 'canal') return 5
  if (w === 'stream') return 3
  if (w === 'drain' || w === 'ditch') return 1.5
  if (tags.width) {
    const parsed = parseFloat(tags.width.replace(',', '.'))
    if (!Number.isNaN(parsed) && parsed > 0) return Math.min(parsed / 2, 40)
  }
  return 4
}

function samePt(a: [number, number], b: [number, number], eps = 1e-6) {
  return Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps
}

function densifyLine(
  points: [number, number][],
  maxStep = 16,
): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < points.length; i++) {
    const cur = points[i]
    if (i === 0) {
      out.push(cur)
      continue
    }
    const prev = points[i - 1]
    const dist = Math.hypot(cur[0] - prev[0], cur[1] - prev[1])
    const steps = Math.max(1, Math.ceil(dist / maxStep))
    for (let k = 1; k <= steps; k++) {
      const t = k / steps
      out.push([prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t])
    }
  }
  return out
}

function discRing(
  center: [number, number],
  radius: number,
  sides = 8,
): [number, number][] {
  const ring: [number, number][] = []
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2
    ring.push([center[0] + Math.cos(a) * radius, center[1] + Math.sin(a) * radius])
  }
  ring.push([...ring[0]] as [number, number])
  return ring
}

/**
 * Çizgiyi konveks parçalara aç: her segment bir dörtgen, her gerçek dönüşe
 * küçük bir disk. Tek halkalı tampon keskin dönüşlerde kendini kesiyor,
 * üçgenleme de bunu "sıvanmış" yüzeylere çeviriyordu. Parçalar araziye tek tek
 * giydirildiği için ek yerleri aynı kotta kalır, basamak oluşmaz.
 */
function stripPieces(
  points: [number, number][],
  halfWidth: number,
  maxStep = 22,
): [number, number][][] {
  const pts = densifyLine(points, maxStep).filter((p, i, arr) => {
    if (i === 0) return true
    return Math.hypot(p[0] - arr[i - 1][0], p[1] - arr[i - 1][1]) > 0.15
  })
  if (pts.length < 2) return []

  const pieces: [number, number][][] = []

  for (let i = 0; i + 1 < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    const len = Math.hypot(x2 - x1, y2 - y1)
    if (len < 1e-3) continue
    const nx = (-(y2 - y1) / len) * halfWidth
    const ny = ((x2 - x1) / len) * halfWidth
    pieces.push([
      [x1 + nx, y1 + ny],
      [x2 + nx, y2 + ny],
      [x2 - nx, y2 - ny],
      [x1 - nx, y1 - ny],
      [x1 + nx, y1 + ny],
    ])
  }

  // Dönüş noktalarında dış kenarda kalan boşluğu disk kapatır
  for (let i = 1; i + 1 < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const c = pts[i + 1]
    const a1 = Math.atan2(b[1] - a[1], b[0] - a[0])
    const a2 = Math.atan2(c[1] - b[1], c[0] - b[0])
    let turn = Math.abs(a2 - a1)
    if (turn > Math.PI) turn = Math.PI * 2 - turn
    if (turn > 0.12) pieces.push(discRing(b, halfWidth))
  }

  return pieces
}

function closeRing(ring: [number, number][]): [number, number][] {
  if (ring.length === 0) return ring
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (samePt(first, last)) return ring
  return [...ring, [...first] as [number, number]]
}

function isClosedRing(pts: [number, number][]) {
  return pts.length >= 4 && samePt(pts[0], pts[pts.length - 1])
}

/** Multipolygon outer way parçalarını uç noktalarından birleştir */
function assembleRings(segments: [number, number][][]): [number, number][][] {
  const pending = segments
    .map((s) => s.filter((_, i, arr) => i === 0 || !samePt(arr[i], arr[i - 1])))
    .filter((s) => s.length >= 2)
    .map((s) => [...s])

  const rings: [number, number][][] = []

  while (pending.length) {
    let chain = pending.shift()!
    let guard = 0
    let extended = true

    while (extended && guard++ < 500) {
      extended = false
      for (let i = 0; i < pending.length; i++) {
        const seg = pending[i]
        const head = chain[0]
        const tail = chain[chain.length - 1]
        const s0 = seg[0]
        const s1 = seg[seg.length - 1]

        if (samePt(tail, s0)) {
          chain.push(...seg.slice(1))
          pending.splice(i, 1)
          extended = true
          break
        }
        if (samePt(tail, s1)) {
          chain.push(...[...seg].reverse().slice(1))
          pending.splice(i, 1)
          extended = true
          break
        }
        if (samePt(head, s1)) {
          chain = [...seg.slice(0, -1), ...chain]
          pending.splice(i, 1)
          extended = true
          break
        }
        if (samePt(head, s0)) {
          chain = [...[...seg].reverse().slice(0, -1), ...chain]
          pending.splice(i, 1)
          extended = true
          break
        }
      }
    }

    const closed = closeRing(chain)
    if (closed.length >= 4) rings.push(closed)
  }

  return rings
}

function ringCentroid(ring: [number, number][]): [number, number] | null {
  const n =
    ring.length >= 2 && samePt(ring[0], ring[ring.length - 1])
      ? ring.length - 1
      : ring.length
  if (n < 1) return null
  let sx = 0
  let sy = 0
  for (let i = 0; i < n; i++) {
    sx += ring[i][0]
    sy += ring[i][1]
  }
  return [sx / n, sy / n]
}

function pointInSize(p: [number, number], sizeM: { width: number; depth: number }) {
  return p[0] >= 0 && p[1] >= 0 && p[0] <= sizeM.width && p[1] <= sizeM.depth
}

/** Binaları parçalamadan seçime al — küçük kırpık dilimleri at */
function prepareBuildingRings(
  rings: [number, number][][],
  sizeM: { width: number; depth: number },
): [number, number][][] {
  const out: [number, number][][] = []
  for (const ring of rings) {
    const closed = closeRing(ring)
    const originalArea = polygonAreaM2(closed)
    if (originalArea < 4) continue

    const c = ringCentroid(closed)
    const allInside = closed.every((p) => pointInSize(p, sizeM))

    if (allInside) {
      out.push(closed)
      continue
    }

    // Merkez dışarıdaysa ve hiç kenara değmiyorsa at
    if (c && !pointInSize(c, sizeM)) {
      const bb = ringBounds(closed)
      const overlaps =
        closed.some((p) => pointInSize(p, sizeM)) ||
        (bb.minX < sizeM.width &&
          bb.maxX > 0 &&
          bb.minY < sizeM.depth &&
          bb.maxY > 0)
      if (!overlaps) continue
    }

    const clipped = clipRingToSize(closed, sizeM)
    for (const part of clipped) {
      const a = polygonAreaM2(part)
      // İnce dilimleri at — bozuk "kesik" modelleri önler
      if (a < 8) continue
      if (a < originalArea * 0.08 && a < 40) continue
      out.push(part)
    }
  }
  return out
}

function capBuildingHeight(
  kind: MapFeature['kind'],
  heightM: number,
  areaM2: number,
): number {
  if (kind !== 'building') return heightM
  let h = heightM
  if (h > 80) h = 80
  if (areaM2 > 4) {
    const slim = h / Math.sqrt(areaM2)
    if (slim > 5.5) h = Math.min(h, Math.max(8, Math.sqrt(areaM2) * 1.4))
  }
  return h
}

function featureHeightM(
  kind: MapFeature['kind'],
  tags: Record<string, string>,
): number {
  if (kind === 'building') return buildingHeight(tags)
  if (kind === 'tree') return treeHeightM(tags)
  if (kind === 'water') return 0.85
  if (kind === 'green') return 0.3
  if (kind === 'paved') return 0.35
  return 2.4
}

function pushFeature(
  features: MapFeature[],
  id: string,
  kind: MapFeature['kind'],
  tags: Record<string, string>,
  rings: [number, number][][],
  sizeM: { width: number; depth: number },
  extra?: { path?: [number, number][]; halfWidthM?: number },
) {
  const prepared =
    kind === 'building'
      ? prepareBuildingRings(rings, sizeM)
      : kind === 'tree'
        ? rings
        : kind === 'road' && extra?.path
          ? rings
          : clipRingsToSize(rings, sizeM)

  const outer = prepared[0]
  const hasPath = Boolean(extra?.path && extra.path.length >= 2)
  if ((!outer || outer.length < 4) && !hasPath) return

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let areaM2 = 0
  for (const ring of prepared) {
    const bb = ringBounds(ring)
    minX = Math.min(minX, bb.minX)
    minY = Math.min(minY, bb.minY)
    maxX = Math.max(maxX, bb.maxX)
    maxY = Math.max(maxY, bb.maxY)
    areaM2 += polygonAreaM2(ring)
  }
  if (hasPath && !Number.isFinite(minX)) {
    for (const p of extra!.path!) {
      minX = Math.min(minX, p[0])
      minY = Math.min(minY, p[1])
      maxX = Math.max(maxX, p[0])
      maxY = Math.max(maxY, p[1])
    }
  }

  features.push({
    id,
    kind,
    name: tags.name || tags.water || tags.waterway || tags.natural,
    rings: prepared.length ? prepared : extra?.path ? [extra.path] : [],
    path: extra?.path,
    halfWidthM: extra?.halfWidthM,
    heightM: capBuildingHeight(kind, featureHeightM(kind, tags), areaM2),
    areaM2,
    widthM: Math.max(0, maxX - minX),
    depthM: Math.max(0, maxY - minY),
    tags,
  })
}

interface WoodedSource {
  id: number
  tags: Record<string, string>
  rings: [number, number][][]
}

/** Baskıda ağaç yığını olmasın: toplam ağaç sayısı sınırlı */
const TREE_BUDGET = 1500

function treeHeightM(tags: Record<string, string>): number {
  const h = parseMeters(tags.height)
  if (h != null && h > 1 && h < 80) return h
  if (tags.landuse === 'orchard' || tags.landuse === 'vineyard') return 5
  if (tags.natural === 'tree') return 8
  return 10
}

/** Taç yarıçapı (m) — etiket varsa ondan, yoksa türüne göre */
function crownRadiusM(tags: Record<string, string>): number {
  const d = parseMeters(tags.diameter_crown ?? tags['diameter_crown'])
  if (d != null && d > 1 && d < 40) return d / 2
  if (tags.landuse === 'orchard' || tags.landuse === 'vineyard') return 3
  return 4.5
}

/** Aynı seçimde ağaçlar hep aynı yere düşsün diye tohumlu üretici */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pointInRing(pt: [number, number], ring: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (
      yi > pt[1] !== yj > pt[1] &&
      pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi + 1e-12) + xi
    ) {
      inside = !inside
    }
  }
  return inside
}

function pointInAnyRing(pt: [number, number], rings: [number, number][][]): boolean {
  for (const ring of rings) {
    if (ring.length >= 4 && pointInRing(pt, ring)) return true
  }
  return false
}

function distPointToSeg(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  if (len2 < 1e-8) return Math.hypot(px - ax, py - ay)
  let t = ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function nearAnyRoad(
  pt: [number, number],
  roads: MapFeature[],
  extraM: number,
): boolean {
  for (const road of roads) {
    const path = road.path
    if (!path || path.length < 2) continue
    const limit = (road.halfWidthM ?? 3.5) + extraM
    for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i]
      const b = path[i + 1]
      const minX = Math.min(a[0], b[0]) - limit
      const maxX = Math.max(a[0], b[0]) + limit
      const minY = Math.min(a[1], b[1]) - limit
      const maxY = Math.max(a[1], b[1]) + limit
      if (pt[0] < minX || pt[0] > maxX || pt[1] < minY || pt[1] > maxY) continue
      if (distPointToSeg(pt[0], pt[1], a[0], a[1], b[0], b[1]) <= limit) {
        return true
      }
    }
  }
  return false
}

function ringCenter(ring: [number, number][]): [number, number] | null {
  const bb = ringBounds(ring)
  if (!Number.isFinite(bb.minX)) return null
  return [(bb.minX + bb.maxX) / 2, (bb.minY + bb.maxY) / 2]
}

function pruneTreesOffRoadsAndWater(
  features: MapFeature[],
  waterRings: [number, number][][],
): void {
  const roads = features.filter((f) => f.kind === 'road')
  for (const f of features) {
    if (f.kind !== 'tree') continue
    f.rings = f.rings.filter((ring) => {
      const c = ringCenter(ring)
      if (!c) return false
      if (waterRings.length && pointInAnyRing(c, waterRings)) return false
      if (nearAnyRoad(c, roads, 4)) return false
      return true
    })
  }
}

function pruneBuildingsOffWater(
  features: MapFeature[],
  waterRings: [number, number][][],
): void {
  if (!waterRings.length) return
  for (let i = features.length - 1; i >= 0; i--) {
    const f = features[i]
    if (f.kind !== 'building' || !f.rings[0]) continue
    const c = ringCentroid(f.rings[0]) ?? ringCenter(f.rings[0])
    if (c && pointInAnyRing(c, waterRings)) features.splice(i, 1)
  }
}

/**
 * Ağaçlı alanlara ağaç serp. Aralık gerçek dünyada 18 m'den küçük olmuyor:
 * baskıda taçlar birbirine girip tek bir yeşil kütleye dönüşmesin.
 */
function scatterInRing(
  ring: [number, number][],
  spacing: number,
  rand: () => number,
  sizeM: { width: number; depth: number },
  budget: number,
): [number, number][] {
  const bb = ringBounds(ring)
  const out: [number, number][] = []
  const x0 = Math.max(0, bb.minX)
  const y0 = Math.max(0, bb.minY)
  const x1 = Math.min(sizeM.width, bb.maxX)
  const y1 = Math.min(sizeM.depth, bb.maxY)

  for (let y = y0 + spacing * 0.5; y <= y1 && out.length < budget; y += spacing) {
    for (let x = x0 + spacing * 0.5; x <= x1 && out.length < budget; x += spacing) {
      const jx = x + (rand() - 0.5) * spacing * 0.5
      const jy = y + (rand() - 0.5) * spacing * 0.5
      if (jx < 0 || jy < 0 || jx > sizeM.width || jy > sizeM.depth) continue
      if (!pointInRing([jx, jy], ring)) continue
      out.push([jx, jy])
    }
  }
  return out
}

/** Ağaç sıralarında (kapanmayan çizgi) ağaçları çizgi boyunca diz */
function scatterAlongLine(
  line: [number, number][],
  spacing: number,
  sizeM: { width: number; depth: number },
  budget: number,
): [number, number][] {
  const out: [number, number][] = []
  let carry = spacing * 0.5
  for (let i = 0; i + 1 < line.length && out.length < budget; i++) {
    const [x1, y1] = line[i]
    const [x2, y2] = line[i + 1]
    const len = Math.hypot(x2 - x1, y2 - y1)
    let t = carry
    while (t <= len && out.length < budget) {
      const px = x1 + ((x2 - x1) * t) / len
      const py = y1 + ((y2 - y1) * t) / len
      if (px >= 0 && py >= 0 && px <= sizeM.width && py <= sizeM.depth) {
        out.push([px, py])
      }
      t += spacing
    }
    carry = t - len
  }
  return out
}

function treeFeatures(
  sources: WoodedSource[],
  nodeTrees: { pt: [number, number]; tags: Record<string, string> }[],
  sizeM: { width: number; depth: number },
): MapFeature[] {
  const out: MapFeature[] = []
  let budget = TREE_BUDGET

  if (nodeTrees.length) {
    const rings = nodeTrees
      .slice(0, Math.min(nodeTrees.length, budget))
      .map(({ pt, tags }) => discRing(pt, crownRadiusM(tags), 8))
    budget -= rings.length
    pushFeature(out, 'trees-nodes', 'tree', { natural: 'tree' }, rings, sizeM)
  }

  // Büyük ormanlar öncelikli: bütçe bitse de baskıda boş orman kalmasın
  const ordered = [...sources].sort((a, b) => {
    const areaOf = (s: WoodedSource) =>
      s.rings.reduce((sum, r) => sum + polygonAreaM2(r), 0)
    return areaOf(b) - areaOf(a)
  })

  for (const src of ordered) {
    if (budget <= 0) break
    const radius = crownRadiusM(src.tags)
    // Aralık taç çapından geniş kalsın: baskıda ağaçlar tek kütleye yapışmasın
    const spacing = Math.max(22, radius * 4.5)
    const rand = seededRandom(src.id)
    const centers: [number, number][] = []

    for (const ring of src.rings) {
      if (budget - centers.length <= 0) break
      const closed = isClosedRing(ring)
      const found = closed
        ? scatterInRing(ring, spacing, rand, sizeM, budget - centers.length)
        : scatterAlongLine(ring, spacing, sizeM, budget - centers.length)
      centers.push(...found)
    }
    if (!centers.length) continue

    budget -= centers.length
    pushFeature(
      out,
      `trees-${src.id}`,
      'tree',
      { ...src.tags, natural: src.tags.natural ?? 'wood' },
      centers.map((c) => discRing(c, radius, 8)),
      sizeM,
    )
  }

  return out
}

/** Uydu izleri: bundan büyük seçimlerde model on binlerce binaya çıkar, atlanır */
const ML_MAX_AREA_M2 = 12_000_000
/** Önizleme ve dilimleyici akıcı kalsın diye eklenen iz sayısı sınırlı */
const ML_MAX_BUILDINGS = 6_000

interface Rect {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** İki kutunun kesişimi / küçük olanın alanı */
function rectOverlapRatio(a: Rect, b: Rect): number {
  const w = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX)
  const h = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY)
  if (w <= 0 || h <= 0) return 0
  const areaA = (a.maxX - a.minX) * (a.maxY - a.minY)
  const areaB = (b.maxX - b.minX) * (b.maxY - b.minY)
  return (w * h) / Math.max(1, Math.min(areaA, areaB))
}

/**
 * Uydudan çıkarılmış bina izlerini sahneye ekle. OSM binaları elle çizildiği
 * için üstündür; onlarla örtüşen ML izleri atılır. Eklenen sayıyı döndürür.
 */
function addMlBuildings(
  features: MapFeature[],
  ml: MlBuilding[],
  origin: { lon: number; lat: number },
  sizeM: { width: number; depth: number },
): number {
  const CELL = 40
  const grid = new Map<string, Rect[]>()

  const put = (r: Rect) => {
    for (let cx = Math.floor(r.minX / CELL); cx <= Math.floor(r.maxX / CELL); cx++) {
      for (let cy = Math.floor(r.minY / CELL); cy <= Math.floor(r.maxY / CELL); cy++) {
        const key = `${cx},${cy}`
        const bucket = grid.get(key)
        if (bucket) bucket.push(r)
        else grid.set(key, [r])
      }
    }
  }

  const collides = (r: Rect) => {
    for (let cx = Math.floor(r.minX / CELL); cx <= Math.floor(r.maxX / CELL); cx++) {
      for (let cy = Math.floor(r.minY / CELL); cy <= Math.floor(r.maxY / CELL); cy++) {
        for (const other of grid.get(`${cx},${cy}`) ?? []) {
          // Kutu tabanlı ölçüm döndürülmüş binalarda çakışmayı büyütür;
          // eşik yüksek tutulup gerçek bina atılmıyor
          if (rectOverlapRatio(r, other) > 0.45) return true
        }
      }
    }
    return false
  }

  for (const f of features) {
    if (f.kind === 'building' && f.rings[0]?.length) put(ringBounds(f.rings[0]))
  }

  let added = 0
  for (const item of ml) {
    if (added >= ML_MAX_BUILDINGS) break
    const ring = closeRing(
      item.ring.map(([lon, lat]) => lonLatToLocal(lon, lat, origin.lon, origin.lat)),
    )
    if (ring.length < 4) continue

    const area = polygonAreaM2(ring)
    if (area < 8) continue

    const bb = ringBounds(ring)
    if (bb.maxX < 0 || bb.minX > sizeM.width) continue
    if (bb.maxY < 0 || bb.minY > sizeM.depth) continue
    if (collides(bb)) continue

    const before = features.length
    const heightM = item.heightM ?? estimateMlHeightM(area)
    pushFeature(
      features,
      `ml-${added}`,
      'building',
      { building: 'yes', height: heightM.toFixed(1), 'auro:source': 'ml' },
      [ring],
      sizeM,
    )
    // Izgaraya sadece OSM binaları girer: ML izleri kendi aralarında bitişik
    // olabilir, birbirlerini elemesinler
    if (features.length > before) added += 1
  }

  return added
}

export interface SceneOptions {
  /** OSM'de eksik binaları uydu tabanlı ML izleriyle tamamla (varsayılan açık) */
  fillBuildings?: boolean
}

export async function fetchSceneModel(
  bounds: SelectionBounds,
  options: SceneOptions = {},
): Promise<SceneModel> {
  const data = await fetchOverpass(buildQuery(bounds))
  const nodes = new Map<number, OsmNode>()
  const ways = new Map<number, OsmWay>()
  const relations: OsmRelation[] = []

  for (const el of data.elements) {
    if (el.type === 'node') nodes.set(el.id, el)
    else if (el.type === 'way') ways.set(el.id, el)
    else if (el.type === 'relation') relations.push(el)
  }

  const origin = { lon: bounds.west, lat: bounds.south }
  const sizeM = boundsSizeM(bounds)
  const features: MapFeature[] = []
  const usedWays = new Set<number>()
  const taggedWaterRings: [number, number][][] = []
  const coastLines: [number, number][][] = []
  const woodedSources: WoodedSource[] = []
  const treeNodes: { pt: [number, number]; tags: Record<string, string> }[] = []

  for (const node of nodes.values()) {
    if (node.tags?.natural !== 'tree') continue
    const pt = lonLatToLocal(node.lon, node.lat, origin.lon, origin.lat)
    if (pt[0] < 0 || pt[1] < 0 || pt[0] > sizeM.width || pt[1] > sizeM.depth) {
      continue
    }
    treeNodes.push({ pt, tags: node.tags })
  }

  const wayToLocal = (way: OsmWay): [number, number][] => {
    const pts: [number, number][] = []
    for (const nid of way.nodes) {
      const n = nodes.get(nid)
      if (!n) continue
      pts.push(lonLatToLocal(n.lon, n.lat, origin.lon, origin.lat))
    }
    return pts
  }

  // Kıyı çizgileri (deniz için)
  for (const way of ways.values()) {
    if (way.tags?.natural === 'coastline') {
      const pts = wayToLocal(way)
      if (pts.length >= 2) coastLines.push(pts)
      usedWays.add(way.id)
    }
  }

  const collectWaterRings = (rings: [number, number][][]) => {
    for (const ring of clipRingsToSize(rings, sizeM)) {
      if (ring.length >= 4) taggedWaterRings.push(ring)
    }
  }

  for (const rel of relations) {
    const tags = rel.tags ?? {}
    const kind = classify(tags)
    if (!kind || kind === 'road') continue

    const outerSegs: [number, number][][] = []
    for (const m of rel.members) {
      if (m.type !== 'way') continue
      const role = (m.role || 'outer').toLowerCase()
      if (role !== 'outer') continue
      const w = ways.get(m.ref)
      if (!w) continue
      usedWays.add(w.id)
      const pts = wayToLocal(w)
      if (pts.length >= 2) outerSegs.push(pts)
    }

    const rings = assembleRings(outerSegs)
    if (!rings.length) continue
    if (kind === 'water') {
      collectWaterRings(rings)
      continue
    }
    if (kind === 'green' && isWooded(tags)) {
      woodedSources.push({ id: rel.id, tags, rings })
    }
    pushFeature(features, `rel-${rel.id}`, kind, tags, rings, sizeM)
  }

  for (const way of ways.values()) {
    if (usedWays.has(way.id)) continue
    const tags = way.tags ?? {}
    const kind = classify(tags)
    if (!kind) continue

    const pts = wayToLocal(way)
    if (pts.length < 2) continue

    if (kind === 'road') {
      if (isTunnelTags(tags)) continue
      const big = Math.max(sizeM.width, sizeM.depth) > 5000
      const hw = tags.highway
      if (big && (hw === 'footway' || hw === 'path' || hw === 'steps')) {
        continue
      }
      const half = roadWidth(tags) / 2
      let part = 0
      for (const seg of clipLineToSize(pts, sizeM)) {
        if (seg.length < 2) continue
        pushFeature(
          features,
          `way-${way.id}-${part++}`,
          'road',
          tags,
          stripPieces(seg, half, 12),
          sizeM,
          { path: seg, halfWidthM: half },
        )
      }
      continue
    }

    if (kind === 'water') {
      if (isClosedRing(pts)) collectWaterRings([closeRing(pts)])
      else {
        for (const seg of clipLineToSize(pts, sizeM)) {
          collectWaterRings(stripPieces(seg, waterwayHalfWidth(tags)))
        }
      }
      continue
    }

    // Ağaç sırası gibi kapanmayan yeşil öğeler: çizgi boyunca ağaç
    if (kind === 'green' && !isClosedRing(pts)) {
      if (isWooded(tags)) woodedSources.push({ id: way.id, tags, rings: [pts] })
      continue
    }

    if (!isClosedRing(pts)) continue
    const ring = closeRing(pts)
    if (kind === 'green' && isWooded(tags)) {
      woodedSources.push({ id: way.id, tags, rings: [ring] })
    }
    pushFeature(features, `way-${way.id}`, kind, tags, [ring], sizeM)
  }

  features.push(...treeFeatures(woodedSources, treeNodes, sizeM))

  const osmBuildings = features.filter((f) => f.kind === 'building').length
  let mlBuildings = 0
  let mlNote: string | undefined

  if (options.fillBuildings ?? true) {
    if (sizeM.width * sizeM.depth > ML_MAX_AREA_M2) {
      mlNote = 'Alan büyük olduğu için uydu bina izleri eklenmedi.'
    } else {
      try {
        mlBuildings = addMlBuildings(
          features,
          await fetchMlBuildings(bounds),
          origin,
          sizeM,
        )
        if (mlBuildings >= ML_MAX_BUILDINGS) {
          mlNote = `Uydu izlerinden en fazla ${ML_MAX_BUILDINGS} bina eklendi; daha fazlası için alanı küçültün.`
        }
      } catch (err) {
        console.warn('Uydu bina izleri alınamadı', err)
        mlNote =
          err instanceof Error
            ? `Uydu bina izleri alınamadı: ${err.message}`
            : 'Uydu bina izleri alınamadı'
      }
    }
  }

  // Deniz + göller — kara örnekleriyle doğrulanmış su
  const landSamples: [number, number][] = []
  for (const f of features) {
    if (f.kind !== 'building' || !f.rings[0]?.length) continue
    const c = ringCentroid(f.rings[0])
    if (c) landSamples.push(c)
    if (landSamples.length >= 80) break
  }

  const flip = shouldFlipCoastline(coastLines, landSamples)
  const waterRings = buildCoastalWaterRings(
    sizeM,
    coastLines,
    taggedWaterRings,
    flip,
    landSamples,
  )
  features.push(...waterFeaturesFromRings(waterRings, 'su'))
  pruneBuildingsOffWater(features, waterRings)
  pruneTreesOffRoadsAndWater(features, waterRings)
  for (let i = features.length - 1; i >= 0; i--) {
    const f = features[i]
    if (f.kind === 'tree' && !f.rings.length) features.splice(i, 1)
  }

  features.sort((a, b) => LAYER_ORDER[a.kind] - LAYER_ORDER[b.kind])

  let elevation
  try {
    elevation = await fetchElevationGrid(bounds)
  } catch (err) {
    console.warn('Yükseklik alınamadı', err)
    elevation = undefined
  }

  let waterMask: Uint8Array | undefined
  if (elevation && (coastLines.length || taggedWaterRings.length)) {
    waterMask = buildWaterMask(
      elevation,
      sizeM,
      coastLines,
      taggedWaterRings.length ? taggedWaterRings : waterRings,
      flip,
    )
  }

  return {
    bounds,
    origin,
    features,
    sizeM,
    elevation,
    waterMask,
    buildingSources: { osm: osmBuildings, ml: mlBuildings },
    mlNote,
  }
}
