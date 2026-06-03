# Mathematische Grundlagen der 3D-Interaktionen in Three.js

Diese Dokumentation beschreibt die mathematischen Konzepte und Formeln, die in diesem Projekt für die Interaktionen in der virtuellen (VR) und erweiterten Realität (AR) verwendet werden. Die Implementierungen basieren auf **homogenen Koordinaten**, **Matrix-Transformationen**, **Quaternionen** sowie **Basiswechseln**.

---

## Inhaltsverzeichnis
1. [Koordinatenräume und Homogene Koordinaten](#1-koordinatenräume-und-homogene-koordinaten)
2. [Objekt-Interaktion: Greifen und Platzieren (Grabbing)](#2-objekt-interaktion-greifen-und-platzieren-grabbing)
3. [Ego-Navigation: Fliegen durch Squeeze-Geste (Flying)](#3-ego-navigation-fliegen-durch-squeeze-geste-flying)
4. [Eingeschränkte Interaktionen (Widgets)](#4-eingeschränkte-interaktionen-widgets)
   - [Linearer Slider (1-DOF Translation)](#linearer-slider-1-dof-translation)
   - [Drehknopf / Rotary Knob (1-DOF Rotation)](#drehknopf--rotary-knob-1-dof-rotation)
5. [Mauseingabe-Mapping (2D auf 3D)](#5-mauseingabe-mapping-2d-auf-3d)
6. [AR-Ebenendetektion und Bounding Boxes](#6-ar-ebenendetektion-und-bounding-boxes)

---

## 1. Koordinatenräume und Homogene Koordinaten

In der 3D-Computergrafik werden Punkte $\mathbf{p} = [x, y, z]^T$ durch **homogene Koordinaten** als 4-Vektoren $\mathbf{p}_{hom} = [x, y, z, 1]^T$ dargestellt. Dies ermöglicht es, Translation, Rotation und Skalierung in einer einzigen $4 \times 4$-Transformationsmatrix $\mathbf{M}$ zu kombinieren:

$$\mathbf{M} = \begin{bmatrix} 
r_{11} & r_{12} & r_{13} & t_x \\
r_{21} & r_{22} & r_{23} & t_y \\
r_{31} & r_{32} & r_{33} & t_z \\
0 & 0 & 0 & 1 
\end{bmatrix}$$

Hierbei repräsentiert die obere linke $3 \times 3$-Submatrix die Rotation (und Skalierung) und die rechte Spalte $[t_x, t_y, t_z]^T$ die Translation.

In Three.js sind Matrizen standardmäßig im **Column-Major-Format** (spaltenweise) im `elements`-Array abgelegt. Das bedeutet:
- Spalte 1 (X-Achse): Indizes $0, 1, 2, 3$
- Spalte 2 (Y-Achse): Indizes $4, 5, 6, 7$
- Spalte 3 (Z-Achse): Indizes $8, 9, 10, 11$
- Spalte 4 (Translation $\mathbf{t}$): Indizes $12, 13, 14, 15$

---

## 2. Objekt-Interaktion: Greifen und Platzieren (Grabbing)

Beim Greifen eines Objekts soll die relative Position und Orientierung zwischen dem Cursor (z. B. dem VR-Controller) und dem Objekt während der Bewegung konstant bleiben.

### Mathematische Herleitung

Sei:
- $\mathbf{M}_C$ die Weltmatrix des Cursors beim Start des Greifens.
- $\mathbf{M}_W$ die Weltmatrix der übergeordneten Welt (`world`).
- $\mathbf{M}_O$ die Weltmatrix des Objekts beim Start des Greifens.

Die Transformation des Objekts relativ zum Cursor wird beim ersten Greifen (Initialisierung) berechnet. Um die Matrix im lokalen Raum der Welt auszudrücken, verwenden wir:

$$\mathbf{I}_{grab} = \mathbf{M}_C^{-1} \cdot \mathbf{M}_W \cdot \mathbf{M}_O$$

Wenn sich der Cursor nun zu einer neuen Position/Orientierung $\mathbf{M}_C'$ bewegt, berechnet sich die neue Matrix des Objekts $\mathbf{M}_O'$ durch Voranstellung der inversen Weltmatrix $\mathbf{M}_W^{-1}$, um das Objekt wieder im lokalen Koordinatensystem der Welt zu platzieren:

$$\mathbf{M}_O' = \mathbf{M}_W^{-1} \cdot \mathbf{M}_C' \cdot \mathbf{I}_{grab}$$

#### Beweis der Konsistenz (beim Start des Greifens):
Wenn $\mathbf{M}_C' = \mathbf{M}_C$:

$$\mathbf{M}_O' = \mathbf{M}_W^{-1} \cdot \mathbf{M}_C \cdot (\mathbf{M}_C^{-1} \cdot \mathbf{M}_W \cdot \mathbf{M}_O) = \mathbf{M}_O$$

Das Objekt springt beim Greifen also nicht (Smooth Grabbing).

### Code-Schnipsel (aus [app.mjs](file:///c:/Repo/HSE/MCI/mci2-s26/25_ThreeJS_Widgets/app.mjs))

**Initialisierung des Greifens:**
```javascript
// Zeilen 353-355 in app.mjs
grabbedObject = firstObjectHitByRay.object;
inverseWorld = world.matrix.clone().invert();
initialGrabbed = cursorGrp.matrix.clone().invert().multiply(world.matrix).multiply(grabbedObject.matrix);
```

**Aktualisierung in jedem Frame:**
```javascript
// Zeile 350 in app.mjs
grabbedObject.matrix.copy(inverseWorld.clone().multiply(cursorGrp.matrix).multiply(initialGrabbed));
```

Wenn die **gesamte Welt** gegriffen wird (Ego-Welt-Verschiebung), vereinfacht sich die Formel zu:
- Initialisierung: $\mathbf{I}_{grab} = \mathbf{M}_C^{-1} \cdot \mathbf{M}_W$
- Aktualisierung: $\mathbf{M}_W' = \mathbf{M}_C' \cdot \mathbf{I}_{grab}$

```javascript
// Zeilen 357-358 und 348 in app.mjs
// Init
initialGrabbed = cursorGrp.matrix.clone().invert().multiply(world.matrix);
// Update
world.matrix.copy(cursorGrp.matrix.clone().multiply(initialGrabbed));
```

---

## 3. Ego-Navigation: Fliegen durch Squeeze-Geste (Flying)

Beim "Fliegen" (Steuerung durch die Squeeze-Taste) steuert die relative Bewegung der Hand im Vergleich zur Startposition die Fortbewegung der Kamera. Da die Kamera in WebXR oft an die reale Raumposition gebunden ist, bewegen wir stattdessen die **Welt** in die entgegengesetzte Richtung.

### Mathematische Modellierung

1. **Relative Handbewegung:** 
   Sei $\mathbf{M}_{hand,0}$ die Handmatrix beim Start des Squeezes und $\mathbf{M}_{hand,t}$ die aktuelle Handmatrix. Die Differenztransformation $\Delta \mathbf{M}_{hand}$ ist:
   
   $$\Delta \mathbf{M}_{hand} = \mathbf{M}_{hand,t} \cdot \mathbf{M}_{hand,0}^{-1}$$

2. **Dekomposition:**
   Diese Matrix wird in Translation $\mathbf{t}$, Rotation (Quaternion $\mathbf{q}$) und Skalierung $\mathbf{s}$ zerlegt.

3. **Gedämpfte & invertierte Translation:**
   Um sich in Richtung der Handbewegung zu bewegen, verschieben wir die Welt in die Gegenrichtung:
   
   $$\mathbf{t}_{fly} = \mathbf{t} \cdot f_{translation}$$
   
   wobei $f_{translation} = -0.02$ (Dämpfungs- und Invertierungsfaktor).

4. **Flugorientierung (Dämpfung und Bewegungseinschränkung):**
   Die Rotation wird invertiert (Konjugation des Quaternions $\mathbf{q}^*$) und mittels **SLERP** (Spherical Linear Interpolation) gedämpft:
   
   $$\mathbf{q}_{fly} = \operatorname{slerp}(\mathbf{q}_{identity}, \mathbf{q}^*, f_{rotation})$$
   
   wobei $f_{rotation} = 0.01$. Um Reisekrankheit (Motion Sickness) zu vermeiden, wird die Rotation auf die **Gierachse** (Yaw / Rotation um Y) beschränkt. Pitch (X) und Roll (Z) werden genullt:
   
   $$\mathbf{q}_{fly} \rightarrow \mathbf{q}_{fly, constrained} \quad \text{mit } \theta_x = 0, \theta_z = 0$$

5. **Akkumulation auf die Welt:**
   Die resultierende Differenzmatrix wird auf die Welt vor-multipliziert (pre-multiplied):
   
   $$\mathbf{M}_W' = \mathbf{M}_{fly} \cdot \mathbf{M}_W$$

### Code-Schnipsel (aus [app.mjs](file:///c:/Repo/HSE/MCI/mci2-s26/25_ThreeJS_Widgets/app.mjs))

```javascript
// Zeilen 365-385 in app.mjs
if (squeezed) {
    if (inverseHand !== undefined) {
        let differenceHand = cursorGrp.matrix.clone().multiply(inverseHand);
        differenceHand.decompose(position, rotation, scale);

        // Rotation dämpfen und invertieren (Conjugate)
        deltaFlyRotation.set(0, 0, 0, 1);
        deltaFlyRotation.slerp(rotation.conjugate(), flySpeedRotationFactor);

        // Pitch (x) und Roll (z) auf 0 setzen zur Vermeidung von Motion Sickness
        euler.setFromQuaternion(deltaFlyRotation);
        euler.x = 0;
        euler.z = 0;
        deltaFlyRotation.setFromEuler(euler);

        // Matrix zusammensetzen und Welt transformieren
        differenceMatrix.compose(position.multiplyScalar(flySpeedTranslationFactor), deltaFlyRotation, scale);
        world.matrix.premultiply(differenceMatrix);
    } else {
        inverseHand = cursorGrp.matrix.clone().invert();
    }
}
```

---

## 4. Eingeschränkte Interaktionen (Widgets)

Hierbei wird die Bewegung des Cursors in das lokale Koordinatensystem des Widgets transformiert (Wechsel des Bezugssystems / Ähnlichkeitstransformation) und dort auf bestimmte Freiheitsgrade eingeschränkt.

### Linearer Slider (1-DOF Translation)

Der Slider-Knopf soll sich nur entlang der lokalen X-Achse bewegen lassen.

#### Mathematischer Ablauf
1. Die relative Bewegung des Cursors wird in das lokale System des Sliders transformiert:
   
   $$\Delta \mathbf{M}_{local} = \mathbf{M}_{slider}^{-1} \cdot \mathbf{M}_{cursor} \cdot \mathbf{I}_{grab}$$
   
   wobei $\mathbf{I}_{grab} = \mathbf{M}_{cursor,0}^{-1} \cdot \mathbf{M}_{slider,0}$.

2. Der X-Verschiebungsanteil ($dx$) wird aus der Translationskomponente der Matrix extrahiert:
   
   $$dx = \Delta \mathbf{M}_{local}[12]$$

3. Es wird eine reine Translationsmatrix $\mathbf{T}_{restriced}(dx, 0, 0)$ erstellt, mit der ursprünglichen Knopf-Matrix multipliziert und innerhalb eines Intervalls $[x_{min}, x_{max}]$ (hier $[-0.4, 0.4]$) geklammert:
   
   $$\mathbf{M}_{knob}' = \mathbf{T}_{restricted} \cdot \mathbf{M}_{knob,0}$$

#### Code-Schnipsel (aus [widgets.mjs](file:///c:/Repo/HSE/MCI/mci2-s26/25_ThreeJS_Widgets/js/widgets.mjs))

```javascript
// Zeilen 168-173 in widgets.mjs
const delta = inWorld ? 
    inverseMesh.clone().multiply(inverseWorld).multiply(cursor.matrix).multiply(initialGrabbed) : 
    inverseMesh.clone().multiply(cursor.matrix).multiply(initialGrabbed);

const dx = delta.elements[12]; // Lokale X-Translation extrahieren
const restricted = new THREE.Matrix4().makeTranslation(dx, 0, 0);

knobMesh.matrix.copy(restricted.multiply(initialMatrix));
knobMesh.matrix.elements[12] = clamp(knobMesh.matrix.elements[12], -0.4, 0.4); // Clamp-Funktion
```

---

### Drehknopf / Rotary Knob (1-DOF Rotation)

Der Drehknopf soll sich nur um seine lokale Y-Achse (Gierachse) drehen lassen.

#### Mathematischer Ablauf
1. Analog zum Slider wird die relative Bewegung $\Delta \mathbf{M}_{local}$ im lokalen System des Drehknopfs berechnet.
2. Diese Matrix wird in Translation, Rotation (Quaternion) und Skalierung zerlegt.
3. Aus dem Quaternion $\mathbf{q} = [q_x, q_y, q_z, q_w]^T$ wird der Gierwinkel (Yaw) $\psi$ berechnet:
   
   $$\psi = \operatorname{atan2}\left(2(q_y q_w + q_x q_z), 1 - 2(q_y^2 + q_x^2)\right)$$

4. Ein neues Quaternion wird erzeugt, das eine reine Rotation um die Y-Achse $\mathbf{a}_y = [0, 1, 0]^T$ beschreibt:
   
   $$\mathbf{q}_{pure\_y} = \left[\mathbf{a}_y \cdot \sin\left(\frac{\psi}{2}\right), \cos\left(\frac{\psi}{2}\right)\right]^T = \left[0, \sin\left(\frac{\psi}{2}\right), 0, \cos\left(\frac{\psi}{2}\right)\right]^T$$

5. Die Translations- und Skalierungskomponenten werden verworfen (durch Zurücksetzen auf die Identitätsmatrix), und die Matrix $\Delta \mathbf{M}_{local}$ wird ausschließlich mit dieser reinen Y-Rotation neu aufgebaut:
   
   $$\Delta \mathbf{M}_{local} = \mathbf{M}(\mathbf{q}_{pure\_y})$$

6. Die neue Matrix des Drehknopfs berechnet sich als:
   
   $$\mathbf{M}_{knob}' = \Delta \mathbf{M}_{local} \cdot \mathbf{M}_{knob,0}$$

#### Code-Schnipsel (aus [widgets.mjs](file:///c:/Repo/HSE/MCI/mci2-s26/25_ThreeJS_Widgets/js/widgets.mjs))

```javascript
// Zeilen 231-239 in widgets.mjs
function limitToYRotation(D) {
    D.decompose(position, quaternion, scale);
    
    // Gierwinkel (Yaw) aus Quaternion extrahieren
    const yaw = Math.atan2(
        2 * (quaternion.y * quaternion.w + quaternion.x * quaternion.z), 
        1 - 2 * (quaternion.y * quaternion.y + quaternion.x * quaternion.x)
    );
    
    onChangeCB(lastYaw - yaw);
    lastYaw = yaw;
    
    // Neues Quaternion um die Y-Achse erstellen
    quaternion.setFromAxisAngle(yAxix, yaw);
    
    // Delta-Matrix zurücksetzen und reine Rotation anwenden
    D.identity();
    D.makeRotationFromQuaternion(quaternion);
}
```

```javascript
// Zeilen 246-250 in widgets.mjs
const delta = inWorld ? 
    inverseMesh.clone().multiply(inverseWorld).multiply(cursor.matrix).multiply(initialGrabbed) : 
    inverseMesh.clone().multiply(cursor.matrix).multiply(initialGrabbed);

limitToYRotation(delta); // Filtert alle Freiheitsgrade außer Y-Rotation heraus
knobMesh.matrix.copy(delta.multiply(initialMatrix));
```

---

## 5. Mauseingabe-Mapping (2D auf 3D)

Für Desktop-Debugging müssen 2D-Mausbewegungen auf dem Bildschirm ($\Delta x, \Delta y$ in Pixeln) in 3D-Transformationen (Translationen und Rotationen) des Cursors abgebildet werden.

### Mathematische Zuordnung

Die Änderungen werden skaliert mit $s_{mouse} = 0.001$:

- **Translation in XZ-Ebene (Linksklick):**
  
  $$\Delta x_{3D} = \Delta x \cdot s_{mouse}, \quad \Delta z_{3D} = \Delta y \cdot s_{mouse}$$

- **Translation in XY-Ebene (Rechtsklick):**
  
  $$\Delta x_{3D} = \Delta x \cdot s_{mouse}, \quad \Delta y_{3D} = -\Delta y \cdot s_{mouse}$$

- **Pitch- und Roll-Rotation (Ctrl + Linksklick):**
  
  $$\Delta \theta_x = \Delta y, \quad \Delta \theta_z = \Delta x$$

- **Pitch- und Yaw-Rotation (Alt + Linksklick):**
  
  $$\Delta \theta_x = \Delta y, \quad \Delta \theta_y = \Delta x$$

### Code-Schnipsel (aus [interaction2D.mjs](file:///c:/Repo/HSE/MCI/mci2-s26/25_ThreeJS_Widgets/js/interaction2D.mjs))

```javascript
// Zeilen 42-70 in interaction2D.mjs
const dx = event.movementX * MOVESCALE;
const dy = event.movementY * MOVESCALE;
const isRotation = event.ctrlKey;
const isYRotation = event.altKey;

// Translation (XZ)
if (!isRotation && !isYRotation && mouseButtons[1]) {
    cursor.position.x += dx;
    cursor.position.z += dy;
}
// Translation (XY)
if (!isRotation && !isYRotation && mouseButtons[3]) {
    cursor.position.x += dx;
    cursor.position.y += -dy;
}
// Rotation (X & Z)
if (isRotation && !isYRotation && mouseButtons[1]) {
    cursor.rotation.x += dy;
    cursor.rotation.z += dx;
}
// Rotation (X & Y)
if (isYRotation && !isRotation && mouseButtons[1]) {
    cursor.rotation.x += dy;
    cursor.rotation.y += dx;
}
```


