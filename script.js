document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById("loginButton");
    const mintButton = document.createElement("button"); // Create mint button dynamically
    const walletInfoDisplay = document.getElementById("walletInfo");

    mintButton.id = "mintButton";
    mintButton.innerText = "Mint NFT";
    mintButton.style.display = "none"; // Initially hidden
    document.body.appendChild(mintButton); // Append to the page

    // Ronin Wallet & Contract Info
    const nftContractAddress = "0xC98f378f5DbF90afAD07b24Ef48443231A1df43c"; // NFT contract
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

                    // Display wallet info
                    walletInfoDisplay.innerHTML = `
                        <p>✅ Connected: <strong>${userAddress}</strong></p>
                        <p>💰 Testnet RON Balance: <strong>${balanceSaigonRON} tRON</strong></p>
                    `;

                    // Hide login button and show mint button
                    loginButton.style.display = "none";
                    mintButton.style.display = "block";
                } else {
                    walletInfoDisplay.innerText = "Connection failed.";
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

                // Prepare transaction data
                const mintTx = {
                    from: userAddress,
                    to: nftContractAddress,
                    data: "0x6a627842" + userAddress.substring(2).padStart(64, "0"), // mint(to)
                };

                // Send transaction
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
    } else {
        walletInfoDisplay.innerText = "Ronin Wallet not detected! Please install it.";
        loginButton.disabled = true;
    }
});
