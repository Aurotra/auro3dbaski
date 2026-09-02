/**
 * Yaygın 3D yazıcı profilleri: tabla (bed) boyutu + nozzle çapı. Kullanıcı bir
 * profil seçtiğinde model otomatik olarak tablaya sığacak ölçeğe çekilir ve
 * nozzle çapının altına düşecek ince öğeler için uyarı gösterilir.
 */
export interface PrinterProfile {
  id: string
  label: string
  /** Baskı tablası, mm */
  bedX: number
  bedY: number
  bedZ: number
  /** Nozzle çapı, mm — asgari basılabilir genişlik ~3× nozzle kabul edilir */
  nozzleMm: number
}

export const PRINTER_PROFILES: PrinterProfile[] = [
  { id: 'custom', label: 'Özel (aşağıdan gir)', bedX: 220, bedY: 220, bedZ: 250, nozzleMm: 0.4 },
  { id: 'bambu-a1-mini', label: 'Bambu Lab A1 mini', bedX: 180, bedY: 180, bedZ: 180, nozzleMm: 0.4 },
  { id: 'bambu-a1', label: 'Bambu Lab A1', bedX: 256, bedY: 256, bedZ: 256, nozzleMm: 0.4 },
  { id: 'bambu-p1s', label: 'Bambu Lab P1S', bedX: 256, bedY: 256, bedZ: 256, nozzleMm: 0.4 },
  { id: 'bambu-x1c', label: 'Bambu Lab X1 Carbon', bedX: 256, bedY: 256, bedZ: 256, nozzleMm: 0.4 },
  { id: 'prusa-mk4', label: 'Prusa MK4 / MK4S', bedX: 250, bedY: 210, bedZ: 220, nozzleMm: 0.4 },
  { id: 'prusa-mini', label: 'Prusa MINI+', bedX: 180, bedY: 180, bedZ: 180, nozzleMm: 0.4 },
  { id: 'ender-3', label: 'Creality Ender 3 (v2/S1)', bedX: 220, bedY: 220, bedZ: 250, nozzleMm: 0.4 },
  { id: 'creality-k1', label: 'Creality K1 / K1C', bedX: 220, bedY: 220, bedZ: 250, nozzleMm: 0.4 },
  { id: 'elegoo-neptune-4', label: 'Elegoo Neptune 4', bedX: 225, bedY: 225, bedZ: 265, nozzleMm: 0.4 },
]

export function findPrinterProfile(id: string): PrinterProfile {
  return PRINTER_PROFILES.find((p) => p.id === id) ?? PRINTER_PROFILES[0]
}

/** Asgari basılabilir genişlik: nozzle çapının ~3 katı, en az 0.8 mm. */
export function minFeatureMm(profile: PrinterProfile): number {
  return Math.max(0.8, profile.nozzleMm * 3)
}

/**
 * Seçili alan (gerçek metre) verilen tablaya bir kenar payıyla sığacak
 * ölçeği (mm/m) döndürür. `margin` 0-1 arası, tablanın ne kadarının
 * kullanılacağını belirtir (varsayılan %90).
 */
export function scaleToFitBed(
  sizeM: { width: number; depth: number },
  profile: PrinterProfile,
  margin = 0.9,
): number {
  const maxSide = Math.max(sizeM.width, sizeM.depth)
  if (!(maxSide > 0)) return 0.4
  const bedSide = Math.min(profile.bedX, profile.bedY) * margin
  return Math.max(0.02, Math.min(4, bedSide / maxSide))
}

/** Model verilen ölçekte tablaya sığar mı? */
export function fitsOnBed(
  sizeM: { width: number; depth: number },
  scale: number,
  profile: PrinterProfile,
): boolean {
  return sizeM.width * scale <= profile.bedX && sizeM.depth * scale <= profile.bedY
}
