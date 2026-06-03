import * as THREE from '../99_Lib/three.module.min.js';
import { keyboard, mouse } from './js/interaction2D.mjs';
import { add, createLine, loadGLTFcb, randomMaterial, ToWireframe } from './js/geometry.mjs';
import { createRay } from './js/ray.mjs';
import { arPlanes } from './js/ar.mjs';

// VR- Buttons zum Starten des immersiven Modus  
import { VRButton } from '../99_Lib/jsm/webxr/VRButton.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { XRControllerModelFactory } from '../99_Lib/jsm/webxr/XRControllerModelFactory.js';

import { createVRcontrollers, showGamepad } from './js/vr.mjs';

window.onload = async function () {
    const controllerModelFactory = new XRControllerModelFactory();

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.3, 2);

    const scene = new THREE.Scene();
    const world = new THREE.Group();
    world.matrixAutoUpdate = false;
    scene.add(world);

    scene.background = new THREE.Color(0x666666);

    const hemiLight = new THREE.HemisphereLight();
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.zoom = 2;
    scene.add(dirLight);

    //////////////////////////////////////////////////////////////////////////////
    // FLOOR

    const width = 0.1;
    const box = new THREE.BoxGeometry(10, width, 10, 10, 1, 10);
    const floor = new THREE.Mesh(box, randomMaterial());
    floor.position.y = -1;
    floor.receiveShadow = true;
    floor.userData.physics = { mass: 0 };
    floor.name = "floor";

    const wireframe = new THREE.WireframeGeometry(box);
    const wireframeFloor = new THREE.LineSegments(wireframe);
    wireframeFloor.material.opacity = 0.25;
    wireframeFloor.material.transparent = true;
    wireframeFloor.position.y = floor.position.y;
    scene.add(wireframeFloor);
    scene.add(floor);

    function FloorVisible(active) {
        floor.visible = active;
        wireframeFloor.visible = active;
    }


    const cursor = add(1, scene);
    const isMouseButton = mouse(cursor);

    let objects = [];
    let x = -0.8, y = 0.3, z = -0.5, delta = 0.4;
    for (let i = 0; i < 5; ++i) {
        objects.push(add(i, world, x, y, z)); x += delta;
    }

    loadGLTFcb('./models/cube_with_inner_sphere.glb', (gltf) => {
        gltf.scene.traverse(child => {
            if (child.name.includes("geo")) {
                objects.push(child);
                child.scale.set(0.2, 0.2, 0.2) // scale here
                child.position.set(1, 0.5, 0);
                child.updateMatrix();
                child.matrixAutoUpdate = false;
            }
        });
        world.add(gltf.scene);
    });


    const planeGroup = new THREE.Group();
    planeGroup.matrixAutoUpdate = false;
    planeGroup.visible = false;
    scene.add(planeGroup);

    const planeOffset = new THREE.Group();
    planeGroup.add(planeOffset);

    loadGLTFcb('./models/plane.gltf', (gltf) => {
        gltf.scene.traverse(child => {
            if (child.name === "Plane") {
                console.log("plane:", child.name);
                child.scale.set(0.1, 0.1, 0.1) // scale here
                child.position.set(0, 0, 0);
                child.rotation.set(0, 0, 0);
                child.updateMatrix();
                child.rotation.z = Math.PI / 2;
                child.updateMatrix();
                planeOffset.add(child);
            }
        });
    });


    const lineFunc = createLine(scene);
    const rayFunc = createRay(objects);

    let position = new THREE.Vector3();
    let rotation = new THREE.Quaternion();
    let scale = new THREE.Vector3();
    let endRay = new THREE.Vector3();
    let direction = new THREE.Vector3();

    // Renderer erstellen
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
    });

    // Renderer-Parameter setzen
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    renderer.xr.enabled = true;

    const planeHandler = arPlanes(scene, renderer.xr);
    renderer.xr.addEventListener("planesdetected", planeHandler.onPlaneEvent);

    let hitTestSource = null;
    let localSpace = null;

    // VR: Callback, wenn Benutzer in VR/AR-Modus wechselt 
    const controllers = {}, mainhand = "left", scndhand = mainhand === "left" ? "right" : "left";

    renderer.xr.addEventListener('sessionstart', () => {
        const session = renderer.xr.getSession();

        for (const id of [0, 1]) {
            const controllerGrip = renderer.xr.getControllerGrip(id);
            controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
            scene.add(controllerGrip);
        }

        session.addEventListener("inputsourceschange", (event) => {
            console.log('inputsourceschange:', session, session.inputSources, Object.keys(session.inputSources));
            for (let id = 0; id < session.inputSources.length; ++id) {
                const inputSource = session.inputSources[id];
                const controller = renderer.xr.getController(id);
                console.log("adding controller", inputSource.handedness);
                controllers[inputSource.handedness] = {
                    controller, data: inputSource
                };
            }
        });
        // Flug-Modus-Anzeige: andere Drehung
        planeOffset.rotation.x = -Math.PI / 2;
        planeOffset.scale.set(0.5, 0.5, 0.5) // scale here
        cursor.matrixAutoUpdate = false;
        cursor.visible = false;

        if (session && session.enabledFeatures && session.enabledFeatures.includes("hit-test")) {
            console.log('AR-Session gestartet:', session);
            FloorVisible(false);
            console.log("Features", session.enabledFeatures);
            session.requestReferenceSpace('viewer').then((space) => {
                localSpace = space;
                session.requestHitTestSource({ space: localSpace }).then((source) => {
                    hitTestSource = source;
                    console.log('hitTestSource:', hitTestSource);
                    console.log('localSpace:', localSpace);
                });
            });
        } else {
            console.log('VR-Session gestartet:', session, session.inputSources, Object.keys(session.inputSources));
            for (let i = 0; i < session.inputSources.length; ++i) {
                const src = session.inputSources[i];
                console.log(src.handedness);
            }
        }
    });

    const reticle = add(6, scene);
    reticle.visible = false;

    // VR 
    document.body.appendChild(VRButton.createButton(renderer));
    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test', 'plane-detection', "local-floor"] }));


    window.addEventListener('resize', onWindowResize);
    function onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }


    const addKey = keyboard();
    addKey("Escape", active => {
        console.log("Escape", active);
    });

    let grabbed = false, squeezed = false;
    addKey(" ", active => {
        console.log("Space: Grabbed", active);
        grabbed = active;
    });

    addKey("s", active => {
        console.log("S: Squeeze", active);
        squeezed = active;
    });

    addKey("f", active => {
        if (active) {
            console.log("F: toggle floor", active, floor.visible);
            floor.visible = !floor.visible;
        }
    });

    addKey("r", active => {
        console.log("R: reset world", active, floor.visible);
        world.matrix.identity();
    });

    addKey("w", active => {
        ToWireframe(scene, active);
    });


    const maxDistance = 10;
    direction.set(0, 1, 0);

    let grabbedObject, initialGrabbed, distance, inverseHand, inverseWorld;
    const deltaFlyRotation = new THREE.Quaternion();
    const differenceMatrix = new THREE.Matrix4();
    const flySpeedRotationFactor = 0.01;
    const flySpeedTranslationFactor = -0.02;
    const euler = new THREE.Euler();


    // Renderer-Loop starten
    let firstVR = false, infoString, captured = false, opacity = 0;

    function render(timestamp, frame) {

        if (frame && hitTestSource) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const hitTestResults = frame.getHitTestResults(hitTestSource);

            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(referenceSpace);

                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
            } else {
                reticle.visible = false;
            }
        }

        // VR 
        if (controllers[mainhand]) {
            if (firstVR === false) {
                firstVR = true;
                console.log("controllers in renderloop", controllers);
            }
            const controller = controllers[mainhand].controller;
            cursor.matrix.copy(controller.matrix);
            const mainGamepad = controllers[mainhand].data.gamepad;

            squeezed = mainGamepad.buttons[1].value > 0;
            grabbed = mainGamepad.buttons[0].value > 0;
            const scndGamepad = controllers[scndhand].data.gamepad;

            showGamepad(mainhand, mainGamepad);

            if (mainGamepad.buttons[4].value) {
                if (frame && frame.session && captured === false) {
                    frame.session.initiateRoomCapture();
                    captured = true;
                }
            }

            if (mainGamepad.buttons[5].value) {
                opacity += 0.1;
                if (opacity > 1) opacity = 0;
                planeHandler.setOpacity(opacity);
            }

            if (scndGamepad.buttons[4].value) FloorVisible(true);
            if (scndGamepad.buttons[5].value) FloorVisible(false);

            direction.set(0, 0, -1);
        } else {
            direction.set(0, 1, 0);
        }

        cursor.matrix.decompose(position, rotation, scale);
        lineFunc(0, position);

        direction.applyQuaternion(rotation);

        let firstObjectHitByRay;
        if (grabbedObject === undefined) {
            firstObjectHitByRay = rayFunc(position, direction);
            if (firstObjectHitByRay) {
                // console.log(firstObjectHitByRay.object.name, firstObjectHitByRay.distance);
                distance = firstObjectHitByRay.distance;
            } else {
                distance = maxDistance;
            }
            endRay.addVectors(position, direction.multiplyScalar(distance));
            lineFunc(1, endRay);
        }


        if (grabbed) {
            if (grabbedObject) {
                endRay.addVectors(position, direction.multiplyScalar(distance));
                lineFunc(1, endRay);
                if (grabbedObject === world) {
                    world.matrix.copy(cursor.matrix.clone().multiply(initialGrabbed));
                } else {
                    grabbedObject.matrix.copy(inverseWorld.clone().multiply(cursor.matrix).multiply(initialGrabbed));
                }
            } else if (firstObjectHitByRay) {
                grabbedObject = firstObjectHitByRay.object;
                inverseWorld = world.matrix.clone().invert();
                initialGrabbed = cursor.matrix.clone().invert().multiply(world.matrix).multiply(grabbedObject.matrix);
            } else {
                grabbedObject = world;
                initialGrabbed = cursor.matrix.clone().invert().multiply(world.matrix);
            }
        } else {
            grabbedObject = undefined;
        }

        // Navigation
        if (squeezed) {
            lineFunc(1, position);

            if (inverseHand !== undefined) {
                lineFunc(0, position);
                let differenceHand = cursor.matrix.clone().multiply(inverseHand);
                differenceHand.decompose(position, rotation, scale);

                // Navigation: Skalierung der Rotationsgeschwindigkeit
                deltaFlyRotation.set(0, 0, 0, 1);
                deltaFlyRotation.slerp(rotation.conjugate(), flySpeedRotationFactor);

                // Beschränkung der Rotation beim Fliegen
                euler.setFromQuaternion(deltaFlyRotation);
                euler.x = 0;
                euler.z = 0;
                deltaFlyRotation.setFromEuler(euler);

                differenceMatrix.compose(position.multiplyScalar(flySpeedTranslationFactor), deltaFlyRotation, scale);
                world.matrix.premultiply(differenceMatrix);
            } else {
                planeGroup.visible = true; // Flugzeug als Feedback sichtbar
                planeGroup.matrix.copy(cursor.matrix);
                inverseHand = cursor.matrix.clone().invert();
            }
        } else {
            planeGroup.visible = false;
            inverseHand = undefined;
        }
        renderer.render(scene, camera);
        // composer.render();

    }
    renderer.setAnimationLoop(render);
};


/*
- Laden von Objekten
- 


*/