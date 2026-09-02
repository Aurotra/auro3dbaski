import * as THREE from 'three'
import {
  mergeGeometries,
  mergeVertices,
} from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { LayerPalette, MapFeature, SceneModel } from '../types'
import { LAYER_COLORS, LAYER_ORDER } from '../types'
import { ringElevRange, sampleElevation, visibleRelief } from './elevation'
import { treeDims, treeParts, type SolidMesh } from './treeSolid'
import { ringBounds } from './geo'
import {
  bridgeSolid,
  isBridgeTags,
  pathLengthM,
  roadRibbon,
  roadSampleStepM,
} from './surfaceSkin'

export interface BuiltMeshes {
  group: THREE.Group
  byId: Map<string, THREE.Object3D>
}

function ringVertexCount(ring: [number, number][]) {
  if (ring.length < 2) return ring.length
  const a = ring[0]
  const b = ring[ring.length - 1]
  return a[0] === b[0] && a[1] === b[1] ? ring.length - 1 : ring.length
}

export function cleanRing(ring: [number, number][]): [number, number][] | null {
  const n0 = ringVertexCount(ring)
  if (n0 < 3) return null

  const pts: [number, number][] = []
  for (let i = 0; i < n0; i++) {
    const p = ring[i]
    if (!Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue
    const prev = pts[pts.length - 1]
    if (prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) < 1e-4) continue
    pts.push([p[0], p[1]])
  }
  if (pts.length >= 2) {
    const a = pts[0]
    const b = pts[pts.length - 1]
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-4) pts.pop()
  }
  if (pts.length < 3) return null

  let sum = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    sum += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]
  }
  if (Math.abs(sum) < 1e-6) return null
  if (sum < 0) pts.reverse()

  return pts
}

export function densifyClosed(
  ring: [number, number][],
  maxStep: number,
): [number, number][] {
  if (ring.length < 3) return ring
  const src = [...ring]
  const a = src[0]
  const b = src[src.length - 1]
  if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 1e-4) src.push([a[0], a[1]])
  const out: [number, number][] = []
  for (let i = 0; i + 1 < src.length; i++) {
    const p0 = src[i]
    const p1 = src[i + 1]
    if (i === 0) out.push(p0)
    const dist = Math.hypot(p1[0] - p0[0], p1[1] - p0[1])
    const n = Math.max(1, Math.ceil(dist / Math.max(1.5, maxStep)))
    for (let k = 1; k <= n; k++) {
      const t = k / n
      out.push([p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t])
    }
  }
  return out
}

function clampRingToSize(
  ring: [number, number][],
  size: { width: number; depth: number },
): [number, number][] {
  const pad = Math.max(size.width, size.depth) * 0.02
  return ring.map(([x, y]) => [
    Math.min(size.width + pad, Math.max(-pad, x)),
    Math.min(size.depth + pad, Math.max(-pad, y)),
  ])
}

function ringToShape(
  ring: [number, number][],
  scale: number,
): THREE.Shape | null {
  const pts = cleanRing(ring)
  if (!pts) return null
  const shape = new THREE.Shape()
  shape.moveTo(pts[0][0] * scale, pts[0][1] * scale)
  for (let i = 1; i < pts.length; i++) {
    shape.lineTo(pts[i][0] * scale, pts[i][1] * scale)
  }
  shape.closePath()
  return shape
}

function makeMaterial(kind: MapFeature['kind'], color: string) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: kind === 'water' ? 0.28 : 0.78,
    metalness: kind === 'water' ? 0.2 : 0.04,
    flatShading: kind === 'building',
  })
}

/** Baskı biriminde (x, y) → arazi üst yüzeyi z */
type GroundAt = (x: number, y: number) => number

