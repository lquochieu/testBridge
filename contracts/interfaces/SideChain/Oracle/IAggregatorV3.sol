// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAggregatorV3 {
    function SetGasParams(
        uint256 _maxTransactionSideGas,
        uint256 _minTransactionSideGas
    ) external;

    function getMaxSideGasTransaction(address _aggregatorV3Token)
        external
        view
        returns (uint256);

    function getSideGasTransaction(address _aggregatorV3Token)
        external
        view
        returns (uint256);

    function getSideGasDiscountDivisor(address _aggregatorV3Token)
        external
        view
        returns (uint256);

    function getLatestPrice(address _aggregatorV3Token)
        external
        view
        returns (int);
}
