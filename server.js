const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
let path = require('path');
const app = express();
const PORT = 3000;

function log(text) {
    console.log(new Date().toUTCString() + " " + text);
}

log("app.js: __dirname=" + __dirname);

/*
 * Reads the various game configuration files
 * (ie: the gameX.json files)
 */
function getGameConfigs() {
    let result = [];
    let gamesPath = __dirname + path.sep + "games";
    for (let nextGameFolderName of fs.readdirSync(gamesPath)) {
        let nextGameFolderPath = gamesPath + path.sep + nextGameFolderName;
        if (fs.lstatSync(nextGameFolderPath).isDirectory()) {
            let nextGameAssets = fs.readdirSync(nextGameFolderPath);
            let nextGameConfigs = nextGameAssets.filter(function (file) {
                return path.extname(file).toLowerCase() === ".json";
            });
            let nextGameConfigAsString = fs.readFileSync(nextGameFolderPath + path.sep + nextGameConfigs[0]);
            let nextGameConfig = JSON.parse(nextGameConfigAsString);
            result.push({
                id: nextGameFolderName,
                relPath: "games" + path.sep + nextGameFolderName,
                fullPath: nextGameFolderPath,
                label: nextGameConfig.label,
                maxScore: nextGameConfig.maxScore
            })
        }
    }
    log("getGameConfigs(): result=" + JSON.stringify(result));
    return result;
}

/*
 * Returns the list of all the folders containing .ejs files
 * (ie: the list of all the subfolders inside the "/games" folder + the "/common" folder)
 */
function getViewFolderPaths() {
    let result = [];
    for (let nextGameConfig of getGameConfigs()) {
        result.push(nextGameConfig.fullPath);
    }
    let commonPath = __dirname + path.sep + "common";
    // TODO: loop on all subfolders instead of harcoding path
    result.push(commonPath);
    result.push(commonPath + path.sep + "control");
    result.push(commonPath + path.sep + "menu");
    result.push(commonPath + path.sep + "modal");
    result.push(commonPath + path.sep + "score");
    log("getViewFolderPaths(): result=" + result);
    return result;
}

app.set("gameConfigs", getGameConfigs());
app.set("views", getViewFolderPaths());
app.set("view engine", "ejs");
app.use(express.static(__dirname + path.sep)); // http://expressjs.com/en/4x/api.html#express.static
for (let nextViewFolderPath of app.get("views")) {
    app.use(express.static(nextViewFolderPath));
}
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res, next) {
    log(">> app.get(): url=" + req.url);
    res.render("home", {gameConfigs: app.get("gameConfigs")});
    log("<< app.get()");
});

app.get('/games/:gameId', function (req, res, next) {
    log(">> app.get(): url=" + req.url + ",query=" + JSON.stringify(req.query));
    let gameConfig = app.get("gameConfigs").filter(function (nextGameConfig) {
        return nextGameConfig.id === req.params.gameId;
    })[0];
    if (req.query.maxScore) {
        log("app.get(): using custom maxScore=" + req.query.maxScore);
        gameConfig.maxScore = parseInt(req.query.maxScore);
    }
    log("<< app.get(): using gameConfig=" + JSON.stringify(gameConfig));
    res.render(req.params.gameId, {ejsConfig: gameConfig});
});

/*
 * https://www.voorhoede.nl/en/blog/real-time-communication-with-server-sent-events/
 * req: https://nodejs.org/api/http.html#http_class_http_incomingmessage
 */
app.get('/game_scorestream', function (req, res, next) {
    log(">> app.get(): url=" + req.url);
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    function messageHandler(message) {
        log("got message=[" + JSON.stringify(message) + "]");
        res.write(`event: message\n`);
        res.write(`data: ${JSON.stringify(message)}\n\n`);
    }

    // Node.js logs may display "MaxListenersExceededWarning: Possible EventEmitter memory leak detected"
    // in case no "ping" message is sent every XX seconds
    // this is because Node.js will close a long-polling connection after 2 minutes when there is no activity
    // when this happens, the client will try to reconnect and a new "message listener" will be created
    app.on('message', messageHandler);

    // https://contourline.wordpress.com/2011/03/30/preventing-server-timeout-in-node-js/
    // req.socket.setTimeout(Infinity);
    req.on("close", function () {
        // request closed unexpectedly
        log("app.get(): request was closed");
        app.removeListener("message", messageHandler);
    });

    log("<< app.get()");
});

app.get('/control/:color', function (req, res, next) {
    log(">> app.get(): url=" + req.url);
    // req.params.color refers to ":color"
    res.render("control", {color: req.params.color});
    log("<< app.get()");
});

app.post('/control', function (req, res, next) {
    // req.body is available via require('body-parser'):
    log(">> app.post(): url=" + req.url + ", message=" + JSON.stringify(req.body));
    log("app.post(): emitting message");
    app.emit('message', req.body);
    log("<< app.post()");
    // redirect is required, even when using an async post
    res.redirect("/control/" + req.body.color);
});

function timer() {
    //log(">> timer");
    // acts as a "ping" to avoid a timeout on the SSE open connection
    app.emit('message', {});
    //log("<< timer");
}

let interval = setInterval(timer, 30000);
app.listen(PORT, () => log(`app.js: listening on port ${PORT}!`));