let interval;
let redCellId;
let blueCellId;

function getRandomCellId(color) {
    //log(">> getRandomCellId(): color=" + color);
    let random = Math.round(Math.random() * 8) + 1; // returns 1,2,3,4,5,6,7,8,9
    let position;
    if (random === 1) position = g_controls.upleft;
    else if (random === 2) position = g_controls.up;
    else if (random === 3) position = g_controls.upright;
    else if (random === 4) position = g_controls.left;
    else if (random === 5) position = g_controls.center;
    else if (random === 6) position = g_controls.right;
    else if (random === 7) position = g_controls.downleft;
    else if (random === 8) position = g_controls.down;
    else if (random === 9) position = g_controls.downright;
    let cellId = color + position;
    //log("<< getRandomCellId(): cellId=" + cellId);
    return cellId;
}

function hasMole(cellId) {
    return byId(cellId).classList.contains("mole");
}

function addMole(color, cellId) {
    byId(cellId).classList.add("mole");
    let id = color === "red" ? "redCellId" : "blueCellId";
    byId(id).value = cellId;
}

function removeMole(color, cellId) {
    byId(cellId).classList.remove("mole");
    let id = color === "red" ? "redCellId" : "blueCellId";
    byId(id).value = ""
}


function timer() {
    if (!g_isGameStarted) return;
    if (redCellId) {
        removeMole("red", redCellId);

    }
    redCellId = getRandomCellId("red");
    addMole("red", redCellId);

    if (blueCellId) {
        removeMole("blue", blueCellId);
    }
    blueCellId = getRandomCellId("blue");
    addMole("blue", blueCellId);
}

/*
 *
 */
function onMessage(e) {
    let message = JSON.parse(e.data);
    log(">> onMessage(): message=" + JSON.stringify(message));
    let cellId = message.color + message.control;
    let isMole = hasMole(cellId);
    log("onMessage(): cellId=" + cellId + " -> isMole=" + isMole);
    if (isMole) {
        // just remove the mole: the mole will appear during the next "tick"
        if (message.color === "red") {
            removeMole("red", cellId);
            redCellId = null;
        } else {
            removeMole("blue", cellId);
            blueCellId = null;
        }
        Score.increaseScore(message.color);
    }
    let winnerColor = Score.getWinnerColor();
    if (winnerColor) {
        clearInterval(interval);
        SSE.close();
        WinnerModal.displayWinner(winnerColor);
    }
    log("<< onMessage()");
}


document.addEventListener("DOMContentLoaded", function (e) {
    SSE.init(onMessage);
    Score.init(g_gameConfig.maxScore);
    redCellId = "redcenter";
    blueCellId = "bluecenter";
    addMole("red", redCellId);
    addMole("blue", blueCellId);
    interval = setInterval(timer, 800);
});

log("game4.js loaded");