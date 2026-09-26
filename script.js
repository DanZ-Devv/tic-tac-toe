const gameBoard = (() => {  // Module responsible for managing the game board and keeping track of its current state

    // Private variable that stores the current state of the board
    const board = Array(9).fill(null);  // initializes board with nulls

    function showBoard() {  // shows the board to code outside the scope
        return board;
    }
    function resetBoard() {
        board.fill(null);    // reset to new empty board
    }
    function placePiece(index, marker) {
        if (board[index] === null) {
            board[index] = marker;
            return true;    // successfully placed
        }
        return false;   // space occupied
    }
    function checkWinner() {
        // All winning combinations
        const winningLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ]
        for (const [a, b, c] of winningLines) {
            // Checks if the board contains the same piece at each winning line
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (board.every(cell => cell !== null)) return "tie";   // all squares full but no winner -> tie
        return null;
    }
    // Return the functions that need to be accessible outside of the module
    return {
        showBoard,
        resetBoard,
        placePiece,
        checkWinner
    };
})(); // IIFE notation: the function is defined and immediately executed, so it runs only once

const createPlayer = function(name, marker) {
    // Factory function used to create player objects
    // Each player has a name and a marker used to represent them on the game board
    return {
        name, 
        marker
    };
}

// module for setup and turn logic
const game = (() => {
    let player1 = null;
    let player2 = null;
    let activePlayer = null;

    function getActivePlayer() {
        return activePlayer;
    }
    function getPlayerByMarker(marker) {
        if (player1.marker === marker) return player1.name;
        return player2.name;
    }
    function switchTurn() {
        if (activePlayer === player1) {
            activePlayer = player2;
        }
        else activePlayer = player1;
    }
    function startGame(name1, name2) {
        player1 = createPlayer(name1, "X");
        player2 = createPlayer(name2, "O");
        activePlayer = player1; // player1 starts
        // Disable inputs so they can't be edited during the game
        document.getElementById("player1").disabled = true;
        document.getElementById("player2").disabled = true;
        form.querySelector("button[type='submit']").disabled = true;
    }
    const form = document.querySelector("form"); // or whatever selector matches your form
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // stop the default reload/navigation behavior

        const name1 = document.getElementById("player1").value;
        const name2 = document.getElementById("player2").value;
        startGame(name1, name2);
        gameBoard.resetBoard();
        display.render();
    });
    function resetGame() {
        player1 = null;
        player2 = null;
        activePlayer = null;
        form.reset();
        // Allows forms to be edited for a new game
        document.getElementById("player1").disabled = false;
        document.getElementById("player2").disabled = false;
        form.querySelector("button[type='submit']").disabled = false;
    }
    function resetTurn() {
        activePlayer = player1; // if the player press reset, player1 goes first
    }
    return {
        getActivePlayer,
        getPlayerByMarker,
        switchTurn,
        resetGame,
        resetTurn
    };
})();

const boardContainer = document.querySelector(".game-board");
const display = (() => {
    function render() {
        const board = gameBoard.showBoard();    // re-fetch fresh data every time render() runs
        boardContainer.innerHTML = ""; // clear old squares
        for (let i = 0; i < 9; i++) {
            const square = document.createElement("div");
            square.classList.add("square");
            if (board[i] === null) {
                square.textContent = "";
            }
            else {
                const piece = document.createElement("p");
                piece.textContent = board[i];
                square.appendChild(piece);
            }
            square.addEventListener("click", () => {
                const moved = gameBoard.placePiece(i, game.getActivePlayer().marker);
                if (moved) {    // switch turn if player moved successfully
                    const result = gameBoard.checkWinner();
                    if (result !== null) {  // a player won
                        render();
                        const dialog = document.querySelector(".result");
                        dialog.innerHTML = ""; // clear any previous winner message
                        const resultMsg = document.createElement("h1");
                        if (result === "tie") resultMsg.textContent = "TIE";    // tie message
                        else resultMsg.textContent = game.getPlayerByMarker(result) + " WINS!"; // winner message
                        dialog.appendChild(resultMsg);
                        dialog.showModal(); // show the result message
                        dialog.addEventListener("click", (e) => {   // close dialog and reset gameboard
                            if (e.target === dialog) {
                                dialog.close();
                                game.resetGame();
                                gameBoard.resetBoard();
                                boardContainer.innerHTML = "";
                                return;
                            }
                        }, { once: true }); // removes listener after executing once
                        return;
                    }
                    game.switchTurn();
                    render();   // refresh screen
                }
            });
            boardContainer.appendChild(square);
        }
    }
    return {
        render
    };
})();

// Reset button logic
const reset = document.querySelector(".reset");
reset.addEventListener("click", () => {
    gameBoard.resetBoard(); // reset board
    game.resetTurn();
    display.render();
});
