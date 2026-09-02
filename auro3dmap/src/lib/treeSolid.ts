/**
 * Basılabilir ağaç katısı: kısa bir gövde + iki koni taç.
 *
 * Baskı kısıtları:
 * - Taç aşağıdan yukarı genişleyip sonra sivriliyor; hiçbir yüzey ~45°'den
 *   fazla sarkmıyor, yani desteksiz basılabilir (mantar şapkası yapmaz).
 * - Gövde ve taç için asgari kalınlık zorlanır; ölçek küçültülse bile ağaç
 *   dilimleyicinin basamayacağı kadar incelmez.
 * - Gövde tabanı zemine gömülür, model tek parça kalır.
 */

export interface SolidMesh {
  vertices: [number, number, number][]
  triangles: [number, number, number][]
}

/** Baskı biriminde (mm) ağaç ölçüleri */
export interface TreeDims {
  /** Taç yarıçapı */
  crown: number
  /** Toplam yükseklik (zeminden tepe noktasına) */
  height: number
  /** Gövde yarıçapı */
  trunk: number
  /** Gövdenin bittiği / tacın başladığı yükseklik */
  trunkTop: number
}

/**
 * Gerçek dünya ölçülerini baskıya çevirirken asgari basılabilir boyutları uygula.
 * Küçük ölçeklerde ağaçlar bilinçli olarak gerçeğinden kalın çıkar; aksi halde
 * 0.2 mm'lik çöplere dönüşüp hiç basılamazlar.
 */
export function treeDims(
  crownRadiusM: number,
  heightM: number,
  scale: number,
): TreeDims {
  const crown = Math.max(crownRadiusM * scale, 1.1)
  const height = Math.max(heightM * scale, crown * 3.2)
  const trunkTop = height * 0.24
  const trunk = Math.max(crown * 0.34, 0.65)
  return { crown, height, trunk, trunkTop }
}

/** Dönel profil (yarıçap, z) → 8 kenarlı kapalı katı */
function lathe(
  cx: number,
  cy: number,
  z0: number,
  profile: { r: number; z: number }[],
  apexZ: number,
  sides: number,
): SolidMesh {
  const vertices: [number, number, number][] = []
  const triangles: [number, number, number][] = []
  const cos: number[] = []
  const sin: number[] = []
  for (let s = 0; s < sides; s++) {
    const a = (s / sides) * Math.PI * 2
    cos.push(Math.cos(a))
    sin.push(Math.sin(a))
  }

  // Alt kapak merkezi
  const bottomCenter = vertices.length
  vertices.push([cx, cy, z0 + profile[0].z])

  const ringStart: number[] = []
  for (const p of profile) {
    ringStart.push(vertices.length)
    for (let s = 0; s < sides; s++) {
      vertices.push([cx + cos[s] * p.r, cy + sin[s] * p.r, z0 + p.z])
    }
  }

  // Tepe noktası (sivri uç)
  const apex = vertices.length
  vertices.push([cx, cy, z0 + apexZ])

  for (let s = 0; s < sides; s++) {
    const s1 = (s + 1) % sides
    // Alt kapak (aşağı bakar)
    triangles.push([bottomCenter, ringStart[0] + s1, ringStart[0] + s])
    // Yan yüzeyler
    for (let i = 0; i + 1 < profile.length; i++) {
      const a = ringStart[i] + s
      const b = ringStart[i] + s1
      const c = ringStart[i + 1] + s1
      const d = ringStart[i + 1] + s
      triangles.push([a, b, c], [a, c, d])
    }
    // Tepe
    const top = ringStart[profile.length - 1]
    triangles.push([top + s, top + s1, apex])
  }

  return { vertices, triangles }
}

/**
 * Merkezi (cx, cy), zemini groundZ olan ağaç: gövde ve taç ayrı katı
 * (gövde kahverengi, yaprak yeşil basılsın).
 */
export function treeParts(
  cx: number,
  cy: number,
  groundZ: number,
  dims: TreeDims,
  sides = 8,
): { trunk: SolidMesh; crown: SolidMesh } {
  const { crown, height, trunk, trunkTop } = dims
  const sink = Math.min(0.6, height * 0.15)
  const crownWidest = trunkTop + (height - trunkTop) * 0.42
  const trunkMesh = lathe(
    cx,
    cy,
    groundZ,
    [
      { r: trunk, z: -sink },
      { r: trunk, z: trunkTop },
    ],
    trunkTop,
    sides,
  )
  const crownMesh = lathe(
    cx,
    cy,
    groundZ,
    [
      { r: trunk * 1.08, z: trunkTop * 0.9 },
      { r: crown, z: crownWidest },
      { r: crown * 0.22, z: trunkTop + (height - trunkTop) * 0.88 },
    ],
    height,
    sides,
  )
  return { trunk: trunkMesh, crown: crownMesh }
}

export function treeSolid(
  cx: number,
  cy: number,
  groundZ: number,
  dims: TreeDims,
  sides = 8,
): SolidMesh {
  const { trunk, crown } = treeParts(cx, cy, groundZ, dims, sides)
  const vertices = [...trunk.vertices, ...crown.vertices]
  const triangles = [
    ...trunk.triangles,
    ...crown.triangles.map(
      (t) =>
        [
          t[0] + trunk.vertices.length,
          t[1] + trunk.vertices.length,
          t[2] + trunk.vertices.length,
        ] as [number, number, number],
    ),
  ]
  return { vertices, triangles }
}