function idHash(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

/**
 * Öğenin baskıdaki yüksekliği (mm). Zemin katmanları bilinçli olarak yapışık
 * kalır: sadece dilimleyicinin görebileceği kadar (2-3 katman) yükselir, baskı
 * ölçeğiyle birlikte büyümez. Katmanlar birbirinden biraz farklı yükselir ki
 * çakıştıkları yerde yüzeyler birbirine girmesin (yol > beton > su > yeşil).
 */
export function featureHeightMm(
  kind: MapFeature['kind'],
  heightM: number,
  printSideMm: number,
  scale: number,
): number {
  if (kind === 'building') {
    return Math.max(heightM * scale, printSideMm * 0.012, 0.8)
  }
  if (kind === 'road') {
    return Math.min(0.42, Math.max(0.32, printSideMm * 0.001))
  }
  if (kind === 'paved') {
    return Math.min(0.28, Math.max(0.18, printSideMm * 0.0007))
  }
  if (kind === 'water') {
    return Math.min(0.28, Math.max(0.18, printSideMm * 0.0007))
  }
  if (kind === 'green') {
    return Math.min(0.22, Math.max(0.14, printSideMm * 0.00055))
  }
  return Math.min(0.4, Math.max(0.25, printSideMm * 0.0008))
}

function extrudeFeature(
  feature: MapFeature,
  color: string,
  scale: number,
  baseZ: number,
  sizeM: { width: number; depth: number },
  groundAt?: GroundAt,
  heightOverride?: number,
): THREE.Object3D | null {
  if (!feature.rings.length) return null
  if (!Number.isFinite(baseZ) || !Number.isFinite(scale)) return null

  const printSide = Math.min(sizeM.width, sizeM.depth) * scale
  const h =
    heightOverride ??
    featureHeightMm(feature.kind, feature.heightM, printSide, scale)
  if (!Number.isFinite(h) || h <= 0) return null

  const geos: THREE.BufferGeometry[] = []
  const mat = makeMaterial(feature.kind, color)

  // Çok halkalı sular merge'i bozabiliyor — parça parça ekle
  const useGroup = feature.rings.length > 40
  // Üst üste binen zemin parçaları tam aynı kotta olursa ekranda titriyor;
  // mikron mertebesinde kaydır (baskıda tek katmanın çok altında)
  const jitterSeed = idHash(feature.id)

  feature.rings.forEach((ring, ringIndex) => {
    const clamped = densifyClosed(
      clampRingToSize(ring, sizeM),
      feature.kind === 'building' ? 40 : 7,
    )
    const shape = ringToShape(clamped, scale)
    if (!shape) return
    const hRing =
      feature.kind === 'building'
        ? h
        : h + (((jitterSeed + ringIndex) % 5) * 0.006)
    try {
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: hRing,
        bevelEnabled: false,
        steps: 1,
        curveSegments: 1,
      })
      // NaN kontrolü
      const pos = geo.getAttribute('position')
      let bad = false
      for (let i = 0; i < pos.count; i++) {
        if (
          !Number.isFinite(pos.getX(i)) ||
          !Number.isFinite(pos.getY(i)) ||
          !Number.isFinite(pos.getZ(i))
        ) {
          bad = true
          break
        }
      }
      if (bad) {
        geo.dispose()
        return
      }
      if (feature.kind === 'building' && groundAt && Number.isFinite(baseZ)) {
        plantBuilding(geo, baseZ, groundAt)
      } else if (groundAt) {
        drapeGeometry(geo, hRing, groundAt)
      } else {
        geo.translate(0, 0, baseZ)
      }
      geos.push(geo)
    } catch {
      /* geçersiz şekil */
    }
  })

  if (!geos.length) {
    mat.dispose()
    return null
  }

  if (useGroup || geos.length > 80) {
    const group = new THREE.Group()
    group.userData.featureId = feature.id
    for (const geo of geos) {
      const mesh = new THREE.Mesh(geo, mat)
      mesh.userData.featureId = feature.id
      mesh.castShadow = feature.kind === 'building'
      mesh.receiveShadow = true
      group.add(mesh)
    }
    return group
  }

  if (geos.length === 1) {
    const mesh = new THREE.Mesh(geos[0], mat)
    mesh.userData.featureId = feature.id
    mesh.castShadow = feature.kind === 'building'
    mesh.receiveShadow = true
    return mesh
  }

  const merged = mergeGeometries(geos, false)
  for (const g of geos) g.dispose()
  if (!merged) {
    mat.dispose()
    return null
  }

  const mesh = new THREE.Mesh(merged, mat)
  mesh.userData.featureId = feature.id
  mesh.castShadow = feature.kind === 'building'
  mesh.receiveShadow = true
  return mesh
}

