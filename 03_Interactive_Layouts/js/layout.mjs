import { hasMethods } from "./utils.mjs"

const background = "#fff";
export function Layout(ctx, info) {
    let x, y, width, height, sum_of_children_weights = 1;
    const children = [];

    function addChild(item, weight = 1) {
        if (hasMethods(item, ["set"])) {
            children.push({ item, weight });
            sum_of_children_weights = children.reduce((acc, i) => acc += i.weight, 0);
        } else {
            console.log("layout.addChild cannot add", item);
        }
    }

    function draw() {
        if (ctx !== undefined) {
            ctx.fillStyle = background;
            ctx.fillRect(x, y, width, height);
        }
        for (const child of children) {
            child.item.draw();
        }
    }

    function set(nx, ny, nw, nh) {
        x = nx; y = ny; width = nw; height = nh;
        console.log("Layout set", info, nx, ny, nw, nh);
    }

    return { addChild, set, draw, children: (cb) => children.forEach(cb), weights: () => sum_of_children_weights };
}

export function HorizontalLayout(ctx, info) {
    const base = Layout(ctx, `L ${info}`);
    function set(nx, ny, nw, nh) {
        base.set(nx, ny, nw, nh);
        console.log("HorizontalLayout set", info, nx, ny, nw, nh);
        let itemX = 0;
        base.children(child => {
            const itemWidth = nw * child.weight / base.weights();
            child.item.set(nx + itemX, ny, itemWidth, nh);
            itemX += itemWidth;
        });
    }
    return { set, addChild: base.addChild, draw: base.draw };
}

export function VerticalLayout(ctx, info) {
    const base = Layout(ctx, `L ${info}`);
    function set(nx, ny, nw, nh) {
        base.set(nx, ny, nw, nh);
        console.log("VerticalLayout set", info, nx, ny, nw, nh);
        let itemY = 0;
        base.children(child => {
            const itemHeight = nh * child.weight / base.weights();
            child.item.set(nx, ny + itemY, nw, itemHeight);
            itemY += itemHeight;
        });
    }
    return { set, addChild: base.addChild, draw: base.draw };
}


export function ToggleLayout(ctx, info, minAspectRatio = 1) {
    const hor = HorizontalLayout(ctx, `TH ${info}`);
    const ver = VerticalLayout(ctx, `TV ${info}`);

    let drawHorizontal = true;

    function set(nx, ny, nw, nh) {
        drawHorizontal = nw > nh * minAspectRatio;
        if (drawHorizontal)
            hor.set(nx, ny, nw, nh);
        else
            ver.set(nx, ny, nw, nh);
    }

    function draw() {
        if (drawHorizontal)
            hor.draw();
        else
            ver.draw();
    }

    function addChild(item, weight = 1) {
        hor.addChild(item, weight);
        ver.addChild(item, weight);
    }

    return { set, addChild, draw };
}




