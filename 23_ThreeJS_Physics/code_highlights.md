# Code Highlights für Präsentation

## 1. Physics-Initialisierung und Szenenbindung

**Datei:** `app.mjs`

```js
const physics = await AmmoPhysics();
...
physics.addScene(scene);
```

**Erklärung:**
- `AmmoPhysics()` lädt die Ammo.js-Physics-Engine asynchron.
- `physics.addScene(scene)` traversiert die gesamte Three.js-Szene und erstellt physikalische Körper für alle Meshes mit `userData.physics`.
- Diese Verbindung sorgt dafür, dass später physikalische Simulation und Rendering synchronisiert ablaufen.

**Grafik-Prompt:**
- "Diagram of a Three.js scene graph being connected to a physics engine, showing meshes with physics metadata being registered as rigid bodies."

---

## 2. Boden und statische Physikobjekte

**Datei:** `app.mjs`

```js
const floor = new THREE.Mesh(
    new THREE.BoxGeometry(10, width, 10),
    floorMaterial
);
floor.position.y = -width / 2;
floor.receiveShadow = true;
floor.userData.physics = { mass: 0 };
floor.name = "floor";
scene.add(floor);
```

**Erklärung:**
- Der Boden wird als statisches Objekt (`mass: 0`) definiert.
- Statische Körper bleiben in der Physik fest an ihrer Position, können aber mit dynamischen Objekten kollidieren.
- Dies ist wichtig für Grenzen, Rampen und Spielfeld-Struktur.

**Grafik-Prompt:**
- "Illustration of a green floor mesh in a 3D scene with physics label mass zero, showing static collision boundary."

---

## 3. Dynamische Würfel und Kugeln

**Datei:** `app.mjs`

```js
for (let i = 0; i < 10; ++i) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth), new THREE.MeshStandardMaterial({
        color: 0xff3333,
        roughness: 0.7,
        metalness: 0.0,
    }));
    box.userData.physics = { mass: 1 };
    scene.add(box);
}
```

```js
const sphere = add(3, scene, 0, 1, 0);
sphere.userData.physics = { mass: 0.9 };
```

**Erklärung:**
- Dynamische Objekte erhalten eine Masse > 0 und werden von der Physik-Simulation bewegt.
- Die Würfel und Kugeln reagieren auf Gravitation, Kollisionen und Kräfte.
- Solche Objekte eignen sich gut, um das physikalische Verhalten sichtbar zu machen.

**Grafik-Prompt:**
- "3D scene with red boxes and spheres falling and bouncing on a physics-enabled floor, with arrows indicating gravity and collisions."

---

## 4. Schussmechanik und Bewegung von Objekten

**Datei:** `app.mjs`

```js
function shootBall(box = false) {
    triggered = false;
    triggeredBox = false;

    cursor.matrix.decompose(cursor_position, cursor_rotation, cursor_scale);
    shoot_direction.applyQuaternion(cursor_rotation);

    velocity.set(shoot_direction.x * MOVESPEED, shoot_direction.y * MOVESPEED, shoot_direction.z * MOVESPEED);
    if (box) {
        physics.setMeshPositionVelocity(physicalBoxes[boxIdx], cursor_position, velocity);
    } else {
        physicalSpheres[ballIdx].visible = true;
        physics.setMeshPositionVelocity(physicalSpheres[ballIdx], cursor_position, velocity);
    }
}
```

**Erklärung:**
- `shootBall` platziert ein Objekt am Cursor und verleiht ihm eine Geschwindigkeit.
- `physics.setMeshPositionVelocity()` setzt Position und Geschwindigkeit des entsprechenden Rigid Bodies in der Physics-Engine.
- So entsteht ein kontrollierter Wurf/Schuss-Effekt.

**Grafik-Prompt:**
- "Action diagram of a cursor launching a ball into a physics scene with an arrow, showing initial position and velocity application."

---

## 5. Greifen, Halten und Werfen

**Datei:** `app.mjs`

