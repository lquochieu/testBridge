// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ICrossDomainMessenger} from "../../libraries/bridge/ICrossDomainMessenger.sol";

interface ISideCrossDomainMessenger is ICrossDomainMessenger {
    
    function relayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _messageNonce
    ) external;

}