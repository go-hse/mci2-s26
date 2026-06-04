import * as THREE from 'three';

import { loadSplat } from './js/splat.mjs';

import { keyboard, mouse } from './js/interaction2D.mjs';
import { add, createLine, loadSTL, randomMaterial, ToWireframe } from './js/geometry.mjs';
import { Touchables, Slider, RotaryKnobs } from './js/widgets.mjs';
import { createRay } from './js/ray.mjs';
import { arPlanes } from './js/ar.mjs';


// VR- Buttons zum Starten des immersiven Modus  
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

import { createVRcontrollers, showGamepad } from './js/vr.mjs';

const HALFPI = Math.PI / 2;

window.onload = async function () {

    const cursorGrp = new THREE.Group();

    const STL = loadSTL();
    STL("./models/cursor.stl", (geometry) => {
        const material = new THREE.MeshStandardMaterial({ color: 0xcccccc, flatShading: false });
        // const material = new THREE.MeshPhongMaterial({ color: 0xa0a0a0, specular: 0x494949, shininess: 100, flatShading: false });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, -0.5, 0);
        mesh.rotation.set(-HALFPI, 0, 0);
        const sc = 0.01;
        mesh.scale.set(sc, sc, sc);
        mesh.castShadow = true;
        // mesh.receiveShadow = true;
        cursorGrp.add(mesh);
    });


    const controllerModelFactory = new XRControllerModelFactory();

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.3, 2);

    const scene = new THREE.Scene();
    const world = new THREE.Group();
    scene.add(cursorGrp);
    world.name = "world";
    world.matrixAutoUpdate = false;
    scene.add(world);


    const touchables = Touchables();
    const slider = Slider(scene, (meshes) => {
        touchables.add(meshes);
    });

    const knobs = RotaryKnobs(scene, (meshes) => {
        touchables.add(meshes);
    }, (yawChange) => {

    });


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

    // const cursor = add(1, scene);
    const isMouseButton = mouse(cursorGrp);
    let objects = [];
    let x = -0.8, y = 0.3, z = -0.5, delta = 0.4;
    for (let i = 0; i < 5; ++i) {
        objects.push(add(i, world, x, y, z)); x += delta;
    }

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

    // funktioniert nur in Wolvic-Browser
    // loadSplat(world, renderer, "./models/Small_Castle.spz");

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
        cursorGrp.matrixAutoUpdate = false;
        cursorGrp.visible = false;

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
    {
        const button = VRButton.createButton(renderer);
        button.style.left = 'calc(40% - 50px)';
        button.textContent = 'VR';
        document.body.appendChild(button);
        console.log("VR button added");
    }

    // AR
    // {
    //     const button = ARButton.createButton(renderer, { requiredFeatures: ['hit-test', 'plane-detection', "local-floor"] })
    //     button.style.left = 'calc(60% - 50px)';
    //     button.textContent = 'AR';
    //     document.body.appendChild(button);
    //     console.log("AR button added");
    // }



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

    let grabbed = false, squeezed = false, sculpting = false;
    addKey(" ", active => {
        console.log("Space: Grabbed", active);
        grabbed = active;
    });

    addKey("s", active => {
        console.log("S: Squeeze", active);
        squeezed = active;
    });

    addKey("c", active => {
        console.log("C: Sculpting", active);
        sculpting = active;
    });


    addKey("f", active => {
        if (active) {
            console.log("F: toggle floor", active, floor.visible);
            floor.visible = !floor.visible;
        }
    });

    addKey("l", active => {
        if (active) {
            slider.toggleVisibility();
        }
    });

    addKey("n", active => {
        if (active) {
            sparkLoader.loadNext();
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

    let grabbedObject, grabTouchedObject, initialGrabbed, distance, inverseHand, inverseWorld;
    const deltaFlyRotation = new THREE.Quaternion();
    const differenceMatrix = new THREE.Matrix4();
    const flySpeedRotationFactor = 0.01;
    const flySpeedTranslationFactor = -0.02;
    const euler = new THREE.Euler();


    // Renderer-Loop starten
    let firstVR = false, captured = false, triggerNext = false;

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
            cursorGrp.matrix.copy(controller.matrix);
            const mainGamepad = controllers[mainhand].data.gamepad;

            squeezed = mainGamepad.buttons[1].value > 0;
            grabbed = mainGamepad.buttons[0].value > 0;
            const scndGamepad = controllers[scndhand].data.gamepad;

            showGamepad(mainhand, mainGamepad);

            // if (mainGamepad.buttons[4].value) {
            //     if (frame && frame.session && captured === false) {
            //         frame.session.initiateRoomCapture();
            //         captured = true;
            //     }
            // }

            if (mainGamepad.buttons[4].value) {
                if (!triggerNext) {
                    sparkLoader.loadNext();
                    triggerNext = true;
                }
            } else {
                if (triggerNext) triggerNext = false;
            }

            direction.set(0, 0, -1);
        } else {
            direction.set(0, 1, 0);
        }

        cursorGrp.matrix.decompose(position, rotation, scale);
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

        // Objekte in der Nähe haben Priorität
        if (grabbedObject === undefined) {
            grabTouchedObject = touchables.move(grabbed, cursorGrp);
        }

        if (grabbed) {
            if (grabbedObject) {
                endRay.addVectors(position, direction.multiplyScalar(distance));
                lineFunc(1, endRay);
                if (grabbedObject === world) {
                    world.matrix.copy(cursorGrp.matrix.clone().multiply(initialGrabbed));
                } else {
                    grabbedObject.matrix.copy(inverseWorld.clone().multiply(cursorGrp.matrix).multiply(initialGrabbed));
                }
            } else if (grabTouchedObject === undefined && firstObjectHitByRay) {
                grabbedObject = firstObjectHitByRay.object;
                inverseWorld = world.matrix.clone().invert();
                initialGrabbed = cursorGrp.matrix.clone().invert().multiply(world.matrix).multiply(grabbedObject.matrix);
            } else if (grabTouchedObject === undefined) {
                grabbedObject = world;
                initialGrabbed = cursorGrp.matrix.clone().invert().multiply(world.matrix);
            }
        } else {
            grabbedObject = undefined;
        }

        // Navigation
        if (squeezed) {
            lineFunc(1, position);

            if (inverseHand !== undefined) {
                lineFunc(0, position);
                let differenceHand = cursorGrp.matrix.clone().multiply(inverseHand);
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
                inverseHand = cursorGrp.matrix.clone().invert();
            }
        } else {
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