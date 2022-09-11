import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

renderer.shadowMap.enabled = true

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  45, 
  window.innerWidth/window.innerHeight,
  1,
  1000
)
camera.position.set(-10,5,10)

const orbit = new OrbitControls(camera, renderer.domElement)

const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

const planeGeometry = new THREE.PlaneGeometry(20,20)
const planeMaterial = new THREE.MeshStandardMaterial({ 
  color : 0xFFFFFF, 
  side: THREE.DoubleSide,
  visible: false,
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)
plane.rotation.x = -.5 * Math.PI
plane.receiveShadow = true
plane.name = 'ground'

const highlightGeometry = new THREE.PlaneGeometry(1,1)
const hightlightMaterial = new THREE.MeshStandardMaterial({ 
  color : 0xFFFFFF, 
  side: THREE.DoubleSide,
  transparent: true
})
const highlight = new THREE.Mesh(highlightGeometry, hightlightMaterial)
highlight.position.set(.5,0,.5)
scene.add(highlight)
highlight.rotation.x = -.5 * Math.PI
highlight.receiveShadow = true

const gridHelper = new THREE.GridHelper(20)
scene.add(gridHelper)

const ambientLight = new THREE.AmbientLight(0x333333)
scene.add(ambientLight)

const spotlight = new THREE.SpotLight(0xFFFFFF)
scene.add(spotlight)
spotlight.position.set(-100,100,0)
spotlight.castShadow = true
spotlight.angle = .2

const mousePosition = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
let intersects

window.addEventListener('mousemove', function(e){
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mousePosition, camera)
  intersects = raycaster.intersectObjects(scene.children)
  intersects.forEach(function(intersect){
    if(intersect.object.name === 'ground'){
      const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(.5)
      highlight.position.set(highlightPos.x, 0, highlightPos.z)

      const elementsExist = elements.find(function(elem){
        return (elem.position.x === highlight.position.x) && (elem.position.z === highlight.position.z)
      })

      if(!elementsExist)
        highlight.material.color.setHex(0xFFFFFF)
      else
        highlight.material.color.setHex(0xFF0000)
    }
  })
})

const sphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(.4,10,10),
  new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0xFFEA00,
  })
)

const elements = []

window.addEventListener('click', function(){

  const elementsExist = elements.find(function(elem){
    return (elem.position.x === highlight.position.x) && (elem.position.z === highlight.position.z)
  })

  if(!elementsExist){
    intersects.forEach(function(intersect){
      if(intersect.object.name === 'ground'){
        const sphereClone = sphereMesh.clone()
        sphereClone.position.copy(new THREE.Vector3(highlight.position.x, 1, highlight.position.z))
        scene.add(sphereClone)
        elements.push(sphereClone)
        highlight.material.color.setHex(0xFF0000)
      }
    }) 
  }

  console.log(scene.children.length, " <<<")
})

function animate(time){
  highlight.material.opacity = 1 + Math.sin(time/120)
  elements.forEach(function(elem){
    elem.rotation.x = time / 1000
    elem.rotation.z = time / 1000
    elem.position.y = .5 + .5 * Math.abs(Math.sin(time / 1000))
  })
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})