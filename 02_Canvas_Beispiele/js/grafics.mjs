
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


export function getTime() {
    const now = new Date();
    const sec = now.getSeconds();
    const min = now.getMinutes();
    let hrs = now.getHours();
    if (hrs >= 12) hrs -= 12;
    return {
        sec,
        min,
        hrs,
        pSec: sec.toString().padStart(2, "0"),
        pMin: min.toString().padStart(2, "0"),
        pHrs: hrs.toString().padStart(2, "0")
    };
}
