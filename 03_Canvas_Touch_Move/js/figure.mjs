import { createUpath, fillPath, getTransform, fillPathTransform } from "./grafics.mjs";

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}


export function createFigure(ctx, x, y) {
    let touched = false, f1, f2, initialDistance;

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
        if (f1 === undefined) {
            const I = (new DOMMatrix(L)).invertSelf();
            const LT = I.transformPoint(new DOMPoint(pageX, pageY));
            touched = ctx.isPointInPath(uPath, LT.x, LT.y);
            if (touched) {
                f1 = { id, x: pageX, y: pageY };
                P = getTransform(ctx, pageX, pageY).invertSelf().multiplySelf(L);
                console.log("Grab", f1);
            }
        } else {
            if (f2 === undefined) {
                f2 = { id, x: pageX, y: pageY };
                initialDistance = distance(f1.x, f1.y, f2.x, f2.y);
                const alpha = Math.atan2(f2.y - f1.y, f2.x - f1.x);
                P = getTransform(ctx, f1.x, f1.y, alpha).invertSelf().multiplySelf(L);
            }
        }
    }

    function onTouchEnd(id) {
        if (f1 && id === f1.id) {
            touched = false;
            f1 = undefined;
            f2 = undefined;
        }
        if (f2 && id === f2.id) {
            f2 = undefined;
            P = getTransform(ctx, f1.x, f1.y).invertSelf().multiplySelf(L);
        }
    }

    function onTouchMove(id, pageX, pageY) {
        if (f1 && id === f1.id) {
            f1.x = pageX; f1.y = pageY;
        }
        if (f2 && id === f2.id) {
            f2.x = pageX; f2.y = pageY;
        }

        if (f1 && f2) {
            const currentDistance = distance(f1.x, f1.y, f2.x, f2.y);


            const alpha = Math.atan2(f2.y - f1.y, f2.x - f1.x);
            L = getTransform(ctx, f1.x, f1.y, alpha, currentDistance / initialDistance).multiplySelf(P); // L = Tn * P
        } else if (f1) {
            L = getTransform(ctx, f1.x, f1.y, 0).multiplySelf(P); // L = Tn * P
        }
    }



    return { draw, onTouchStart, onTouchEnd, onTouchMove };
}