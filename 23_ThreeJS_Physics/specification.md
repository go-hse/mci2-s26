# Spezifikation für 23_ThreeJS_Physics

## 1. Projektziel

Das Projekt demonstriert eine interaktive Three.js-Szene mit echter Physics-Simulation durch Ammo.js. Ziel ist eine einfache Spielumgebung mit werfbaren Objekten, Greifmechanik und einem Zielobjekt mit Punktesystem.

---

## 2. Architektur & Komponenten

### 2.1 Hauptdatei
- `app.mjs`
  - Initialisiert Three.js `Scene`, `PerspectiveCamera`, Licht und Renderer.
  - Lädt die Physics-Engine mit `const physics = await AmmoPhysics();`
  - Verknüpft Szene und Physics mittels `physics.addScene(scene)`.

### 2.2 Unterstützende Module
- `js/interaction2D.mjs`
  - Tastaturinput (`keyboard()`)
  - Mausbewegung und Cursorsteuerung (`mouse(cursor)`)

- `js/vr.mjs`
  - WebXR-VR-Controller-Anbindung
  - Mapping von `selectstart`, `selectend`, `squeezestart`, `squeezeend`

- `js/ray.mjs`
  - Raycasting für Objektselektion
  - Ermittelt Schnittpunkt zwischen Cursor-Laser und physischen Kugeln

- `js/geometry.mjs`
  - Erzeugt verschiedene Geometrien
  - Erstellt Linien für Visualisierung
  - Implementiert das Ziel-Billboard mit `Billboard(scene, "./img/background.png", physics)`

- `99_Lib/AmmoPhysicsSingle.js`
  - Physics-Wrapper für Ammo.js
  - Verwaltet RigidBodies, Simulation, Collision-Detektion
  - Stellt `addScene`, `setMeshPositionVelocity` und `detectCollision` bereit

---

## 3. Szeneaufbau

### 3.1 Kamera & Licht
- Kamera:
  - `PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)`
  - Position: `(0, 0.3, 2)`

- Beleuchtung:
  - `HemisphereLight`
  - `DirectionalLight` mit Schatten

### 3.2 Bodenflächen
Vier statische Böden (`mass: 0`):
- zentraler Boden
- linker schräger Boden
- rechter schräger Boden
- hinterer Boden

Diese bilden die physikalische Umgebung und begrenzen das Spielfeld.

### 3.3 Physische Objekte
- 10 rote Würfel (`mass: 1`)
- bis zu 10 bewegliche Kugeln (`mass: 0.9`)
- bis zu 10 weitere physische Objekte unterschiedlicher Form (`mass: 1.5`)

### 3.4 Ziel-Billboard
- `Billboard`-Objekt im Vordergrund
- statische Masse `0`
- Nutzlast:
  - Canvas-Textur zur Anzeige von Punkten
  - `onCollision`-Callback zur Auswertung von Treffern

---

## 4. Interaktionskonzept

### 4.1 Desktop-Steuerung
- Maus
  - linke Mittelklick + bewegen: Cursor in XY verschieben
  - rechte Mittelklick + bewegen: Cursor in XZ verschieben
  - `Ctrl` + Mittelklick-Bewegung: Rotation des Cursors

- Tastatur
  - `Space`: Schießt eine Kugel
  - `A`: Schießt ein Box-Objekt
  - `G`: Greifen / Loslassen eines Objekts

### 4.2 VR-Steuerung
- VR-Controller werden mit `createVRcontrollers` verbunden
- Cursor verwendet dann die Controller-Matrix
- Buttons:
  - `select` → Greifen/Loslassen
  - `squeeze` → Auslösen von `triggered` (Schuss)

### 4.3 Ziel- und Auswahlmechanik
- Ein Cursor-Objekt wird als 3D-Zielpunkt genutzt
- `createRay(physicalSpheres)` erzeugt einen Laser aus Cursor-Position und -Richtung
- Auswahl erfolgt anhand der geringsten Kreuzprodukt-Distanz zur Kugel
- Das ausgewählte Objekt wird farblich hervorgehoben (`0xffaaaa`)

---

