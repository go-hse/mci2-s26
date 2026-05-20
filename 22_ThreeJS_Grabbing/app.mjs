import * as THREE from '../99_Lib/three.module.js';
import { add, NO_OF_GEOS, createLine } from './js/geometry.mjs';
import { mouse, keyboard } from './js/interaction2D.mjs';

console.log("ThreeJs " + THREE.REVISION);
window.onload = function () {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("hsla(253, 73.10%, 49.60%, 0.73)");

    // Lichter
    scene.add(new THREE.HemisphereLight(0x808080, 0x606060));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 2, 5);
    light.castShadow = true;
    scene.add(light);
    // Kamera
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 1);
    scene.add(camera);
    //////////////////////////////////////////////////////////////////////////////
    // FLOOR
    // const floorMaterial = await shaderMaterial("./shaders/floorVertexShader.glsl", "./shaders/floorFragmentShader.glsl")


    const width = 0.1;
    const box = new THREE.BoxGeometry(10, width, 10, 20, 1, 20);
    const floor = new THREE.Mesh(box, new THREE.MeshStandardMaterial({
        color: new THREE.Color("hsl(0, 54.80%, 93.90%)"),
        roughness: 0.2,
        metalness: 0.4
    }));
    floor.position.y = -1;
    scene.add(floor);
    floor.receiveShadow = true;

    const linematerial = new THREE.LineBasicMaterial({
        color: new THREE.Color("hsl(67, 18.40%, 90.40%)")
    });

    const wireframe = new THREE.WireframeGeometry(box);
    const line = new THREE.LineSegments(wireframe, linematerial);
    line.position.y = floor.position.y;
    scene.add(line);


    const arr = [];

    const addToKeyboard = keyboard();

    let grabbed = false; // taste: benutzer will greifen

    addToKeyboard(" ", (active) => {
        console.log("Space", active);
        grabbed = active;
    });

    const cursor = add(1, scene);
    mouse(cursor);

    const delta = 0.3, z = -    1;
    for (let x = -2; x <= 2; x += delta * 2) {
        for (let y = -1; y <= 1; y += delta) {
            const id = Math.trunc(Math.random() * NO_OF_GEOS);
            arr.push(add(id, scene, x, y, z, false));
        }
    }

    const setLinePos = createLine(scene);

    // Renderer erstellen
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    // Renderer-Parameter setzen
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // Renderer-Loop starten

    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const endRay = new THREE.Vector3();
    function render() {
        cursor.matrix.decompose(position, rotation, scale);
        direction.set(0, 1, 0);
        direction.applyQuaternion(rotation);
        endRay.addVectors(position, direction.multiplyScalar(10));
        setLinePos(0, cursor.position);
        setLinePos(1, endRay);
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(render);


};
