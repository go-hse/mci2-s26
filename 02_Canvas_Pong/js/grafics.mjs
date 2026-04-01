
const END_ANGLE = Math.PI * 2;

export function circle(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, END_ANGLE, true);
    ctx.fill();
}

export function line(ctx, x1, y1, x2, y2, strokeStyle = "#fff", lineWidth = 1) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}


/**
 * Zeichnet einen Ball mit 3D-Effekt auf das Canvas.
 * @param {CanvasRenderingContext2D} ctx - Der 2D-Kontext des Canvas.
 * @param {number} x - Die x-Koordinate des Mittelpunkts.
 * @param {number} y - Die y-Koordinate des Mittelpunkts.
 * @param {number} [radius=20] - Der Radius des Balls.
 */
export function ball(ctx, x, y, radius = 20) {
    const gradient = ctx.createRadialGradient(
        x - radius * 0.3,   // Startkreis
        y - radius * 0.3,   // Startkreis
        radius * 0.05,      // Startkreis
        x,                  // Endkreis
        y,                  // Endkreis
        radius              // Endkreis    
    );

    // Farben für den 3D-Effekt hinzufügen
    gradient.addColorStop(0, '#ffffff'); // Glanzpunkt (weiß)
    gradient.addColorStop(0.2, '#a498db'); // Hauptfarbe (blau)
    gradient.addColorStop(1, '#1a5276'); // Schattenbereich (dunkelblau)

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}