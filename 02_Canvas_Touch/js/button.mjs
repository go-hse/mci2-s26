import { circle } from "./grafics.mjs";

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}


export function createButton(x, y, radius, activeColor, passiveColor, cb) {
    let touched = false, identifier;

    function draw(ctx) {
        console.log("btn");
        if (touched)
            circle(ctx, x, y, radius, activeColor);
        else
            circle(ctx, x, y, radius, passiveColor);
    }

    function onTouchStart(id, pageX, pageY) {
        const d = distance(x, pageX, y, pageY);
        touched = d <= radius;
        if (touched)
            identifier = id;
    }

    function onTouchEnd(id) {
        if (id === identifier) {
            touched = false;
            identifier = undefined;
        }
    }

    return { draw, onTouchStart, onTouchEnd };
}