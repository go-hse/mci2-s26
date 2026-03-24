import * as myFunctions from "./js/funcs.mjs";

function onLoad() {
    myFunctions.test();
};

window.onload = onLoad;


window.onload = () => {
    let a = 5;
    console.log("Window loaded", a, b);
    myFunctions.test();

    if (a > 3) {  // var b is hoisted to the top of the function scope, but not initialized until this line is executed
        var b = 10;
    }

    let object = {
        name: "Test Object",
        method: function () {
            console.log("Method called");
        },
        arr: [1, 2, 3]
    };

    object["test-14"] = "Test Value";
    object.test = "Test Value 2";

    console.log(object);
};

