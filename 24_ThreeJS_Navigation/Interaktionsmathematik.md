# Mathematische Grundlagen der Interaktionen im Three.js Navigations- und Interaktionsprojekt

Prompt: "Erstelle eine Markdown-Datei, in der die Mathematik der Interaktionen dieses Projekts erläutert wird."

Dieses Dokument erläutert die mathematischen Prinzipien, Koordinatentransformationen und Algorithmen, die für die 3D-Interaktionen (Greifen von Objekten, Greifen der Welt, Fliegen/Navigation, Raycasting und AR-Ebenenerkennung) in diesem Projekt verwendet werden.

---

## 1. Mathematische Grundlagen & Notation

In Three.js und der 3D-Computergrafik werden dreidimensionale Positionen und Orientierungen mithilfe von **homogenen Koordinaten** und **$4\times4$-Transformationsmatrizen** dargestellt. 

### 1.1 Homogene Koordinaten und Matrizen
Ein Punkt im 3D-Raum wird als 4D-Spaltenvektor dargestellt:
$$\vec{v} = \begin{pmatrix} x \\ y \\ z \\ 1 \end{pmatrix}$$

Eine affine Transformation (Kombination aus Rotation $R$, Translation $T$ und Skalierung $S$) wird durch eine Matrix $M \in \mathbb{R}^{4\times4}$ ausgedrückt:
$$M = \begin{pmatrix} 
R_{11}S_x & R_{12}S_y & R_{13}S_z & t_x \\
R_{21}S_x & R_{22}S_y & R_{23}S_z & t_y \\
R_{31}S_x & R_{32}S_y & R_{33}S_z & t_z \\
0 & 0 & 0 & 1
\end{pmatrix}$$

Die Transformation eines Vektors erfolgt durch Linksmultiplikation:
$$\vec{v}' = M \cdot \vec{v}$$

### 1.2 Verkettung von Transformationen
Werden mehrere Transformationen nacheinander auf ein Objekt angewendet (z. B. erst lokale Transformation $A$, dann die des übergeordneten Koordinatensystems $B$), so werden die Matrizen multipliziert. Die Auswertung erfolgt von rechts nach links:
$$\vec{v}' = B \cdot (A \cdot \vec{v}) = (B \cdot A) \cdot \vec{v}$$

In Three.js entspricht dies der Methode `matrix.multiply()` bzw. der hierarchischen Struktur von `Object3D`-Instanzen:
$$\text{Welt-Transformation} = \text{Eltern-Matrix} \cdot \text{Lokale Matrix}$$

---

## 2. Objekt-Interaktion: Greifen (Grab)

