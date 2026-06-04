import * as THREE from '../99_Lib/three.module.js';
import { AmmoPhysics } from '../99_Lib/jsm/physics/AmmoPhysicsSingle.js';

import { VRButton } from '../99_Lib/jsm/webxr/VRButton.js';
import { createVRcontrollers } from './js/vr.mjs';

import { keyboard, mouse } from './js/interaction2D.mjs';
import { createRay } from './js/ray.mjs';
import { add, createLine, Billboard } from './js/geometry.mjs';

console.log("ThreeJs " + THREE.REVISION);

window.onload = async function () {

    const physics = await AmmoPhysics();

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.3, 2);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x666666);

    const hemiLight = new THREE.HemisphereLight();
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.zoom = 2;
    scene.add(dirLight);

    //////////////////////////////////////////////////////////////////////////////
    // FLOORS
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    // const floorShadowMaterial = new THREE.ShadowMaterial({ color: 0x554444 });
    const width = 0.1;

    {
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(10, width, 10),
            floorMaterial
        );
        floor.position.y = -width / 2;
        floor.receiveShadow = true;
        floor.userData.physics = { mass: 0 };
        floor.name = "floor";
        scene.add(floor);
    }

    {
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(10, width, 10),
            floorMaterial
        );
        floor.rotation.z = -0.1;
        floor.position.x = -1;
        floor.position.y = -width / 2;
        floor.receiveShadow = true;
        floor.userData.physics = { mass: 0 };
        floor.name = "floor_left";
        scene.add(floor);
    }

    {
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(10, width, 10),
            floorMaterial
        );
        floor.rotation.z = 0.1;
        floor.position.x = 1;
        floor.position.y = -width / 2;
        floor.receiveShadow = true;
        floor.userData.physics = { mass: 0 };
        floor.name = "floor_right";
        scene.add(floor);
    }

    {
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(10, width, 10),
            floorMaterial
        );
        floor.rotation.x = 0.3;
        floor.position.z = -3;
        floor.position.y = -width / 2;
        floor.receiveShadow = true;
        floor.userData.physics = { mass: 0 };
        floor.name = "floor_back";
        scene.add(floor);
    }


    //////////////////////////////////////////////////////////////////////////////
    // Box
    const boxWidth = 0.2;

    for (let i = 0; i < 10; ++i) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth), new THREE.MeshStandardMaterial({
            color: 0xff3333,
            roughness: 0.7,
            metalness: 0.0,
        }));
        box.name = `box_${i}`;
        box.position.x = 2 * Math.random() - 1;
        box.position.z = -1 * Math.random();
        box.position.y = boxWidth / 2;

        box.castShadow = true;
        box.receiveShadow = true;
        box.userData.physics = { mass: 1 };
        scene.add(box);
    }

    //////////////////////////////////////////////////////////////////////////////
    // Spheres
    const physicalSpheres = [];
    const MAX_SPHERES = 10;
    for (let i = 0; i < MAX_SPHERES; ++i) {
        const sphere = add(3, scene, 0, 1, 0);
        sphere.castShadow = true;
        // sphere.receiveShadow = true;
        sphere.userData.physics = { mass: 0.9 };
        sphere.name = `sphere_${i}`;
        // sphere.matrixAutoUpdate = false;
        physicalSpheres.push(sphere);
    }
    const physicalBoxes = [];
    for (let i = 0; i < MAX_SPHERES; ++i) {
        const obj = add(0, scene, 0, -1, 0);
        obj.castShadow = true;
        // obj.receiveShadow = true;
        obj.userData.physics = { mass: 1.5 };
        obj.name = `obj_${i}`;
        physicalBoxes.push(obj);
    }

    const target = Billboard(scene, "./img/background.png", physics);

    const rayFunc = createRay(physicalSpheres);
    const lineFunc = createLine(scene);

    const cursor = add(1, scene);
    cursor.castShadow = true;
    mouse(cursor);


    const addKey = keyboard();
    let triggered = false, triggeredBox = false, grabbed;
    addKey(" ", active => {
        triggered = active;
    });
    addKey("a", active => {
        triggeredBox = active;
    });

    addKey("g", active => {
        grabbed = active;
    });


    const object_position = new THREE.Vector3();
    const object_rotation = new THREE.Quaternion();
    const object_scale = new THREE.Vector3();

    const cursor_position = new THREE.Vector3();
    const cursor_rotation = new THREE.Quaternion();
    const cursor_scale = new THREE.Vector3();
    const laser_direction = new THREE.Vector3();
    const shoot_direction = new THREE.Vector3();
    const velocity = new THREE.Vector3();
    const MOVESPEED = 10;

    let ballIdx = 0, boxIdx = 0;
    function shootBall(box = false) {
        triggered = false;
        triggeredBox = false;

        cursor.matrix.decompose(cursor_position, cursor_rotation, cursor_scale);
        shoot_direction.applyQuaternion(cursor_rotation);

        console.log("shootball");
        velocity.set(shoot_direction.x * MOVESPEED, shoot_direction.y * MOVESPEED, shoot_direction.z * MOVESPEED);
        if (box) {
            if (++boxIdx >= MAX_SPHERES) boxIdx = 0;
            physics.setMeshPositionVelocity(physicalBoxes[boxIdx], cursor_position, velocity);
        } else {
            if (++ballIdx >= MAX_SPHERES) ballIdx = 0;
            physicalSpheres[ballIdx].visible = true;
            physics.setMeshPositionVelocity(physicalSpheres[ballIdx], cursor_position, velocity);
        }
    }

    physics.addScene(scene);
    //

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    //
    let last_active_controller;
    createVRcontrollers(scene, renderer, (controller, data, id) => {
        cursor.matrixAutoUpdate = false;
        cursor.visible = false;
        last_active_controller = controller;
        renderer.xr.enabled = true;
        console.log("verbinde", id, data.handedness)
    });


    // Renderer-Loop starten

    let squeeze = false;
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const endRay = new THREE.Vector3();
    let grabbedObject, initialGrabbed, distance, selected, lastName = "";
    const maxDistance = 3;
    const diff = new THREE.Vector3();

    const grabbedArray = [], MAXGRABBEDIDX = 10;
    let grabbedArrayIdx = 0, grabbedCount = 0;
    for (grabbedArrayIdx = 0; grabbedArrayIdx < MAXGRABBEDIDX; ++grabbedArrayIdx) {
        grabbedArray.push({ id: -1, pos: new THREE.Vector3() });
    }
    grabbedArrayIdx = 0;


    let frameCounter = 0;
    function render() {
        ++frameCounter;

        if (last_active_controller) {
            cursor.matrix.copy(last_active_controller.matrix);
            const nsqueeze = last_active_controller.userData.isSqueezeing;
            if (nsqueeze !== squeeze) {
                squeeze = nsqueeze;
                if (squeeze) triggered = true;
            }
            laser_direction.set(0, 0, -1);
            shoot_direction.set(0, 0, -1);
            grabbed = last_active_controller.userData.isSelecting
        } else {
            laser_direction.set(0, 1, 0);
            shoot_direction.set(0, 1, 0);
        }

        cursor.matrix.decompose(position, rotation, scale);
        laser_direction.applyQuaternion(rotation);

        // Selektion der Kugeln mittels Kreuzprodukt
        const distances = physicalSpheres.map(item => diff.subVectors(item.position, position).cross(laser_direction).length());
        const minSelect = distances.indexOf(Math.min(...distances));
        if (minSelect !== selected) {
            selected = minSelect;
            console.log("Select", distances, minSelect);
            for (let i = 0; i < physicalSpheres.length; ++i) {
                physicalSpheres[i].material.color.set(0x888888);
            }
            physicalSpheres[selected].material.color.set(0xffaaaa);
        }


        lineFunc(1, position);

        const intersectObject = rayFunc(position, laser_direction);
        if (intersectObject) {
            if (intersectObject.object.name !== lastName) {
                lastName = intersectObject.object.name;
                console.log(lastName);
            }
            endRay.addVectors(position, laser_direction.multiplyScalar(intersectObject.distance));
            distance = intersectObject.distance;
        } else {
            endRay.addVectors(position, laser_direction.multiplyScalar(maxDistance));
            distance = maxDistance;
        }

        lineFunc(0, endRay);

        if (grabbed) {
            if (grabbedObject) {
                grabbedObject.matrix.copy(cursor.matrix.clone().multiply(initialGrabbed));
                grabbedObject.matrix.decompose(grabbedArray[grabbedArrayIdx].pos, rotation, scale);
                console.log("filled", grabbedCount, "idx", grabbedArrayIdx);
                grabbedArray[grabbedArrayIdx].id = grabbedCount;
                ++grabbedArrayIdx;
                ++grabbedCount;
                if (grabbedArrayIdx >= MAXGRABBEDIDX) {
                    grabbedArrayIdx = 0;
                }
            } else {
                grabbedArrayIdx = 0;
                grabbedCount = 0;
                grabbedObject = physicalSpheres[selected];
                initialGrabbed = cursor.matrix.clone().invert().multiply(grabbedObject.matrix);
                grabbedObject.matrixAutoUpdate = false;
            }
        } else {
            if (grabbedObject) {
                let oldIdx = -1, count = grabbedCount;
                for (let i = 0; i < MAXGRABBEDIDX; ++i) {
                    const o = grabbedArray[i];
                    if (o.id !== -1 && o.id < count) {
                        count = o.id;
                        oldIdx = i;
                    }
                }
                console.log("used", grabbedCount, "idx", oldIdx);

                if (oldIdx !== -1) {
                    grabbedObject.matrix.decompose(position, rotation, scale);
                    grabbedObject.matrixAutoUpdate = true;
                    velocity.subVectors(grabbedArray[oldIdx].pos, position);
                    velocity.multiplyScalar(-10);
                    console.log("used v", velocity);
                    physics.setMeshPositionVelocity(grabbedObject, position, velocity);
                } else {
                    console.log("used v", grabbedArray);
                }
                grabbedObject = undefined;
            }
        }




        if (triggered) {
            shootBall();
        }
        if (triggeredBox) {
            shootBall(true);
        }
        target.draw();
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(render);


}
