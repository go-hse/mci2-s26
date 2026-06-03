import * as THREE from '../../99_Lib/three.module.min.js';
import { loadGLTF } from './geometry.mjs';


const touchColor = 0xaaaaff;
const defaultColor = 0xaaaaaa;

export function Touchables() {

    const objects = [];

    const cursorPosition = new THREE.Vector3(),
        cursorRotation = new THREE.Quaternion(),
        cursorScale = new THREE.Vector3(),
        diff = new THREE.Vector3();

    let touchObject, grabbedObject;


    function add(meshes) {
        for (const child of meshes) {
            console.log("Touchables:Add", child.name, child.worldPos);
            child.matrixAutoUpdate = false;
            child.worldPos = new THREE.Vector3();
            child.getWorldPosition(child.worldPos);
            objects.push(child);
        }
    }

    let oldIdx;
    function move(grabbed, cursor) {
        // wenn noch nichts gegriffen ist, suche nächstes Mesh
        if (!grabbedObject) {
            cursor.matrix.decompose(cursorPosition, cursorRotation, cursorScale);
            const positions = objects.map(item => {
                item.getWorldPosition(item.worldPos);
                return { name: item.name, pos: item.worldPos };
            });
            // console.log(positions);
            const distances = positions.map(item => diff.subVectors(cursorPosition, item.pos).length());
            const filtered = distances.filter(item => item < 0.2);

            if (filtered.length) {
                const newSelectIdx = distances.indexOf(Math.min(...distances));
                if (newSelectIdx !== oldIdx) {
                    console.log("positions", positions, "distances", distances, filtered, newSelectIdx);
                    oldIdx = newSelectIdx;
                }

                const nextObj = objects[newSelectIdx];

                // anderes Objekt wird berührt: altes Objekt zurücksetzen
                if (touchObject && nextObj !== touchObject) {
                    touchObject.material.copy(standardMaterial);
                }

                // neues Object setzen
                if (nextObj !== touchObject) {
                    console.log("Touching", nextObj.name);
                    touchObject = nextObj;
                    nextObj.material.copy(selectMaterial);
                }
            } else {
                if (touchObject) {
                    console.log("Stop Touching", touchObject.name);
                    touchObject.material.copy(standardMaterial);
                    touchObject = undefined;
                }
            }
        }
        if (grabbed) {
            // im Greifmodus
            if (grabbedObject) {
                // bereits initialisiert/zugegriffen
                grabbedObject.touchable.grab(cursor, grabbedObject);
            } else {
                // noch nicht initialisiert, ist ein Objekt in Greifnähe?
                if (touchObject) {
                    grabbedObject = touchObject;
                    grabbedObject.touchable.initGrab(cursor, grabbedObject);
                }
            }
        } else {
            // kein Greifen, wenn Objekt vorhanden, dann loslassen
            if (grabbedObject) {
                grabbedObject.touchable.exitGrab();
                grabbedObject = undefined;
            }
        }

        return grabbedObject;
    }

    return { add, move };
}


const standardMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f7b9d,
    roughness: 0.2,
    metalness: 0.4
});


const selectMaterial = new THREE.MeshStandardMaterial({
    color: 0xee7c0b,
    roughness: 0.2,
    metalness: 0.4
});



