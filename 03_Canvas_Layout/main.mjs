import { circle, line } from "./js/grafics.mjs"
import { createButton } from "./js/button.mjs";
const fontSize = 36;


import { renderLayout, computeLayout, createNode, LayoutType } from "./js/layout.mjs";

window.onload = () => {
    let cnv = document.getElementById("cnv");
    let ctx = cnv.getContext("2d");

    let calculated;

    function resize() {
        cnv.width = window.innerWidth;
        cnv.height = window.innerHeight;
        calculated = computeLayout(myLayout, 0, 0, cnv.width, cnv.height);
    }
    addEventListener("resize", resize);

    const myLayout = createNode({
        type: LayoutType.ROW,
        padding: 10,
        children: [
            createNode({ color: '#ffadad' }),
            createNode({
                type: LayoutType.COLUMN,
                children: [
                    createNode({ color: '#caffbf' }),
                    createNode({ color: '#fdffb6' })
                ]
            })
        ]
    });




    function draw() {
        ctx.resetTransform();
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        renderLayout(ctx, calculated);
        window.requestAnimationFrame(draw);
    }
    resize();
    draw();
}

