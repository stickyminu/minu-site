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

    const whitelistAPI = "https://mochi-inu-admirals.netlify.app/data/whitelist.json"; // Update with actual API URL

    const minuTokenAddress = "0xfa4384cbac92141bc47b8600db5f3805a33645d2"; // $MINU Token Address
    const mochiInuWallet = "0x0632921b0eb918758959238760cF556a8163ab20"; // Receiver Wallet

    const minuAmountDiamond = "9999999000000000000000000"; // 9,999,999 $MINU (18 decimals)
    const minuAmountGold = "4999999000000000000000000"; // 4,999,999 $MINU (18 decimals)

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

            const response = await fetch(whitelistAPI);
            if (!response.ok) throw new Error("Failed to fetch whitelist data.");

            const data = await response.json();
            const normalizedAddress = address.toLowerCase();
            const whitelistEntry = data.find(entry => entry.wallet.toLowerCase() === normalizedAddress);

            if (whitelistEntry && whitelistEntry.whitelisted) {
                whitelistStatus.style.display = "none";
                allocationSection.style.display = "block";

                diamondAmountDisplay.innerText = whitelistEntry.diamondAmount;
                goldAmountDisplay.innerText = whitelistEntry.goldAmount;

                if (whitelistEntry.diamondAmount > 0) mintDiamondButton.style.display = "block";
                if (whitelistEntry.goldAmount > 0) mintGoldButton.style.display = "block";
            } else {
                whitelistStatus.style.display = "none";
                notWhitelistedSection.style.display = "block";
            }
        } catch (error) {
            console.error("Error fetching whitelist status:", error);
            whitelistStatus.innerHTML = "<p>❌ Failed to load whitelist status.</p>";
        }
    }

    async function mintVoucher(amount) {
        if (!window.ronin || !window.ronin.provider) {
            alert("❌ Ronin Wallet not detected! Please install it.");
            return;
        }

        try {
            const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });
            const userAddress = accounts[0];

            const provider = new ethers.providers.Web3Provider(window.ronin.provider);
            const signer = provider.getSigner();

            // $MINU Token Contract ABI (Approval + Transfer)
            const minuABI = [
                "function approve(address spender, uint256 amount) public returns (bool)",
                "function transfer(address to, uint256 amount) public returns (bool)"
            ];

            const minuContract = new ethers.Contract(minuTokenAddress, minuABI, signer);

            // Step 1: Approve spending
            console.log("🔄 Approving $MINU tokens...");
            const approveTx = await minuContract.approve(mochiInuWallet, amount);
            await approveTx.wait();
            console.log("✅ Approval confirmed!");

            // Step 2: Transfer tokens to Mochi Inu Wallet
            console.log("🔄 Transferring tokens...");
            const transferTx = await minuContract.transfer(mochiInuWallet, amount);
            await transferTx.wait();
            console.log("✅ Transfer successful!");

            alert("🎉 Mint successful!");
        } catch (error) {
            console.error("❌ Minting error:", error);
            alert("⚠️ Minting failed! Check console for details.");
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