Das Greifen wird in [app.mjs](file:///c:/Repo/HSE/MCI/mci2-w25/24_ThreeJS_Navigation/app.mjs) durch Halten der Taste `Space` (bzw. des Triggers/Grab-Buttons auf dem VR-Controller) ausgelöst. Es unterscheidet zwischen dem Greifen eines konkreten 3D-Objekts und dem Greifen der gesamten Szene (Welt-Transformation).

### 2.1 Fall A: Greifen eines Objekts im Raum
Wenn der Interaktionsstrahl (Raycast) ein Objekt schneidet, wird dieses gegriffen. Das Ziel ist es, das Objekt relativ zum Controller (Cursor) starr zu fixieren, sodass es allen Bewegungen und Drehungen des Controllers 1-zu-1 folgt.

#### Initialisierung beim Drücken des Buttons (Start des Grab):
Beim Start des Greifens wird die relative Transformation zwischen dem Controller und dem Objekt berechnet und als `initialGrabbed` gespeichert:
1. Sei $C_0$ die Welt-Matrix des Cursors/Controllers zum Startzeitpunkt ($t=0$).
2. Sei $W_0$ die Welt-Matrix des übergeordneten Koordinatensystems der virtuellen Objekte (`world.matrix`) zum Startzeitpunkt.
3. Sei $O_0$ die lokale Transformationsmatrix des gegriffen Objekts relative zur virtuellen Welt (`grabbedObject.matrix`).
4. Die absolute Welt-Pose des Objekts ist somit $A_0 = W_0 \cdot O_0$.

Wir berechnen die Transformation von der Cursor-Pose zum Objekt in Weltkoordinaten:
$$\text{initialGrabbed} = I_g = C_0^{-1} \cdot W_0 \cdot O_0 = C_0^{-1} \cdot A_0$$

Der Code implementiert dies exakt so:
```javascript
inverseWorld = world.matrix.clone().invert(); // W_0^-1
initialGrabbed = cursor.matrix.clone().invert().multiply(world.matrix).multiply(grabbedObject.matrix);
```

#### Aktualisierung in jedem Frame (während des Haltens):
Bewegt sich der Controller zu einer neuen Matrix $C$, wollen wir die relative Transformation $I_g$ beibehalten. Die neue absolute Pose des Objekts $A$ muss sein:
$$A = C \cdot I_g$$

Da das Objekt ein Kind des `world`-Objekts ist, gilt für seine lokale Matrix $O$:
$$A = W \cdot O \implies O = W^{-1} \cdot A$$

Unter der Annahme, dass sich die virtuelle Welt während des Objekt-Greifens nicht verschiebt ($W = W_0$), ergibt sich für die lokale Matrix des Objekts:
$$O = W_0^{-1} \cdot C \cdot I_g$$

Dies entspricht dem Code:
```javascript
grabbedObject.matrix.copy(inverseWorld.clone().multiply(cursor.matrix).multiply(initialGrabbed));
```

#### Mathematischer Beweis der 1-zu-1-Bewegung:
Setzen wir $I_g$ in die Gleichung ein:
$$O = W_0^{-1} \cdot C \cdot (C_0^{-1} \cdot W_0 \cdot O_0)$$
Die neue absolute Pose des Objekts $A$ ist:
$$A = W_0 \cdot O = W_0 \cdot W_0^{-1} \cdot C \cdot C_0^{-1} \cdot W_0 \cdot O_0 = C \cdot C_0^{-1} \cdot A_0$$
Definieren wir die relative Bewegung des Controllers als $\Delta C = C \cdot C_0^{-1}$, so gilt:
$$A = \Delta C \cdot A_0$$
Das Objekt vollzieht also exakt dieselbe Bewegung wie der Controller im Raum.

---

### 2.2 Fall B: Greifen der Welt (World Grab / Drag)
Trifft der Strahl beim Greifen kein Objekt, greift der Nutzer die gesamte virtuelle Welt (`world`). Dies erlaubt es, die Szene per Handbewegung zu verschieben und zu drehen.

#### Initialisierung beim Drücken des Buttons:
Hier wird die relative Transformation zwischen dem Controller und der virtuellen Welt direkt berechnet:
$$I_g = C_0^{-1} \cdot W_0$$
Code:
```javascript
grabbedObject = world;
initialGrabbed = cursor.matrix.clone().invert().multiply(world.matrix);
```

#### Aktualisierung in jedem Frame:
Bei Bewegung des Cursors nach $C$ wird die Welt-Matrix $W$ aktualisiert:
$$W = C \cdot I_g$$
Substituiert ergibt dies:
$$W = C \cdot C_0^{-1} \cdot W_0 = \Delta C \cdot W_0$$
Die gesamte Szene wird somit analog zur Controllerbewegung verschoben und rotiert.
Code:
```javascript
world.matrix.copy(cursor.matrix.clone().multiply(initialGrabbed));
```

---

## 3. Navigation: Fliegen (Fly / Squeeze)

Wird der Squeeze-Button gedrückt, wechselt das System in den Navigationsmodus. Dieser nutzt eine **Joystick-Metapher** (geschwindigkeitsbasierte Steuerung / Velocity-based Control): Der Abstand und die Drehung des Controllers relativ zur ursprünglichen Position beim Drücken des Buttons bestimmen die Fluggeschwindigkeit und Rotationsrate der Kamera.

### 3.1 Initialisierung beim Drücken
Beim Drücken des Squeeze-Buttons wird die inverse Matrix des Controllers gespeichert:
$$\text{inverseHand} = C_0^{-1}$$
Code:
```javascript
inverseHand = cursor.matrix.clone().invert();
```

### 3.2 Berechnung der Abweichung (Joystick-Ausschlag)
In jedem Frame wird die Differenzmatrix $D$ zwischen der aktuellen Controller-Pose $C$ und der Start-Pose $C_0$ berechnet:
$$D = C \cdot C_0^{-1}$$
Code:
```javascript
let differenceHand = cursor.matrix.clone().multiply(inverseHand);
```

Diese Matrix $D$ wird anschließend mittels Matrix-Dekomposition in ihre Bestandteile zerlegt:
- Translation $\vec{t}$ (Verschiebungsvektor aus der Startposition)
- Rotation $q$ (Quaternion der relativen Drehung)
- Skalierung $\vec{s}$
```javascript
differenceHand.decompose(position, rotation, scale);
```

### 3.3 Translation und Skalierung der Geschwindigkeit
Der Verschiebungsvektor $\vec{t}$ (im Code als `position` bezeichnet) wird mit einem Skalierungsfaktor multipliziert:
$$\vec{t}_{\Delta} = \vec{t} \cdot \beta_{trans}$$
mit $\beta_{trans} = -0.02$ (`flySpeedTranslationFactor`). 
*Das negative Vorzeichen bewirkt, dass ein Verschieben des Controllers nach vorne (positive Translation relativ zum Startpunkt) die Welt nach hinten verschiebt. Dies erzeugt für den Nutzer die optische Wirkung, nach vorne zu fliegen.*

### 3.4 Rotationssteuerung und Schutz vor Motion Sickness
Um Übelkeit (Simulator Sickness) in VR zu vermeiden, ist es von entscheidender Bedeutung, unkontrollierte Rotationen um die Roll- (Z) und Nick-Achse (X) beim Fliegen zu verhindern. Der Horizont des Nutzers muss stabil bleiben. Daher wird die Rotation wie folgt gefiltert:

1. **Skalierung der Rotation:**
   Die relative Rotation $q$ wird invertiert (konjugiert, da die Welt entgegengesetzt zur Hand rotieren soll) und über eine sphärische lineare Interpolation (Slerp) mit einem Dämpfungsfaktor $\alpha_{rot} = 0.01$ (`flySpeedRotationFactor`) skaliert:
   $$q_{\Delta} = \text{Slerp}(I, q^{-1}, \alpha_{rot})$$
   wobei $I$ das Identitäts-Quaternion $(0,0,0,1)$ ist.
   ```javascript
   deltaFlyRotation.set(0, 0, 0, 1);
   deltaFlyRotation.slerp(rotation.conjugate(), flySpeedRotationFactor);
   ```

2. **Rotationsbeschränkung auf Gier-Achse (Yaw-only):**
   Das Quaternion $q_{\Delta}$ wird in Euler-Winkel überführt, um Nick- (Pitch) und Roll-Winkel zu eliminieren:
   $$\text{Euler}(x, y, z) = \text{toEuler}(q_{\Delta})$$
   Wir setzen die Rotation um die X-Achse (Pitch) und Z-Achse (Roll) auf $0$:
   $$x' = 0, \quad z' = 0, \quad y' = y$$
   Daraus wird das neue gefilterte Quaternion $q_{\Delta}'$ erzeugt:
   $$q_{\Delta}' = \text{fromEuler}(0, y, 0)$$
   ```javascript
   euler.setFromQuaternion(deltaFlyRotation);
   euler.x = 0;
   euler.z = 0;
   deltaFlyRotation.setFromEuler(euler);
   ```

### 3.5 Aktualisierung der Welt-Matrix (Premultiplikation)
Aus der skalierten Translation $\vec{t}_{\Delta}$ und der gefilterten Rotation $q_{\Delta}'$ wird die inkrementelle Bewegungsmatrix $M_{\Delta}$ zusammengesetzt:
```javascript
differenceMatrix.compose(position.multiplyScalar(flySpeedTranslationFactor), deltaFlyRotation, scale);
```

Da sich der Controller im übergeordneten Tracking-Raum (Szenenkoordinaten) bewegt, muss diese Bewegung auch im Tracking-Raum auf die Welt angewendet werden. Mathematisch bedeutet dies eine **Premultiplikation** (Linksmultiplikation) der Weltmatrix $W$:
$$W_{k+1} = M_{\Delta} \cdot W_k$$
Code:
```javascript
world.matrix.premultiply(differenceMatrix);
```
Dadurch, dass dieser Schritt in jedem Render-Frame ausgeführt wird, addieren sich die kleinen Transformationen $M_{\Delta}$ kontinuierlich auf, was zu einer flüssigen Flugbewegung führt. Je weiter der Controller aus seiner Ausgangsposition wegbewegt wird, desto größer wird $\vec{t}$ und somit auch die Fluggeschwindigkeit (Joystick-Effekt).

---

## 4. Strahl-Interaktion (Raycasting)

Um Objekte aus der Ferne auszuwählen, wird ein virtueller Strahl vom Controller ausgesendet.

### 4.1 Mathematische Definition des Strahls
Ein Strahl $\vec{r}(t)$ wird durch einen Startpunkt $\vec{p}$ und einen Richtungsvektor $\vec{d}$ definiert:
$$\vec{r}(t) = \vec{p} + t \cdot \vec{d}, \quad t \ge 0$$

- **Startpunkt $\vec{p}$**: Entspricht der Position des Controllers (`cursor.matrix.decompose` liefert die Position).
- **Richtung $\vec{d}$**: 
  - Im VR-Modus zeigt der Strahl standardmäßig entlang der negativen Z-Achse des Controllers: $\vec{d}_{local} = (0, 0, -1)^T$.
  - Diese lokale Richtung wird mit dem Rotationsquaternion $q_{cursor}$ des Controllers in Weltkoordinaten transformiert:
    $$\vec{d}_{world} = q_{cursor} \cdot \vec{d}_{local} \cdot q_{cursor}^{-1}$$
  
Code in `app.mjs`:
```javascript
cursor.matrix.decompose(position, rotation, scale);
direction.set(0, 0, -1); // lokale Richtung
direction.applyQuaternion(rotation); // Transformation in Weltrichtung
```

### 4.2 Strahl-Dreieck-Schnitttest (Ray-Triangle Intersection)
Die mathematische Prüfung, ob der Strahl ein 3D-Mesh schneidet, basiert auf dem Testen aller Dreiecke des Meshes. Ein häufig genutztes Verfahren hierfür ist der **Möller-Trumbore-Algorithmus**:

Ein Punkt $T(u, v)$ auf einem Dreieck mit den Eckpunkten $V_0, V_1, V_2$ wird mithilfe von baryzentrischen Koordinaten dargestellt:
$$T(u, v) = (1 - u - v)V_0 + uV_1 + vV_2, \quad u \ge 0, v \ge 0, u+v \le 1$$

Gleichsetzen von Strahl und Dreiecksebene liefert:
$$\vec{p} + t\vec{d} = (1 - u - v)V_0 + uV_1 + vV_2$$

Dies führt zu einem linearen Gleichungssystem für die Unbekannten $t$, $u$ und $v$:
$$\begin{pmatrix} -\vec{d} & V_1 - V_0 & V_2 - V_0 \end{pmatrix} \begin{pmatrix} t \\ u \\ v \end{pmatrix} = \vec{p} - V_0$$

Dieses System wird mithilfe der Cramerschen Regel effizient nach $t, u, v$ gelöst. Ein Schnittpunkt liegt vor, wenn:
1. $t \ge 0$ (Schnittpunkt liegt vor dem Raycaster)
2. $u \ge 0, v \ge 0$ und $u + v \le 1$ (Schnittpunkt liegt innerhalb des Dreiecks)

Three.js führt diese Berechnung im Hintergrund durch (`raycaster.intersectObjects(objects)`), sortiert die getroffenen Objekte nach ihrer Distanz $t$ und gibt das Objekt mit dem kleinsten $t$ zurück.

---

## 5. AR-Ebenendetektion & Polygon-Fitting

Im AR-Modus ([js/ar.mjs](file:///c:/Repo/HSE/MCI/mci2-w25/24_ThreeJS_Navigation/js/ar.mjs)) werden reale Oberflächen (z. B. Fußböden oder Tische) erkannt.

### 5.1 Bounding Box des Polygons
Die AR-API liefert für eine erkannte Ebene ein 2D-Polygon (eine Liste von Punkten auf der Ebene). Um eine einfache 3D-Geometrie zur Visualisierung zu erstellen, wird die minimale achsenparallele Begrenzungsbox (Axis-Aligned Bounding Box, AABB) in der lokalen 2D-Ebene (x-z-Ebene) berechnet:

1. Initialisiere Grenzen:
   $$x_{min} = \infty, \quad x_{max} = -\infty, \quad z_{min} = \infty, \quad z_{max} = -\infty$$
2. Für jeden Punkt $\vec{p}_i = (x_i, z_i)$ des Polygons:
   $$x_{min} = \min(x_{min}, x_i), \quad x_{max} = \max(x_{max}, x_i)$$
   $$z_{min} = \min(z_{min}, z_i), \quad z_{max} = \max(z_{max}, z_i)$$
3. Breite $w$ und Tiefe $h$ der Ebene ergeben sich als:
   $$w = x_{max} - x_{min}, \quad h = z_{max} - z_{min}$$

Code:
```javascript
for (const point of polygon) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minZ = Math.min(minZ, point.z);
    maxZ = Math.max(maxZ, point.z);
}
const width = maxX - minX;
const height = maxZ - minZ;
```

Anschließend wird eine Box-Geometrie mit sehr geringer Dicke (y-Dimension $= 0.0001\,\text{m}$) erstellt:
```javascript
const geometry = new THREE.BoxGeometry(width, 0.0001, height);
```

### 5.2 Transformation der Ebene
Die Ebene besitzt eine von WebXR gelieferte Raum-Matrix (`planeSpace`), welche ihre Position und Ausrichtung (Normale) im Raum beschreibt. Die Geometrie wird mit dieser Matrix transformiert:
```javascript
const pose = frame.getPose(plane.planeSpace, referenceSpace);
mesh.matrix.fromArray(pose.transform.matrix);
```
Dadurch liegt das visualisierte Rechteck exakt deckungsgleich auf der physikalisch erkannten Oberfläche.
