import * as THREE from '../../99_Lib/three.module.min.js';


export function createRay(objects) {
    const rayCaster = new THREE.Raycaster();
    let lastLen = 0;
    console.log("intersects with", objects.length);

    // anon. Funktion, wird wiederholt aufgeruft
    return (position, direction) => {
        rayCaster.set(position, direction);
        const intersects = rayCaster.intersectObjects(objects);
        if (intersects.length !== lastLen) {
            lastLen = intersects.length;
            console.log("intersects", objects.length, lastLen);
            if (intersects.length) {
                console.log("intersects", objects.length, lastLen, intersects[0].object.name);
            } else {
                console.log("no intersects");
            }
        }
        if (intersects.length) {
            return intersects[0];
        }
    }
} 