function safeElev(v: number) {
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(v, 8000))
}

/** Ağaç öğesi: her halka bir ağacın taç izi → gövdeli, basılabilir katı */
function buildTreeObject(
  feature: MapFeature,
  scale: number,
  groundAt: GroundAt,
  colors: LayerPalette,
): THREE.Object3D | null {
  const trunkPos: number[] = []
  const trunkIdx: number[] = []
  const crownPos: number[] = []
  const crownIdx: number[] = []
  let trunkBase = 0
  let crownBase = 0

  for (const ring of feature.rings) {
    const bb = ringBounds(ring)
    const radiusM = Math.max(bb.width, bb.depth) / 2
    if (!Number.isFinite(radiusM) || radiusM <= 0) continue
    const cx = ((bb.minX + bb.maxX) / 2) * scale
    const cy = ((bb.minY + bb.maxY) / 2) * scale
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) continue

    const dims = treeDims(radiusM, feature.heightM, scale)
    const parts = treeParts(cx, cy, groundAt(cx, cy), dims)
    for (const v of parts.trunk.vertices) trunkPos.push(v[0], v[1], v[2])
    for (const t of parts.trunk.triangles) {
      trunkIdx.push(t[0] + trunkBase, t[1] + trunkBase, t[2] + trunkBase)
    }
    trunkBase += parts.trunk.vertices.length
    for (const v of parts.crown.vertices) crownPos.push(v[0], v[1], v[2])
    for (const t of parts.crown.triangles) {
      crownIdx.push(t[0] + crownBase, t[1] + crownBase, t[2] + crownBase)
    }
    crownBase += parts.crown.vertices.length
  }

  if (!trunkIdx.length && !crownIdx.length) return null

  const group = new THREE.Group()
  group.userData.featureId = feature.id
  const add = (pos: number[], idx: number[], color: string) => {
    if (!idx.length) return
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    geo.setIndex(idx)
    geo.computeVertexNormals()
    const mesh = new THREE.Mesh(geo, makeMaterial('tree', color))
    mesh.userData.featureId = feature.id
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }
  add(trunkPos, trunkIdx, colors.trunk)
  add(crownPos, crownIdx, colors.tree)
  return group
}

/**
 * Düz prizmayı araziye giydir: her köşe kendi zemin kotuna oturur, böylece
 * yollar/sular eğimde havada kalmaz. Taban biraz gömülür ki boşluk kalmasın.
 */
function drapeGeometry(
  geo: THREE.BufferGeometry,
  h: number,
  groundAt: GroundAt,
) {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const sink = Math.min(h * 0.25, 0.08)
  for (let i = 0; i < pos.count; i++) {
    const isTop = pos.getZ(i) > h * 0.5
    const g = groundAt(pos.getX(i), pos.getY(i))
    pos.setZ(i, isTop ? g + h : g - sink)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  geo.computeBoundingSphere()
}

/** Bina: taban her köşede yerel arazi, çatı düz (eğimde yere gömülmesin) */
function plantBuilding(
  geo: THREE.BufferGeometry,
  zRoof: number,
  groundAt: GroundAt,
) {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  let zMin = Infinity
  let zMax = -Infinity
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i)
    zMin = Math.min(zMin, z)
    zMax = Math.max(zMax, z)
  }
  const mid = (zMin + zMax) * 0.5
  const sink = 0.18
  for (let i = 0; i < pos.count; i++) {
    const g = groundAt(pos.getX(i), pos.getY(i))
    pos.setZ(i, pos.getZ(i) > mid ? zRoof : g - sink)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  geo.computeBoundingSphere()
}

