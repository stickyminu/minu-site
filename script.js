document.addEventListener("DOMContentLoaded", async () => {
    const connectWalletButton = document.getElementById("connectWallet");
    const walletInfo = document.getElementById("walletInfo");
    const whitelistStatus = document.getElementById("whitelist-status"); // Fix: Corrected reference
    const allocationSection = document.getElementById("allocation");
    const notWhitelistedSection = document.getElementById("not-whitelisted");
    const mintDiamondButton = document.getElementById("mintDiamond");
    const mintGoldButton = document.getElementById("mintGold");
    const diamondAmountDisplay = document.getElementById("diamondAmount");
    const goldAmountDisplay = document.getElementById("goldAmount");

    const nftContractAddress = "0xC98f378f5DbF90afAD07b24Ef48443231A1df43c";
    const whitelistAPI = "https://your-api.com/check-whitelist"; // UPDATE WITH ACTUAL API URL

    async function checkWalletConnection() {
        if (!window.ronin || !window.ronin.provider) {
            whitelistStatus.innerHTML = "<p>❌ Ronin Wallet not detected! Please install it.</p>";
            connectWalletButton.disabled = true;
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
            whitelistStatus.innerHTML = "<p>❌ Failed to check wallet connection.</p>";
        }
    }

    function updateWalletDisplay(address) {
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        walletInfo.innerHTML = `<a href="my-account.html">${shortAddress}</a>`;
        connectWalletButton.style.display = "none";
        walletInfo.style.display = "inline";
    }

    async function checkWhitelistStatus(address) {
        try {
            whitelistStatus.innerHTML = "<p>🔍 Checking whitelist status...</p>";

            const response = await fetch(`${whitelistAPI}?wallet=${address}`);
            if (!response.ok) throw new Error("Failed to fetch whitelist data.");

            const data = await response.json();

            if (data.whitelisted) {
                whitelistStatus.style.display = "none";
                allocationSection.style.display = "block";

                diamondAmountDisplay.innerText = data.diamondAmount;
                goldAmountDisplay.innerText = data.goldAmount;

                if (data.diamondAmount > 0) mintDiamondButton.style.display = "block";
                if (data.goldAmount > 0) mintGoldButton.style.display = "block";
            } else {
                whitelistStatus.style.display = "none";
                notWhitelistedSection.style.display = "block";
            }
        } catch (error) {
            console.error("Error fetching whitelist status:", error);
            whitelistStatus.innerHTML = "<p>❌ Failed to load whitelist status.</p>";
        }
    }

    connectWalletButton.addEventListener("click", async () => {
        console.log("🔗 Connect Wallet button clicked.");
        try {
            const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });
            updateWalletDisplay(accounts[0]);
            checkWhitelistStatus(accounts[0]);
        } catch (error) {
            console.error("Connection error:", error);
            whitelistStatus.innerHTML = "<p>❌ Wallet connection failed.</p>";
        }
    });

    checkWalletConnection();
});
