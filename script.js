document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById("loginButton");
    const mintButton = document.createElement("button");
    const walletInfoDisplay = document.getElementById("walletInfo");

    mintButton.id = "mintButton";
    mintButton.innerText = "Mint NFT";
    mintButton.style.display = "none";
    document.body.appendChild(mintButton);

    const nftContractAddress = "0xC98f378f5DbF90afAD07b24Ef48443231A1df43c";
    const saigonRPC = "https://saigon-testnet.roninchain.com/rpc";

    async function checkWalletConnection() {
        if (window.ronin && window.ronin.provider) {
            try {
                const accounts = await window.ronin.provider.request({ method: "eth_accounts" });

                if (accounts.length > 0) {
                    const userAddress = accounts[0];

                    // Fetch balance
                    const balanceHex = await fetch(saigonRPC, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            jsonrpc: "2.0",
                            method: "eth_getBalance",
                            params: [userAddress, "latest"],
                            id: 1,
                        }),
                    }).then(res => res.json()).then(data => data.result);

                    const balanceSaigonRON = (parseInt(balanceHex, 16) / 10 ** 18).toFixed(4);

                    // Display wallet info
                    walletInfoDisplay.innerHTML = `
                        <p>✅ Connected: <strong>${userAddress}</strong></p>
                        <p>💰 Testnet RON Balance: <strong>${balanceSaigonRON} tRON</strong></p>
                    `;

                    // Hide login button and show mint button
                    loginButton.style.display = "none";
                    mintButton.style.display = "block";
                }
            } catch (error) {
                console.error("Error checking wallet connection:", error);
            }
        } else {
            walletInfoDisplay.innerText = "Ronin Wallet not detected! Please install it.";
            loginButton.disabled = true;
        }
    }

    loginButton.addEventListener("click", async () => {
        try {
            const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });

            if (accounts.length > 0) {
                checkWalletConnection(); // Refresh UI state after connection
            }
        } catch (error) {
            console.error("Connection Error:", error);
            walletInfoDisplay.innerText = "Connection failed. Check the console.";
        }
    });

    mintButton.addEventListener("click", async () => {
        try {
            const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });
            const userAddress = accounts[0];

            const mintTx = {
                from: userAddress,
                to: nftContractAddress,
                data: "0x6a627842" + userAddress.substring(2).padStart(64, "0"), // mint(to)
            };

            const txHash = await window.ronin.provider.request({
                method: "eth_sendTransaction",
                params: [mintTx],
            });

            alert(`✅ Transaction Sent! TX Hash: ${txHash}`);
            console.log("Transaction Hash:", txHash);
        } catch (error) {
            console.error("Minting Failed:", error);
            alert("❌ Minting Failed! Check the console for details.");
        }
    });

    // Check wallet connection on page load
    checkWalletConnection();
});
