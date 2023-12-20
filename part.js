let thisWindow = '';
let windowData = {};
let windows = [];

function getAllWindows() {
    // windows are stored in the localStorage as a JSON string
    let newWindows = JSON.parse(localStorage.getItem('windows'));
    // check every window to see if it's still open by checking the lastTimeStamp
    let maxTimeOut = 200;
    for (let windowIndex in newWindows) {
        if (!windows[windowIndex]?.lastTimeStamp || windows[windowIndex].lastTimeStamp < Date.now() - maxTimeOut) {
            delete windows[windowIndex];
        }
    }

    return newWindows;
}

function saveAllWindows() {
    let windowsArray = getAllWindows();
    windowsArray[thisWindow] = { ...windowsArray[thisWindow], ...windowData };
    localStorage.setItem('windows', JSON.stringify(windowsArray));
}

function getNewWindowIndex() {
    // Gets a new window index that's the lowest it can be without being taken
    let windowsArray = getAllWindows();
    let index = 0;
    while (windowsArray[index] !== undefined) {
        index++;
    }
    return index;
}

function setWindowData() {
    const size = {
        width: window.innerWidth,
        height: window.innerHeight,
    }
    const pos = {
        x: window.screenX,
        y: window.screenY,
    };
    const lastTimeStamp = Date.now();
    windowData = { size, pos, lastTimeStamp };
}

const frame = () => {
    setWindowData();
    saveAllWindows();

    windows = (getAllWindows());
    document.body.innerHTML = thisWindow + ": " + JSON.stringify(windowData, null, 2);

    // renders a dot at the center of the screen;
    let dot = document.createElement('div');
    dot.style.position = 'absolute';
    dot.style.left = windowData.size.width / 2 + 'px';
    dot.style.top = windowData.size.height / 2 + 'px';
    dot.style.width = '20px';
    dot.style.height = '20px';
    dot.style.backgroundColor = 'black';
    dot.style.transform = 'translate(-50%, -50%)';
    dot.style.borderRadius = '9999px';
    document.body.appendChild(dot);

    // // render a dot at the center of other windows
    for (const [key, value] of Object.entries(windows)) {
        if (key.toString() === thisWindow.toString()) continue;

        console.log(key, thisWindow);

        // gets the offset between the center of this window and the center of the other window
        let x = value.pos.x - windowData.pos.x + windowData.size.width - value.size.width / 2;
        let y = value.pos.y - windowData.pos.y + windowData.size.height - value.size.height / 2;

        let dot = document.createElement('div');
        dot.style.position = 'absolute';
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        dot.style.width = '10px';
        dot.style.height = '10px';
        dot.style.backgroundColor = 'red';
        dot.style.transform = 'translate(-50%, -50%)';
        dot.style.borderRadius = '9999px';
        document.body.appendChild(dot);
    }

    requestAnimationFrame(frame);
};

// Add key press to localstorage array
window.addEventListener('keydown', (event) => {
    addToKeypresses(event.key);
});

function addToKeypresses(key) {
    let keypresses = JSON.parse(localStorage.getItem('keypresses')) ?? [];

    if (!keypresses.includes(key)) {
        keypresses.push(key);
        localStorage.setItem('keypresses', JSON.stringify(keypresses));
    }
}

window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';

    // remove this window from the windows array
    let windowsArray = getAllWindows();
    delete windowsArray[thisWindow];
    localStorage.setItem('windows', JSON.stringify(windowsArray));
});


thisWindow = getNewWindowIndex();
frame();