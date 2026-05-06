import * as THREE from 'three';
console.log("ThreeJs " + THREE.REVISION);

const width = window.innerWidth, height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 10);
camera.position.z = 1;

const scene = new THREE.Scene();

// Lichter
scene.add(new THREE.HemisphereLight(0x808080, 0x606060));
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 2, 0);
scene.add(light);


// Geometry
const geometry = new THREE.BoxGeometry(0.1, 0.2, 0.2);
const material = new THREE.MeshNormalMaterial();
const defaultCube = new THREE.Mesh(geometry, material);

scene.add(defaultCube);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

function animate(time) {

    defaultCube.rotation.x = time / 2000;
    // defaultCube.rotation.y = time / 1000;
    renderer.render(scene, camera);
}