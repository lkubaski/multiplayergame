let Score = (function () {
    let _maxScore;
    let _score = {
        red: 0,
        blue: 0
    };

    function init(maxScore) {
        _maxScore = maxScore;
        byId("redScore").innerHTML = "0";
        byId("blueScore").innerHTML = "0";
        if (maxScore > 0) {
            byId("maxRedScore").innerHTML = "/" + maxScore;
            byId("maxBlueScore").innerHTML = "/" + maxScore;
        } else {
            byId('maxRedScore').style.display='none';
            byId('maxBlueScore').style.display='none';
        }
    }

    function setScore(color, score) {
        _score[color] = score;
        byId(color + "Score").innerText = score;
    }

    function getScore(color) {
        return _score[color];
    }

    function increaseScore(color) {
        byId(color + "Score").innerText = ++_score[color];
    }

    function decreaseScore(color) {
        let score = --_score[color];
        score = score < 0 ? 0 : score;
        byId(color + "Score").innerText = score;
    }

    function getWinnerColor() {
        let winnerColor;
        if (_score.red >= _maxScore) winnerColor = "red";
        else if (_score.blue >= _maxScore) winnerColor = "blue";
        return winnerColor;
    }
    function getCurrentWinnerColor() {
        let currentWinnerColor;
        if (_score.red > _score.blue) currentWinnerColor = "red";
        else if (_score.red < _score.blue) currentWinnerColor = "blue";
        return currentWinnerColor;
    }

    return {
        init: init,
        setScore: setScore,
        getScore: getScore,
        increaseScore: increaseScore,
        decreaseScore: decreaseScore,
        getWinnerColor: getWinnerColor,
        getCurrentWinnerColor: getCurrentWinnerColor
    };

})();


log("include-score.js loaded");