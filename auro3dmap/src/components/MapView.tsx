import { useCallback, useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { FeatureCollection } from 'geojson'

// MapLibre v6, worker script URL'ini `import.meta.url` ile otomatik bulmaya
// çalışır ama Vite'ın tek-dosya production build'inde bu doğru çözülmüyor —
// worker isteği site köküne (`/assets/maplibre-gl.mjs`) gidip 404/HTML
// döndüğü için karolar hiç yüklenmiyordu. `?worker&url` sorgusu worker'ı
// kendi `maplibre-gl-shared.mjs` bağımlılığıyla birlikte bağımsız bir chunk
// olarak derleyip doğru (base path dahil) URL'i veriyor.
maplibregl.setWorkerUrl(maplibreWorkerUrl)
import type { SelectionBounds } from '../types'
import { trackCollection, trackExtent, type LonLat } from '../lib/gpxParse'
import {
  BASEMAPS,
  basemapStyle,
  readStoredBasemap,
  storeBasemap,
  type BasemapId,
} from '../lib/mapStyles'

interface MapViewProps {
  bounds: SelectionBounds | null
  onBoundsChange: (bounds: SelectionBounds | null) => void
  selectionMode: boolean
  gpxTrack?: LonLat[]
  gpxFocusKey?: number
}

function boundsCollection(b: SelectionBounds | null): FeatureCollection {
  if (!b) return { type: 'FeatureCollection', features: [] }
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [b.west, b.south],
              [b.east, b.south],
              [b.east, b.north],
              [b.west, b.north],
              [b.west, b.south],
            ],
          ],
        },
      },
    ],
  }
}

function screenToBounds(
  map: maplibregl.Map,
  a: { x: number; y: number },
  b: { x: number; y: number },
): SelectionBounds {
  const corners = [
    [a.x, a.y],
    [b.x, a.y],
    [b.x, b.y],
    [a.x, b.y],
  ] as const
  let west = Infinity
  let east = -Infinity
  let south = Infinity
  let north = -Infinity
  for (const [x, y] of corners) {
    const p = map.unproject([x, y])
    west = Math.min(west, p.lng)
    east = Math.max(east, p.lng)
    south = Math.min(south, p.lat)
    north = Math.max(north, p.lat)
  }
  return { west, south, east, north }
}

function paintDraftRect(
  el: SVGRectElement | null,
  a: { x: number; y: number } | null,
  b: { x: number; y: number } | null,
) {
  if (!el) return
  if (!a || !b) {
    el.setAttribute('width', '0')
    el.setAttribute('height', '0')
    el.style.display = 'none'
    return
  }
  const w = Math.abs(b.x - a.x)
  const h = Math.abs(b.y - a.y)
  el.setAttribute('x', String(Math.min(a.x, b.x)))
  el.setAttribute('y', String(Math.min(a.y, b.y)))
  el.setAttribute('width', String(w))
  el.setAttribute('height', String(h))
  el.style.display = w < 2 && h < 2 ? 'none' : 'block'
}

function overlayPaint(basemap: BasemapId) {
  const onDark = basemap === 'dark' || basemap === 'satellite'
  return {
    fill: onDark ? '#ffc766' : '#f6a623',
    fillOpacity: onDark ? 0.28 : 0.2,
    line: onDark ? '#ffe08a' : '#dd8712',
    casing: onDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)',
    // Rota, amber seçim dikdörtgeniyle karışmasın; modeldeki rota rengiyle aynı
    gpx: onDark ? '#ff5a5f' : '#c1121f',
  }
}

function fitMapToTrack(map: maplibregl.Map, pts: LonLat[]) {
  const ext = trackExtent(pts)
  if (!ext) return

  map.stop()
  map.resize()

  const center: [number, number] = [
    (ext.west + ext.east) / 2,
    (ext.south + ext.north) / 2,
  ]
  const span = Math.max(ext.east - ext.west, ext.north - ext.south)

  if (span < 1e-5) {
    map.flyTo({
      center,
      zoom: Math.max(map.getZoom(), 14),
      duration: 1100,
      essential: true,
    })
    return
  }

  const bounds = new maplibregl.LngLatBounds(
    [ext.west, ext.south],
    [ext.east, ext.north],
  )

  try {
    map.fitBounds(bounds, {
      padding: { top: 80, bottom: 52, left: 44, right: 60 },
      maxZoom: 15,
      duration: 1100,
      essential: true,
    })
  } catch {
    map.flyTo({
      center,
      zoom: span > 0.2 ? 10 : span > 0.05 ? 12 : 14,
      duration: 1100,
      essential: true,
    })
  }
}

function setSelData(
  map: maplibregl.Map,
  basemap: BasemapId,
  b: SelectionBounds | null,
) {
  ensureOverlayLayers(map, basemap)
  const src = map.getSource('sel') as maplibregl.GeoJSONSource | undefined
  src?.setData(boundsCollection(b))
}

