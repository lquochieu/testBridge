// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SideNFTBase.sol";

contract SideNFTCore is SideNFTBase {
    constructor(address _sideBridge, address _mainNFT) SideNFTBase("TTH NFT", "TTH", _sideBridge, _mainNFT) {}
}
