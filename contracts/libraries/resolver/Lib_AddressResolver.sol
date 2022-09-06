// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Lib_AddressManager } from "./Lib_AddressManager.sol";

abstract contract Lib_AddressResolver {

    Lib_AddressManager public libAddressManager;

    constructor(address _libAddressManager) {
        libAddressManager = Lib_AddressManager(_libAddressManager);
    }

    function resolve(string memory _name) public view returns (address) {
        return libAddressManager.getAddress(_name);
    }
}
