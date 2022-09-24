// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Lib_OVMCodec} from "../../../libraries/codec/Lib_OVMCodec.sol";

interface ICanonicalTransactionChain {

    function getQueueElement(uint256 _index)
        external
        view
        returns (Lib_OVMCodec.QueueElement memory _element);

    function getQueueLength() external view returns (uint40);

    function enqueue(
        uint256 _chainId,
        address _target,
        bytes memory _data
    ) external;
}