## 5. Physik-Engine Nutzung

### 5.1 Initialisierung
- `const physics = await AmmoPhysics();`
- `physics.addScene(scene)` traversiert alle Meshes der Szene
- Jedes Mesh mit `userData.physics` erhält einen RigidBody

### 5.2 Massen und Kollisionen
- `mass: 0` → statisch: Boden, Ziel-Billboard
- `mass > 0` → dynamisch: Kugeln, Würfel, andere Objekte
- Physics-Simulation:
  - `physicsWorld.stepSimulation(delta, 10)` im Timer
  - Sichtbare Meshes werden nach Simulation mit Physik-Transform aktualisiert

### 5.3 Objektbewegung & Abschuss
- `setMeshPositionVelocity(mesh, position, velocity)`
  - Positioniert ein Objekt neu
  - setzt direkte Geschwindigkeit
  - aktiviert den Body (`body.activate(true)`)

- Anwendung:
  - Abschuss von Kugeln und Boxen
  - Nach Treffer im Ziel wird Objekt neu positioniert und erneut ins Spielfeld geschossen

### 5.4 Greifen & Werfen
- Beim Greifen:
  - Das ausgewählte Objekt folgt der Cursor-/Controller-Matrix
  - `matrixAutoUpdate = false`
  - Relativer Transform wird festgehalten (`initialGrabbed`)

- Beim Loslassen:
  - Ein kurzer Bewegungsverlauf wird gesammelt
  - daraus wird eine Wurfgeschwindigkeit berechnet
  - `physics.setMeshPositionVelocity(grabbedObject, position, velocity)` setzt das Objekt wieder frei

---

## 6. Kollisionsauswertung & Feedback

### 6.1 Kollisions-Callback
- In `AmmoPhysicsSingle.js`:
  - `detectCollision()` durchläuft alle Kontakt-Manifolds
  - ruft bei jeder Kollision `threeObject.onCollision(other)` auf

### 6.2 Zielauswertung
- `Billboard` definiert `mesh.onCollision = (o) => {...}`
- Bei Treffer:
  - Abstand vom Kontaktpunkt zum Zielmittelpunkt bestimmt Punkte
  - Punkte werden auf dem Billboard-Canvas angezeigt
  - Treffer werden in einer Trefferliste gespeichert
  - Getroffene Objekte werden zurückgesetzt und erneut ins Spielfeld geschossen

---

## 7. Präsentationsstruktur

### Folie 1: Projektübersicht
- Name: `23_ThreeJS_Physics`
- Schwerpunkt: Interaktive Physics-Umgebung in Three.js
- Kerntechnologien: `three.module.js`, `AmmoPhysicsSingle.js`, WebXR, Canvas-Textur

### Folie 2: Szene & Physik
- Boden + schräger Flächen
- dynamische Würfel, Kugeln, geometrische Objekte
- statisches Ziel-Billboard

### Folie 3: Interaktion
- Desktop: Maus + Keyboard
- VR: Controller Select / Squeeze
- Kontrollobjekt: Cursor + Laser + Auswahl

### Folie 4: Physics-Engine Integration
- `AmmoPhysics()` initialisiert Ammo / WebAssembly
- `physics.addScene(scene)` mappt `userData.physics`
- dynamische Objekte werden simuliert und ihre drei.js-Transformationsdaten synchronisiert

### Folie 5: Spielmechanik
- Schießen von Kugeln und Boxen
- Greifen und Werfen
- Trefferpunkte über Canvas-Texte auf dem Billboard

### Folie 6: Erweiterungsideen
- Scoreboard/Timer
- weitere Zieltypen
- physikalische Hindernisse
- bessere VR-Feedback und Controller-Visualisierung

---

## 8. Wichtige Dateien für die Präsentation
- `app.mjs` – zentrale Logik, Steuerung, Physics-Integration
- `js/interaction2D.mjs` – Desktopinput
- `js/vr.mjs` – WebXR-Controller
- `js/geometry.mjs` – Objektgenerierung und Ziel-Billboard
- `99_Lib/AmmoPhysicsSingle.js` – Physics-Schnittstelle, Collision-Handling
