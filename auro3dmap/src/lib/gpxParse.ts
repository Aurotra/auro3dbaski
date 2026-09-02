/** Browser-side GPX → lon/lat track for the map overlay. */

import type { FeatureCollection } from 'geojson'

export type LonLat = [number, number]

function toNum(raw: string | null | undefined): number | null {
  if (raw == null || raw === '') return null
  const n = Number(String(raw).trim().replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function attr(el: Element, ...names: string[]): number | null {
  for (const name of names) {
    const n = toNum(el.getAttribute(name))
    if (n != null) return n
  }
  return null
}

function childNum(el: Element, ...names: string[]): number | null {
  for (const name of names) {
    const node = el.getElementsByTagName(name)[0]
    const n = toNum(node?.textContent)
    if (n != null) return n
  }
  return null
}

function readLonLat(el: Element): LonLat | null {
  const lon = attr(el, 'lon', 'longitude') ?? childNum(el, 'lon', 'longitude')
  const lat = attr(el, 'lat', 'latitude') ?? childNum(el, 'lat', 'latitude')
  if (lon == null || lat == null) return null
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null
  return [lon, lat]
}

function collectByTag(doc: Document, tag: string): Element[] {
  return Array.from(doc.getElementsByTagName(tag))
}

function parseGpxByRegex(xml: string): LonLat[] {
  const pts: LonLat[] = []
  const tagRe = /<(?:[\w.-]+:)?(?:trkpt|rtept|wpt)\b([^>]*)>/gi
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(xml))) {
    const attrs = m[1]
    const lat =
      attrs.match(/\b(?:lat|latitude)=["']([^"']+)["']/i)?.[1] ?? null
    const lon =
      attrs.match(/\b(?:lon|longitude)=["']([^"']+)["']/i)?.[1] ?? null
    const ll = readLonLatFromNums(toNum(lon), toNum(lat))
    if (!ll) continue
    const prev = pts[pts.length - 1]
    if (prev && prev[0] === ll[0] && prev[1] === ll[1]) continue
    pts.push(ll)
  }
  return pts
}

function readLonLatFromNums(lon: number | null, lat: number | null): LonLat | null {
  if (lon == null || lat == null) return null
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null
  return [lon, lat]
}

export function parseGpxTrack(xml: string): LonLat[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const pts: LonLat[] = []
  if (!doc.querySelector('parsererror')) {
    const nodes = [
      ...collectByTag(doc, 'trkpt'),
      ...collectByTag(doc, 'rtept'),
      ...collectByTag(doc, 'wpt'),
    ]
    for (const el of nodes) {
      const ll = readLonLat(el)
      if (!ll) continue
      const prev = pts[pts.length - 1]
      if (prev && prev[0] === ll[0] && prev[1] === ll[1]) continue
      pts.push(ll)
    }
  }
  if (pts.length > 0) return pts
  return parseGpxByRegex(xml)
}

export function trackExtent(pts: LonLat[]): {
  west: number
  south: number
  east: number
  north: number
} | null {
  if (!pts.length) return null
  let west = Infinity
  let south = Infinity
  let east = -Infinity
  let north = -Infinity
  for (const [lon, lat] of pts) {
    west = Math.min(west, lon)
    east = Math.max(east, lon)
    south = Math.min(south, lat)
    north = Math.max(north, lat)
  }
  if (!Number.isFinite(west)) return null
  return { west, south, east, north }
}

export function trackCollection(pts: LonLat[]): FeatureCollection {
  if (pts.length === 1) {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: pts[0] },
        },
      ],
    }
  }
  if (pts.length < 2) {
    return { type: 'FeatureCollection', features: [] }
  }
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: pts },
      },
    ],
  }
}
