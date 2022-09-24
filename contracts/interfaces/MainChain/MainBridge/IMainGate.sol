// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ICrossDomainMessenger} from "../../../libraries/bridge/ICrossDomainMessenger.sol";

interface IMainGate is ICrossDomainMessenger {
    struct SideMessageInclusionProof {
        bytes32 stateRoot;
        // Lib_OVMCodec.ChainBatchHeader stateRootBatchHeader;
        // Lib_OVMCodec.ChainInclusionProof stateRootProof;
        // bytes stateTrieWitness;
        // bytes storageTrieWitness;
    }

    function relayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _messageNonce
    ) external;

    function replayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _queueIndex
    ) external;
}
