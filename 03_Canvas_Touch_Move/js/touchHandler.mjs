// 

export function touchHandler(cnv, interactivElements) {
    const Touches = new Map();

    cnv.addEventListener("touchstart", (evt) => {
        evt.preventDefault();
        for (let t of evt.changedTouches) {
            for (const element of interactivElements) {
                element.onTouchStart(t.identifier, t.pageX, t.pageY);
            }
            console.log(`add ${t.identifier}`);
            Touches.set(t.identifier, {
                x: t.pageX,
                y: t.pageY,
            });


        }
    }, true);


    cnv.addEventListener("touchmove", (evt) => {
        evt.preventDefault();
        for (let t of evt.changedTouches) {
            console.log(`move ${t.identifier}`);
            Touches.set(t.identifier, {
                x: t.pageX,
                y: t.pageY,
            });
            for (const element of interactivElements) {
                element.onTouchMove(t.identifier, t.pageX, t.pageY);
            }
        }
    }, true);

    cnv.addEventListener("touchend", (evt) => {
        evt.preventDefault();
        for (let t of evt.changedTouches) {
            for (const element of interactivElements) {
                element.onTouchEnd(t.identifier, t.pageX, t.pageY);
            }
            console.log(`end ${t.identifier}`);
            Touches.delete(t.identifier);
        }
    }, true);


}