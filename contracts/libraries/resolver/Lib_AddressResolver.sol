// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Lib_AddressManager} from "./Lib_AddressManager.sol";

abstract contract Lib_AddressResolver is Initializable {
    
    Lib_AddressManager public libAddressManager;

    function __Lib_AddressResolver_init(address _libAddressManager)
        internal
        onlyInitializing
    {
        libAddressManager = Lib_AddressManager(_libAddressManager);
    }

    function resolve(string memory _name) public view returns (address) {
        return libAddressManager.getAddress(_name);
    }

    function resolveGate(uint256 _chainId) public view returns (address) {
        return libAddressManager.getGateAddress(_chainId);
    }

    function resolveTransactor(uint256 _chainId) public view returns (address) {
        return libAddressManager.getTransactorAddress(_chainId);
    }
}