export function Slider(parent, cb) {
    let initialGrabbed, inverseWorld, inverseMesh, initialMatrix;

    const inWorld = false;
    const sliderGroup = new THREE.Group();
    sliderGroup.matrixAutoUpdate = false;

    parent.add(sliderGroup);

    let handleMesh, knobMesh;

    loadGLTF('./models/slider.glb', sliderGroup, 0.1, meshes => {
        for (const child of meshes) {
            child.matrixAutoUpdate = false;
            child.material = standardMaterial.clone();
            child.touchable = { initGrab, exitGrab, grab };
            if (child.name === "Handle") handleMesh = child;
            if (child.name === "Knob") knobMesh = child;
        }
        cb([handleMesh, knobMesh]);
    });

    function clamp(v, min, max) {
        v = v < min ? min : v;
        v = v > max ? max : v;
        return v;
    }

    function toggleVisibility() {
        sliderGroup.visible = !sliderGroup.visible;
        console.log("L: toggle sLider", sliderGroup.visible);
    }

    function initGrab(cursor, item) {
        if (item === handleMesh) {
            initialGrabbed = inWorld ? cursor.matrix.clone().invert().multiply(parent.matrix).multiply(sliderGroup.matrix) : cursor.matrix.clone().invert().multiply(sliderGroup.matrix);
            if (inWorld) inverseWorld = parent.matrix.clone().invert();
        }

        else if (item === knobMesh) {
            initialMatrix = knobMesh.matrix.clone();
            initialGrabbed = inWorld ? cursor.matrix.clone().invert().multiply(sliderGroup.matrix) : cursor.matrix.clone().invert().multiply(sliderGroup.matrix);
            if (inWorld) inverseWorld = parent.matrix.clone().invert();
            inverseMesh = sliderGroup.matrix.clone().invert();
        }
    }

    function exitGrab(cursor) {
    }

    function grab(cursor, item) {
        if (item === handleMesh) {
            sliderGroup.matrix.copy(inWorld ? inverseWorld.clone().multiply(cursor.matrix).multiply(initialGrabbed) : cursor.matrix.clone().multiply(initialGrabbed))
        }
        else if (item === knobMesh) {
            const delta = inWorld ? inverseMesh.clone().multiply(inverseWorld).multiply(cursor.matrix).multiply(initialGrabbed) : inverseMesh.clone().multiply(cursor.matrix).multiply(initialGrabbed);
            const dx = delta.elements[12];
            const restricted = new THREE.Matrix4().makeTranslation(dx, 0, 0);
            knobMesh.matrix.copy(restricted.multiply(initialMatrix));
            knobMesh.matrix.elements[12] = clamp(knobMesh.matrix.elements[12], -0.4, 0.4);
        }
    }

    return { grab, initGrab, exitGrab, toggleVisibility };
}

export function RotaryKnobs(parent, onLoadCB, onChangeCB) {
    let initialGrabbed, inverseWorld, inverseMesh, initialMatrix;

    const inWorld = false;
    const widgetGroup = new THREE.Group();
    widgetGroup.position.set(0, 0.5, 0);
    widgetGroup.updateMatrix();
    widgetGroup.matrixAutoUpdate = false;

    parent.add(widgetGroup);

    let handleMesh, knobMesh;

    loadGLTF('./models/knob.glb', widgetGroup, 0.1, meshes => {
        for (const child of meshes) {
            console.log("Slider adds", child.name);
            try {
                child.matrixAutoUpdate = false;
                child.touchable = { initGrab, exitGrab, grab };
                child.material = standardMaterial.clone();
                if (child.name === "Handle") handleMesh = child;
                if (child.name === "Knob") knobMesh = child;
            } catch (ex) {
                console.log(ex.message);
            }
        }
        onLoadCB([handleMesh, knobMesh]);
    });

    function initGrab(cursor, item) {
        if (item === handleMesh) {
            initialGrabbed = inWorld ?
                cursor.matrix.clone().invert().multiply(parent.matrix).multiply(widgetGroup.matrix) :
                cursor.matrix.clone().invert().multiply(widgetGroup.matrix);
            if (inWorld) inverseWorld = parent.matrix.clone().invert();
        }

        else if (item === knobMesh) {
            initialMatrix = knobMesh.matrix.clone();
            initialGrabbed = inWorld ? cursor.matrix.clone().invert().multiply(widgetGroup.matrix) : cursor.matrix.clone().invert().multiply(widgetGroup.matrix);
            if (inWorld) inverseWorld = parent.matrix.clone().invert();
            inverseMesh = widgetGroup.matrix.clone().invert();
        }
    }

    function exitGrab(cursor) {
    }

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const yAxix = new THREE.Vector3(0, 1, 0);
    let lastYaw = 0;

    function limitToYRotation(D) {
        D.decompose(position, quaternion, scale);
        const yaw = Math.atan2(2 * (quaternion.y * quaternion.w + quaternion.x * quaternion.z), 1 - 2 * (quaternion.y * quaternion.y + quaternion.x * quaternion.x));
        onChangeCB(lastYaw - yaw);
        lastYaw = yaw;
        quaternion.setFromAxisAngle(yAxix, yaw);
        D.identity();
        D.makeRotationFromQuaternion(quaternion);
    }


    function grab(cursor, item) {
        if (item === handleMesh) {
            widgetGroup.matrix.copy(inWorld ? inverseWorld.clone().multiply(cursor.matrix).multiply(initialGrabbed) : cursor.matrix.clone().multiply(initialGrabbed))
        }
        else if (item === knobMesh) {
            const delta = inWorld ? inverseMesh.clone().multiply(inverseWorld).multiply(cursor.matrix).multiply(initialGrabbed) : inverseMesh.clone().multiply(cursor.matrix).multiply(initialGrabbed);
            limitToYRotation(delta);
            knobMesh.matrix.copy(delta.multiply(initialMatrix));
        }
    }

    return { grab, initGrab, exitGrab };
}


