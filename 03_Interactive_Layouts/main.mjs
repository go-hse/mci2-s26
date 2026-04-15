// import * as lib from "./js/funcs.mjs";

import { DrawPong, DrawInfo, DrawClock } from "./js/items.mjs"
import { HorizontalLayout, VerticalLayout, ToggleLayout } from "./js/layout.mjs"
import { WidgetsHandler } from "./js/widgetshandler.mjs";
import { Button } from "./js/widgets.mjs";
import { Checkbox } from "./js/widgets.mjs";
import { Fingers } from "./js/finger.mjs";
import { Lines } from "./js/lines.mjs";

function fullScreen(enabled) {
    if (enabled) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Fehler beim Aktivieren des Vollbildmodus: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

window.onload = () => {

    // Canvas-Element und Context als API zum Zeichnen
    const cnv = document.getElementById("cnv");
    const ctx = cnv.getContext("2d");

    // Widgets reagieren auf Touch-Events
    const widgets = WidgetsHandler(cnv);
    const interactiveLines = Lines(ctx);
    const interactiveFingers = Fingers(ctx);

    const greenButton = Button(ctx, () => {
        interactiveLines.setColor("#0f0")
        interactiveFingers.setColor("#0f0")
    }, "Green", "#3f3", "#262");
    const redButton = Button(ctx, () => {
        interactiveLines.setColor("#f00")
        interactiveFingers.setColor("#f00")
    }, "Red", "#f33", "#622");

    const clearButton = Button(ctx, () => {
        interactiveLines.clearLines();
    }, "Clear", "#33f", "#226");

    const testCheckBox = Checkbox(ctx, fullScreen, "#aaa", "#ccc");

    widgets.addWidget(greenButton);
    widgets.addWidget(redButton);
    widgets.addWidget(clearButton);

    widgets.addWidget(testCheckBox);
    widgets.addWidget(interactiveLines);
    widgets.addWidget(interactiveFingers);

    // Layouts: steuern die Größen der Widgets im Fenster
    const mainLayout = VerticalLayout(ctx, "main");

    // resize: wird bei Größenänderungen des Fensters und initial aufgerufen
    // setzt Größe des Haupt-Layouts
    function resize() {
        console.log("resize set", window.innerWidth, window.innerHeight);
        cnv.width = window.innerWidth;
        cnv.height = window.innerHeight;
        mainLayout.set(0, 0, window.innerWidth, window.innerHeight);

    }

    window.addEventListener("resize", resize);

    // 2 Layouts der 1. Hierarchieebene
    const menuLayout = HorizontalLayout(ctx, "menu");
    const contentLayout = ToggleLayout(ctx, "content");

    mainLayout.addChild(menuLayout, 2.5);
    mainLayout.addChild(contentLayout, 10);

    // Menü mit Uhr und Button-Layout
    menuLayout.addChild(DrawClock(ctx), 2);
    menuLayout.addChild(DrawPong(ctx, "Pong"), 9);

    // Button-Layout schaltet zwischen Horizontal und Vertikal-Layout um
    const buttonLayout = ToggleLayout(ctx, "buttons", 1.5);
    buttonLayout.addChild(greenButton, 1);
    buttonLayout.addChild(redButton, 1);
    buttonLayout.addChild(clearButton, 1);
    buttonLayout.addChild(testCheckBox, 2);
    menuLayout.addChild(buttonLayout, 2);

    // contentLayout.addChild(DrawPong(ctx, "content"), 1);
    contentLayout.addChild(interactiveLines);
    contentLayout.addChild(interactiveFingers);

    function draw() {
        ctx.resetTransform();
        ctx.clearRect(0, 0, cnv.width, cnv.height);

        mainLayout.draw();
        window.requestAnimationFrame(draw);
    }
    resize();
    draw();
}


// window.onload = Init
// addEventListener("load", Init);


