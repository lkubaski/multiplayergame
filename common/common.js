let g_gameConfig = {
    id: "",
    path: "",
    label: "",
    maxScore: 0
};
let g_controls = {
    upleft : 'upleft',
    up : 'up',
    upright : 'upright',
    left : 'left',
    center : 'center',
    right : 'right',
    downleft : 'downleft',
    down : 'down',
    downright : 'downright'
};
let g_isGameStarted = false;

function log(text, logStatus = false) {
    console.log(new Date().toUTCString() + " " + text);
    let statusElt = document.getElementById("log");
    if (logStatus && statusElt) statusElt.innerHTML = text;
}

function byId(idElt) {
    let elt = document.getElementById(idElt);
    if (elt === null) console.error("byId(): undefined element=" + idElt);
    return elt;
}

function newElt(tagName, attributes) {
    let elt = document.createElement(tagName);
    for (let key in attributes) {
        elt.setAttribute(key, attributes[key]);
    }
    return elt;
}

log("common.js loaded");