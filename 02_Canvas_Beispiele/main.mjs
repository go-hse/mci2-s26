import { circle, line, getTime } from "./js/grafics.mjs"

window.onload = () => {
    const cnv = document.getElementById("cnv");
    const ctx = cnv.getContext("2d");

    function resize() {
        cnv.width = window.innerWidth;
        cnv.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);

    let alpha = 0;
    const anglePerSecond = Math.PI / 30;
    const anglePerHour = Math.PI / 6;

    function draw() {
        const inner = cnv.height * 0.4;
        const outer = cnv.height * 0.42;
        ctx.resetTransform();
        ctx.clearRect(0, 0, cnv.width, cnv.height);

        // Mitte des Fensters 
        ctx.translate(cnv.width / 2, cnv.height / 2);

        // 60 äußere Ticks
        for (let i = 0; i < 60; i++) {
            if (i % 5 === 0) {
                line(ctx, inner, 0, outer + 15, 0, "#000", 2);
            } else {
                line(ctx, inner, 0, outer, 0, "#000", 1);
            }
            ctx.rotate(anglePerSecond);
        }

        const { pHrs, pMin, pSec, hrs, min, sec } = getTime();

        // Zurücksetzen der Transformation in die Mitte
        ctx.save();
        // Rotation des Sekundenzeigers
        ctx.rotate(sec * Math.PI / 30);
        line(ctx, 0, 0, 0, -outer, "#f00", 1);
        ctx.restore();

        ctx.save();
        ctx.rotate(min * Math.PI / 30);
        line(ctx, 0, 0, 0, -outer, "#000", 3);
        ctx.restore();

        ctx.save();
        ctx.rotate(hrs * Math.PI / 6);
        line(ctx, 0, 0, 0, -outer / 2, "#000", 6);

        window.requestAnimationFrame(draw);
    }
    resize();
    draw();
}






