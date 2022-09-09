// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Lib_OVMCodec } from "../../../libraries/codec/Lib_OVMCodec.sol";

interface ICanonicalTransactionChain {
    event TransactionEnqueued(
        address indexed _l1TxOrigin,
        address indexed _target,
        uint256 _gasLimit,
        bytes _data,
        uint256 indexed _queueIndex,
        uint256 _timestamp
    );

    function getQueueElement(uint256 _index)
        external
        view
        returns (Lib_OVMCodec.QueueElement memory _element);

    function getQueueLength() external view returns (uint40);

    function enqueue(
        address _target,
        uint256 _gasLimit,
        bytes memory _data
    ) external;
}
