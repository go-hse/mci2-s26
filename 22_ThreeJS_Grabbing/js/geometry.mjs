import * as THREE from '../../99_Lib/three.module.js';

const geometries = [
    new THREE.BoxGeometry(0.25, 0.25, 0.25),
    new THREE.ConeGeometry(0.1, 0.4, 64),
    new THREE.CylinderGeometry(0.2, 0.2, 0.2, 64),
    new THREE.IcosahedronGeometry(0.2, 3),
    new THREE.TorusKnotGeometry(.2, .03, 50, 16),
    new THREE.TorusGeometry(0.2, 0.04, 64, 32),
    new THREE.CapsuleGeometry(0.1, 0.3, 8, 16)
];

export const NO_OF_GEOS = geometries.length;

export function randomMaterial() {
    return new THREE.MeshStandardMaterial({
        color: Math.random() * 0xff3333,
        roughness: 0.2,
        metalness: 0.4
    });
}

export function add(i, parent, x = 0, y = 0, z = 0, update = true) {
    let object = new THREE.Mesh(geometries[i], randomMaterial());
    object.position.set(x, y, z);
    object.updateMatrix();
    object.castShadow = true;
    object.receiveShadow = true;
    object.matrixAutoUpdate = update;
    parent.add(object);
    return object;
}


export function createLine(scene) {
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff
    });

    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 1, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const positions = line.geometry.attributes.position.array;

    function setPos(idx, positionIn) {
        idx *= 3;
        positions[idx++] = positionIn.x;
        positions[idx++] = positionIn.y;
        positions[idx++] = positionIn.z;
        line.geometry.attributes.position.needsUpdate = true;
    }

    return setPos;
}