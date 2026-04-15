import { Item } from "./items.mjs";

export function Lines(ctx) {
    let active, identifier, lines = [], lineColor = "#f00";

    const item = Item();

    function draw() {
        const { x, y, width, height } = item.get();
        if (lines.length > 0) {
            ctx.lineWidth = 5;
            ctx.beginPath();
            for (let line of lines) {
                if (!line.move) {
                    ctx.lineTo(line.x, line.y);
                } else {
                    ctx.stroke();
                    ctx.strokeStyle = line.c;
                    ctx.beginPath();
                    ctx.moveTo(line.x, line.y);
                }
            }
            ctx.stroke();
        }
    }

    function isTouched(id, tx, ty) {
        active = item.hit(tx, ty);
        if (active === true) {
            identifier = id;
            lines.push({
                x: tx,
                y: ty,
                c: lineColor,
                move: true
            });
        }
    }

    function move(id, tx, ty) {
        if (identifier === id) {
            active = item.hit(tx, ty);
            if (active === true) {
                lines.push({
                    x: tx,
                    y: ty,
                    c: lineColor,
                    move: false
                });
            } else {
                identifier = undefined;
            }
        }
    }

    function setColor(c) {
        lineColor = c;
    }

    function clearLines() {
        lines = [];
    }

    function reset(id) {
        if (id === identifier) {
            identifier = undefined;
        }
    }

    return { draw, isTouched, reset, move, set: item.set, setColor, clearLines };
}
