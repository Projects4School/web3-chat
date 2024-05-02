import React from "react";
import { useEffect, useState } from "react";
import {
  messageContract,
  connectWallet,
  sendMessage,
  getCurrentWalletConnected,
  loadAllMessages,
} from "./util/interact.js";

import alchemylogo from "./alchemylogo.svg";

const HelloWorld = () => {
  //state variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState([]); //default message
  const [newMessage, setNewMessage] = useState("");
  const [receiver, setReceiver] = useState("");
  const [messageSent, setMessagSent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredMessages = messages.filter((msg) =>
    msg[3].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredMessages = () => {
    if(searchTerm.length > 0) 
      return filteredMessages;
    else
      return messages;
  }

  //called only once
  useEffect(() => {
    fetchWallet();
    addWalletListener(); 

    addSmartContractListener();
  }, []);

  async function fetchWallet() {
    const {address, status} = await getCurrentWalletConnected();
    setWallet(address);
    setStatus(status); 
    fetchMessages(address)
  }

  async function fetchMessages(address) {
    const msgs = await loadAllMessages(address);
    setMessages(msgs);
  }

  function addSmartContractListener() { //TODO: implement
    messageContract.events.MessageSent(async (error, data) => {
      if (error) {
        setStatus("😥 " + error.message);
      } else {
        const {address, status} = await getCurrentWalletConnected();
        console.log(address, data)
        if(address.toLowerCase() == data.returnValues.sender.toLowerCase())
        {
          setNewMessage("");
          setStatus("🎉 Your message has been sent!");
        }
        else
        {
          fetchWallet();
          if(address == data.returnValues.receiver.toLowerCase())
          {
            console.log("oui")
            sendNotification("New message ! From " + data.returnValues.sender.toUpperCase());
          }
        }
      }
    });
  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => { //TODO: implement
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onSendPressed = async () => {
    const { status } = await sendMessage(walletAddress, receiver, newMessage);
    setStatus(status);
    setMessagSent(true);
  };

  const sendNotification = (msg) => {
    if (Notification.permission === "granted") {
      const notification = new Notification(msg);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          const notification = new Notification(msg);
        }
      });
    }
  }

  const stringToColour = (str) => {
    let hash = 0;
    str.split('').forEach(char => {
      hash = char.charCodeAt(0) + ((hash << 5) - hash)
    })
    let colour = '#'
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      colour += value.toString(16).padStart(2, '0')
    }
    return colour
  }

  const hexToRgbA = (hex, opacity) => {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = `0x${c.join('')}`;
      return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity})`;
    }
    throw new Error('Bad Hex');
  };

  //the UI of our component
  return (
    <div id="container">
      <img id="logo" src={alchemylogo}></img>
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
      
      <h2>{messages.length} message(s) received.</h2>

      <h2 style={{ paddingTop: "10px" }}>Messages received:</h2>
      <input
        type="text"
        placeholder="Search messages..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {messages.length > 0 
        ? getFilteredMessages().map(msg => <div style={{ 
          backgroundColor: hexToRgbA(stringToColour(msg[0]), 0.2), 
          margin: "10px 0px",
          borderRadius: 10,
          padding: '3px',
        }} key={msg[0]*Math.random()}><p style={{margin: 2}}>Sender address : {msg[0]}</p><p style={{margin: 2}}> Date : {new Date(msg[2]*1000).toLocaleString()}</p><p style={{margin: 2}}>Content : {msg[3]}</p></div>)
        : <p>No message</p>}
      

      <h2 style={{ paddingTop: "10px" }}>New Message:</h2>

      <div>
      <input
          type="text"
          id="receiver"
          placeholder="Receiver's address"
          onChange={(e) => setReceiver(e.target.value)}
          value={receiver}
        /><br/>
        <input
          type="text"
          id="message"
          placeholder="Send new message"
          onChange={(d) => setNewMessage(d.target.value)}
          value={newMessage}
        />
        <p id="status">{status}</p>

        <button id="publish" onClick={onSendPressed}>
          Send
        </button>
      </div>
    </div>
  );
};

export default HelloWorld;
