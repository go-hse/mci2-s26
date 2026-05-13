import * as THREE from 'three';
import { add, NO_OF_GEOS } from './js/geometry.mjs';
import { createPointerControls } from './js/pointerControls.mjs';


console.log("ThreeJs " + THREE.REVISION);

const width = window.innerWidth, height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10);
camera.position.z = 1;

const scene = new THREE.Scene();

// Lichter
scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff));
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 2, 0);
scene.add(light);
// Geometry
// 
const geometry = new THREE.TorusKnotGeometry(.05, .01, 50, 16);
const material = new THREE.MeshNormalMaterial();
const defaultMesh = new THREE.Mesh(geometry, material);

scene.add(defaultMesh);

const pointer = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.15, 24),
    new THREE.MeshStandardMaterial({
        color: 0xffcc66,
        roughness: 0.45,
        metalness: 0.1
    })
);
pointer.position.set(0, 0, 0.25);
scene.add(pointer);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const pointerControls = createPointerControls({
    object: pointer,
    domElement: document
});

let qstart = new THREE.Quaternion();
let qend = new THREE.Quaternion();
qstart.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
qend.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);

let speed = 0.01, t = 0;
function animate(time) {
    t += speed;
    if (t < 0 || t > 1) speed *= -1;
    defaultMesh.quaternion.copy(qstart);
    defaultMesh.quaternion.slerp(qend, t);
    renderer.render(scene, camera);
}