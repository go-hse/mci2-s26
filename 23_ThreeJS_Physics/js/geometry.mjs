import { Vector3 } from '../../99_Lib/three.core.js';
import * as THREE from '../../99_Lib/three.module.min.js';

const geometries = [
    new THREE.BoxGeometry(0.25, 0.25, 0.25),
    new THREE.ConeGeometry(0.1, 0.4, 64),
    new THREE.CylinderGeometry(0.2, 0.2, 0.2, 64),
    new THREE.IcosahedronGeometry(0.1, 3),
    new THREE.TorusKnotGeometry(.2, .03, 50, 16),
    new THREE.TorusGeometry(0.2, 0.04, 64, 32),
    new THREE.CapsuleGeometry(0.1, 0.3, 8, 16)
];

function randomMaterial() {
    return new THREE.MeshStandardMaterial({
        color: Math.random() * 0xff3333,
        roughness: 0.2,
        metalness: 0.4
    });
}

export function add(i, parent, x = 0, y = 0, z = 0, userData = {}) {
    let object = new THREE.Mesh(geometries[i], randomMaterial());
    object.position.set(x, y, z);
    object.updateMatrix();
    object.castShadow = true;
    object.name = `o_${i}`;
    object.matrixAutoUpdate = true;
    object.userData = userData;
    parent.add(object);
    return object;
}

export function createLine(scene) {
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 1, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const position = line.geometry.attributes.position.array;

    return (idx, pos) => {
        idx *= 3;
        position[idx++] = pos.x;
        position[idx++] = pos.y;
        position[idx++] = pos.z;
        line.geometry.attributes.position.needsUpdate = true;
    }
}


export function Billboard(scene, background, physics) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const fontSize = 8;
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.font = fontSize + "pt Monospace";
    context.strokeStyle = "black";
    let points = 0;

    const END_ANGLE = Math.PI * 2;

    function circle(x, y, radius, color) {
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, radius, 0, END_ANGLE, true);
        context.fill();
    }
    let needsUpdate = true;
    const drawBackground = background !== undefined ? image(context, background, 1, () => {
        needsUpdate = true;
    }, false) : undefined;
    const drawHole = image(context, "./img/hole.png", 0.2, undefined, true);

    const canvasSize = 256;
    const canvasHalf = canvasSize / 2;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const material = new THREE.MeshBasicMaterial();
    material.map = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.1), material);

    mesh.overdraw = true;
    mesh.doubleSided = true;
    mesh.position.set(0, 1.5, -3);
    mesh.name = "billboard";
    mesh.receiveShadow = true;
    mesh.userData.physics = { mass: 0 };
    scene.add(mesh);

    const defaultPosition = new Vector3(1, 1, -1);
    const defaultVelocity = new Vector3(0, 1, 0);

    let hits = [];
    // hits.unshift({ x: 0, y: 0, a: Math.PI }); // store in front
    const diff = new Vector3();
    let lasthitname = "";
    mesh.onCollision = (o) => {
        if (o.name !== lasthitname) {
            lasthitname = o.name;
            diff.subVectors(o.position, mesh.position);

            const shotPoints = Math.floor(100 - 100 * diff.length());
            points += shotPoints;
            console.log("target hit", o, diff, points);
            hits.unshift({ x: diff.x, y: diff.y, a: 2 * Math.random() * Math.PI, p: shotPoints }); // store in front
            if (hits.length > 10) {
                hits.pop();
            }
            console.log("hits", hits);
            needsUpdate = true;

            physics.setMeshPositionVelocity(o, defaultPosition, defaultVelocity);
        }
    }



    function draw() {
        if (needsUpdate) {
            needsUpdate = false;
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "black";

            if (drawBackground) {
                drawBackground(1, 1, 0);
            }

            context.fillText(`Points ${points}`, 5, fontSize + 2);


            for (const h of hits) {
                const x = canvasHalf + (h.x * canvasHalf);
                const y = canvasHalf - (h.y * canvasHalf);
                // console.log("hit", x, y);
                // circle(x, y, 10, "green");
                drawHole(x, y, h.a);
                context.fillText(`${h.p}`, x, y);
            }
            material.map.needsUpdate = true;
            material.needsUpdate = true;
        }
    };
    needsUpdate = true;
    return { draw, mesh };
}


function image(context, src, sc, cb, center = false) {
    let img = new Image();
    img.src = src;
    let ratio = 0, halfW = 0, halfH = 0;

    img.addEventListener('load', () => {
        ratio = img.naturalWidth / img.naturalHeight;
        halfW = img.naturalWidth / 2;
        halfH = img.naturalHeight / 2;
        console.log("image load", src, ratio);
        if (cb) cb();
    });

    return (x, y, a = 0) => {
        if (ratio > 0) {
            context.save();
            context.translate(x, y);
            context.rotate(a);
            if (center) context.translate(-halfW * sc, -halfH * sc);
            context.scale(sc, sc);
            context.drawImage(img, 0, 0);
            context.restore();
        }
    }
}
