// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICrossDomainMessenger {
    event SentMessage(
        address indexed target,
        address sender,
        bytes message,
        uint256 messageNonce
    );
    event RelayedMessage(bytes32 indexed msgHash);
    event FailedRelayedMessage(bytes32 indexed msgHash);

    function xDomainMessageSender() external view returns (address);

    function sendMessage(
        uint256 _chainId,
        address _target,
        bytes calldata _message
    ) external;
}