function setGpxData(map: maplibregl.Map, basemap: BasemapId, pts: LonLat[]) {
  ensureOverlayLayers(map, basemap)
  const src = map.getSource('gpx') as maplibregl.GeoJSONSource | undefined
  src?.setData(trackCollection(pts))
}

/** Katmanları ekle. Stil henüz hazır değilse sessizce geç — 'styledata' tekrar dener. */
function ensureOverlayLayers(map: maplibregl.Map, basemap: BasemapId) {
  try {
    addSelLayers(map, basemap)
  } catch {
    /* stil hazır değil */
  }
  try {
    addGpxLayers(map, basemap)
  } catch {
    /* stil hazır değil */
  }
}

function addSelLayers(map: maplibregl.Map, basemap: BasemapId) {
  const paint = overlayPaint(basemap)
  if (!map.getSource('sel')) {
    map.addSource('sel', {
      type: 'geojson',
      data: boundsCollection(null),
    })
    map.addLayer({
      id: 'sel-fill',
      type: 'fill',
      source: 'sel',
      paint: {
        'fill-color': paint.fill,
        'fill-opacity': paint.fillOpacity,
      },
    })
    map.addLayer({
      id: 'sel-casing',
      type: 'line',
      source: 'sel',
      paint: {
        'line-color': paint.casing,
        'line-width': 6,
        'line-opacity': 0.9,
      },
    })
    map.addLayer({
      id: 'sel-line',
      type: 'line',
      source: 'sel',
      paint: {
        'line-color': paint.line,
        'line-width': 2.5,
        'line-opacity': 1,
      },
    })
  }
}

function addGpxLayers(map: maplibregl.Map, basemap: BasemapId) {
  const paint = overlayPaint(basemap)
  if (!map.getSource('gpx')) {
    map.addSource('gpx', {
      type: 'geojson',
      data: trackCollection([]),
    })
    map.addLayer({
      id: 'gpx-line',
      type: 'line',
      source: 'gpx',
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: {
        'line-color': paint.gpx,
        'line-width': 4,
        'line-opacity': 0.95,
      },
    })
    map.addLayer({
      id: 'gpx-point',
      type: 'circle',
      source: 'gpx',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-color': paint.gpx,
        'circle-radius': 6,
        'circle-stroke-width': 2,
        'circle-stroke-color': paint.casing,
      },
    })
  }
}

