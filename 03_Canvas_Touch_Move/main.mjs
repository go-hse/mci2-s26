import { circle, line, createUpath } from "./js/grafics.mjs"
import { createFigure } from "./js/figure.mjs";
const fontSize = 36;

import { touchHandler } from "./js/touchHandler.mjs";


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

    touchHandler(cnv, interactivElements);


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

