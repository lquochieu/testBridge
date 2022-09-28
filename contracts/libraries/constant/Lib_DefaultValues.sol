// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Lib_DefaultValues {
    address internal constant DEFAULT_XDOMAIN_SENDER =
        0x0000000000000000000000000000000000000000;

    address public constant BNB_USDT_AggregatorV3_BSC_TESTNET =
        0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526;
    address public constant ETH_USDT_AggregatorV3_BSC_TESTNET =
        0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7;
    address public constant BTC_ETH_AggregatorV3_Goerli_TESTNET =
        0x779877A7B0D9E8603169DdbD7836e478b4624789;

    uint256 public constant UNIQUE_RARITY = 5;
    uint256 public constant BSC_CHAIN_ID_TESTNET = 97;
    uint256 public constant KOVAN_CHAIN_ID_TESTNET = 4;
    uint256 public constant GOERLI_CHAIN_ID_TESTNET = 5;
    uint256 public constant RINKEBY_CHAIN_ID_TESTNET = 42;
}
