let Menu = (function () {
    let _countdownCounter=2; // TODO: set back to "2" in production
    let _countdownInterval;

    /*
     * Displays a countdown before a game starts
     *
     */
    function _gameStartCountdown() {
        log(">> _gameStartCountdown()");
        byId("startGameButton").src = "/menu-play-" + _countdownCounter + ".png";
        if (_countdownCounter-- <= 0) {
            clearInterval(_countdownInterval);
            Score.setScore("red", 0);
            Score.setScore("blue", 0);
            g_isGameStarted=true;
            byId('startGameButton').style.display = 'none';
            // prevent changing the config once the game has started:
            byId('showConfigButton').style.display = 'none';
        }
        log("<< _gameStartCountdown()");
    }

    function onPlayButtonClicked() {
        byId("startGameButton").src = "/menu-play-3.png";
        _countdownInterval = setInterval(_gameStartCountdown, 1000);
    }

    function onConfigButtonClicked() {
        byId("configMaxScore").value = g_gameConfig.maxScore;
        byId('configModal').style.display = 'block';
        byId("configMaxScore").focus();
    }

    function onConfigModalClosed() {
        byId('configModal').style.display='none';
        g_gameConfig.maxScore = parseInt(byId("configMaxScore").value);
        onReloadButtonClicked(); // so that custom maxScore is preserved even when going back to home page
    }

    function onReloadButtonClicked() {
        byId('maxScore').value=g_gameConfig.maxScore;
        byId('reloadGameButton').submit();
    }

    return {
        onPlayButtonClicked: onPlayButtonClicked,
        onConfigButtonClicked: onConfigButtonClicked,
        onConfigModalClosed: onConfigModalClosed,
        onReloadButtonClicked: onReloadButtonClicked
    };

})();

document.addEventListener("DOMContentLoaded", function (e) {
});

log("include-menu.js loaded");