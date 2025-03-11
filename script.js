document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById("loginButton");
    const walletAddressDisplay = document.getElementById("walletAddress");

    // Check if Ronin Wallet is installed
    if (window.ronin && window.ronin.provider) {
        loginButton.addEventListener("click", async () => {
            try {
                // Request Ronin Wallet connection
                const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });

                if (accounts.length > 0) {
                    walletAddressDisplay.innerText = `Connected: ${accounts[0]}`;
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
