document.addEventListener("DOMContentLoaded", async () => {
    const connectButton = document.getElementById("connectButton");
    const walletDisplay = document.getElementById("walletDisplay");
    const statusMessage = document.getElementById("statusMessage");
    const mintDiamondButton = document.getElementById("mintDiamondButton");
    const mintGoldButton = document.getElementById("mintGoldButton");

    const nftContractAddress = "0xC98f378f5DbF90afAD07b24Ef48443231A1df43c";
    const whitelistAPI = "https://your-api.com/check-whitelist"; // Replace with your actual API URL

    async function checkWalletConnection() {
        if (!window.ronin || !window.ronin.provider) {
            statusMessage.innerText = "❌ Ronin Wallet not detected! Please install it.";
            connectButton.disabled = true;
            return;
        }

        try {
            const accounts = await window.ronin.provider.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
                updateWalletDisplay(accounts[0]);
                checkWhitelistStatus(accounts[0]);
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
            statusMessage.innerText = "❌ Failed to check wallet connection.";
        }
    }

    function updateWalletDisplay(address) {
        const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
        walletDisplay.innerHTML = `<a href="my-account.html">${shortAddress}</a>`;
        connectButton.style.display = "none";
    }

    async function checkWhitelistStatus(address) {
        try {
            statusMessage.innerText = "🔍 Checking whitelist status...";
            const response = await fetch(`${whitelistAPI}?wallet=${address}`);
            const data = await response.json();

            if (data.whitelisted) {
                statusMessage.innerHTML = `
                    🎉 Congratulations! You are whitelisted.  
                    Diamond Voucher: ${data.diamondAmount}  
                    Gold Voucher: ${data.goldAmount}
                `;

                if (data.diamondAmount > 0) mintDiamondButton.style.display = "block";
                if (data.goldAmount > 0) mintGoldButton.style.display = "block";
            } else {
                statusMessage.innerHTML = `
                    🚀 Welcome! Our whitelist is full. Public sale starts April 1, 2025, 6:00 PM GMT+8.
                `;
            }
        } catch (error) {
            console.error("Error fetching whitelist status:", error);
            statusMessage.innerText = "❌ Failed to load whitelist status.";
        }
    }

    if (connectButton) {
        connectButton.addEventListener("click", async () => {
            try {
                const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });
                updateWalletDisplay(accounts[0]);
                checkWhitelistStatus(accounts[0]);
            } catch (error) {
                console.error("Connection error:", error);
                statusMessage.innerText = "❌ Wallet connection failed.";
            }
        });
    } else {
        console.error("❌ Connect button not found in HTML.");
    }

    checkWalletConnection();
});
