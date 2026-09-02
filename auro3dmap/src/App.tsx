import { useCallback, useMemo, useRef, useState } from 'react'
import { MapView } from './components/MapView'
import { Scene3D } from './components/Scene3D'
import { Sidebar } from './components/Sidebar'
import { fetchSceneModel } from './lib/overpass'
import { export3mf } from './lib/export3mf'
import { boundsSizeM } from './lib/geo'
import { parseGpxTrack, type LonLat } from './lib/gpxParse'
import type { SceneModel, SelectionBounds } from './types'
import { copyLayerColors } from './types'
import { lonLatToLocal } from './lib/geo'
import { apiUrl } from './lib/api'
import {
  PRINTER_PROFILES,
  findPrinterProfile,
  fitsOnBed,
  minFeatureMm,
  scaleToFitBed,
} from './lib/printerProfiles'
import './App.css'

/** Üst sınır (~20 km kenar / ~250 km²) — Overpass/DEM için güvenli */
const MAX_SIDE_M = 20_000
const MAX_AREA_M2 = 250_000_000

/** Tarayıcıyı/sunucuyu kilitlememesi için GPX dosya boyutu ve nokta sınırı */
const MAX_GPX_BYTES = 8 * 1024 * 1024
const MAX_GPX_POINTS = 50_000

function attachRoute(
  scene: SceneModel,
  track: LonLat[],
  raise: boolean,
): SceneModel {
  if (!track.length) {
    return { ...scene, routePath: undefined, raiseRoute: raise }
  }
  return {
    ...scene,
    routePath: track.map(([lon, lat]) =>
      lonLatToLocal(lon, lat, scene.origin.lon, scene.origin.lat),
    ),
    raiseRoute: raise,
  }
}

