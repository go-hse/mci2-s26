import { getTime } from "./utils.mjs";


const END_ANGLE = Math.PI * 2;

export function circle(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, END_ANGLE, true);
    ctx.fill();
}

const fontSize = 12;


// Item, das die aktuelle Größe anzeigt 
export function InfoBox(ctx, width, height, info) {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";

    ctx.fillRect(0, 0, width, height);
    ctx.strokeRect(0, 0, width, height);

    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = "#000";

    const text = `${info} ${width.toFixed(0)}x${height.toFixed(0)}`;
    const bb = ctx.measureText(text);
    const bbheight = bb.actualBoundingBoxAscent + bb.actualBoundingBoxDescent;
    ctx.fillText(text, width / 2 - bb.width / 2, height / 2 + bbheight / 2);
}

export function Pong() {
    let ballX = 10, ballY = 10, speedX = 1, speedY = 1;

    function draw(ctx, width, height) {
        const min = width < height ? width : height;
        const radius = min / 10;
        circle(ctx, ballX, ballY, radius, "#f00");

        ballX += speedX;
        ballY += speedY;

        if (ballX + radius > width || ballX - radius < 0) speedX *= -1;
        if (ballY + radius > height || ballY - radius < 0) speedY *= -1;
    }

    function set(nx, ny, nw, nh) {
        ballX = nw / 3;
        ballY = nh / 2;
    }

    return { draw, set };
}

export function Clock() {
    function pointer(ctx, angle, length, strokeStyle, lineWidth) {
        ctx.save(); // Zustand wird auf Stack gespeichert
        ctx.rotate(angle);  // ganze Drehung: 2 PI; 1 Sekunde = PI / 30
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.restore(); // Zustand wird von Stack wieder hergestellt
    }

    function draw(ctx, width, height) {
        const { pHrs, pMin, pSec, hrs, min, sec } = getTime();
        const radius = width < height ? width / 2 : height / 2;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        pointer(ctx, sec * Math.PI / 30, radius, "#000", 1);
        pointer(ctx, min * Math.PI / 30, radius, "#000", 2);
        pointer(ctx, hrs * Math.PI / 6 + (Math.PI / 360) * min, radius * 0.8, "#000", 3);

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000";
        for (let i = 0; i < 60; ++i) {
            const start = i % 5 === 0 ? radius * 0.8 : radius * 0.95;
            ctx.beginPath();
            ctx.moveTo(0, start);
            ctx.lineTo(0, radius);
            ctx.stroke();
            ctx.rotate(Math.PI / 30);
        }
    }
    return { draw };
}



