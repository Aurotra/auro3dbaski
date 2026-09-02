import JSZip from 'jszip'
import earcut from 'earcut'
import type { FeatureKind, LayerPalette, MapFeature, SceneModel } from '../types'
import { LAYER_COLORS, LAYER_ORDER } from '../types'
import { cleanRing, densifyClosed, featureHeightMm } from './meshBuilder'
import { ringElevRange, sampleElevation, visibleRelief } from './elevation'
import { ringBounds } from './geo'
import { treeDims, treeParts } from './treeSolid'
import {
  bridgeSolid,
  isBridgeTags,
  pathLengthM,
  roadRibbon,
  roadSampleStepM,
} from './surfaceSkin'

interface MeshPart {
  name: string
  color: string
  vertices: [number, number, number][]
  triangles: [number, number, number][]
}

function triangulate(ring: [number, number][]): number[] {
  const coords: number[] = []
  for (const p of ring) coords.push(p[0], p[1])
  return earcut(coords)
}

type GroundAt = (x: number, y: number) => number

function extrudeToPart(
  color: string,
  ring: [number, number][],
  z0: number,
  z1: number,
  scale: number,
  groundAt?: GroundAt,
  plantRoof?: number,
): MeshPart | null {
  const pts = cleanRing(ring)
  if (!pts) return null
  const indices = triangulate(pts)
  if (indices.length < 3) return null

  const n = pts.length
  const h = z1 - z0
  const sink = Math.min(h * 0.25, 0.08)
  const vertices: [number, number, number][] = []
  for (let i = 0; i < n; i++) {
    const x = pts[i][0] * scale
    const y = pts[i][1] * scale
    const g = groundAt ? groundAt(x, y) : z0
    vertices.push([x, y, plantRoof != null ? g - 0.18 : groundAt ? g - sink : z0])
  }
  for (let i = 0; i < n; i++) {
    const x = pts[i][0] * scale
    const y = pts[i][1] * scale
    const g = groundAt ? groundAt(x, y) : z1
    vertices.push([
      x,
      y,
      plantRoof != null ? plantRoof : groundAt ? g + h : z1,
    ])
  }

  const triangles: [number, number, number][] = []
  for (let i = 0; i < indices.length; i += 3) {
    triangles.push([indices[i] + n, indices[i + 1] + n, indices[i + 2] + n])
  }
  for (let i = 0; i < indices.length; i += 3) {
    triangles.push([indices[i], indices[i + 2], indices[i + 1]])
  }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    triangles.push([i, j, j + n], [i, j + n, i + n])
  }

  return { name: '', color, vertices, triangles }
}

function buildTerrainPart(
  model: SceneModel,
  scale: number,
  baseH: number,
  relief: number,
  color: string,
): MeshPart {
  const w = model.sizeM.width * scale
  const d = model.sizeM.depth * scale
  const grid = model.elevation

  if (!grid || grid.cols < 2 || grid.rows < 2) {
    return {
      name: 'arazi',
      color,
      vertices: [
        [0, 0, 0],
        [w, 0, 0],
        [w, d, 0],
        [0, d, 0],
        [0, 0, baseH],
        [w, 0, baseH],
        [w, d, baseH],
        [0, d, baseH],
      ],
      triangles: [
        [0, 1, 2],
        [0, 2, 3],
        [4, 6, 5],
        [4, 7, 6],
        [0, 4, 5],
        [0, 5, 1],
        [1, 5, 6],
        [1, 6, 2],
        [2, 6, 7],
        [2, 7, 3],
        [3, 7, 4],
        [3, 4, 0],
      ],
    }
  }

  const { cols, rows, relativeM } = grid
  const vertices: [number, number, number][] = []
  const triangles: [number, number, number][] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c / (cols - 1)) * w
      const y = (r / (rows - 1)) * d
      const h = baseH + relativeM[r * cols + c] * relief * scale
      vertices.push([x, y, h])
    }
  }
  const botOff = cols * rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c / (cols - 1)) * w
      const y = (r / (rows - 1)) * d
      vertices.push([x, y, 0])
    }
  }

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const i = r * cols + c
      // Üst yüzey +Z, alt yüzey -Z bakmalı
      triangles.push(
        [i, i + 1, i + cols],
        [i + 1, i + cols + 1, i + cols],
        [botOff + i, botOff + i + cols, botOff + i + 1],
        [botOff + i + 1, botOff + i + cols, botOff + i + cols + 1],
      )
    }
  }

  for (let c = 0; c < cols - 1; c++) {
    triangles.push(
      [c, botOff + c, c + 1],
      [c + 1, botOff + c, botOff + c + 1],
    )
    const j = (rows - 1) * cols + c
    triangles.push(
      [j, j + 1, botOff + j],
      [j + 1, botOff + j + 1, botOff + j],
    )
  }
  for (let r = 0; r < rows - 1; r++) {
    const i = r * cols
    triangles.push(
      [i, i + cols, botOff + i],
      [i + cols, botOff + i + cols, botOff + i],
    )
    const j = r * cols + (cols - 1)
    triangles.push(
      [j, botOff + j, j + cols],
      [j + cols, botOff + j, botOff + j + cols],
    )
  }

  return {
    name: 'arazi',
    color,
    vertices,
    triangles,
  }
}

