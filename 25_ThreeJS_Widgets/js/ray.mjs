import * as THREE from 'three';

export function createRay(objects) {
    const raycaster = new THREE.Raycaster();

    return function (position, direction) {
        raycaster.set(position, direction);
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length) {
            return intersects[0];
        }
    }
}