const { SecretNetworkClient, MsgExecuteContract } = window.secretjs;



const REGISTRATION_CONTRACT = "secret1td09kmwqrq3gm67c0g95nlfwhk5dwjyxzm8apc";
const REGISTRATION_HASH = "4927d814875de5bf63b97e21e682fdd7cb7e9d60e46e0c9f862b84904ece4670";
const GOV_CONTRACT = "secret1k3apatdqj46z6p5sh840k6tlkvnlmc2ug7dyf7";
const GOV_HASH = "a0c6f06962720a447d8759274db48873bf17852b7fcc468af0b8b12ed66e1611";

let erth_viewing_key;

window.addEventListener("keplr_keystorechange", () => {
    console.log("Changed accounts");
    location.reload(true);
});

async function connectKeplr() {
    const chainId = 'secret-4';  // Mainnet chain ID

    if (!window.getOfflineSigner || !window.keplr) {
        alert("Please install the Keplr extension.");
    } else {
        try {
            showLoadingScreen(true);
            console.log("Connecting to Keplr...");
            document.querySelector("#wallet-connection-box").classList.add('remove');
            await window.keplr.enable(chainId);
            const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(chainId);
            const accounts = await keplrOfflineSigner.getAccounts();
            const address = accounts[0].address;

            window.secretjs = new SecretNetworkClient({
                url: "https://lcd.mainnet.secretsaturn.net",
                chainId: chainId,
                wallet: keplrOfflineSigner,
                walletAddress: address,
                encryptionUtils: window.keplr.getEnigmaUtils(chainId),
            });

            if (address) {
                try {
                    let wallet_name = await window.keplr.getKey(chainId);
                    const walletNameElement = document.querySelector("#wallet-name");
                    if (walletNameElement) {
                        walletNameElement.innerHTML = wallet_name.name.slice(0, 12);
                        console.log("Connected to Keplr with wallet name:", wallet_name.name);
                    } else {
                        console.error("#wallet-name element not found!");
                    }
                    start();  // Call start() after successful connection
                } catch (error) {
                    console.log("Error getting wallet name:", error);
                }
            } else {
                console.log("Error connecting to Keplr: Address not found.");
                document.querySelector("#wallet-connection-box").classList.remove('remove');
            }
        } catch (error) {
            console.error("Error connecting to Keplr:", error);
            document.querySelector("#wallet-connection-box").classList.remove('remove');
        } finally {
        }
    }
}

async function loadSidebar() {
    try {
        const response = await fetch('html/sidebar.html');
        const sidebarHTML = await response.text();
        document.getElementById('sidebar-placeholder').innerHTML = sidebarHTML;
        console.log("Sidebar loaded successfully.");
    } catch (error) {
        console.error("Error loading sidebar:", error);
    }
}

async function initialization() {
    showLoadingScreen(true);
    try {
        await loadSidebar();
        await connectKeplr();
        // Additional initialization can go here
    } catch (error) {
        console.error("Initialization error:", error);
    }
}

function showLoadingScreen(show) {
    const loadingScreen = document.querySelector("#loading-screen");
    if (loadingScreen) {
        if (show) {
            loadingScreen.classList.remove('remove');
            console.log("Showing loading screen");
        } else {
            loadingScreen.classList.add('remove');
            console.log("Hiding loading screen");
        }
    } else {
        console.error('Loading screen element not found!');
    }
}

// Ensure initialization() is called when the page loads
document.addEventListener("DOMContentLoaded", initialization);

