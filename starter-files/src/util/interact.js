const contractABI = require('../contract-abi.json');
const alchemyKey = "wss://eth-sepolia.g.alchemy.com/v2/P39DFJvglTWtQLx1_HoXhulMLmsY3RiT"
const contractAddress = "0xd3414aAf6E53c4306ae0aC2661EB3c7ab8603282";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey); 

export const messageContract = new web3.eth.Contract(
    contractABI,
    contractAddress
);

export const loadAllMessages = async (address) => { 
    const messagesCount = await messageContract.methods.getMessageCount(address).call();
    const messages = [];
    for (let i = 0; i < messagesCount; i++) {
        let msg = await messageContract.methods.getMessage(address, i).call();
        messages.push(msg);
    }
    return messages;
};

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const obj = {
                status: "👆🏽 Write a message in the text-field above.",
                address: addressArray[0],
            };
            return obj;
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                <p>
                    {" "}
                    🦊{" "}
                    <a target="_blank" href={`https://metamask.io/download`}>
                    You must install Metamask, a virtual Ethereum wallet, in your
                    browser.
                    </a>
                </p>
                </span>
            ),
        };
    }
};

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (addressArray.length > 0) {
                return {
                    address: addressArray[0],
                    status: "👆🏽 Write a message in the text-field above.",
                };
            } else {
                return {
                    address: "",
                    status: "🦊 Connect to Metamask using the top right button.",
                };
            }
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                <p>
                    {" "}
                    🦊{" "}
                    <a target="_blank" href={`https://metamask.io/download`}>
                    You must install Metamask, a virtual Ethereum wallet, in your
                    browser.
                    </a>
                </p>
                </span>
            ),
        };
    }
};

export const sendMessage = async (address, receiver, message) => {
    if (!window.ethereum || address === null) {
        return {
            status: "💡 Connect your Metamask wallet to update the message on the blockchain.",
        };
    }

    if (message.trim() === "") {
        return {
            status: "❌ Your message cannot be an empty string.",
        };
    }

    if (receiver.trim() === "") {
        return {
            status: "❌  Receiver address cannot be empty.",
        };
    }
    //set up transaction parameters
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: address, // must match user's active address.
        data: messageContract.methods.sendMessage(receiver, message).encodeABI(),
    };

    //sign the transaction
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
        });
        return {
            status: (
                <span>
                ✅{" "}
                <a target="_blank" href={`https://sepolia.etherscan.io/tx/${txHash}`}>
                    View the status of your transaction on Etherscan!
                </a>
                <br />
                ℹ️ Once the transaction is verified by the network, the message will
                be updated automatically.
                </span>
            ),
        };
    } catch (error) {
        return {
            status: "😥 " + error.message,
        };
    }
};
