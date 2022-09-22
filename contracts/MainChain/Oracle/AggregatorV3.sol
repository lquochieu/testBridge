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

    function getMaxSideGasTransaction(
        address _mainAggregatorV3Token,
        address _sideAggregatorV3Token
    ) public returns (uint256) {
        return
            (maxTransactionSideGas *
                getSideGasDiscountDivisor(
                    _mainAggregatorV3Token,
                    _sideAggregatorV3Token
                )) / 1e18;
    }

    function getSideGasTransaction(
        address _mainAggregatorV3Token,
        address _sideAggregatorV3Token
    ) public returns (uint256) {
        return
            (minTransactionSideGas *
                getSideGasDiscountDivisor(
                    _mainAggregatorV3Token,
                    _sideAggregatorV3Token
                )) / 1e18;
    }

    function getSideGasDiscountDivisor(
        address _mainAggregatorV3Token,
        address _sideAggregatorV3Token
    ) public returns (uint256) {
        ethPrice = getLatestPrice(_mainAggregatorV3Token);
        bnbPrice = getLatestPrice(_sideAggregatorV3Token);
        return uint256((ethPrice * 1e18) / bnbPrice);
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
