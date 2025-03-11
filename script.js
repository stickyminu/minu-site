document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById("loginButton");
    const walletAddressDisplay = document.getElementById("walletAddress");

    // Check if Ronin Wallet is installed
    if (window.ronin) {
        loginButton.addEventListener("click", async () => {
            try {
                // Request connection to Ronin Wallet using send() instead of request()
                const response = await window.ronin.send("eth_requestAccounts");

                if (response.result && response.result.length > 0) {
                    walletAddressDisplay.innerText = `Connected: ${response.result[0]}`;
                } else {
                    walletAddressDisplay.innerText = "Connection failed.";
                }
            } catch (error) {
                console.error("Connection Error:", error);
                walletAddressDisplay.innerText = "Connection failed. Check the console.";
            }
        });
    } else {
        walletAddressDisplay.innerText = "Ronin Wallet not detected! Please install it.";
        loginButton.disabled = true;
    }
});
