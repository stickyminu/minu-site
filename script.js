document.getElementById("connectWallet").addEventListener("click", async function () {
    if (window.ronin) {
        try {
            const accounts = await window.ronin.request({ method: "eth_requestAccounts" });
            document.getElementById("walletAddress").innerText = "Connected: " + accounts[0];
        } catch (error) {
            console.error(error);
            alert("Connection failed. Please try again.");
        }
    } else {
        alert("Ronin Wallet not detected. Please install it.");
    }
});
