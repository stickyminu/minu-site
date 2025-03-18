document.addEventListener("DOMContentLoaded", () => {
    const playerBoxes = document.querySelectorAll("#playerBoard .box");
    const aiBoxes = document.querySelectorAll("#aiBoard .box");
    const submitButton = document.getElementById("submit");
    const playAgainButton = document.getElementById("playAgainButton");
    const resultText = document.getElementById("result");

    const pieces = ["Admiral", "Intelligence", "Confidant", "Genome"];
    let selectedPieces = [];
    let aiSelectedPieces = [];

    // Function to reset game
    function resetGame() {
        selectedPieces = [];
        aiSelectedPieces = [];
        playerBoxes.forEach(box => box.textContent = ""); // Clear player selections
        aiBoxes.forEach(box => box.textContent = "?"); // Reset AI display
        resultText.textContent = ""; // Clear result
        submitButton.style.display = "block"; // Show Submit button
        playAgainButton.style.display = "none"; // Hide Play Again button
    }

    // Ensure player selects in order
    playerBoxes.forEach((box, index) => {
        box.addEventListener("click", () => {
            if (selectedPieces.length < 4 && !box.textContent) {
                box.textContent = pieces[selectedPieces.length]; // Assign based on order
                selectedPieces.push(pieces[selectedPieces.length - 1]); // Store selection
            }
        });
    });

    submitButton.addEventListener("click", () => {
        if (selectedPieces.length < 4) {
            resultText.textContent = "Please select all four pieces before submitting!";
            return;
        }

        // Randomly assign AI pieces
        aiSelectedPieces = pieces.sort(() => Math.random() - 0.5);
        aiBoxes.forEach((box, index) => {
            box.textContent = aiSelectedPieces[index];
        });

        // Determine the winner
        let playerScore = 0;
        let aiScore = 0;

        for (let i = 0; i < 4; i++) {
            if (
                (selectedPieces[i] === "Admiral" && (aiSelectedPieces[i] === "Confidant" || aiSelectedPieces[i] === "Genome")) ||
                (selectedPieces[i] === "Intelligence" && aiSelectedPieces[i] === "Admiral") ||
                (selectedPieces[i] === "Confidant" && (aiSelectedPieces[i] === "Intelligence" || aiSelectedPieces[i] === "Genome")) ||
                (selectedPieces[i] === "Genome" && aiSelectedPieces[i] === "Genome")
            ) {
                playerScore++;
            } else if (selectedPieces[i] !== aiSelectedPieces[i]) {
                aiScore++;
            }
        }

        if (playerScore > aiScore) {
            resultText.textContent = "You Win! 🎉";
        } else if (playerScore < aiScore) {
            resultText.textContent = "AI Wins! 🤖";
        } else {
            resultText.textContent = "It's a Draw! ⚖️";
        }

        submitButton.style.display = "none";
        playAgainButton.style.display = "block";
    });

    playAgainButton.addEventListener("click", resetGame);
});
