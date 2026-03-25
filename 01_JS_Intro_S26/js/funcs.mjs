export function dom(tag, attributes) {
    attributes = attributes || {};
    const namespace = attributes.namespace || "http://www.w3.org/1999/xhtml";
    let node = document.createElementNS(namespace, tag);
    for (let key in attributes) {
        if (key === "events") {
            for (let ev of attributes[key]) {
                for (const event in ev) {
                    node.addEventListener(event, ev[event]);
                }
            }
        } else if (key === "HTML") {
            node.innerHTML = attributes[key];
        } else {
            if (attributes[key])
                node.setAttribute(key, attributes[key]);
        }
    }
    for (let i = 2; i < arguments.length; ++i) {
        let child = arguments[i];
        if (typeof child === "string") {
            child = document.createTextNode(child);
            node.textnode = child;
        }
        node.appendChild(child);
    }
    return node;
}

export function removeAllChildren(ele) {
    while (ele.firstChild) {
        ele.removeChild(ele.lastChild);
    }
}
