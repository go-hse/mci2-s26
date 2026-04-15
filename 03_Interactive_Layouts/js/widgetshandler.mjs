import { hasMethods } from "./utils.mjs"


// Gibt Touch-Events an Widgets weiter

export function WidgetsHandler(cnv) {
    const widgets = [];

    cnv.addEventListener("touchstart", (ev) => {
        ev.preventDefault();
        for (let t of ev.changedTouches) {
            widgets.forEach(w => w.isTouched(t.identifier, t.pageX, t.pageY));
        }
    });

    cnv.addEventListener("touchend", (ev) => {
        ev.preventDefault();
        for (let t of ev.changedTouches) {
            widgets.forEach(w => w.reset(t.identifier));
        }
    });

    cnv.addEventListener("touchmove", (ev) => {
        ev.preventDefault();
        for (let t of ev.changedTouches) {
            widgets.forEach(w => w.move(t.identifier, t.pageX, t.pageY));
        }
    });

    function addWidget(widget) {
        if (hasMethods(widget, ["isTouched", "reset", "move", "draw"])) {
            widgets.push(widget);
        } else {
            console.log("cannot add widget", widget);
        }
    }

    return { addWidget };
}