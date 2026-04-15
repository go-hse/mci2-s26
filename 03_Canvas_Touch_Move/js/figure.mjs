import { createUpath, fillPath } from "./grafics.mjs";



export function createFigure(ctx, x, y) {
    let touched = false, identifier, M;

    const uPath = createUpath();


    function draw(ctx) {
        // M: Transformations-Matrix mit Verschiebung, Skalierung
        if (touched)
            M = fillPath(ctx, uPath, 100, 100, 40, "red");
        else
            M = fillPath(ctx, uPath, 100, 100, 40, "green");
    }

    function onTouchStart(id, pageX, pageY) {
        const I = (new DOMMatrix(M)).invertSelf();
        const L = I.transformPoint(new DOMPoint(pageX, pageY));
        touched = ctx.isPointInPath(uPath, L.x, L.y);
        if (touched) identifier = id;
    }

    function onTouchEnd(id) {
        if (id === identifier) {
            touched = false;
            identifier = undefined;
        }
    }

    return { draw, onTouchStart, onTouchEnd };
}