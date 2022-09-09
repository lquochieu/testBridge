// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ICrossDomainMessenger} from "../../../libraries/bridge/ICrossDomainMessenger.sol";

interface IMainCrossDomainMessenger is ICrossDomainMessenger {
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
        // SideMessageInclusionProof memory _proof
    ) external;

    function replayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _queueIndex,
        uint32 _oldGasLimit,
        uint32 _newGasLimit
    ) external;

}
