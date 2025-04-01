document.addEventListener("DOMContentLoaded", async () => {
    const connectWalletButton = document.getElementById("connectWallet");
    const walletInfo = document.getElementById("walletInfo");
    const whitelistStatus = document.getElementById("whitelist-status");
    const allocationSection = document.getElementById("allocation");
    const notWhitelistedSection = document.getElementById("not-whitelisted");
    const mintDiamondButton = document.getElementById("mintDiamond");
    const mintGoldButton = document.getElementById("mintGold");
    const diamondAmountDisplay = document.getElementById("diamondAmount");
    const goldAmountDisplay = document.getElementById("goldAmount");
    const whitelistSourceDisplay = document.getElementById("whitelistSource");

    const whitelistAPI = "https://mochi-inu-admirals.netlify.app/data/whitelist.json";

    const minuTokenAddress = "0x024ac9ebfadf58b9427b97b489b33349c8313b3b";
    const mochiInuWallet = "0x396464E105A232F58f486BcF9bD828313aDd8387";

    const minuAmountDiamond = "9999999000000000000000000";
    const minuAmountGold = "4999999000000000000000000";

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
        walletInfo.innerHTML = `<span id="disconnectWallet">${shortAddress} (Disconnect)</span>`;
        connectWalletButton.style.display = "none";
        walletInfo.style.display = "inline";

        document.getElementById("disconnectWallet").addEventListener("click", disconnectWallet);
    }

    function disconnectWallet() {
        // Clear the stored wallet address (if you are storing it)
        localStorage.removeItem("roninWalletAddress");

        // Reset the UI
        walletInfo.innerHTML = "";
        connectWalletButton.style.display = "inline-block";
        walletInfo.style.display = "none";

        // Reload the page to fully clear the wallet session
        location.reload();
    }



    async function checkWhitelistStatus(address) {
        try {
            whitelistStatus.innerHTML = "<p>✅ Public sale is live. No whitelist required!</p>";

            // Hide whitelist-related UI
            whitelistStatus.style.display = "none";
            allocationSection.style.display = "block";

            // Set unlimited allocation
            diamondAmountDisplay.innerText = "Unlimited";
            goldAmountDisplay.innerText = "Unlimited";
            whitelistSourceDisplay.innerText = "Public Sale";

            // Always show mint buttons
            mintDiamondButton.style.display = "block";
            mintGoldButton.style.display = "block";

        } catch (error) {
            console.error("Error checking whitelist status:", error);
            whitelistStatus.innerHTML = "<p>❌ Failed to check status.</p>";
        }
    }


    async function mintVoucher(amount) {
        const statusText = document.getElementById("textStatus");
        if (!window.ronin || !window.ronin.provider) {
            alert("❌ Ronin Wallet not detected! Please install it.");
            return;
        }

        try {
            const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });
            const userAddress = accounts[0];

            const provider = new ethers.providers.Web3Provider(window.ronin.provider);
            const signer = provider.getSigner();

            const minuABI = [
                "function approve(address spender, uint256 amount) public returns (bool)",
                "function transfer(address to, uint256 amount) public returns (bool)"
            ];

            const minuContract = new ethers.Contract(minuTokenAddress, minuABI, signer);

            console.log("🔄 Approving $MINU tokens...");
            statusText.innerText = "Approving...";
            const approveTx = await minuContract.approve(mochiInuWallet, amount);
            await approveTx.wait();
            console.log("✅ Approval confirmed!");

            console.log("🔄 Transferring tokens...");
            statusText.innerText = "Sending Payment...";
            const transferTx = await minuContract.transfer(mochiInuWallet, amount);
            await transferTx.wait();
            console.log("✅ Transfer successful!");

            statusText.innerText = "Mint Successful! 🎉";
        } catch (error) {
            console.error("❌ Minting error:", error);
            statusText.innerText = "⚠️ Minting failed! Please check if you have enough RON and MINU balance. If issue persists, please reach out to Mochi Inu Admirals X Account";
        }
    }

    connectWalletButton.addEventListener("click", async () => {
        try {
            const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });
            updateWalletDisplay(accounts[0]);
            checkWhitelistStatus(accounts[0]);
        } catch (error) {
            console.error("Connection error:", error);
            whitelistStatus.innerHTML = "<p>❌ Wallet connection failed.</p>";
        }
    });

    if (mintDiamondButton) {
        mintDiamondButton.addEventListener("click", () => mintVoucher(minuAmountDiamond));
    }

    if (mintGoldButton) {
        mintGoldButton.addEventListener("click", () => mintVoucher(minuAmountGold));
    }

    checkWalletConnection();
});
