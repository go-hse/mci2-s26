import * as THREE from '../../99_Lib/three.module.js';

export function createRay(objects) {
    const rayCaster = new THREE.Raycaster();

    // anon. Funktion, wird wiederholt aufgeruft
    return (position, direction) => {
        rayCaster.set(position, direction);
        const intersects = rayCaster.intersectObjects(objects);
        if (intersects.length) {
            return intersects[0];
        }
    }

} 