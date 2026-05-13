export function createPointerControls({ object, domElement }) {
    const state = {
        leftButton: false,
        middleButton: false,
        rightButton: false,
        lastX: 0,
        lastY: 0
    };

    function onPointerDown(event) {
        if (event.button === 0) {
            state.leftButton = true;
        }

        if (event.button === 1) {
            state.middleButton = true;
            event.preventDefault();
        }

        if (event.button === 2) {
            state.rightButton = true;
        }

        state.lastX = event.clientX;
        state.lastY = event.clientY;
    }

    function onPointerMove(event) {
        if (!state.leftButton && !state.middleButton && !state.rightButton) {
            return;
        }

        const deltaX = event.clientX - state.lastX;
        const deltaY = event.clientY - state.lastY;
        state.lastX = event.clientX;
        state.lastY = event.clientY;

        const moveSpeed = 0.005;
        const rotateSpeed = 0.01;

        if (state.middleButton) {
            object.rotation.z -= deltaX * rotateSpeed;
            object.rotation.x += deltaY * rotateSpeed;
        } else if (state.leftButton) {
            object.position.x += deltaX * moveSpeed;
            object.position.y -= deltaY * moveSpeed;
        } else if (state.rightButton) {
            object.position.z += deltaY * moveSpeed;
        }
    }

    function onPointerUp(event) {
        if (event.button === 0) {
            state.leftButton = false;
        }

        if (event.button === 1) {
            state.middleButton = false;
        }

        if (event.button === 2) {
            state.rightButton = false;
        }
    }

    function onWheel(event) {
        if (state.leftButton || state.middleButton || state.rightButton) {
            return;
        }

        event.preventDefault();

        const rotateSpeed = 0.002;
        const deltaX = event.deltaX;
        const deltaY = event.deltaY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        const dominanceRatio = 1.2;
        const deadZone = 0.5;

        if (absX < deadZone && absY < deadZone) {
            return;
        }

        if (absX > absY * dominanceRatio) {
            object.rotation.z += deltaX * rotateSpeed;
            return;
        }

        if (absY > absX * dominanceRatio) {
            object.rotation.x += deltaY * rotateSpeed;
        }
    }

    function onContextMenu(event) {
        event.preventDefault();
    }

    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('contextmenu', onContextMenu);

    return {
        enabled: true
    };
}