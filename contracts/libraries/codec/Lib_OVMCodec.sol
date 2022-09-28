// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Lib_OVMCodec {
    struct QueueElement {
        bytes32 transactionHash;
        uint40 timestamp;
        uint40 blockNumber;
    }
}