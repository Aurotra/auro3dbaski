import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { LayerPalette, SceneModel } from '../types'
import { buildSceneMeshes, highlightMesh } from '../lib/meshBuilder'

interface Scene3DProps {
  model: SceneModel | null
  selectedId: string | null
  mmPerMeter: number
  reliefExaggeration: number
  colors: LayerPalette
  onSelect: (id: string | null) => void
  onError?: (message: string) => void
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry?.dispose()
    const mat = child.material
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else mat?.dispose()
  })
}

function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  object: THREE.Object3D,
  sizeMm: { width: number; depth: number },
) {
  const fallbackW = Math.max(sizeMm.width, 20)
  const fallbackD = Math.max(sizeMm.depth, 20)
  let cx = fallbackW / 2
  let cy = fallbackD / 2
  let cz = 0
  let horiz = Math.max(fallbackW, fallbackD)

  const box = new THREE.Box3().setFromObject(object)
  if (
    !box.isEmpty() &&
    Number.isFinite(box.min.x) &&
    Number.isFinite(box.max.x) &&
    Number.isFinite(box.min.y) &&
    Number.isFinite(box.max.y) &&
    Number.isFinite(box.min.z) &&
    Number.isFinite(box.max.z)
  ) {
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    if (
      Number.isFinite(center.x) &&
      Number.isFinite(center.y) &&
      size.x < fallbackW * 6 &&
      size.y < fallbackD * 6
    ) {
      cx = center.x
      cy = center.y
      cz = Number.isFinite(center.z) ? center.z : 0
      horiz = Math.max(size.x, size.y, horiz * 0.45)
      if (size.z > horiz * 1.4) cz = Math.min(Math.max(cz, 0), horiz * 0.12)
    }
  }

  const dist = horiz * 1.3
  camera.near = Math.max(0.2, horiz / 80)
  camera.far = Math.max(8000, horiz * 25)
  camera.updateProjectionMatrix()
  camera.up.set(0, 0, 1)
  camera.position.set(cx + dist * 0.58, cy - dist * 0.82, cz + dist * 0.78)
  controls.target.set(cx, cy, Math.max(cz, 0))
  controls.minDistance = horiz * 0.2
  controls.maxDistance = horiz * 6
  controls.minPolarAngle = 0.18
  controls.maxPolarAngle = Math.PI * 0.47
  controls.update()
}

/** Gölge kamerası modeli kapsamalı; varsayılan ±5 birim baskı ölçeğinde hiçbir şey. */
function fitSunToModel(
  sun: THREE.DirectionalLight,
  sizeMm: { width: number; depth: number },
) {
  const w = Math.max(sizeMm.width, 20)
  const d = Math.max(sizeMm.depth, 20)
  const span = Math.max(w, d)
  const cx = w / 2
  const cy = d / 2

  sun.position.set(cx + span * 0.6, cy - span * 0.75, span * 0.9)
  sun.target.position.set(cx, cy, 0)
  sun.target.updateMatrixWorld()

  const cam = sun.shadow.camera
  const half = span * 0.75
  cam.left = -half
  cam.right = half
  cam.top = half
  cam.bottom = -half
  cam.near = span * 0.05
  cam.far = span * 4
  cam.updateProjectionMatrix()
  sun.shadow.bias = -0.0006 * Math.max(1, span / 150)
}

