import * as THREE from '../../99_Lib/three.module.min.js';



export function arPlanes(scene, xr) {

    const currentPlanes = new Map();
    const matrix = new THREE.Matrix4();

    const planeGroup = new THREE.Group();
    scene.add(planeGroup);

    let infoString;

    function setOpacity(value) {
        planeGroup.traverse(child => {
            if (child.isMesh) {
                child.material.opacity = value;
            }
        });
    }

    function onPlaneEvent(event) {
        const frame = event.data;
        const detectedPlanes = frame.detectedPlanes;
        const referenceSpace = xr.getReferenceSpace();

        let planeCounter = 0;

        // https://immersive-web.github.io/real-world-geometry/plane-detection.html
        for (const [plane, timestamp] of currentPlanes) {
            if (!detectedPlanes.has(plane)) {
                currentPlanes.delete(plane);
            }
        }

        detectedPlanes.forEach(plane => {
            ++planeCounter;
            if (currentPlanes.has(plane)) {
                // Handle previously-seen plane:

                if (plane.lastChangedTime > currentPlanes.get(plane)) {
                    currentPlanes.set(plane, plane.lastChangedTime);
                } else {

                }
            } else {
                currentPlanes.set(plane, plane.lastChangedTime);
                const pose = frame.getPose(plane.planeSpace, referenceSpace);
                matrix.fromArray(pose.transform.matrix);

                const polygon = plane.polygon;

                let minX = Number.MAX_SAFE_INTEGER;
                let maxX = Number.MIN_SAFE_INTEGER;
                let minZ = Number.MAX_SAFE_INTEGER;
                let maxZ = Number.MIN_SAFE_INTEGER;

                for (const point of polygon) {
                    minX = Math.min(minX, point.x);
                    maxX = Math.max(maxX, point.x);
                    minZ = Math.min(minZ, point.z);
                    maxZ = Math.max(maxZ, point.z);
                }

                const width = maxX - minX;
                const height = maxZ - minZ;

                const geometry = new THREE.BoxGeometry(width, 0.0001, height);
                const material = new THREE.MeshStandardMaterial({
                    color: Math.random() * 0xff3333,
                    roughness: 0.2,
                    metalness: 0.4,
                    transparent: true,
                    opacity: 0.3
                })

                // const material = new THREE.ShadowMaterial({
                //     color: 0x444444,
                //     transparent: true,
                //     wireframe: true,
                //     opacity: 0.3,
                // });

                const mesh = new THREE.Mesh(geometry, material);
                mesh.matrixAutoUpdate = false;
                mesh.matrix.fromArray(pose.transform.matrix);
                mesh.receiveShadow = true;
                planeGroup.add(mesh);
            }
        });
    };

    return { onPlaneEvent, setOpacity };
}