import { createUpath, fillPath, getTransform, fillPathTransform } from "./grafics.mjs";



export function createFigure(ctx, x, y) {
    let touched = false, identifier;

    const uPath = createUpath();
    let L = getTransform(ctx, x, y, 0, 20);  // L: lokales Koordsys
    let P; // vor-berechnete Matrix für Bewegung 




    function draw(ctx) {
        // M: Transformations-Matrix mit Verschiebung, Skalierung
        if (touched)
            fillPathTransform(ctx, uPath, L, "red");
        else
            fillPathTransform(ctx, uPath, L, "green");
    }

    function onTouchStart(id, pageX, pageY) {
        const I = (new DOMMatrix(L)).invertSelf();
        const LT = I.transformPoint(new DOMPoint(pageX, pageY));
        touched = ctx.isPointInPath(uPath, LT.x, LT.y);
        if (touched) {
            identifier = id;
            P = getTransform(ctx, pageX, pageY).invertSelf().multiplySelf(L);
            console.log("Grab", identifier);
        }
    }

    function onTouchEnd(id) {
        if (id === identifier) {
            touched = false;
            identifier = undefined;
        }
    }

    function onTouchMove(id, pageX, pageY) {
        if (id === identifier) {
            L = getTransform(ctx, pageX, pageY).multiplySelf(P);
            console.log("Move", identifier, pageX, pageY);
        }
    }


    return { draw, onTouchStart, onTouchEnd, onTouchMove };
}