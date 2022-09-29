// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Lib_OVMCode
 * @notice it contains struct of transaction was deposited or withdrawn
 */

library Lib_OVMCodec {
    struct QueueElement {
        bytes32 transactionHash;
        uint40 timestamp;
        uint40 blockNumber;
    }
}