import * as THREE from 'three';
import { add } from './js/geometry.mjs';

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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const objects = [], start = -1.2, stop = start * -1, step = 0.3;
for (let x = start; x < stop; x += step) {
    for (let y = start; y < stop; y += step) {
        const o = (objects.length % 2 == 0) ? add(4, scene) : add(6, scene);
        o.position.x = x;
        o.position.y = y;
        o.position.z = -2;
        objects.push(o);
    }
}


function animate(time) {

    defaultMesh.rotation.x = time / 2000;
    defaultMesh.rotation.y = time / 1000;

    for (const o of objects) {
        o.rotation.x = time / 2000;
        o.rotation.y = time / 1000;

    }

    renderer.render(scene, camera);
}