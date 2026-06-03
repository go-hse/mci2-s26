import * as THREE from '../../99_Lib/three.module.min.js';

import { GLTFLoader } from '../../99_Lib/jsm/loaders/GLTFLoader.js';
import { STLLoader } from '../../99_Lib/jsm/loaders//STLLoader.js';
import { mergeVertices } from '../../99_Lib/jsm/utils/BufferGeometryUtils.js';

// import vertexShader from '../shaders/vertexShader.glsl'
// import fragmentShader from '../shaders/fragmentShader.glsl'
// import test from '../shaders/test'


let wireframeFlag = false;
export function ToWireframe(scene, active) {
    if (wireframeFlag !== active) {
        wireframeFlag = active;
        scene.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    // Wenn das Mesh mehrere Materialien verwendet
                    object.material.forEach((mat) => {
                        mat.wireframe = active;
                    });
                } else {
                    // Einzelnes Material
                    object.material.wireframe = active;
                }
            }
        });
    }
}



function httpGetAsync(theUrl) {
    return new Promise((resolve, reject) => {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4)
                if (xmlHttp.status === 200)
                    resolve(xmlHttp.responseText);
                else
                    reject(`Error: ${xmlHttp.status}`);
        }
        xmlHttp.open("GET", theUrl, true);
        xmlHttp.send(null);
    });

}

export async function shaderMaterial(vertexShaderFile, fragmentShaderFile) {
    const vertexShader = await httpGetAsync(vertexShaderFile);
    const fragmentShader = await httpGetAsync(fragmentShaderFile);
    // console.log(vertexShader, fragmentShader);

    const material = new THREE.ShaderMaterial({
        uniforms: { 'thickness': { value: 1 } },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        alphaToCoverage: true, // only works when WebGLRenderer's "antialias" is set to "true"
        vertexShader,
        fragmentShader
    });

    return material;
}

console.log("ThreeJs ", THREE.REVISION, new Date().toLocaleTimeString());


const loader = new GLTFLoader();

export function loadGLTF(filename, parent, childScale, cb) {
    loader.load(filename, function (gltf) {
        const meshes = [];

        gltf.scene.traverse(child => {
            if (child.isMesh) {
                meshes.push(child);
            }
        });

        for (const child of meshes) {
            child.scale.set(child.scale.x * childScale, child.scale.y * childScale, child.scale.z * childScale);
            child.position.set(child.position.x * childScale, child.position.y * childScale, child.position.z * childScale);
            child.updateMatrix();
            parent.add(child);
        }
        cb(meshes);
    }, undefined, function (error) {
        console.error(error);
    });
}

export function loadSTL(filename, parent) {
    const loader = new STLLoader();

    return (filename, cb) => {
        loader.load(filename, (geometry) => {
            const unifiedGeometry = mergeVertices(geometry);
            unifiedGeometry.computeVertexNormals();
            cb(unifiedGeometry);
        }, undefined, function (error) {
            console.error(error);
        });
    }
}





const geometries = [
    new THREE.BoxGeometry(0.25, 0.25, 0.25), // 0
    new THREE.ConeGeometry(0.1, 0.4, 64),
    new THREE.CylinderGeometry(0.2, 0.2, 0.2, 64), // 2
    new THREE.IcosahedronGeometry(0.2, 3),
    new THREE.TorusKnotGeometry(.2, .03, 50, 16), // 4
    new THREE.TorusGeometry(0.2, 0.04, 64, 32),
    new THREE.RingGeometry(0.05, 0.06, 32).rotateX(-Math.PI / 2) // 6
];

export function randomMaterial() {
    return new THREE.MeshStandardMaterial({
        color: Math.random() * 0xff3333,
        roughness: 0.2,
        metalness: 0.4
    });
}

export function add(i, parent, x = 0, y = 0, z = 0, au = false) {
    let object = new THREE.Mesh(geometries[i], randomMaterial());
    object.position.set(x, y, z);
    object.updateMatrix();
    object.castShadow = true;
    object.name = `o_${i}`;
    object.matrixAutoUpdate = au;
    parent.add(object);
    return object;
}


export function createLine(scene) {
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 1, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const position = line.geometry.attributes.position.array;

    return (idx, pos) => {
        idx *= 3;
        position[idx++] = pos.x;
        position[idx++] = pos.y;
        position[idx++] = pos.z;
        line.geometry.attributes.position.needsUpdate = true;
    }
}
