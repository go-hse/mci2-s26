/**
 * Canvas Layout Engine (Functional ESM)
 */

export const LayoutType = {
    ROW: 'row',
    COLUMN: 'column'
};

/**
 * Erzeugt ein persistentes Node-Objekt (Plain Old JavaScript Object).
 */
export const createNode = (options = {}) => ({
    type: options.type || LayoutType.COLUMN,
    padding: options.padding || 0,
    color: options.color || '#ccc',
    children: options.children || [],
    draw: options.draw || null,
    // Geometrie wird erst durch compute() berechnet
    x: 0,
    y: 0,
    width: 0,
    height: 0
});

/**
 * Berechnet das Layout rekursiv und gibt einen neuen Baum mit berechneten Koordinaten zurück.
 * (Pure Function: Verändert das Original nicht)
 */
export const computeLayout = (node, x, y, width, height) => {
    const innerX = x + node.padding;
    const innerY = y + node.padding;
    const innerWidth = width - node.padding * 2;
    const innerHeight = height - node.padding * 2;

    const childCount = node.children.length;

    const computedChildren = node.children.map((child, index) => {
        const childWidth = node.type === LayoutType.ROW ? innerWidth / childCount : innerWidth;
        const childHeight = node.type === LayoutType.COLUMN ? innerHeight / childCount : innerHeight;

        const childX = node.type === LayoutType.ROW ? innerX + (index * childWidth) : innerX;
        const childY = node.type === LayoutType.COLUMN ? innerY + (index * childHeight) : innerY;

        return computeLayout(child, childX, childY, childWidth, childHeight);
    });

    return {
        ...node,
        x,
        y,
        width,
        height,
        children: computedChildren
    };
};

/**
 * Rendert den berechneten Baum auf den Canvas-Kontext.
 */
export const renderLayout = (ctx, node) => {
    // 1. Hintergrund zeichnen, falls eine Farbe gesetzt ist
    if (node.color !== 'transparent') {
        ctx.fillStyle = node.color;
        ctx.fillRect(node.x, node.y, node.width, node.height);
    }

    // 2. Individuelle Draw-Logik ausführen
    if (typeof node.draw === 'function') {
        ctx.save(); // Kontext speichern, um Seiteneffekte der Draw-Funktion zu isolieren
        node.draw(ctx, node);
        ctx.restore();
    }

    // 3. Kinder rekursiv rendern
    node.children.forEach(child => renderLayout(ctx, child));
};