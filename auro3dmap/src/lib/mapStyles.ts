import type { StyleSpecification } from 'maplibre-gl'

export type BasemapId = 'light' | 'dark' | 'topo' | 'satellite'

export const BASEMAPS: {
  id: BasemapId
  label: string
  title: string
}[] = [
  { id: 'light', label: 'Beyaz', title: 'Açık harita' },
  { id: 'dark', label: 'Siyah', title: 'Koyu harita' },
  { id: 'topo', label: 'Topo', title: 'Topografi / eşyükselti' },
  { id: 'satellite', label: 'Uydu', title: 'Uydu görüntüsü' },
]

function rasterStyle(
  id: string,
  tiles: string[],
  extras: { maxzoom?: number; layers?: StyleSpecification['layers'] } = {},
): StyleSpecification {
  return {
    version: 8,
    sources: {
      basemap: {
        type: 'raster',
        tiles,
        tileSize: 256,
        maxzoom: extras.maxzoom ?? 19,
        attribution: '',
      },
    },
    layers: extras.layers ?? [{ id, type: 'raster', source: 'basemap' }],
  }
}

/**
 * CARTO'nun ücretsiz anonim raster karo servisi (basemaps.cartocdn.com) artık
 * anahtar istiyor ("API KEY REQUIRED" karoları basıyor) — bunun yerine
 * OpenFreeMap'in ücretsiz, anahtarsız, sınırsız barındırılan vektör
 * stillerini kullanıyoruz (CARTO Positron/Dark Matter ile aynı tasarım).
 */
const OPENFREEMAP_LIGHT = 'https://tiles.openfreemap.org/styles/positron'
const OPENFREEMAP_DARK = 'https://tiles.openfreemap.org/styles/dark'

export function basemapStyle(id: BasemapId): StyleSpecification | string {
  switch (id) {
    case 'dark':
      return OPENFREEMAP_DARK
    case 'topo':
      return rasterStyle(
        'opentopo',
        [
          'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
          'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
          'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
        ],
        { maxzoom: 17 },
      )
    case 'satellite':
      return {
        version: 8,
        sources: {
          imagery: {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            maxzoom: 19,
            attribution: '',
          },
        },
        layers: [{ id: 'esri-imagery', type: 'raster', source: 'imagery' }],
      }
    default:
      return OPENFREEMAP_LIGHT
  }
}

const STORAGE_KEY = 'auro3dmap.basemap'

export function readStoredBasemap(): BasemapId {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'topo' || v === 'satellite') {
      return v
    }
  } catch {
    /* ignore */
  }
  return 'light'
}

export function storeBasemap(id: BasemapId) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
}
