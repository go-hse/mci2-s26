
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

export function createUpath() {
    let upath = new Path2D();
    upath.moveTo(-2, -2);
    upath.lineTo(-2, 2);
    upath.lineTo(-1, 2);
    upath.lineTo(-1, -1);
    upath.lineTo(1, -1);
    upath.lineTo(1, 2);
    upath.lineTo(2, 2);
    upath.lineTo(2, -2);
    upath.closePath();
    return upath;
}

export function createArrowPath() {
    let upath = new Path2D();
    upath.moveTo(-1, -2);
    upath.lineTo(1, -2);
    upath.lineTo(1, 0);
    upath.lineTo(1.5, 0);
    upath.lineTo(0, 1.5);
    upath.lineTo(-1.5, 0);
    upath.lineTo(-1, 0);
    upath.closePath();
    return upath;
}


export function fillPath(ctx, path, x, y, sc, fillStyle = "#fff", strokeStyle = "#000", lineWidth = 0.1) {
    ctx.save();  // Speichern des Zustands mit der aktuellen Matrix auf Stack
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    const M = ctx.getTransform();

    ctx.fillStyle = fillStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.fill(path);
    ctx.stroke(path);
    ctx.restore(); // Holen der gespeicherten Matrix vom Stack

    return M;
}

export function fillPathTransform(ctx, path, T, fillStyle = "#fff", strokeStyle = "#000", lineWidth = 0.1) {
    ctx.save();  // Speichern des Zustands mit der aktuellen Matrix auf Stack
    ctx.setTransform(T);
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.fill(path);
    ctx.stroke(path);
    ctx.restore(); // Holen der gespeicherten Matrix vom Stack
}


export function getTransform(ctx, x, y, alpha = 0, scale = 1) {
    ctx.resetTransform();
    ctx.translate(x, y);
    ctx.rotate(alpha);
    ctx.scale(scale, scale);
    let L = ctx.getTransform();
    return L;
}


