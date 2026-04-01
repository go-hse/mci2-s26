import { circle, line, ball } from "./js/grafics.mjs"

window.onload = () => {
    const cnv = document.getElementById("cnv");
    const ctx = cnv.getContext("2d");

    const maxSpeed = 5, radius = 40;
    let ballX, ballY, speedX = maxSpeed, speedY = maxSpeed;

    function resize() {
        cnv.width = window.innerWidth;
        cnv.height = window.innerHeight;
        ballX = cnv.width / 3;
        ballY = cnv.height / 3
    }
    window.addEventListener("resize", resize);


    function draw() {
        ctx.resetTransform();
        ctx.clearRect(0, 0, cnv.width, cnv.height);

        ball(ctx, ballX, ballY, radius);
        ballX += speedX;
        ballY += speedY;

        if (ballX + radius > cnv.width || ballX - radius < 0) speedX *= -1;
        if (ballY + radius > cnv.height || ballY - radius < 0) speedY *= -1;

        window.requestAnimationFrame(draw);
    }
    resize();
    draw();
}






