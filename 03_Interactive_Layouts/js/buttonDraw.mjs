export function drawButton(ctx, x, y, w, h, label, isPressed = false, options = {}) {
    const {
        radius = 10,
        bg_from = '#4F46E5',
        bg_to = '#3B82F6',
        textColor = '#fff',
        font = '16px sans-serif',
        shadow = { x: 0, y: 4, blur: 10, color: 'rgba(0,0,0,0.25)' },
        borderColor = 'rgba(255,255,255,0.2)',
        bgColor = "#fff"
    } = options;

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    ctx.save();

    // Wenn gedrückt: Button wirkt "tiefer"
    const offsetY = isPressed ? 2 : 0;

    // Schatten
    ctx.shadowOffsetX = shadow.x;
    ctx.shadowOffsetY = shadow.y;
    ctx.shadowBlur = shadow.blur;
    ctx.shadowColor = shadow.color;

    // Farbverlauf (etwas dunkler, wenn gedrückt)
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    const adjustColor = (col, amount) => {
        const num = parseInt(col.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, ((num >> 16) & 255) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amount));
        const b = Math.max(0, Math.min(255, (num & 255) + amount));
        return `rgb(${r},${g},${b})`;
    };
    const top = isPressed ? adjustColor(bg_from, -20) : bg_from;
    const bottom = isPressed ? adjustColor(bg_to, -20) : bg_to;

    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);

    // Hintergrund zeichnen
    roundRect(ctx, x, y + offsetY, w, h, radius);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Text
    ctx.font = font;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + offsetY);

    ctx.restore();
}

