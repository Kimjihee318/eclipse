import * as THREE from 'three'
import 'three/examples/js/controls/OrbitControls'

// Fake data (unit: ?)
const SUN_RADIUS = 10
const EARTH_RADIUS = SUN_RADIUS * 0.5
const MOON_RADIUS = EARTH_RADIUS * 0.3
const SUN_EARTH_DIST = SUN_RADIUS * 8
const EARTH_MOON_DIST = EARTH_RADIUS * 2

// Approx. data (unit: day)
const MOON_REVOLUTION_PERIOD = 27
const EARTH_REVOLUTION_PERIOD = 365
const MOON_ROTATION_PERIOD = 27
const EARTH_ROTATION_PERIOD = 1


export function main(root: HTMLElement): void {
  const canvas1: HTMLCanvasElement | null = root.querySelector('canvas.canvas1')
  const canvas2: HTMLCanvasElement | null = root.querySelector('canvas.canvas2')
  const canvas3: HTMLCanvasElement | null = root.querySelector('canvas.canvas3')
  if (!canvas1 || !canvas2 || !canvas3) throw new Error('Canvas not found')

  const win = root.ownerDocument.defaultView

  const scene = new THREE.Scene()

  const camera1 = new THREE.PerspectiveCamera(45, canvas1.width / canvas1.height, 1, SUN_EARTH_DIST * 6)
  camera1.position.set(0, 0, SUN_EARTH_DIST * 3)
  const camera2 = new THREE.PerspectiveCamera(45, canvas2.width / canvas2.height, 1, SUN_EARTH_DIST * 6)
  camera2.position.set(0, 0, SUN_EARTH_DIST * 3)
  const camera3 = new THREE.PerspectiveCamera(45, canvas3.width / canvas3.height, 1, SUN_EARTH_DIST * 6)
  camera3.position.set(0, 0, SUN_EARTH_DIST * 3)

  const control = new THREE.OrbitControls(camera3, canvas3)
  control.addEventListener('change', () => renderer3.render(scene, camera3))

  const renderer1 = new THREE.WebGLRenderer({antialias: true, canvas: canvas1})
  renderer1.setSize(canvas1.width, canvas1.height)
  renderer1.shadowMap.enabled = true
  renderer1.shadowMap.type = THREE.PCFSoftShadowMap

  const renderer2 = new THREE.WebGLRenderer({antialias: true, canvas: canvas2})
  renderer2.setSize(canvas2.width, canvas2.height)
  renderer2.shadowMap.enabled = true
  renderer2.shadowMap.type = THREE.PCFSoftShadowMap

  const renderer3 = new THREE.WebGLRenderer({antialias: true, canvas: canvas3})
  renderer3.setSize(canvas3.width, canvas3.height)
  renderer3.shadowMap.enabled = true
  renderer3.shadowMap.type = THREE.PCFSoftShadowMap

  const sun = createAstroBody(SUN_RADIUS, 'images/sun.jpg', true)
  scene.add(sun)
  const earth = createAstroBody(EARTH_RADIUS, 'images/earth.jpg', false)
  scene.add(earth)
  const moon = createAstroBody(MOON_RADIUS, 'images/moon.jpg', false)
  scene.add(moon)

  const ambLight = new THREE.AmbientLight(0xFFFFFF, 0.3)
  scene.add(ambLight)
  const sunLight = new THREE.DirectionalLight(0xFFFFFF, 2)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 1024
  sunLight.shadow.mapSize.height = 1024
  sunLight.target = earth
  scene.add(sunLight)

  tick(0)

  let lastUpdate = Date.now()

  function tick(millis: number) {
    win.requestAnimationFrame(tick)

    let now = Date.now()
    if (now - lastUpdate < 10) return
    lastUpdate = now

    update(millis)

    renderer1.render(scene, camera1)
    renderer2.render(scene, camera2)
    renderer3.render(scene, camera3)
  }

  function update(millis: number) {
    // 1초를 3시간으로
    let speed = 60 * 60 * 3

    // 일단위로 변환
    let days = speed * millis / 1000 / 60 / 60 / 24

    // 공전
    let earthX = Math.cos(days / EARTH_REVOLUTION_PERIOD * 2 * Math.PI) * SUN_EARTH_DIST
    let earthZ = Math.sin(days / EARTH_REVOLUTION_PERIOD * 2 * Math.PI) * SUN_EARTH_DIST
    let moonX = Math.cos(days / MOON_REVOLUTION_PERIOD * 2 * Math.PI) * EARTH_MOON_DIST
    let moonZ = Math.sin(days / MOON_REVOLUTION_PERIOD * 2 * Math.PI) * EARTH_MOON_DIST
    earth.position.x = earthX
    earth.position.z = earthZ
    moon.position.x = earthX + moonX
    moon.position.z = earthZ + moonZ

    // 자전
    earth.rotation.y = -days / EARTH_ROTATION_PERIOD * 2 * Math.PI
    moon.rotation.y = days / MOON_ROTATION_PERIOD * 2 * Math.PI

    // 카메라
    //// 태양계를 전체
    camera1.position.set(sun.position.x, SUN_EARTH_DIST * 3, sun.position.z)
    camera1.lookAt(sun.position)

    //// 지구에서 본 태양
    camera2.position.set(earth.position.x, earth.position.y, earth.position.z)
    camera2.lookAt(sun.position)
  }
}

function createAstroBody(radius: number, texture: string, isSun: boolean): THREE.Object3D {
  const geometry = new THREE.SphereGeometry(radius, 50, 50)
  const material = isSun ?
    new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(texture),
    }) :
    new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load(texture),
      shininess: 1,
    })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = !isSun
  mesh.receiveShadow = !isSun
  return mesh
}
