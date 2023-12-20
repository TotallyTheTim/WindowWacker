
cleanWindows();
let windows = [];
let center = getCenter();
let newScreenWidth = 500;

windows.push(window.open('part.html', '', `width=${newScreenWidth},height=${newScreenWidth}, top=${center.y + newScreenWidth / 2},left=${center.x + newScreenWidth / 2}`));
windows.push(window.open('part.html', '', `width=${newScreenWidth},height=${newScreenWidth},top=${center.y + newScreenWidth / 2},left=${center.x + newScreenWidth / 2}`));
var movementSpeed = 10;

// on page reload destroy the window
window.addEventListener('beforeunload', function (event) {
    for (let i = 0; i < windows.length; i++) {
        windows[i].close();
    }
    cleanWindows();
});
function getCenter() {
    // gets the main windows center
    return {
        x: window.screenX + window.outerWidth / 2,
        y: window.screenY + window.outerHeight / 2,
    }
}
function cleanWindows() {
    localStorage.setItem('windows', JSON.stringify({}));
}

function moveWindow(forcedKey) {
    // get the keys pressed
    var keysPressed = JSON.parse(localStorage.getItem('keypresses')) ?? [];
    keysPressed = [...keysPressed, forcedKey]
    if (keysPressed.includes('w')) {
        windows[0].moveBy(0, -movementSpeed);
        keysPressed = keysPressed.filter(key => key !== 'w');
    }
    if (keysPressed.includes('a')) {
        windows[0].moveBy(-movementSpeed, 0);
        keysPressed = keysPressed.filter(key => key !== 'a');
    }
    if (keysPressed.includes('s')) {
        windows[0].moveBy(0, movementSpeed);
        keysPressed = keysPressed.filter(key => key !== 's');
    }
    if (keysPressed.includes('d')) {
        windows[0].moveBy(movementSpeed, 0);
        keysPressed = keysPressed.filter(key => key !== 'd');
    }
    // second window
    if (keysPressed.includes('i')) {
        windows[1].moveBy(0, -movementSpeed);
        keysPressed = keysPressed.filter(key => key !== 'i');
    }
    if (keysPressed.includes('j')) {
        windows[1].moveBy(-movementSpeed, 0);
        keysPressed = keysPressed.filter(key => key !== 'j');
    }
    if (keysPressed.includes('k')) {
        windows[1].moveBy(0, movementSpeed);
        keysPressed = keysPressed.filter(key => key !== 'k');
    }
    if (keysPressed.includes('l')) {
        windows[1].moveBy(movementSpeed, 0);
        keysPressed = keysPressed.filter(key => key !== 'l');
    }

    // effectivly remove the keys that were pressed
    localStorage.setItem('keypresses', JSON.stringify(keysPressed));
}
function checkWindowOrder() {
    const windowObjectsArray = windows.map(w => w = { pos: { x: w.screenX, y: w.screenY }, size: { width: w.outerWidth, height: w.outerHeight }, focus: w.focus.bind(w) });
    console.log(windowObjectsArray);
    for (let i = 0; i < windowObjectsArray.length; i++) {
        const current = windowObjectsArray[i];
        const others = windowObjectsArray.filter(w => w !== current);
        // check if the current window is overlapping any other window
        const colliding = others.filter(w => w.pos.x < current.pos.x + current.size.width && w.pos.x + w.size.width > current.pos.x && w.pos.y < current.pos.y + current.size.height && w.pos.y + w.size.height > current.pos.y);
        const highest = colliding.reduce((a, b) => a.pos.y < b.pos.y ? a : b, colliding[0]);
        if (!highest) continue;

        if (current.pos.y > highest.pos.y) {
            current.focus();
        }
    }
}

// just in case this window is focused, shouldn't happen but just in case;
window.addEventListener('keydown', function (event) {
    moveWindow(event.key);
});

function getAllWindows() {
    // windows are stored in the localStorage as a JSON string
    let windows = JSON.parse(localStorage.getItem('windows'));
    // check every window to see if it's still open by checking the lastTimeStamp
    let maxTimeOut = 200;
    for (let windowIndex in windows) {
        if (!windows[windowIndex].lastTimeStamp || windows[windowIndex].lastTimeStamp < Date.now() - maxTimeOut) {
            delete windows[windowIndex];
        }
    }

    return windows;
}
let hasFocus = true;
window.onblur = function () {
    hasFocus = false;
}
window.onfocus = function () {
    hasFocus = true;
}

function resetFocus() {
    for (let i = 0; i < windows.length; i++) {
        windows[windows.length - i - 1].focus();
    }
}

// Animation loop
function frame() {
    // checks if this window is focus and if it is it should focus the child window
    if (hasFocus) {
        resetFocus();
    }

    moveWindow();

    document.body.innerHTML = JSON.stringify(getAllWindows(), null, 2);

    // For some reason the checkWindowOrder doesn't work. Could try to fix this later
    // checkWindowOrder();

    requestAnimationFrame(frame);
}

frame();
