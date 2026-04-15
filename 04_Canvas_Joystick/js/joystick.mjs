import { createArrowPath, circle, getTransform, fillPathTransform } from "./grafics.mjs";

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function createJoystick(ctx, x, y) {
    let f1, f2;

    const radius = 80, actionRadius = radius / 4;;
    const cx = radius;
    const speedScale = -0.001;

    let cy = ctx.canvas.height - radius;

    const arrowPath = createArrowPath();
    let arrowTransform = getTransform(ctx, x, y, Math.PI, 20);  // L: lokales Koordsys

    function draw(ctx) {
        circle(ctx, cx, cy, radius, "white");

        if (f1) {
            circle(ctx, f1.x, f1.y, radius / 10, "red");
            if (f2) {
                circle(ctx, f2.x, f2.y, radius / 10, "red");
                const dx = (f2.x - f1.x);
                const dy = (f2.y - f1.y);

                arrowTransform.translateSelf(dx * speedScale, dy * speedScale);
                if (f1.alpha !== undefined) {
                    const alpha = Math.atan2(dy, dx);
                    const deltaAlpha = normalizeAngleDiff(alpha, f1.alpha);
                    arrowTransform.rotateSelf(deltaAlpha);
                }
            }
            fillPathTransform(ctx, arrowPath, arrowTransform, "red");
        }
        else
            fillPathTransform(ctx, arrowPath, arrowTransform, "green");
    }

    function onTouchStart(id, pageX, pageY) {
        if (f1 === undefined) {
            if (distance(pageX, pageY, cx, cy) < radius) {
                f1 = { id, x: pageX, y: pageY };
            }
        }
    }

    function onTouchEnd(id) {
        if (f1 && f1.id === id) {
            f1 = undefined;
            f2 = undefined;
        }
    }

    function onTouchMove(id, pageX, pageY) {
        if (f1 && f1.id === id) {
            f2 = { id, x: pageX, y: pageY };
            const d = distance(pageX, pageY, f1.x, f1.y);
            if (d > actionRadius && f1.alpha === undefined) {
                const dx = (f2.x - f1.x);
                const dy = (f2.y - f1.y);
                f1.alpha = Math.atan2(dy, dx);
            }

        }
    }

    function onResize(w, h) {
        cy = ctx.canvas.height - radius;
        console.log("Joystick", ctx.canvas.height, cy);

    }



    return { draw, onResize, onTouchStart, onTouchEnd, onTouchMove };
}

function normalizeAngleDiff(alpha, beta) {
    let diff = alpha - beta;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
}
