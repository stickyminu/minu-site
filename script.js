document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById("loginButton");
    const walletInfoDisplay = document.getElementById("walletInfo");

    // Check if Ronin Wallet is installed
    if (window.ronin && window.ronin.provider) {
        loginButton.addEventListener("click", async () => {
            try {
                // Request Ronin Wallet connection
                const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });

                if (accounts.length > 0) {
                    const userAddress = accounts[0];

                    // Fetch balance (RON) using eth_getBalance
                    const balanceHex = await window.ronin.provider.request({
                        method: "eth_getBalance",
                        params: [userAddress, "latest"],
                    });

                    // Convert balance from Wei to RON (1 RON = 10^18 Wei)
                    const balanceRON = (parseInt(balanceHex, 16) / 10 ** 18).toFixed(4);

                    // Update UI
                    walletInfoDisplay.innerHTML = `
                        <p>✅ Connected: <strong>${userAddress}</strong></p>
                        <p>💰 Balance: <strong>${balanceRON} RON</strong></p>
                    `;
                } else {
                    walletInfoDisplay.innerText = "Connection failed.";
                }
            } catch (error) {
                console.error("Connection Error:", error);
                walletInfoDisplay.innerText = "Connection failed. Check the console.";
            }
        });
    } else {
        walletInfoDisplay.innerText = "Ronin Wallet not detected! Please install it.";
        loginButton.disabled = true;
    }
});
