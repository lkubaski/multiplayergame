let WinnerModal = (function () {

    function displayWinner(winnerColor) {
        byId("winnerImage").src = "/trophy-" + winnerColor + ".png";
        byId('winnerModal').style.display = 'block';
    }

    return {
        displayWinner: displayWinner
    };

})();

log("include-modal.js loaded");