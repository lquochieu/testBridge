// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract AggregatorV3 is Ownable {
    uint256 public maxTransactionSideGas;
    uint256 public minTransactionSideGas;

    int bnbPrice;
    int ethPrice;

    event SideGasParamsUpdated(
        uint256 maxTransactionSideGas,
        uint256 minTransactionSideGas
    );

    constructor(uint256 _maxTransactionSideGas, uint256 _minTransactionSideGas)
    {
        maxTransactionSideGas = _maxTransactionSideGas;
        minTransactionSideGas = _minTransactionSideGas;
        // See the comment in enqueue() for the rationale behind this formula.
    }

    function SetGasParams(
        uint256 _maxTransactionSideGas,
        uint256 _minTransactionSideGas
    ) external onlyOwner {
        maxTransactionSideGas = _maxTransactionSideGas;
        minTransactionSideGas = _minTransactionSideGas;

        // See the comment in enqueue() for the rationale behind this formula.

        emit SideGasParamsUpdated(maxTransactionSideGas, minTransactionSideGas);
    }

    function getMaxSideGasTransaction(address _aggregatorV3Token)
        public
        view
        returns (uint256)
    {
        return
            (maxTransactionSideGas *
                getMainGasDiscountDivisor(_aggregatorV3Token)) / 1e18;
    }

    function getMainGasTransaction(address _aggregatorV3Token)
        public
        view
        returns (uint256)
    {
        return
            (minTransactionSideGas *
                getMainGasDiscountDivisor(_aggregatorV3Token)) / 1e18;
    }

    function getMainGasDiscountDivisor(address _aggregatorV3Token)
        public
        view
        returns (uint256)
    {
        return uint256(getLatestPrice(_aggregatorV3Token));
    }

    function getLatestPrice(address _aggregatorV3Token)
        public
        view
        returns (int)
    {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            _aggregatorV3Token
        );
        (
            ,
            /*uint80 roundID*/
            int price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,

        ) = priceFeed.latestRoundData();
        return price;
    }
}
