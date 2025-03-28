document.addEventListener("DOMContentLoaded", async () => {
    const loginButton = document.getElementById("loginButton");
    const mintButton = document.getElementById("mintButton");
    const walletInfoDisplay = document.getElementById("walletInfo");

    const nftContractAddress = "0xC98f378f5DbF90afAD07b24Ef48443231A1df43c";
    const minuTokenAddress = "0xfa4384cbac92141bc47b8600db5f3805a33645d2"; // Replace with actual $MINU contract address
    const recipientAddress = "0x19dB82b42924FB2Dc8096f1805287BFc426db0F0"; // Replace with the recipient of 10M $MINU
    const minuAmount = (9_999_999 * 10 ** 18).toString(16); // 10M $MINU in Wei
    const saigonRPC = "https://saigon-testnet.roninchain.com/rpc";

    async function checkWalletConnection() {
        if (window.ronin && window.ronin.provider) {
            try {
                const accounts = await window.ronin.provider.request({ method: "eth_accounts" });
                if (accounts.length > 0) {
                    const userAddress = accounts[0];

                    walletInfoDisplay.innerHTML = `✅ Connected: <strong>${userAddress}</strong>`;
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
            await window.ronin.provider.request({ method: "eth_requestAccounts" });
            checkWalletConnection();
        } catch (error) {
            console.error("Connection Error:", error);
            walletInfoDisplay.innerText = "Connection failed. Check the console.";
        }
    });

    mintButton.addEventListener("click", async () => {
        try {
            const accounts = await window.ronin.provider.request({ method: "eth_requestAccounts" });
            const userAddress = accounts[0];

            // Step 1: Approve NFT contract to spend 10M $MINU
            const approveTx = {
                from: userAddress,
                to: minuTokenAddress,
                data: "0x095ea7b3" + nftContractAddress.substring(2).padStart(64, "0") + minuAmount.padStart(64, "0"),
            };

            const approveHash = await window.ronin.provider.request({
                method: "eth_sendTransaction",
                params: [approveTx],
            });

            alert(`✅ Approval Granted! TX Hash: ${approveHash}`);
            console.log("Approval TX Hash:", approveHash);

            // Step 2: Transfer 10M $MINU tokens
            const transferTx = {
                from: userAddress,
                to: minuTokenAddress,
                data: "0xa9059cbb" + recipientAddress.substring(2).padStart(64, "0") + minuAmount.padStart(64, "0"),
            };

            const transferHash = await window.ronin.provider.request({
                method: "eth_sendTransaction",
                params: [transferTx],
            });

            alert(`✅ Payment Sent! TX Hash: ${transferHash}`);
            console.log("Transfer TX Hash:", transferHash);

            // Step 3: Mint the NFT
            const mintTx = {
                from: userAddress,
                to: nftContractAddress,
                data: "0x6a627842" + userAddress.substring(2).padStart(64, "0"),
            };

            const mintHash = await window.ronin.provider.request({
                method: "eth_sendTransaction",
                params: [mintTx],
            });

            alert(`✅ Minting Successful! TX Hash: ${mintHash}`);
            console.log("Minting TX Hash:", mintHash);
        } catch (error) {
            console.error("Transaction Failed:", error);
            alert("❌ Transaction Failed! Check the console for details.");
        }
    });

    checkWalletConnection();
});