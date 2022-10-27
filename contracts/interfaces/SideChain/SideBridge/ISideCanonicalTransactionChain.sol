// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Lib_OVMCodec} from "../../../libraries/codec/Lib_OVMCodec.sol";

interface ISideCanonicalTransactionChain {
    function pause() external;

    function getQueueElement(uint256 _index)
        external
        view
        returns (Lib_OVMCodec.QueueElement memory _element);

    function getQueueLength() external view returns (uint40);

    function enqueue(
        uint256 _chainId,
        address _target,
        address _sender,
        bytes memory _message,
        bytes memory _data
    ) external;

    // function dequeue(uint256 _fromIndex, uint256 _toIndex) external;
}