```js
if (grabbed) {
    if (grabbedObject) {
        grabbedObject.matrix.copy(cursor.matrix.clone().multiply(initialGrabbed));
        grabbedObject.matrix.decompose(grabbedArray[grabbedArrayIdx].pos, rotation, scale);
    } else {
        grabbedObject = physicalSpheres[selected];
        initialGrabbed = cursor.matrix.clone().invert().multiply(grabbedObject.matrix);
        grabbedObject.matrixAutoUpdate = false;
    }
} else {
    if (grabbedObject) {
        grabbedObject.matrix.decompose(position, rotation, scale);
        grabbedObject.matrixAutoUpdate = true;
        velocity.subVectors(grabbedArray[oldIdx].pos, position);
        velocity.multiplyScalar(-10);
        physics.setMeshPositionVelocity(grabbedObject, position, velocity);
    }
}
```

**Erklärung:**
- Beim Greifen wird das Objekt an die Cursor-Transformation geknüpft.
- Beim Loslassen wird die zuletzt gemessene Bewegung in eine Wurfgeschwindigkeit umgerechnet.
- Das Objekt wird wieder an die Physics-Engine übergeben, damit es physikalisch korrekt fliegt.

**Grafik-Prompt:**
- "Sequence showing grabbing a sphere with a cursor, holding it, then releasing it with a throw velocity vector."

---

## 6. Raycasting und Auswahl

**Datei:** `app.mjs`

```js
const rayFunc = createRay(physicalSpheres);
...
const intersectObject = rayFunc(position, laser_direction);
if (intersectObject) {
    endRay.addVectors(position, laser_direction.multiplyScalar(intersectObject.distance));
}
```

**Erklärung:**
- `createRay` erzeugt einen Raycaster, der physische Objekte prüft.
- Die Schnittpunkte werden genutzt, um gezielt ein Objekt anzuwählen und den Laser zu visualisieren.
- Ausgewählte Kugeln werden farblich hervorgehoben.

**Grafik-Prompt:**
- "Visualization of a laser ray from a cursor hitting a sphere in a 3D scene, with hit detection and selected object highlight."

---

## 7. Ziel-Billboard und Kollisionsfeedback

**Datei:** `js/geometry.mjs`

```js
mesh.onCollision = (o) => {
    diff.subVectors(o.position, mesh.position);
    const shotPoints = Math.floor(100 - 100 * diff.length());
    points += shotPoints;
    physics.setMeshPositionVelocity(o, defaultPosition, defaultVelocity);
};
```

**Erklärung:**
- Das Billboard empfängt Kollisionen über `onCollision`.
- Die Trefferposition wird ausgewertet und in Punkte umgewandelt.
- Getroffene Objekte werden zurückgesetzt, um das Spiel weiterlaufen zu lassen.

**Grafik-Prompt:**
- "Target billboard in a physics scene with hit points appearing on a score display after a projectile collision."

---

## 8. Physics-Engine intern: Simulation und Kollisionsabfrage

**Datei:** `99_Lib/AmmoPhysicsSingle.js`

```js
function step() {
    const delta = (time - lastTime) / 1000;
    physicsWorld.stepSimulation(delta, 10);
    for (let i = 0, l = visibleMeshes.length; i < l; i++) {
        const mesh = visibleMeshes[i];
        const motionState = visibleMesh2physicalBodyMap.get(mesh).getMotionState();
        motionState.getWorldTransform(worldTransform);
        mesh.position.set(position.x(), position.y(), position.z());
        mesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
    }
    detectCollision();
}
```

**Erklärung:**
- In jeder Simulationstaktung werden Physics-Körper fortgeschrieben.
- Die berechneten Positionen und Rotationen werden in die Three.js-Meshes zurückgeschrieben.
- Anschließend erfolgt die Kollisionsabfrage und das Aufrufen von Collision-Callbacks.

**Grafik-Prompt:**
- "Flowchart of physics simulation loop: time step, stepSimulation, update scene objects, collision detection, callback execution."

---

## 9. Präsentations-Empfehlungen

- Zeige zuerst den Aufbau der Szene (`app.mjs`) mit Boden, Objekten und Billboard.
- Erläutere dann die Physics-Verbindung und warum `userData.physics` wichtig ist.
- Verwende die Schuss- und Greifmechanik als praxisnahe Beispiele.
- Beziehe das Kollisionsfeedback des Billboards als Spielerfolg ein.
- Nutze die Grafik-Prompts, um Visualisierungen für das Publikum zu erzeugen.
