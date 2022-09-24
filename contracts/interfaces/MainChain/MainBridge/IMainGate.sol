// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ICrossDomainMessenger} from "../../../libraries/bridge/ICrossDomainMessenger.sol";

interface IMainGate is ICrossDomainMessenger {

    function pause() external;

    function blockMessage(bytes32 _xDomainCallDataHash) external;

    function allowMessage(bytes32 _xDomainCallDataHash) external;

    function relayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _messageNonce
    ) external;

    function replayMessage(
        uint256 _chainId,
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _queueIndex
    ) external;
}
