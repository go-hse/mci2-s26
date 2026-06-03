import { XRControllerModelFactory } from '../../99_Lib/jsm/webxr/XRControllerModelFactory.js';

// from three.js\examples\webxr_vr_ballshooter.html
export function createVRcontrollers(scene, renderer, connect_cb) {
    const controllerModelFactory = new XRControllerModelFactory();

    for (const id of [0, 1]) {
        const controllerGrip = renderer.xr.getControllerGrip(id);
        controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
        scene.add(controllerGrip);
    }
}

let laststr;

const gamepadButtonStrings = {
    0: "trigger",
    1: "squeeze",
    // 2: "touchpad",
    3: "thumbstick",
    4: "A/X",
    5: "B/Y",
}

function fmt(n) {
    return n % 1 === 0 ? n : n.toFixed(2);
}

export function showGamepad(handedness, gamepad) {
    let allButtons = ""
    for (let i = 0; i < gamepad.buttons.length; ++i) {
        if (i in gamepadButtonStrings) {
            const value = fmt(gamepad.buttons[i].value);
            const pressed = gamepad.buttons[i].pressed ? "p" : "";
            const touched = gamepad.buttons[i].touched ? "t" : "";
            const btnString = `[${gamepadButtonStrings[i]}: ${value}${pressed}${touched}]`
            if (value !== 0)
                allButtons += btnString;
        }
    }
    // touchpad ${fmt(gamepad.axes[0])}/ ${fmt(gamepad.axes[1])} NICHT BELEGT??

    const thumbstickValues = `${fmt(gamepad.axes[2])}/${fmt(gamepad.axes[3])}`;
    const thumbstickString = thumbstickValues !== "0/0" ? `thumbstick ${thumbstickValues}` : "";

    const str = `${handedness}: ${thumbstickString} ${allButtons}`;
    if (str !== laststr) {
        laststr = str;
        console.log(laststr);
    }

}