function solidToMesh(
  solid: SolidMesh,
  kind: MapFeature['kind'],
  color: string,
  id: string,
): THREE.Mesh | null {
  if (!solid.triangles.length) return null
  const pos = new Float32Array(solid.vertices.length * 3)
  for (let i = 0; i < solid.vertices.length; i++) {
    const v = solid.vertices[i]
    pos[i * 3] = v[0]
    pos[i * 3 + 1] = v[1]
    pos[i * 3 + 2] = v[2]
  }
  const idx = new Uint32Array(solid.triangles.length * 3)
  for (let i = 0; i < solid.triangles.length; i++) {
    const t = solid.triangles[i]
    idx[i * 3] = t[0]
    idx[i * 3 + 1] = t[1]
    idx[i * 3 + 2] = t[2]
  }
  let geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setIndex(new THREE.BufferAttribute(idx, 1))
  // Şerit (yol/köprü) segmentleri her karede kendi köşe kopyalarını üretir;
  // kaynaştırmadan normal hesaplarsak her kare kendi düz yüzü gibi görünür
  // ("kare kare" merdiven efekti). Çakışan köşeleri birleştirip öyle
  // pürüzsüz normal hesaplıyoruz.
  geo = mergeVertices(geo, 1e-4)
  geo.computeVertexNormals()
  geo.computeBoundingSphere()
  const mesh = new THREE.Mesh(geo, makeMaterial(kind, color))
  mesh.userData.featureId = id
  mesh.castShadow = kind === 'building' || kind === 'tree'
  mesh.receiveShadow = true
  return mesh
}

/** Düz tabanlı katı topografi — baskıya uygun */
function buildTerrainMesh(
  model: SceneModel,
  scale: number,
  baseThickness: number,
  relief: number,
  baseColor: string,
): THREE.Mesh {
  const grid = model.elevation
  const W = model.sizeM.width * scale
  const D = model.sizeM.depth * scale

  if (
    !grid ||
    grid.cols < 2 ||
    grid.rows < 2 ||
    grid.relativeM.length < grid.cols * grid.rows
  ) {
    const geo = new THREE.BoxGeometry(W, D, baseThickness)
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.92,
        metalness: 0,
      }),
    )
    mesh.position.set(W / 2, D / 2, baseThickness / 2)
    mesh.receiveShadow = true
    return mesh
  }

  const { cols, rows, relativeM } = grid
  const vertCount = cols * rows * 2
  const positions = new Float32Array(vertCount * 3)
  const indices: number[] = []

  let p = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c / (cols - 1)) * W
      const y = (r / (rows - 1)) * D
      const elev = safeElev(relativeM[r * cols + c])
      const h = baseThickness + elev * relief * scale
      positions[p++] = x
      positions[p++] = y
      positions[p++] = h
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c / (cols - 1)) * W
      const y = (r / (rows - 1)) * D
      positions[p++] = x
      positions[p++] = y
      positions[p++] = 0
    }
  }

  const topOff = 0
  const botOff = cols * rows

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const i = r * cols + c
      // Üst yüzey +Z, alt yüzey -Z bakmalı
      indices.push(
        topOff + i,
        topOff + i + 1,
        topOff + i + cols,
        topOff + i + 1,
        topOff + i + cols + 1,
        topOff + i + cols,
      )
      indices.push(
        botOff + i,
        botOff + i + cols,
        botOff + i + 1,
        botOff + i + 1,
        botOff + i + cols,
        botOff + i + cols + 1,
      )
    }
  }

  for (let c = 0; c < cols - 1; c++) {
    indices.push(
      topOff + c,
      botOff + c,
      topOff + c + 1,
      topOff + c + 1,
      botOff + c,
      botOff + c + 1,
    )
    const j = (rows - 1) * cols + c
    indices.push(
      topOff + j,
      topOff + j + 1,
      botOff + j,
      topOff + j + 1,
      botOff + j + 1,
      botOff + j,
    )
  }
  for (let r = 0; r < rows - 1; r++) {
    const i = r * cols
    indices.push(
      topOff + i,
      topOff + i + cols,
      botOff + i,
      topOff + i + cols,
      botOff + i + cols,
      botOff + i,
    )
    const j = r * cols + (cols - 1)
    indices.push(
      topOff + j,
      botOff + j,
      topOff + j + cols,
      topOff + j + cols,
      botOff + j,
      botOff + j + cols,
    )
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.9,
      metalness: 0,
      flatShading: false,
    }),
  )
  mesh.receiveShadow = true
  mesh.castShadow = true
  return mesh
}

