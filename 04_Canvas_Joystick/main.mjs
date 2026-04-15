import { circle, line } from "./js/grafics.mjs"
import { createButton } from "./js/button.mjs";
const fontSize = 36;


window.onload = () => {
    let cnv = document.getElementById("cnv");
    let ctx = cnv.getContext("2d");

    function resize() {
        cnv.width = window.innerWidth;
        cnv.height = window.innerHeight;
    }
    addEventListener("resize", resize);

    const buttons = [];
    buttons.push(createButton(100, 100, 50, "white", "gray"));

    const Touches = new Map();

    cnv.addEventListener("touchstart", (evt) => {
        evt.preventDefault();
        for (let t of evt.changedTouches) {
            for (const btn of buttons) {
                btn.onTouchStart(t.identifier, t.pageX, t.pageY);
            }
            console.log(`add ${t.identifier}`);
            Touches.set(t.identifier, {
                x: t.pageX,
                y: t.pageY,
            });


        }
    }, true);


    cnv.addEventListener("touchmove", (evt) => {
        evt.preventDefault();
        for (let t of evt.changedTouches) {
            console.log(`move ${t.identifier}`);
            Touches.set(t.identifier, {
                x: t.pageX,
                y: t.pageY,
            });
        }
    }, true);

    cnv.addEventListener("touchend", (evt) => {
        evt.preventDefault();
        for (let t of evt.changedTouches) {
            for (const btn of buttons) {
                btn.onTouchEnd(t.identifier, t.pageX, t.pageY);
            }
            console.log(`end ${t.identifier}`);
            Touches.delete(t.identifier);
        }
    }, true);


    function draw() {
        ctx.resetTransform();
        ctx.clearRect(0, 0, cnv.width, cnv.height);


        ctx.font = `${fontSize}px monospace`;

        for (const [identifier, coords] of Touches) {
            circle(ctx, coords.x, coords.y, 40, "#f00");
            ctx.fillStyle = "#000";
            ctx.fillText(`f${identifier}`, coords.x - 20, coords.y + fontSize / 2);

        }

        for (const btn of buttons) {
            btn.draw(ctx);
        }

        window.requestAnimationFrame(draw);
    }
    resize();
    draw();
}