export function MapView({
  bounds,
  onBoundsChange,
  selectionMode,
  gpxTrack = [],
  gpxFocusKey = 0,
}: MapViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const mapHostRef = useRef<HTMLDivElement>(null)
  const draftRectRef = useRef<SVGRectElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const draftBoundsRef = useRef<SelectionBounds | null>(null)
  const pendingFitRef = useRef<LonLat[] | null>(null)
  const ignoreTapUntilRef = useRef(0)
  const dragStartPx = useRef<{ x: number; y: number } | null>(null)
  const selectionModeRef = useRef(selectionMode)
  const onBoundsChangeRef = useRef(onBoundsChange)
  const boundsRef = useRef(bounds)
  const gpxRef = useRef(gpxTrack)
  const basemapRef = useRef<BasemapId>(readStoredBasemap())
  const skipStyleApply = useRef(true)
  const [basemap, setBasemap] = useState<BasemapId>(() => readStoredBasemap())

  useEffect(() => {
    selectionModeRef.current = selectionMode
  }, [selectionMode])

  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange
  }, [onBoundsChange])

  useEffect(() => {
    boundsRef.current = bounds
  }, [bounds])

  useEffect(() => {
    gpxRef.current = gpxTrack
  }, [gpxTrack])

  useEffect(() => {
    basemapRef.current = basemap
  }, [basemap])

  const applyPendingFit = useCallback((map: maplibregl.Map) => {
    const pts = pendingFitRef.current
    if (!pts?.length) return
    pendingFitRef.current = null
    setGpxData(map, basemapRef.current, pts)
    fitMapToTrack(map, pts)
  }, [])

  useEffect(() => {
    const host = mapHostRef.current
    const wrap = wrapRef.current
    if (!host || !wrap || mapRef.current) return

    skipStyleApply.current = true

    const map = new maplibregl.Map({
      container: host,
      style: basemapStyle(basemapRef.current),
      center: [28.9784, 41.0082],
      zoom: 15,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      'top-right',
    )

    const resizeObserver = new ResizeObserver(() => {
      map.resize()
    })
    resizeObserver.observe(host)
    requestAnimationFrame(() => map.resize())

    const shownBounds = () => draftBoundsRef.current ?? boundsRef.current

    const syncOverlays = () => {
      setSelData(map, basemapRef.current, shownBounds())
      setGpxData(map, basemapRef.current, gpxRef.current)
      applyPendingFit(map)
    }

    const localPoint = (e: PointerEvent | MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!selectionModeRef.current || e.button !== 0) return
      const target = e.target as HTMLElement
      if (target.closest('.maplibregl-ctrl, .map-basemap')) return
      if (performance.now() < ignoreTapUntilRef.current) return

      e.preventDefault()
      e.stopPropagation()
      try {
        wrap.setPointerCapture(e.pointerId)
      } catch {
        /* capture alınamadı — sürükleme yine çalışır */
      }

      const p = localPoint(e)
      dragStartPx.current = p
      map.dragPan.disable()
      map.boxZoom.disable()
      setSelData(map, basemapRef.current, null)
      paintDraftRect(draftRectRef.current, p, p)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragStartPx.current) return
      const p = localPoint(e)
      paintDraftRect(draftRectRef.current, dragStartPx.current, p)
    }

    const finishDrag = (e: PointerEvent) => {
      if (!dragStartPx.current) return
      const start = dragStartPx.current
      dragStartPx.current = null
      map.dragPan.enable()
      map.boxZoom.enable()

      try {
        wrap.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }

      const end = localPoint(e)

      paintDraftRect(draftRectRef.current, null, null)

      if (Math.hypot(end.x - start.x, end.y - start.y) < 8) {
        draftBoundsRef.current = null
        setSelData(map, basemapRef.current, boundsRef.current)
        return
      }

      const next = screenToBounds(map, start, end)
      draftBoundsRef.current = null
      boundsRef.current = next
      ignoreTapUntilRef.current = performance.now() + 450
      setSelData(map, basemapRef.current, next)
      onBoundsChangeRef.current(next)
    }

    map.on('load', syncOverlays)
    map.on('style.load', syncOverlays)
    map.on('styledata', syncOverlays)
    syncOverlays()

    wrap.addEventListener('pointerdown', onPointerDown, true)
    wrap.addEventListener('pointermove', onPointerMove, true)
    wrap.addEventListener('pointerup', finishDrag, true)
    wrap.addEventListener('pointercancel', finishDrag, true)

    mapRef.current = map

    return () => {
      resizeObserver.disconnect()
      wrap.removeEventListener('pointerdown', onPointerDown, true)
      wrap.removeEventListener('pointermove', onPointerMove, true)
      wrap.removeEventListener('pointerup', finishDrag, true)
      wrap.removeEventListener('pointercancel', finishDrag, true)
      map.off('load', syncOverlays)
      map.off('style.load', syncOverlays)
      map.off('styledata', syncOverlays)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (skipStyleApply.current) {
      skipStyleApply.current = false
      return
    }
    map.setStyle(basemapStyle(basemap))
  }, [basemap])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (dragStartPx.current) return
    setSelData(map, basemapRef.current, bounds)
  }, [bounds])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    setGpxData(map, basemapRef.current, gpxTrack)
  }, [gpxTrack])

  // GPX yüklenince rotaya kaydır. Harita yeniden kurulursa odak yeniden uygulanır.
  useEffect(() => {
    if (!gpxFocusKey || gpxTrack.length === 0) return
    pendingFitRef.current = gpxTrack

    const run = () => {
      const map = mapRef.current
      if (map) applyPendingFit(map)
    }

    run()
    const t1 = window.setTimeout(run, 150)
    const t2 = window.setTimeout(run, 600)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [gpxFocusKey, gpxTrack, applyPendingFit])

  useEffect(() => {
    const map = mapRef.current
    const wrap = wrapRef.current
    if (!map || !wrap) return
    wrap.style.cursor = selectionMode ? 'crosshair' : ''
    map.getCanvas().style.cursor = selectionMode ? 'crosshair' : ''
    if (selectionMode) {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 280,
        essential: true,
      })
      map.setMaxPitch(0)
      map.dragRotate.disable()
      map.touchPitch.disable()
    } else {
      map.setMaxPitch(85)
      map.dragRotate.enable()
      map.touchPitch.enable()
    }
  }, [selectionMode])

  const onPickBasemap = (id: BasemapId) => {
    setBasemap(id)
    storeBasemap(id)
  }

  return (
    <div className="map-view" ref={wrapRef} data-basemap={basemap}>
      <div className="map-host" ref={mapHostRef} />
      <svg className="map-sel-svg" aria-hidden>
        <rect ref={draftRectRef} className="map-sel-draft" />
      </svg>
      <div className="map-basemap" role="tablist" aria-label="Harita görünümü">
        {BASEMAPS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={basemap === item.id}
            title={item.title}
            className={basemap === item.id ? 'is-active' : undefined}
            onClick={() => onPickBasemap(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
