document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById("loginButton");
    const walletInfoDisplay = document.getElementById("walletInfo");

    // Saigon Testnet RON & $MINU Token
    const minuTokenAddress = "0xfa4384cbac92141bc47b8600db5f3805a33645d2"; // Replace with actual contract
    const minuDecimals = 18; // Adjust if needed
    const saigonRPC = "https://saigon-testnet.roninchain.com/rpc";

    if (window.ronin && window.ronin.provider) {
        loginButton.addEventListener("click", async () => {
            try {
                // Request Ronin Wallet connection
                const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });

                if (accounts.length > 0) {
                    const userAddress = accounts[0];

                    // Fetch balance (RON) on Saigon Testnet
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

                    // Fetch $MINU token balance from Saigon Testnet
                    const minuBalanceHex = await fetch(saigonRPC, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            jsonrpc: "2.0",
                            method: "eth_call",
                            params: [{
                                to: minuTokenAddress,
                                data: `0x70a08231000000000000000000000000${userAddress.substring(2)}`
                            }, "latest"],
                            id: 2
                        }),
                    }).then(res => res.json()).then(data => data.result);

                    const minuBalance = (parseInt(minuBalanceHex, 16) / 10 ** minuDecimals).toFixed(2);

                    // Update UI (Only Testnet Balances)
                    walletInfoDisplay.innerHTML = `
                        <p>✅ Connected: <strong>${userAddress}</strong></p>
                        <p>💰 Testnet RON Balance: <strong>${balanceSaigonRON} tRON</strong></p>
                        <p>🪙 $MINU Testnet Balance: <strong>${minuBalance} $MINU</strong></p>
                    `;

                    /*  
                    // Mainnet RON Balance (Commented Out for Later)
                    const balanceMainnetHex = await window.ronin.provider.request({
                        method: "eth_getBalance",
                        params: [userAddress, "latest"],
                    });
                    const balanceRON = (parseInt(balanceMainnetHex, 16) / 10 ** 18).toFixed(4);
                    
                    console.log("Mainnet RON:", balanceRON);
                    */
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
