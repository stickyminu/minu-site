document.addEventListener("DOMContentLoaded", () => {
    const playerBoard = document.getElementById("playerBoard");
    const aiBoard = document.getElementById("aiBoard");
    const submitButton = document.getElementById("submit");
    const playAgainButton = document.getElementById("playAgainButton");
    const resultDisplay = document.getElementById("result");

    const pieces = ["Admiral", "Intelligence", "Confidant", "Genome"];
    let playerSelection = [];
    let aiSelection = [];

    function resetGame() {
        playerSelection = [];
        aiSelection = [];
        resultDisplay.textContent = "";

        playerBoard.querySelectorAll(".box").forEach((box) => {
            box.textContent = "";
        });

        aiBoard.querySelectorAll(".box").forEach((box) => {
            box.textContent = "?";
        });

        submitButton.style.display = "block";
        playAgainButton.style.display = "none";
        randomizeAI();
    }

    function randomizeAI() {
        aiSelection = [...pieces].sort(() => Math.random() - 0.5);
        aiBoard.querySelectorAll(".box").forEach((box) => {
            box.textContent = "?";
        });
    }

    function determineWinner() {
        let playerWins = 0, aiWins = 0;
        for (let i = 0; i < 4; i++) {
            let playerPiece = playerSelection[i];
            let aiPiece = aiSelection[i];

            if (
                (playerPiece === "Admiral" && (aiPiece === "Confidant" || aiPiece === "Genome")) ||
                (playerPiece === "Intelligence" && aiPiece === "Admiral") ||
                (playerPiece === "Confidant" && (aiPiece === "Intelligence" || aiPiece === "Genome")) ||
                (playerPiece === "Genome" && aiPiece === "Genome")
            ) {
                playerWins++;
            } else if (playerPiece !== aiPiece) {
                aiWins++;
            }
        }

        if (playerWins > aiWins) {
            resultDisplay.textContent = "You Win!";
        } else if (aiWins > playerWins) {
            resultDisplay.textContent = "AI Wins!";
        } else {
            resultDisplay.textContent = "It's a Draw!";
        }

        submitButton.style.display = "none";
        playAgainButton.style.display = "block";
    }

    playerBoard.querySelectorAll(".box").forEach((box, index) => {
        box.addEventListener("click", () => {
            box.textContent = pieces[index];
            playerSelection[index] = pieces[index];
        });
    });

    submitButton.addEventListener("click", () => {
        if (playerSelection.length < 4) {
            resultDisplay.textContent = "Arrange all pieces first!";
            return;
        }
        randomizeAI();
        setTimeout(() => {
            aiBoard.querySelectorAll(".box").forEach((box, index) => {
                box.textContent = aiSelection[index];
            });
            determineWinner();
        }, 2000);
    });

    playAgainButton.addEventListener("click", resetGame);

    randomizeAI();
});
