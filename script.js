document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById("loginButton");
    const walletInfoDisplay = document.getElementById("walletInfo");
    const mintButton = document.createElement("button");
    const mintStatus = document.createElement("div");

    mintButton.id = "mintButton";
    mintButton.innerText = "Mint NFT Voucher";
    mintStatus.id = "mintStatus";

    document.body.appendChild(mintButton);
    document.body.appendChild(mintStatus);

    // Contract Addresses
    const nftContractAddress = "0xC98f378f5DbF90afAD07b24Ef48443231A1df43c"; // NFT Contract
    const minuTokenAddress = "0xfa4384cbac92141bc47b8600db5f3805a33645d2"; // $MINU Token Contract

    const minuDecimals = 18; // $MINU Token Decimals
    const mintCost = 10000000 * (10 ** minuDecimals); // 10M $MINU
    const saigonRPC = "https://saigon-testnet.roninchain.com/rpc";

    let userAddress = null;

    if (window.ronin && window.ronin.provider) {
        loginButton.addEventListener("click", async () => {
            try {
                // Request Ronin Wallet connection
                const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });

                if (accounts.length > 0) {
                    userAddress = accounts[0];

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
                                data: `0x70a08231000000000000000000000000${userAddress.substring(2)}` // balanceOf(address)
                            }, "latest"],
                            id: 2
                        }),
                    }).then(res => res.json()).then(data => data.result);

                    const minuBalance = (parseInt(minuBalanceHex, 16) / 10 ** minuDecimals).toFixed(2);

                    // Update UI (Testnet Balances)
                    walletInfoDisplay.innerHTML = `
                        <p>✅ Connected: <strong>${userAddress}</strong></p>
                        <p>💰 Testnet RON Balance: <strong>${balanceSaigonRON} tRON</strong></p>
                        <p>🪙 $MINU Testnet Balance: <strong>${minuBalance} $MINU</strong></p>
                    `;

                } else {
                    walletInfoDisplay.innerText = "Connection failed.";
                }
            } catch (error) {
                console.error("Connection Error:", error);
                walletInfoDisplay.innerText = "Connection failed. Check console.";
            }
        });
    } else {
        walletInfoDisplay.innerText = "Ronin Wallet not detected! Please install it.";
        loginButton.disabled = true;
    }

    // Mint Button Click Event
    mintButton.addEventListener("click", async () => {
        if (!userAddress) {
            mintStatus.innerHTML = `<p style="color: red;">❌ Wallet not connected!</p>`;
            return;
        }

        try {
            // Step 1: Approve $MINU tokens for spending
            mintStatus.innerHTML = "<p>⏳ Approving $MINU tokens...</p>";

            const approveTx = await window.ronin.provider.request({
                method: "eth_sendTransaction",
                params: [{
                    from: userAddress,
                    to: minuTokenAddress,
                    data: `0x095ea7b3${nftContractAddress.substring(2).padStart(64, '0')}${mintCost.toString(16).padStart(64, '0')}`, // approve(spender, amount)
                    gas: "0x5208"
                }]
            });

            mintStatus.innerHTML = `<p>✅ Approval Sent: <a href="https://saigon-explorer.roninchain.com/tx/${approveTx}" target="_blank">${approveTx}</a></p>`;

            // Step 2: Wait for Approval to Complete
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before minting

            // Step 3: Mint the NFT Voucher
            mintStatus.innerHTML += "<p>⏳ Minting NFT Voucher...</p>";

            // Encoding `mint(address to)` function call
            const functionSelector = "0x6a627842"; // mint(address)
            const paddedAddress = userAddress.substring(2).padStart(64, '0'); // Remove '0x' and pad

            const mintTx = await window.ronin.provider.request({
                method: "eth_sendTransaction",
                params: [{
                    from: userAddress,
                    to: nftContractAddress,
                    data: functionSelector + paddedAddress, // Encoded function call
                    gas: "0x5208"
                }]
            });

            mintStatus.innerHTML += `<p>✅ Minting Successful! <a href="https://saigon-explorer.roninchain.com/tx/${mintTx}" target="_blank">${mintTx}</a></p>`;

        } catch (error) {
            console.error("Minting Error:", error);
            mintStatus.innerHTML = `<p style="color: red;">❌ Minting Failed! Check console for details.</p>`;
        }
    });
});
