document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById("loginButton");
    const walletInfoDisplay = document.getElementById("walletInfo");
    const mintDiamondButton = document.getElementById("mintDiamondButton");
    const mintGoldButton = document.getElementById("mintGoldButton");

    const nftContractAddress = "0xC98f378f5DbF90afAD07b24Ef48443231A1df43c";
    const minuTokenAddress = "0xfa4384cbac92141bc47b8600db5f3805a33645d2";
    const recipientAddress = "0x19dB82b42924FB2Dc8096f1805287BFc426db0F0";
    const minuAmount = (9_999_999 * 10 ** 18).toString(16);
    const saigonRPC = "https://saigon-testnet.roninchain.com/rpc";

    let userAddress = "";

    async function checkWalletConnection() {
        if (window.ronin && window.ronin.provider) {
            try {
                const accounts = await window.ronin.provider.request({ method: "eth_accounts" });
                if (accounts.length > 0) {
                    userAddress = accounts[0];
                    displayWalletInfo(userAddress);
                    await checkWhitelistStatus(userAddress);
                }
            } catch (error) {
                console.error("Error checking wallet connection:", error);
            }
        } else {
            walletInfoDisplay.innerText = "Ronin Wallet not detected! Please install it.";
            loginButton.disabled = true;
        }
    }

    function displayWalletInfo(address) {
        const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
        walletInfoDisplay.innerHTML = `<a href='myaccount.html' class='wallet-link'>${shortAddress}</a>`;
        loginButton.style.display = "none";
    }

    loginButton.addEventListener("click", async () => {
        try {
            const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });
            userAddress = accounts[0];
            displayWalletInfo(userAddress);
            await checkWhitelistStatus(userAddress);
        } catch (error) {
            console.error("Connection Error:", error);
            walletInfoDisplay.innerText = "Connection failed. Check the console.";
        }
    });

    async function checkWhitelistStatus(address) {
        // Fetch whitelist status from backend (this needs an API endpoint)
        const response = await fetch(`/api/whitelist?address=${address}`);
        const data = await response.json();

        const container = document.getElementById("whitelistContainer");

        if (data.whitelisted) {
            container.innerHTML = `
                <p>🎉 Congratulations! You are whitelisted for the Presale.</p>
                <p>Diamond Voucher: ${data.diamondAmount}</p>
                <p>Gold Voucher: ${data.goldAmount}</p>
            `;
            if (data.diamondAmount > 0) mintDiamondButton.style.display = "block";
            if (data.goldAmount > 0) mintGoldButton.style.display = "block";
        } else {
            container.innerHTML = `
                <p>Welcome! Whitelist spots are full.</p>
                <p>You can join the FCFS Public Sale on April 1, 2025, 6:00 PM GMT+8.</p>
            `;
        }
    }

    mintDiamondButton.addEventListener("click", async () => {
        await mintNFT("diamond");
    });

    mintGoldButton.addEventListener("click", async () => {
        await mintNFT("gold");
    });

    async function mintNFT(type) {
        try {
            const mintTx = {
                from: userAddress,
                to: nftContractAddress,
                data: "0x6a627842" + userAddress.substring(2).padStart(64, "0"),
            };

            const mintHash = await window.ronin.provider.request({
                method: "eth_sendTransaction",
                params: [mintTx],
            });

            alert(`✅ ${type.toUpperCase()} Voucher Minted! TX Hash: ${mintHash}`);
        } catch (error) {
            console.error("Minting Failed:", error);
            alert("❌ Minting Failed! Check the console for details.");
        }
    }

    checkWalletConnection();
});