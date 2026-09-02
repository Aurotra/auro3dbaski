import { bboxClip, lineString, polygon } from '@turf/turf'
import type { Position } from 'geojson'

export type SizeM = { width: number; depth: number }

function asPairs(coords: Position[]): [number, number][] {
  return coords.map((c) => [c[0], c[1]] as [number, number])
}

function closeRing(ring: [number, number][]): [number, number][] {
  if (ring.length === 0) return ring
  const a = ring[0]
  const b = ring[ring.length - 1]
  if (a[0] === b[0] && a[1] === b[1]) return ring
  return [...ring, [a[0], a[1]]]
}

/** Çizgiyi seçim dikdörtgenine kırp — dışarı taşan yol parçalarını atar */
export function clipLineToSize(
  pts: [number, number][],
  size: SizeM,
): [number, number][][] {
  if (pts.length < 2) return []
  if (size.width <= 0 || size.depth <= 0) return []

  const bbox: [number, number, number, number] = [0, 0, size.width, size.depth]
  try {
    const clipped = bboxClip(lineString(pts), bbox)
    if (!clipped?.geometry) return []
    const g = clipped.geometry
    if (g.type === 'LineString') {
      const line = asPairs(g.coordinates)
      return line.length >= 2 ? [line] : []
    }
    if (g.type === 'MultiLineString') {
      return g.coordinates
        .map((c) => asPairs(c))
        .filter((line) => line.length >= 2)
    }
  } catch {
    return []
  }
  return []
}

/** Poligon halkasını seçim dikdörtgenine kırp */
export function clipRingToSize(
  ring: [number, number][],
  size: SizeM,
): [number, number][][] {
  if (ring.length < 3) return []
  if (size.width <= 0 || size.depth <= 0) return []

  const bbox: [number, number, number, number] = [0, 0, size.width, size.depth]
  try {
    const clipped = bboxClip(polygon([closeRing(ring)]), bbox)
    if (!clipped?.geometry) return []
    const g = clipped.geometry
    if (g.type === 'Polygon') {
      const outer = asPairs(g.coordinates[0] ?? [])
      return outer.length >= 4 ? [closeRing(outer)] : []
    }
    if (g.type === 'MultiPolygon') {
      return g.coordinates
        .map((poly) => asPairs(poly[0] ?? []))
        .filter((outer) => outer.length >= 4)
        .map((outer) => closeRing(outer))
    }
  } catch {
    return []
  }
  return []
}

export function clipRingsToSize(
  rings: [number, number][][],
  size: SizeM,
): [number, number][][] {
  const out: [number, number][][] = []
  for (const ring of rings) {
    out.push(...clipRingToSize(ring, size))
  }
  return out
}
