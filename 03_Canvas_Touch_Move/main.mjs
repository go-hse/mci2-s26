import { circle, line, createUpath } from "./js/grafics.mjs"
import { createFigure } from "./js/figure.mjs";
const fontSize = 36;


window.onload = () => {
    let cnv = document.getElementById("cnv");
    let ctx = cnv.getContext("2d");

    function resize() {
        cnv.width = window.innerWidth;
        cnv.height = window.innerHeight;
    }
    addEventListener("resize", resize);

    const interactivElements = [];
    interactivElements.push(createFigure(ctx, 100, 100));

    const Touches = new Map();

    cnv.addEventListener("touchstart", (evt) => {
        evt.preventDefault();
        for (let t of evt.changedTouches) {
            for (const btn of interactivElements) {
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
            for (const btn of interactivElements) {
                btn.onTouchEnd(t.identifier, t.pageX, t.pageY);
            }
            console.log(`end ${t.identifier}`);
            Touches.delete(t.identifier);
        }
    }, true);


    function draw() {
        ctx.resetTransform();
        ctx.clearRect(0, 0, cnv.width, cnv.height);


        for (const ie of interactivElements) {
            ie.draw(ctx);
        }

        window.requestAnimationFrame(draw);
    }
    resize();
    draw();
}

