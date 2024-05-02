// SPDX-License-Identifier: UNLICENSED
// Specifies the version of Solidity, using semantic versioning.
// Learn more: https://solidity.readthedocs.io/en/v0.5.10/layout-of-source-files.html#pragma
pragma solidity >=0.7.3;

contract MessageContract {
    struct Message {
        address sender;
        address receiver;
        uint256 timestamp;
        string content;
    }
 
    mapping(address => Message[]) sendMessages;
    mapping(address => Message[]) receivedMessages;
 
    event MessageSent(address indexed sender, address indexed receiver, uint256 timestamp, string content);
 
    function sendMessage(address _receiver, string memory _content) external {
        Message memory newMessage = Message({
            sender: msg.sender,
            receiver: _receiver,
            timestamp: block.timestamp,
            content: _content
        });
        sendMessages[msg.sender].push(newMessage);
        receivedMessages[_receiver].push(newMessage);
        emit MessageSent(msg.sender, _receiver, block.timestamp, _content);
    }
 
    function getMessageCount(address _sender) external view returns (uint256) {
        return receivedMessages[_sender].length;
    }

    function getMessage(address _sender, uint256 _index) external view returns (address, address, uint256, string memory) {
        require(_index < receivedMessages[_sender].length, "Message index out of bounds");
        Message memory message = receivedMessages[_sender][_index];
        return (message.sender, message.receiver, message.timestamp, message.content);
    }
}