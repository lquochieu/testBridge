// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICrossDomainMessenger {

    function xDomainMessageSender() external view returns (address);

    function sendMessage(
        uint256 _chainId,
        address _target,
        bytes calldata _message
    ) external;
}
