export function drawCheckbox(ctx, x, y, w, h, checked = false, options = {}) {
    const {
        radius = h / 2,
        bgOn = '#34D399',       // grün (aktiv)
        bgOff = '#CBD5E1',      // grau (inaktiv)
        circleColor = '#fff',   // Farbe des Kreises
        borderColor = 'rgba(0,0,0,0.1)',
        shadow = true
    } = options;

    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = borderColor;

    // Hintergrund (abgerundete Kapsel)
    const bgColor = checked ? bgOn : bgOff;
    ctx.fillStyle = bgColor;
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.stroke();

    // Kreisposition
    const circleRadius = h / 2 - 3;
    const circleX = checked ? x + w - circleRadius - 3 : x + circleRadius + 3;
    const circleY = y + h / 2;

    // Schatten unter dem Kreis
    if (shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 1;
    }

    // Kreis
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = circleColor;
    ctx.fill();

    ctx.restore();
}

// Hilfsfunktion für abgerundetes Rechteck
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
