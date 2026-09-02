export type FeatureKind =
  | 'building'
  | 'road'
  /** Beton/asfalt zemin: otopark, meydan, yaya alanı, iskele */
  | 'paved'
  /** Yeşil alan: park, çayır, orman tabanı, tarla */
  | 'green'
  /** Ağaçlar: her halka bir ağacın taç izi */
  | 'tree'
  | 'water'

export interface MapFeature {
  id: string
  kind: FeatureKind
  name?: string
  /** Polygon rings in local meters (origin = selection southwest) */
  rings: [number, number][][]
  /** Yol/köprü merkez çizgisi (yerel m) — şerit araziye bundan giydirilir */
  path?: [number, number][]
  /** Şerit yarı genişliği (m); path varken kullanılır */
  halfWidthM?: number
  /** Extrusion height in real meters */
  heightM: number
  /** Footprint area in m² */
  areaM2: number
  /** Bounding box width/depth in meters */
  widthM: number
  depthM: number
  tags: Record<string, string>
}

/** Alttan üste: beton kentsel zemin, üstünde park/yeşil, sonra su ve yol */
export const LAYER_ORDER: Record<FeatureKind, number> = {
  paved: 0,
  green: 1,
  water: 2,
  road: 3,
  building: 4,
  tree: 5,
}

export interface SelectionBounds {
  west: number
  south: number
  east: number
  north: number
}

export interface SceneModel {
  bounds: SelectionBounds
  origin: { lon: number; lat: number }
  features: MapFeature[]
  /** Real-world size of selection in meters */
  sizeM: { width: number; depth: number }
  /** Topografi ızgarası (göreli m); yoksa düz taban */
  elevation?: ElevationGrid
  /**
   * Arazi hücreleri: 1 = su. Uzunluk (rows-1)*(cols-1).
   * Kıyı/deniz burada boyanır; poligon elemesi denizi yok etmesin.
   */
  waterMask?: Uint8Array
  /** GPX rotası (yerel m) — 3D önizlemede ayrı renkli şerit */
  routePath?: [number, number][]
  /** Rota normal yolların üstünde yükselsin */
  raiseRoute?: boolean
  buildingSources: { osm: number; ml: number }
  /** Uydu izleri istendi ama alınamadıysa sebep */
  mlNote?: string
}

export interface ElevationGrid {
  cols: number
  rows: number
  relativeM: Float32Array
  minElevM: number
  maxElevM: number
}

/** Her katman ayrı bir renk tonunda: baskıda ve ekranda karışmasınlar. */
export const LAYER_COLORS = {
  building: '#c08b57',
  road: '#e6e2d8',
  paved: '#8e9299',
  green: '#4a9b3f',
  /** Ağaç tacı / yaprak */
  tree: '#2f8f44',
  /** Ağaç gövdesi */
  trunk: '#6b4423',
  water: '#1f9ec9',
  base: '#7d6a52',
  selected: '#ffb020',
  route: '#c1121f',
} as const

export type LayerPalette = { [K in keyof typeof LAYER_COLORS]: string }

export function copyLayerColors(): LayerPalette {
  return { ...LAYER_COLORS }
}
