import { Item } from "./items.mjs";
import { circle } from "./graphics.mjs";

export function Fingers(ctx) {
    let active, fingers = {}, color = "#f00";;

    const item = Item();

    function set(nx, ny, nw, nh) {
        item.set(nx, ny, nw, nh);
    }

    function draw() {
        const { x, y, width, height } = item.get();
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);


        for (const id in fingers) {
            circle(ctx, fingers[id].x, fingers[id].y, 10, color);
        }
    }

    function isTouched(id, tx, ty) {
        active = item.hit(tx, ty);
        if (active === true) {
            fingers[id] = { x: tx, y: ty };
        }
        return active;
    }

    function reset(id) {
        if (fingers[id]) {
            delete fingers[id]
        }
    }

    function setColor(c) {
        color = c;
    }


    return { draw, isTouched, reset, move: isTouched, set, setColor };
}
