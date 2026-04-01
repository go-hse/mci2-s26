import { circle, line } from "./js/grafics.mjs"

window.onload = () => {
    const cnv = document.getElementById("cnv");
    const ctx = cnv.getContext("2d");

    function resize() {
        cnv.width = window.innerWidth;
        cnv.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);

    function draw() {
        ctx.resetTransform();
        ctx.clearRect(0, 0, cnv.width, cnv.height);

        ctx.fillStyle = "red";
        ctx.fillRect(100, 100, 200, 20);

        window.requestAnimationFrame(draw);
    }
    resize();
    draw();
}