export default function App() {
  const [bounds, setBounds] = useState<SelectionBounds | null>(null)
  const [model, setModel] = useState<SceneModel | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [mmPerMeter, setMmPerMeter] = useState(0.4)
  const [reliefExaggeration, setReliefExaggeration] = useState(1.8)
  const [gpxFile, setGpxFile] = useState<File | null>(null)
  const [gpxTrack, setGpxTrack] = useState<LonLat[]>([])
  const [gpxFocusKey, setGpxFocusKey] = useState(0)
  const [serverBusy, setServerBusy] = useState(false)
  const [fillBuildings, setFillBuildings] = useState(true)
  const [layerColors, setLayerColors] = useState(copyLayerColors)
  const [raiseRoute, setRaiseRoute] = useState(true)
  const [printerProfileId, setPrinterProfileId] = useState(PRINTER_PROFILES[0].id)
  const [scenePaneOpen, setScenePaneOpen] = useState(false)
  const genIdRef = useRef(0)

  const selectionSize = useMemo(
    () => (bounds ? boundsSizeM(bounds) : null),
    [bounds],
  )

  const printerProfile = useMemo(
    () => findPrinterProfile(printerProfileId),
    [printerProfileId],
  )
  const bedFits = useMemo(
    () => (model ? fitsOnBed(model.sizeM, mmPerMeter, printerProfile) : true),
    [model, mmPerMeter, printerProfile],
  )
  const onFitToBed = useCallback(() => {
    if (!model) return
    setMmPerMeter(Number(scaleToFitBed(model.sizeM, printerProfile).toFixed(3)))
  }, [model, printerProfile])

  const onBoundsChange = useCallback((b: SelectionBounds | null) => {
    setBounds(b)
    setModel(null)
    setSelectedId(null)
    setError(null)
    setWarning(null)
  }, [])

  const onGenerate = useCallback(async () => {
    if (!bounds) return
    const myGenId = ++genIdRef.current
    setLoading(true)
    setError(null)
    setSelectedId(null)
    setWarning(null)
    const notes: string[] = []
    try {
      const size = boundsSizeM(bounds)
      const area = size.width * size.depth
      const maxSide = Math.max(size.width, size.depth)

      if (maxSide > MAX_SIDE_M || area > MAX_AREA_M2) {
        throw new Error(
          'Alan çok büyük (en fazla ~20 km kenar veya ~250 km²). Biraz küçültün.',
        )
      }

      let scale = mmPerMeter
      const printSide = maxSide * scale
      if (printSide > 320) {
        const autoScale = Number((320 / maxSide).toFixed(3))
        if (autoScale < scale) {
          scale = autoScale
          setMmPerMeter(scale)
          notes.push(
            'Büyük alan: baskı sığsın diye ölçek küçültüldü. Seçilen konum aynı kaldı.',
          )
        }
      } else if (maxSide > 4000) {
        notes.push('Büyük alan: yükleme biraz uzun sürebilir.')
      }

      const scene = await fetchSceneModel(bounds, { fillBuildings })
      // Bu üretimden sonra kullanıcı yeni bir alan seçip tekrar tıkladıysa
      // eski (yavaş) yanıt yeni sonucun üzerine yazmasın.
      if (genIdRef.current !== myGenId) return
      if (scene.features.length === 0) {
        setError('Bu alanda bina, yol veya su bulunamadı.')
      }
      if (scene.mlNote) notes.push(scene.mlNote)
      if (!scene.elevation) {
        notes.push(
          'Topografi alınamadı. Backend’i (port 8001) çalıştırıp modeli yeniden yükleyin.',
        )
      } else {
        const range = scene.elevation.maxElevM - scene.elevation.minElevM
        if (range < 2) {
          notes.push(
            'Bu alanda kot farkı çok küçük; arazi neredeyse düz görünebilir.',
          )
        }
      }
      setWarning(notes.length ? notes.join(' ') : null)
      setModel(attachRoute(scene, gpxTrack, raiseRoute))
      setSelectionMode(false)
      setScenePaneOpen(true)
    } catch (err) {
      if (genIdRef.current !== myGenId) return
      setModel(null)
      setError(
        err instanceof Error
          ? err.message
          : 'Veri alınamadı. Biraz sonra tekrar deneyin.',
      )
    } finally {
      if (genIdRef.current === myGenId) setLoading(false)
    }
  }, [bounds, mmPerMeter, fillBuildings, gpxTrack, raiseRoute])

  const onExport = useCallback(async () => {
    if (!model) return
    try {
      setError(null)
      await export3mf(
        model,
        mmPerMeter,
        'auro3dmap.3mf',
        reliefExaggeration,
        layerColors,
        minFeatureMm(printerProfile),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? `3MF oluşturulamadı: ${err.message}`
          : '3MF oluşturulamadı. Model çok büyük olabilir; sunucu export’unu deneyin.',
      )
    }
  }, [model, mmPerMeter, reliefExaggeration, layerColors, printerProfile])

  const onGpxFile = useCallback(async (file: File | null) => {
    if (!file) {
      setGpxFile(null)
      setGpxTrack([])
      setModel((m) =>
        m ? { ...m, routePath: undefined, raiseRoute } : m,
      )
      return
    }
    if (file.size > MAX_GPX_BYTES) {
      setError(
        `GPX dosyası çok büyük (en fazla ${Math.round(MAX_GPX_BYTES / 1024 / 1024)} MB).`,
      )
      return
    }
    setGpxFile(file)
    try {
      const text = await file.text()
      let pts = parseGpxTrack(text)
      if (pts.length === 0) {
        throw new Error('GPX içinde konum noktası yok')
      }
      if (pts.length > MAX_GPX_POINTS) {
        pts = pts.slice(0, MAX_GPX_POINTS)
      }
      setGpxTrack(pts)
      setGpxFocusKey((n) => n + 1)
      setError(null)
      setModel((m) => (m ? attachRoute(m, pts, raiseRoute) : m))
    } catch (err) {
      setGpxFile(null)
      setGpxTrack([])
      setError(err instanceof Error ? err.message : 'GPX okunamadı')
    }
  }, [raiseRoute])

  const onServerExport = useCallback(async () => {
    if (!bounds) return
    setServerBusy(true)
    setError(null)
    setWarning('Sunucu DEM + OSM + GPX ile 3MF üretiyor…')
    try {
      const body = new FormData()
      body.set('west', String(bounds.west))
      body.set('south', String(bounds.south))
      body.set('east', String(bounds.east))
      body.set('north', String(bounds.north))
      body.set('scale_mm_per_m', String(mmPerMeter))
      body.set('relief', String(reliefExaggeration))
      body.set('fill_buildings', String(fillBuildings))
      body.set('raise_route', String(raiseRoute))
      body.set('nozzle_mm', String(printerProfile.nozzleMm))
      if (gpxFile) body.set('gpx', gpxFile)

      const res = await fetch(apiUrl('/api/build'), { method: 'POST', body })
      if (!res.ok) {
        let msg = `Sunucu ${res.status}`
        try {
          const j = (await res.json()) as { detail?: string }
          if (j.detail) msg = j.detail
        } catch {
          /* ignore */
        }
        throw new Error(msg)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'auro3dmap.3mf'
      a.click()
      URL.revokeObjectURL(url)
      setWarning(null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Sunucu 3MF üretilemedi. Backend çalışıyor mu?',
      )
    } finally {
      setServerBusy(false)
    }
  }, [bounds, mmPerMeter, reliefExaggeration, gpxFile, fillBuildings, raiseRoute, printerProfile])

  const onToggleScenePane = useCallback(() => {
    setScenePaneOpen((v) => !v)
  }, [])

  // Model yokken 3D panel tamamen kapalı; oluşunca açılır; kullanıcı
  // manuel olarak gizleyip tekrar gösterebilir.
  const sceneState: 'hidden' | 'open' | 'collapsed' = !model
    ? 'hidden'
    : scenePaneOpen
      ? 'open'
      : 'collapsed'

  return (
    <div className="app">
      <Sidebar
        bounds={bounds}
        model={model}
        selectedId={selectedId}
        loading={loading}
        error={error}
        warning={warning}
        selectionSize={selectionSize}
        selectionMode={selectionMode}
        mmPerMeter={mmPerMeter}
        reliefExaggeration={reliefExaggeration}
        fillBuildings={fillBuildings}
        onFillBuildingsChange={setFillBuildings}
        onToggleSelect={() => setSelectionMode((v) => !v)}
        onGenerate={onGenerate}
        onExport={onExport}
        onSelectFeature={setSelectedId}
        onScaleChange={setMmPerMeter}
        onReliefChange={setReliefExaggeration}
        layerColors={layerColors}
        onLayerColorChange={(key, value) =>
          setLayerColors((c) => ({ ...c, [key]: value }))
        }
        raiseRoute={raiseRoute}
        onRaiseRouteChange={(v) => {
          setRaiseRoute(v)
          setModel((m) => (m ? { ...m, raiseRoute: v } : m))
        }}
        gpxName={gpxFile?.name ?? null}
        onGpxFile={onGpxFile}
        serverBusy={serverBusy}
        onServerExport={onServerExport}
        printerProfileId={printerProfileId}
        onPrinterProfileChange={setPrinterProfileId}
        printerMinFeatureMm={minFeatureMm(printerProfile)}
        bedFits={bedFits}
        onFitToBed={onFitToBed}
      />
      <main className="workspace" data-scene={sceneState}>
        <div className="pane map-pane">
          <div className="pane-label">Harita</div>
          <MapView
            bounds={bounds}
            onBoundsChange={onBoundsChange}
            selectionMode={selectionMode}
            gpxTrack={gpxTrack}
            gpxFocusKey={gpxFocusKey}
          />
        </div>
        <div
          className={
            sceneState === 'open' ? 'pane scene-pane' : 'pane scene-pane is-collapsed'
          }
        >
          <div className="pane-label">3D önizleme</div>
          {model && (
            <button
              type="button"
              className="scene-toggle"
              aria-expanded={sceneState === 'open'}
              onClick={onToggleScenePane}
            >
              {sceneState === 'open' ? 'Gizle ▾' : 'Göster ▴'}
            </button>
          )}
          <Scene3D
            model={model}
            selectedId={selectedId}
            mmPerMeter={mmPerMeter}
            reliefExaggeration={reliefExaggeration}
            colors={layerColors}
            onSelect={setSelectedId}
            onError={(msg) => setWarning((w) => w ?? msg)}
          />
        </div>
      </main>
    </div>
  )
}