export function Scene3D({
  model,
  selectedId,
  mmPerMeter,
  reliefExaggeration,
  colors,
  onSelect,
  onError,
}: Scene3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const onErrorRef = useRef(onError)
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    root: THREE.Group
    sun: THREE.DirectionalLight
    byId: Map<string, THREE.Object3D>
    frame: number
  } | null>(null)
  const selectedRef = useRef(selectedId)
  const onSelectRef = useRef(onSelect)
  const fitKeyRef = useRef('')

  useEffect(() => {
    selectedRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.shadowMap.enabled = true
    // Işık ve geometri sabit: gölge haritası her karede değil, model
    // değiştiğinde bir kez hesaplanır (binlerce bina olduğunda fark ediyor)
    renderer.shadowMap.autoUpdate = false
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#e8eef1')

    const camera = new THREE.PerspectiveCamera(
      40,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.05,
      20000,
    )
    camera.position.set(80, -90, 70)
    camera.up.set(0, 0, 1)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.screenSpacePanning = true
    controls.minPolarAngle = 0.18
    controls.maxPolarAngle = Math.PI * 0.47
    controls.target.set(40, 40, 0)

    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a9aa3, 0.72)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xfff6e8, 1.25)
    dir.position.set(90, -70, 80)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    scene.add(dir)
    scene.add(dir.target)
    const fill = new THREE.DirectionalLight(0xc5d8e0, 0.35)
    fill.position.set(-50, 40, 40)
    scene.add(fill)

    const root = new THREE.Group()
    scene.add(root)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const onClick = (ev: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(root.children, true)
      const hit = hits.find((h) => h.object.userData.featureId)
      onSelectRef.current(hit ? String(hit.object.userData.featureId) : null)
    }
    renderer.domElement.addEventListener('click', onClick)

    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = Math.max(mount.clientHeight, 1)
      if (w === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)
    // Pencere yeniden boyutlanmadan da konteyner boyutu değişebilir (örn.
    // 3D panel aç/kapa animasyonu) — ResizeObserver bunu da yakalar.
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(mount)

    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    stateRef.current = {
      renderer,
      scene,
      camera,
      controls,
      root,
      sun: dir,
      byId: new Map(),
      frame,
    }

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('click', onClick)
      disposeObject(root)
      controls.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      stateRef.current = null
    }
  }, [])

  useEffect(() => {
    const state = stateRef.current
    if (!state) return

    while (state.root.children.length) {
      const child = state.root.children[0]
      state.root.remove(child)
      disposeObject(child)
    }
    state.byId.clear()

    if (!model) {
      state.renderer.shadowMap.needsUpdate = true
      return
    }

    try {
      const built = buildSceneMeshes(model, mmPerMeter, reliefExaggeration, colors)
      state.root.add(built.group)
      state.byId = built.byId
      fitSunToModel(state.sun, {
        width: model.sizeM.width * mmPerMeter,
        depth: model.sizeM.depth * mmPerMeter,
      })
      state.renderer.shadowMap.needsUpdate = true
      const fitKey = [
        model.origin.lon,
        model.origin.lat,
        model.sizeM.width,
        model.sizeM.depth,
        mmPerMeter,
        reliefExaggeration,
        model.features.length,
      ].join(':')
      if (fitKeyRef.current !== fitKey) {
        fitKeyRef.current = fitKey
        fitCameraToObject(state.camera, state.controls, built.group, {
          width: model.sizeM.width * mmPerMeter,
          depth: model.sizeM.depth * mmPerMeter,
        })
      }
    } catch (err) {
      // model üretimi patlarsa sahneyi boş bırak ama kullanıcıyı bilgilendir
      onErrorRef.current?.(
        err instanceof Error
          ? `3D önizleme oluşturulamadı: ${err.message}`
          : '3D önizleme oluşturulamadı.',
      )
    }
  }, [model, mmPerMeter, reliefExaggeration, colors])

  useEffect(() => {
    const state = stateRef.current
    if (!state) return
    for (const [id, obj] of state.byId) {
      highlightMesh(obj, id === selectedId)
    }
  }, [selectedId, model, mmPerMeter, reliefExaggeration, colors])

  return (
    <div className="scene-3d" ref={mountRef}>
      {!model && (
        <div className="scene-empty">
          <p>3D önizleme burada görünecek</p>
          <span>Haritada bir alan seçip modeli oluşturun</span>
        </div>
      )}
    </div>
  )
}
