import type { LayerPalette, MapFeature, SceneModel, SelectionBounds } from '../types'
import { formatArea, formatMeters, boundsSizeM } from '../lib/geo'
import { PRINTER_PROFILES } from '../lib/printerProfiles'

interface SidebarProps {
  bounds: SelectionBounds | null
  model: SceneModel | null
  selectedId: string | null
  loading: boolean
  error: string | null
  warning: string | null
  selectionSize: { width: number; depth: number } | null
  selectionMode: boolean
  mmPerMeter: number
  reliefExaggeration: number
  fillBuildings: boolean
  onFillBuildingsChange: (v: boolean) => void
  onToggleSelect: () => void
  onGenerate: () => void
  onExport: () => void
  onSelectFeature: (id: string | null) => void
  onScaleChange: (v: number) => void
  onReliefChange: (v: number) => void
  layerColors: LayerPalette
  onLayerColorChange: (key: keyof LayerPalette, value: string) => void
  raiseRoute: boolean
  onRaiseRouteChange: (v: boolean) => void
  gpxName: string | null
  onGpxFile: (file: File | null) => void
  serverBusy: boolean
  onServerExport: () => void
  printerProfileId: string
  onPrinterProfileChange: (id: string) => void
  printerMinFeatureMm: number
  bedFits: boolean
  onFitToBed: () => void
}

function countKind(model: SceneModel, kind: MapFeature['kind']) {
  return model.features.filter((f) => f.kind === kind).length
}

function kindLabel(kind: MapFeature['kind']) {
  if (kind === 'building') return 'Bina'
  if (kind === 'road') return 'Yol'
  if (kind === 'paved') return 'Beton zemin'
  if (kind === 'green') return 'Yeşil alan'
  if (kind === 'tree') return 'Ağaçlar'
  return 'Su'
}