function buildParts(
  model: SceneModel,
  scale: number,
  relief: number,
  colors: LayerPalette,
  minFeatureMm = 0.8,
): MeshPart[] {
  const parts: MeshPart[] = []
  const baseH = 1.2 * scale
  parts.push(buildTerrainPart(model, scale, baseH, relief, colors.base))
  // Yazıcı nozzle'ının altına düşmesin: en az yarım-genişlik (metre) hesapla
  const minHalfWidthM = minFeatureMm / (2 * Math.max(scale, 1e-6))

  const grid = model.elevation
  const groundAt: GroundAt = (x, y) => {
    if (!grid) return baseH
    const e = sampleElevation(grid, model.sizeM, x / scale, y / scale)
    return baseH + (Number.isFinite(e) ? Math.max(0, e) : 0) * relief * scale
  }

  const byKind: Record<FeatureKind, MapFeature[]> = {
    green: [],
    paved: [],
    water: [],
    road: [],
    building: [],
    tree: [],
  }
  for (const f of model.features) byKind[f.kind].push(f)

  const labels: Record<FeatureKind, string> = {
    green: 'yesil alanlar',
    paved: 'beton zemin',
    water: 'sular',
    road: 'yollar',
    building: 'binalar',
    tree: 'agaclar',
  }

  const printSide = Math.min(model.sizeM.width, model.sizeM.depth) * scale
  const stepM = roadSampleStepM(grid, model.sizeM)
  const kinds = (Object.keys(byKind) as FeatureKind[]).sort(
    (a, b) => LAYER_ORDER[a] - LAYER_ORDER[b],
  )

  const appendTo = (
    merged: MeshPart,
    piece: { vertices: MeshPart['vertices']; triangles: MeshPart['triangles'] },
  ) => {
    const offset = merged.vertices.length
    merged.vertices.push(...piece.vertices)
    for (const t of piece.triangles) {
      merged.triangles.push([t[0] + offset, t[1] + offset, t[2] + offset])
    }
  }

  for (const kind of kinds) {
    if (kind === 'tree') {
      const trunks: MeshPart = {
        name: 'agac govde',
        color: colors.trunk,
        vertices: [],
        triangles: [],
      }
      const crowns: MeshPart = {
        name: 'agac yaprak',
        color: colors.tree,
        vertices: [],
        triangles: [],
      }
      for (const feature of byKind.tree) {
        for (const ring of feature.rings) {
          if (!ring?.length) continue
          const bb = ringBounds(ring)
          const radiusM = Math.max(bb.width, bb.depth) / 2
          if (!(radiusM > 0)) continue
          const cx = ((bb.minX + bb.maxX) / 2) * scale
          const cy = ((bb.minY + bb.maxY) / 2) * scale
          const partsTree = treeParts(
            cx,
            cy,
            groundAt(cx, cy),
            treeDims(radiusM, feature.heightM, scale),
          )
          appendTo(trunks, partsTree.trunk)
          appendTo(crowns, partsTree.crown)
        }
      }
      if (trunks.vertices.length) parts.push(trunks)
      if (crowns.vertices.length) parts.push(crowns)
      continue
    }

    const merged: MeshPart = {
      name: labels[kind],
      color: colors[kind],
      vertices: [],
      triangles: [],
    }

    if (!byKind[kind].length) continue

    for (const feature of byKind[kind]) {
      if (kind === 'road') {
        const h = featureHeightMm('road', feature.heightM, printSide, scale)
        const path = feature.path
        const half = Math.max(feature.halfWidthM ?? 3.5, minHalfWidthM)
        if (path && path.length >= 2) {
          const asBridge = isBridgeTags(feature.tags) && pathLengthM(path) >= 14
          const solid = asBridge
            ? bridgeSolid(path, half, scale, groundAt, h, stepM)
            : roadRibbon(path, half, scale, groundAt, h, stepM)
          if (solid) appendTo(merged, solid)
          continue
        }
      }

      const own = featureHeightMm(kind, feature.heightM, printSide, scale)
      let z0 = baseH
      let h = own
      let plantRoof: number | undefined
      if (kind === 'building') {
        const range = ringElevRange(model.elevation, model.sizeM, feature.rings)
        const zMax = baseH + Math.max(0, range.max) * relief * scale
        plantRoof = zMax + own
        h = Math.max(own, 1)
      }

      for (const ring of feature.rings) {
        if (!ring) continue
        const dense = densifyClosed(ring, kind === 'building' ? 40 : 7)
        const part = extrudeToPart(
          colors[kind],
          dense,
          z0,
          z0 + h,
          scale,
          groundAt,
          plantRoof,
        )
        if (part) appendTo(merged, part)
      }
    }

    if (merged.vertices.length > 0) parts.push(merged)
  }

  if (model.routePath && model.routePath.length >= 2) {
    const roadH = featureHeightMm('road', 2.4, printSide, scale)
    const h = model.raiseRoute ? roadH + 0.55 : roadH + 0.22
    const solid = roadRibbon(
      model.routePath,
      Math.max(2.6, minHalfWidthM),
      scale,
      groundAt,
      h,
      stepM,
    )
    if (solid) {
      parts.push({
        name: 'gpx rota',
        color: colors.route,
        vertices: solid.vertices,
        triangles: solid.triangles,
      })
    }
  }

  return parts
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** NaN/Infinity üreten üçgenleri at — bozuk 3MF'nin slicer'da açılmama riskini önler. */
function sanitizePart(part: MeshPart): MeshPart {
  const badVertex = part.vertices.some(
    (v) => !Number.isFinite(v[0]) || !Number.isFinite(v[1]) || !Number.isFinite(v[2]),
  )
  if (!badVertex) return part
  const finite = (i: number) => {
    const v = part.vertices[i]
    return v && Number.isFinite(v[0]) && Number.isFinite(v[1]) && Number.isFinite(v[2])
  }
  const triangles = part.triangles.filter(
    (t) => finite(t[0]) && finite(t[1]) && finite(t[2]),
  )
  return { ...part, triangles }
}

function buildModelXml(rawParts: MeshPart[]): string {
  const resources: string[] = []
  const buildItems: string[] = []
  const parts = rawParts
    .map(sanitizePart)
    .filter((p) => p.triangles.length > 0 && p.vertices.length > 0)

  parts.forEach((part, i) => {
    const matId = i + 1
    const objId = 100 + i
    const hex = part.color.slice(1).toUpperCase()
    const verts = part.vertices
      .map(
        (v) =>
          `          <vertex x="${v[0].toFixed(4)}" y="${v[1].toFixed(4)}" z="${v[2].toFixed(4)}" />`,
      )
      .join('\n')
    const tris = part.triangles
      .map(
        // 3MF Core: p1, o "basematerials" bloğu içindeki 1 tabanlı indeks —
        // her blokta tek <base> var, dolayısıyla her zaman "1" olmalı.
        (t) =>
          `          <triangle v1="${t[0]}" v2="${t[1]}" v3="${t[2]}" pid="${matId}" p1="1" />`,
      )
      .join('\n')

    resources.push(`      <basematerials id="${matId}">
        <base name="${escapeXml(part.name)}" displaycolor="#${hex}FF" />
      </basematerials>`)

    resources.push(`      <object id="${objId}" name="${escapeXml(part.name)}" type="model">
        <mesh>
          <vertices>
${verts}
          </vertices>
          <triangles>
${tris}
          </triangles>
        </mesh>
      </object>`)

    buildItems.push(`      <item objectid="${objId}" />`)
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="tr" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <metadata name="Application">Auro3DMap</metadata>
  <metadata name="Title">Auro3DMap model</metadata>
  <resources>
${resources.join('\n')}
  </resources>
  <build>
${buildItems.join('\n')}
  </build>
</model>
`
}

export async function export3mf(
  model: SceneModel,
  mmPerMeter: number,
  filename = 'auro3dmap.3mf',
  reliefExaggeration = 1.5,
  colors: LayerPalette = LAYER_COLORS,
  minFeatureMm = 0.8,
) {
  const relief = visibleRelief(model.elevation, model.sizeM, reliefExaggeration)
  const parts = buildParts(model, mmPerMeter, relief, colors, minFeatureMm)
  const zip = new JSZip()

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
</Types>`,
  )

  zip.folder('_rels')!.file(
    '.rels',
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>`,
  )

  zip.folder('3D')!.file('3dmodel.model', buildModelXml(parts))

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
