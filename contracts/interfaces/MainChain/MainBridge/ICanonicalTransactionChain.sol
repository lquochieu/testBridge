// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Lib_OVMCodec} from "../../../libraries/codec/Lib_OVMCodec.sol";

interface ICanonicalTransactionChain {
    function SetGasParams(
        uint256 _maxTransactionSideGas,
        uint256 _minTransactionSideGas
    ) external;

    function getSideGasDiscountDivisor(
        address _mainAggregatorV3Token,
        address _sideAggregatorV3Token
    ) external returns (uint256);

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
