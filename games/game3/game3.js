function getNextAction(currentAction) {
    let result = currentAction;
    do {
        let random = Math.round(Math.random() * 3) + 1; // returns 1,2,3 or 4
        if (random === 1) result = g_controls.up;
        if (random === 2) result = g_controls.left;
        if (random === 3) result = g_controls.right;
        if (random === 4) result = g_controls.down;
    } while (result === currentAction); // so that the next action is always different from the current one
    return result;
}

function onMessage(e) {
    let message = JSON.parse(e.data);
    log(">> onMessage(): message=" + JSON.stringify(message));
    let expectedAction = byId(message.color + "ActionDiv").value;
    let newScore = Score.getScore(message.color);
    if (message.control === expectedAction) {
        newScore++;
        let nextAction = getNextAction(expectedAction);
        byId(message.color + "ActionDiv").value = nextAction;
        byId(message.color + "ActionImg").src = "arrow-" + nextAction + ".png";
    } else {
        newScore = newScore === 0 ? 0 : (newScore - 1);
    }
    Score.setScore(message.color, newScore);

    let winnerColor = Score.getWinnerColor();
    if (winnerColor) {
        WinnerModal.displayWinner(winnerColor);
        SSE.close();
    }
    log("<< onMessage()");
}

document.addEventListener("DOMContentLoaded", function (e) {
    SSE.init(onMessage);
    Score.init(g_gameConfig.maxScore);
});

log("game3.js loaded");