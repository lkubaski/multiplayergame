/*
 * Each game should define a "onMessage()" function that will be invoked each time
 * the server sends an event
 *
 * Note that this function will start being invoked AFTER the game starts
 */
function onMessage(e) {
    let message = JSON.parse(e.data);
    log(">> onMessage(): message=" + JSON.stringify(message));
    Score.increaseScore(message.color);
    // score=3, maxScore=10 -> progress = 3*100/10 = 30%
    for (let nextColor of ["red", "blue"]) {
        let progress = Score.getScore(nextColor) * 100 / g_gameConfig.maxScore;
        draw(nextColor, progress);
    }
    let winnerColor = Score.getWinnerColor();
    if (winnerColor) {
        WinnerModal.displayWinner(winnerColor);
        SSE.close();
    }
    log("<< onMessage()");
}

/*
 *
 */
function draw(color, progress) {
    let canvas = byId(color + "Canvas");
    //let canvasWidth = parseInt(canvas.style.width.split("px")[0]);
    //let canvasHeight = parseInt(canvas.style.height.split("px")[0]);
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;
    log(">> draw(): color=" + color + ", progress=" + progress, ", width=" + canvasWidth + ", height=" + canvasHeight);
    let ctx = canvas.getContext("2d");
    // Step #1: generate progress bar at 100% with bottle shape
    // what's cool with this approach is that the progress bar color is set in the js code
    ctx.drawImage(byId("bottle-filled"), 0, 0, canvasWidth, canvasHeight);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color === "red" ? "#f44336" : "#2196F3";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Step #2: reduce progress bar by 25%
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = 'green'; // color doesn't matter, it's just used for debugging purpose
    // progress = 25 -> height = 300
    let height = canvasHeight - (progress * canvasHeight / 100);
    ctx.fillRect(0, 0, canvasWidth, height);

    // Step #3
    ctx.globalCompositeOperation = "source-over";
    // TODO: why is this not working when the canvas size is set via CSS?
    ctx.drawImage(byId("bottle-empty"), 0, 0, canvasWidth, canvasHeight);
    log("<< draw()");

}

function initCanvas() {
    let clientWidth = byId("redGame").clientWidth;
    let clientHeight = byId("redGame").clientHeight;
    let canvasSize = clientWidth > clientHeight ? clientHeight : clientWidth;
    log(">> initCanvas(): clientWidth=" + clientWidth + ", clientHeight=" + clientHeight);
    for (let color of ["red", "blue"]) {
        byId(color + "Game").removeChild(byId(color + "Canvas"));
        let canvasElt = newElt("canvas", {id: color + "Canvas", width: canvasSize, height: canvasSize});
        byId(color + "Game").appendChild(canvasElt);
        draw(color, 0);
    }
    log("<< initCanvas()");
}

window.onload = function () {
    log(">> onload()");
    SSE.init(onMessage);
    Score.init(g_gameConfig.maxScore);
    initCanvas();
    log("<< onload()");
};

log("game1.js loaded");