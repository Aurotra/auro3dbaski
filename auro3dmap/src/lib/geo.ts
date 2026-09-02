import type { SelectionBounds } from '../types'

/** Approx meters per degree at a given latitude */
export function metersPerDegree(lat: number) {
  const latRad = (lat * Math.PI) / 180
  return {
    lon: 111320 * Math.cos(latRad),
    lat: 110540,
  }
}

export function lonLatToLocal(
  lon: number,
  lat: number,
  originLon: number,
  originLat: number,
): [number, number] {
  const m = metersPerDegree(originLat)
  return [(lon - originLon) * m.lon, (lat - originLat) * m.lat]
}

export function boundsSizeM(bounds: SelectionBounds) {
  const midLat = (bounds.south + bounds.north) / 2
  const m = metersPerDegree(midLat)
  return {
    width: (bounds.east - bounds.west) * m.lon,
    depth: (bounds.north - bounds.south) * m.lat,
  }
}

export function ringBounds(ring: [number, number][]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of ring) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, depth: maxY - minY }
}

/** Shoelace area in local meter coordinates */
export function polygonAreaM2(ring: [number, number][]) {
  if (ring.length < 3) return 0
  let sum = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum) / 2
}

export function formatMeters(m: number) {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`
  if (m >= 10) return `${m.toFixed(1)} m`
  return `${m.toFixed(2)} m`
}

export function formatArea(m2: number) {
  if (m2 >= 10_000) return `${(m2 / 10_000).toFixed(2)} ha`
  return `${Math.round(m2)} m²`
}
