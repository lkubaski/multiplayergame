let ropeDelta;

/*
 * Determines how many pixels the rope should be moved each time a user clicks on a controller button
 */
function initRopeDelta() {
    ropeDelta = 25;
    /*log(">> initRopeDelta()");
    let ropeBcc = byId("rope").getBoundingClientRect();
    let firstSeparatorBcc = byId("firstSeparator").getBoundingClientRect();
    log("initRopeDelta(): ropeBcc.left=" + ropeBcc.left + ",ropeBcc.right=" + ropeBcc.right);
    log("initRopeDelta(): firstSeparatorBcc.left=" + firstSeparatorBcc.left + ",firstSeparatorBcc.right=" + firstSeparatorBcc.right);
    let halfRopeLength = (ropeBcc.right - ropeBcc.left) / 2;
    let ropeMiddleLeft = ropeBcc.left + halfRopeLength;
    // TODO: need to translate this into pixels (not sure what the current unit is)
    ropeDelta = (ropeMiddleLeft - firstSeparatorBcc.right) / 20;
    log("<< initRopeDelta() : ropeDelta=" + ropeDelta);*/
}

/*
 * The rope delta
 * Can be mocked during testing.
 */
function getRopeDelta() {
    return ropeDelta;
}

function getWinnerColor() {
    log(">> getWinnerColor()");
    let winnerColor;
    let ropeBcc = byId("rope").getBoundingClientRect();
    let firstSeparatorBcc = byId("firstSeparator").getBoundingClientRect();
    let fourthSeparatorsBcc = byId("fourthSeparator").getBoundingClientRect();
    let halfRopeLength = (ropeBcc.right - ropeBcc.left) / 2;
    let ropeMiddleLeft = ropeBcc.left + halfRopeLength;
    log("getWinnerColor(): ropeBcc.left=" + ropeBcc.left + ",ropeBcc.right=" + ropeBcc.right);
    log("getWinnerColor(): firstSeparatorBcc.left=" + firstSeparatorBcc.left + ",firstSeparatorBcc.right=" + firstSeparatorBcc.right);
    log("getWinnerColor(): fourthSeparatorsBcc.left=" + fourthSeparatorsBcc.left + ",fourthSeparatorsBcc.right=" + fourthSeparatorsBcc.right);
    let isRedVictory = ropeMiddleLeft < firstSeparatorBcc.right;
    let isBlueVictory = fourthSeparatorsBcc.left < ropeMiddleLeft;
    if (isRedVictory) winnerColor = "red";
    else if (isBlueVictory) winnerColor = "blue";
    else winnerColor = null;
    log("<< getWinnerColor() : winnerColor=" + winnerColor);
    return winnerColor;
}

function onMessage(e) {
    let message = JSON.parse(e.data);
    log(">> onMessage(): message=" + JSON.stringify(message));
    Score.increaseScore(message.color);
    let ropeElt = byId("rope");
    // "style.marginLeft" doesn't work since it only returns the "inline" margin, not the one set by CSS rules:
    //let marginLeftAsString = ropeElt.style.marginLeft;
    let marginLeftAsString = window.getComputedStyle(ropeElt).getPropertyValue("margin-left");
    if (marginLeftAsString === "") marginLeftAsString = "0px";
    let marginLeft = parseInt(marginLeftAsString.split("px")[0]);
    let ropeDelta = message.color === "red" ? - getRopeDelta() : getRopeDelta();
    ropeElt.style.marginLeft = marginLeft + ropeDelta + "px";
    let winnerColor = getWinnerColor();
    if (winnerColor) {
        log("onMessage(): winner=" + winnerColor);
        SSE.close();
        WinnerModal.displayWinner(winnerColor);
    }
    log("<< onMessage()");
}

document.addEventListener("DOMContentLoaded", function (e) {
    log(">> onload()");
    SSE.init(onMessage);
    Score.init(g_gameConfig.maxScore);
    initRopeDelta();
    log("<< onload()");
});

log("game2.js loaded");