export function buildSceneMeshes(
  model: SceneModel,
  printScale: number,
  reliefExaggeration = 1.5,
  colors: LayerPalette = LAYER_COLORS,
): BuiltMeshes {
  const group = new THREE.Group()
  const byId = new Map<string, THREE.Object3D>()
  const scale = Math.max(1e-6, printScale)
  const baseThickness = Math.max(1.2 * scale, 0.8)
  const relief = visibleRelief(model.elevation, model.sizeM, reliefExaggeration)

  group.add(buildTerrainMesh(model, scale, baseThickness, relief, colors.base))

  const grid = model.elevation
  const groundAt: GroundAt = (x, y) => {
    if (!grid) return baseThickness
    const e = safeElev(sampleElevation(grid, model.sizeM, x / scale, y / scale))
    return baseThickness + e * relief * scale
  }

  const ordered = [...model.features].sort(
    (a, b) => LAYER_ORDER[a.kind] - LAYER_ORDER[b.kind],
  )
  const printSide = Math.min(model.sizeM.width, model.sizeM.depth) * scale
  const stepM = roadSampleStepM(grid, model.sizeM)

  const addSolid = (
    solid: SolidMesh | null,
    kind: MapFeature['kind'],
    id: string,
    color?: string,
  ) => {
    if (!solid) return
    const obj = solidToMesh(solid, kind, color ?? colors[kind], id)
    if (!obj) return
    group.add(obj)
    byId.set(id, obj)
  }

  for (const feature of ordered) {
    if (feature.kind === 'tree') {
      const obj = buildTreeObject(feature, scale, groundAt, colors)
      if (!obj) continue
      group.add(obj)
      byId.set(feature.id, obj)
      continue
    }

    if (feature.kind === 'road') {
      const h = featureHeightMm('road', feature.heightM, printSide, scale)
      const path = feature.path
      const half = feature.halfWidthM ?? 3.5
      if (path && path.length >= 2) {
        const asBridge =
          isBridgeTags(feature.tags) && pathLengthM(path) >= 14
        const solid = asBridge
          ? bridgeSolid(path, half, scale, groundAt, h, stepM)
          : roadRibbon(path, half, scale, groundAt, h, stepM)
        addSolid(solid, 'road', feature.id, colors.road)
        continue
      }
      const obj = extrudeFeature(
        feature,
        colors.road,
        scale,
        baseThickness,
        model.sizeM,
        groundAt,
      )
      if (!obj) continue
      group.add(obj)
      byId.set(feature.id, obj)
      continue
    }

    if (feature.kind === 'building') {
      const range = ringElevRange(model.elevation, model.sizeM, feature.rings)
      const zMax = baseThickness + safeElev(range.max) * relief * scale
      const own = featureHeightMm(feature.kind, feature.heightM, printSide, scale)
      const zRoof = zMax + own
      const obj = extrudeFeature(
        feature,
        colors.building,
        scale,
        zRoof,
        model.sizeM,
        groundAt,
        Math.max(own, 1),
      )
      if (!obj) continue
      group.add(obj)
      byId.set(feature.id, obj)
      continue
    }

    const obj = extrudeFeature(
      feature,
      colors[feature.kind],
      scale,
      baseThickness,
      model.sizeM,
      groundAt,
    )
    if (!obj) continue
    group.add(obj)
    byId.set(feature.id, obj)
  }

  if (model.routePath && model.routePath.length >= 2) {
    const roadH = featureHeightMm('road', 2.4, printSide, scale)
    const h = model.raiseRoute ? roadH + 0.55 : roadH + 0.22
    addSolid(
      roadRibbon(model.routePath, 2.6, scale, groundAt, h, stepM),
      'road',
      'gpx-route',
      colors.route,
    )
  }

  return { group, byId }
}

export function highlightMesh(obj: THREE.Object3D | undefined, on: boolean) {
  if (!obj) return
  obj.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const mat = child.material as THREE.MeshStandardMaterial
    if (!mat?.emissive) return
    if (on) {
      mat.emissive = new THREE.Color(LAYER_COLORS.selected)
      mat.emissiveIntensity = 0.35
    } else {
      mat.emissive = new THREE.Color(0x000000)
      mat.emissiveIntensity = 0
    }
  })
}
