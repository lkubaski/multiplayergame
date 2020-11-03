let SSE = (function () {
    let eventSource;

    function close() {
        eventSource.close();
    }

    /*
     * https://www.terlici.com/2015/12/04/realtime-node-expressjs-with-sse.html
     *
     * Starts listening for SSE events from the server
     */
    function init(onMessageCallback) {
        log(">> init()");
        if (!!window.EventSource) {
            eventSource = new EventSource('/game_scorestream');
            eventSource.addEventListener('message', function (e) {
                // do NOT forward the event to the active game if it's a "ping" event OR if the game is not started
                let message = JSON.parse(e.data);
                log("init() : message=" + JSON.stringify(message));
                //let isRed = message.red !== undefined;
                //let isBlue = message.blue !== undefined;
                //if ( (isRed || isBlue) && g_isGameStarted) {
                if ((message.color === "red" || message.color === "blue") && g_isGameStarted) {
                    onMessageCallback(e);
                }
            }, false);
            eventSource.addEventListener('open', function (e) {
                log(">> << init(): onOpen()");
            }, false);
            /*
             * dev console will display "GET http://localhost:3000/eventstream net::ERR_EMPTY_RESPONSE"
             * before this callback is invoked: this is because Node.js has a 2 min timeout by default
             * for long-polling requests
             *
             * https://contourline.wordpress.com/2011/03/30/preventing-server-timeout-in-node-js/
             * https://github.com/sinatra/sinatra/issues/448
             * https://stackoverflow.com/questions/8761025/why-is-eventsource-connection-closed-every-30-60-sec-when-no-data-transported-w
             * https://www.smashingmagazine.com/2018/02/sse-websockets-data-flow-http2/
             */
            eventSource.addEventListener('error', function (e) {
                log(">> << init(): onError(): readyState=" + e.target.readyState);
                if (e.target.readyState === EventSource.CLOSED) {
                } else if (e.target.readyState === EventSource.CONNECTING) {
                }
            }, false)
        } else {
            log("init(): Error: your browser doesn't support SSE")
        }
        log("<< init()");
    }

    return {
        close: close,
        init: init
    };

})();

log("sse.js loaded");