export function Sidebar({
  bounds,
  model,
  selectedId,
  loading,
  error,
  warning,
  selectionSize,
  selectionMode,
  mmPerMeter,
  reliefExaggeration,
  fillBuildings,
  onFillBuildingsChange,
  onToggleSelect,
  onGenerate,
  onExport,
  onSelectFeature,
  onScaleChange,
  onReliefChange,
  layerColors,
  onLayerColorChange,
  raiseRoute,
  onRaiseRouteChange,
  gpxName,
  onGpxFile,
  serverBusy,
  onServerExport,
  printerProfileId,
  onPrinterProfileChange,
  printerMinFeatureMm,
  bedFits,
  onFitToBed,
}: SidebarProps) {
  const selected = model?.features.find((f) => f.id === selectedId) ?? null
  const buildings = model?.features.filter((f) => f.kind === 'building') ?? []
  // Ağaçlar tek öğede toplanır: her halka bir ağaç
  const treeCount =
    model?.features
      .filter((f) => f.kind === 'tree')
      .reduce((sum, f) => sum + f.rings.length, 0) ?? 0
  const waterCount = (() => {
    if (!model) return 0
    const tagged = countKind(model, 'water')
    if (model.waterMask) {
      for (const v of model.waterMask) {
        if (v) return Math.max(1, tagged)
      }
    }
    return tagged
  })()
  const bridgeCount =
    model?.features.filter(
      (f) => f.kind === 'road' && (f.tags.bridge || f.tags.man_made === 'bridge'),
    ).length ?? 0
  const size = selectionSize ?? (bounds ? boundsSizeM(bounds) : null)
  const printW = model ? model.sizeM.width * mmPerMeter : 0
  const printD = model ? model.sizeM.depth * mmPerMeter : 0

  return (
    <aside className="sidebar">
      <header className="brand">
        <p className="brand-mark">Auro3DMap</p>
        <h1>Haritadan basılabilir şehir modeli</h1>
        <p className="lede">
          Alan seçin, gerçek boyutları görün, renkli 3MF olarak indirin.
        </p>
      </header>

      <section className="panel">
        <h2>1. Alan seç</h2>
        <button
          type="button"
          className={selectionMode ? 'btn btn-primary active' : 'btn btn-primary'}
          onClick={onToggleSelect}
        >
          {selectionMode ? 'Seçim açık — sürükleyin' : 'Haritada dikdörtgen çiz'}
        </button>
        {!selectionMode && (
          <p className="meta">
            Haritada gezmek için sürükleyin. Alan seçmek için butona basın — çizdiğiniz
            dikdörtgen olduğu gibi kalır (en fazla ~20 km).
          </p>
        )}
        {selectionMode && (
          <p className="meta">
            Seçim açık: harita düz bakışa alınır. Sürükleyerek alanı kendiniz çizin.
          </p>
        )}
        {size && (
          <p className="meta">
            Seçim: {formatMeters(size.width)} × {formatMeters(size.depth)}
            {Math.max(size.width, size.depth) > 2500
              ? ' · büyük alan desteklenir'
              : ''}
          </p>
        )}
      </section>

      <section className="panel">
        <h2>2. Model oluştur</h2>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!bounds || loading}
          onClick={onGenerate}
        >
          {loading ? (
            <>
              <span className="btn-spinner" aria-hidden />
              Harita verisi alınıyor…
            </>
          ) : (
            'Bina / yol / su yükle'
          )}
        </button>
        <label className="check-label">
          <input
            type="checkbox"
            checked={fillBuildings}
            onChange={(e) => onFillBuildingsChange(e.target.checked)}
          />
          Eksik binaları uydu izlerinden tamamla
        </label>
        <p className="meta">
          Birçok mahallede bina çizili değil. Bu seçenek uydudan çıkarılmış
          bina izlerini ekler; yükseklikler tahminidir.
        </p>
        {loading && (
          <p className="meta">
            Kaynak yoğunsa yedek sunucularla tekrar denenir; 1–2 dakika sürebilir.
            {fillBuildings
              ? ' Bir bölgenin uydu bina izleri ilk kullanımda indirilir (~30 sn), sonra önbellekten gelir.'
              : ''}
          </p>
        )}
        {error && <p className="error">{error}</p>}
        {warning && !error && <p className="warn">{warning}</p>}
        {model && (
          <ul className="stats">
            <li>
              <span>Bina</span>
              <strong>{buildings.length}</strong>
            </li>
            <li>
              <span>Köprü</span>
              <strong>{bridgeCount}</strong>
            </li>
            <li>
              <span>Su</span>
              <strong>{waterCount}</strong>
            </li>
            <li>
              <span>Yeşil</span>
              <strong>{countKind(model, 'green')}</strong>
            </li>
            <li>
              <span>Beton</span>
              <strong>{countKind(model, 'paved')}</strong>
            </li>
            <li>
              <span>Ağaç</span>
              <strong>{treeCount}</strong>
            </li>
          </ul>
        )}
        {model && model.buildingSources.ml > 0 && (
          <p className="meta">
            Bina kaynağı: {model.buildingSources.osm} harita çizimi +{' '}
            {model.buildingSources.ml} uydu izi.
          </p>
        )}
      </section>

      <section className="panel">
        <h2>3. Baskı ölçeği</h2>
        <label className="scale-label" htmlFor="scale">
          1 gerçek metre → {mmPerMeter.toFixed(2)} mm model
        </label>
        <input
          id="scale"
          type="range"
          min={0.05}
          max={2}
          step={0.05}
          value={mmPerMeter}
          onChange={(e) => onScaleChange(Number(e.target.value))}
        />
        <p className="meta">
          Yaklaşık baskı tabanı: {printW.toFixed(0)} × {printD.toFixed(0)} mm
          {model ? ` (1:${Math.round(1000 / mmPerMeter)})` : ''}
        </p>
      </section>

      <section className="panel">
        <h2>4. Yazıcı profili</h2>
        <select
          className="select"
          value={printerProfileId}
          onChange={(e) => onPrinterProfileChange(e.target.value)}
        >
          {PRINTER_PROFILES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} · {p.bedX}×{p.bedY} mm
            </option>
          ))}
        </select>
        <p className="meta">
          Asgari basılabilir kalınlık ≈ {printerMinFeatureMm.toFixed(1)} mm (nozzle
          çapının katı). İnce yol/rota şeritleri bu değerin altına düşmeyecek şekilde
          otomatik kalınlaştırılır.
        </p>
        {model && !bedFits && (
          <>
            <p className="warn">
              Model seçili yazıcının tablasına ({printW.toFixed(0)} × {printD.toFixed(0)} mm)
              sığmıyor.
            </p>
            <button type="button" className="btn btn-secondary" onClick={onFitToBed}>
              Ölçeği tablaya sığdır
            </button>
          </>
        )}
      </section>

      <section className="panel">
        <h2>5. Topografi</h2>
        <label className="scale-label" htmlFor="relief">
          Arazi abartısı: {reliefExaggeration.toFixed(1)}×
        </label>
        <input
          id="relief"
          type="range"
          min={0.5}
          max={6}
          step={0.1}
          value={reliefExaggeration}
          onChange={(e) => onReliefChange(Number(e.target.value))}
        />
        <p className="meta">
          {model?.elevation
            ? `Kot farkı: ${Math.round(model.elevation.maxElevM - model.elevation.minElevM)} m (${Math.round(model.elevation.minElevM)}–${Math.round(model.elevation.maxElevM)} m)`
            : 'Kot yok — modeli yeniden yükleyin (backend açık olmalı).'}
        </p>
      </section>

      <section className="panel legend-panel">
        <h2>Katmanlar</h2>
        <ul className="legend">
          {(
            [
              ['building', 'Binalar'],
              ['road', 'Yollar'],
              ['paved', 'Beton zemin'],
              ['green', 'Yeşil alanlar'],
              ['trunk', 'Ağaç gövdesi'],
              ['tree', 'Ağaç yaprak'],
              ['water', 'Sular'],
              ['base', 'Arazi / taban'],
              ['route', 'GPX rota'],
            ] as const
          ).map(([key, label]) => (
            <li key={key}>
              <label className="legend-color">
                <input
                  type="color"
                  value={layerColors[key]}
                  onChange={(e) => onLayerColorChange(key, e.target.value)}
                  title={`${label} rengi`}
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
        <p className="meta">Renk değişince 3D model de güncellenir.</p>
        <p className="meta">
          Çok renkli/AMS yazıcılarda slicer renk eşlemesi otomatik olmayabilir
          (özellikle Bambu Studio ↔ diğer slicer'lar arasında). 3MF'yi açtıktan sonra
          her katmanı aşağıdaki sıraya göre bir filaman slotuna elle atayın:
        </p>
        <ol className="filament-slots">
          {(
            [
              ['base', 'Arazi / taban'],
              ['paved', 'Beton zemin'],
              ['green', 'Yeşil alanlar'],
              ['water', 'Sular'],
              ['road', 'Yollar'],
              ['building', 'Binalar'],
              ['trunk', 'Ağaç gövdesi'],
              ['tree', 'Ağaç yaprak'],
              ['route', 'GPX rota'],
            ] as const
          ).map(([key, label]) => (
            <li key={key}>
              <span className="dot" style={{ background: layerColors[key] }} />
              {label}
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h2>6. GPX rota</h2>
        <label className="file-label">
          <input
            type="file"
            accept=".gpx,application/gpx+xml,text/xml"
            onChange={(e) => {
              onGpxFile(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
          {gpxName ? gpxName : 'GPX dosyası seç'}
        </label>
        {gpxName && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onGpxFile(null)}
          >
            Rotayı kaldır
          </button>
        )}
        <label className="check-label">
          <input
            type="checkbox"
            checked={raiseRoute}
            onChange={(e) => onRaiseRouteChange(e.target.checked)}
          />
          Rotayı yolların üstünde yükselt
        </label>
        <p className="meta">
          Rota 3D modelde seçtiğiniz renkte görünür. İşaretliyse normal yollardan
          daha yüksek basılır.
        </p>
      </section>

      {selected && (
        <section className="panel detail">
          <h2>Seçili öğe</h2>
          <p className="detail-title">
            {selected.name || kindLabel(selected.kind)}
          </p>
          <dl>
            <div>
              <dt>Tür</dt>
              <dd>{kindLabel(selected.kind)}</dd>
            </div>
            <div>
              <dt>Genişlik</dt>
              <dd>{formatMeters(selected.widthM)}</dd>
            </div>
            <div>
              <dt>Derinlik</dt>
              <dd>{formatMeters(selected.depthM)}</dd>
            </div>
            <div>
              <dt>Yükseklik</dt>
              <dd>{formatMeters(selected.heightM)}</dd>
            </div>
            <div>
              <dt>Taban alanı</dt>
              <dd>{formatArea(selected.areaM2)}</dd>
            </div>
          </dl>
        </section>
      )}

      {buildings.length > 0 && (
        <section className="panel list-panel">
          <h2>Binalar</h2>
          <ul className="feature-list">
            {buildings.slice(0, 40).map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className={b.id === selectedId ? 'active' : ''}
                  onClick={() =>
                    onSelectFeature(b.id === selectedId ? null : b.id)
                  }
                >
                  <span>{b.name || 'Adsız bina'}</span>
                  <small>
                    {formatMeters(b.widthM)} × {formatMeters(b.depthM)} ·{' '}
                    {formatMeters(b.heightM)}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel export-panel">
        <button
          type="button"
          className="btn btn-export"
          disabled={!bounds || serverBusy}
          onClick={onServerExport}
        >
          {serverBusy ? (
            <>
              <span className="btn-spinner" aria-hidden />
              Sunucu model üretiyor…
            </>
          ) : (
            '3MF üret (sunucu)'
          )}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!model || serverBusy}
          onClick={onExport}
          style={{ marginTop: '0.5rem' }}
        >
          Hızlı 3MF (tarayıcı)
        </button>
        <p className="meta">
          Sunucu: DEM + OSM + GPX, katı arazi, renkli parçalar. Tarayıcı önizleme
          için hızlı yedek.
        </p>
      </section>
    </aside>
  )
}
