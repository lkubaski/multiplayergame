/*
 * https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Sending_forms_through_JavaScript
 */
function asyncPost(color, control) {
    log(">> asyncPost(): color=" + color + ",  control=" + control);
    let XHR = new XMLHttpRequest();
    // Define what happens on successful data submission
    XHR.addEventListener('load', function(event) {
        console.log("asyncPost(): success!");
    });
    // Define what happens in case of error
    XHR.addEventListener('error', function(event) {
        console.log("asyncPost(): error!");
    });
    XHR.open('POST', '/control', true);
    XHR.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    XHR.send("color=" + color + "&control=" + control);
    log("<< asyncPost()");
}

log("control.js loaded");