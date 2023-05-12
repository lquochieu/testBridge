// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./Lib_AddressManagerUpgradeable.sol";

/**
 * @title Lib_AddressResolver
 * @notice Lib_AddressResolver will resolve address contract from Lib_AddressManager
 */
abstract contract Lib_AddressResolverUpgradeable is Initializable {
    
    Lib_AddressManagerUpgradeable public libAddressManager;

    function __Lib_AddressResolverUpgradeable_init(address _libAddressManager)
        internal
        onlyInitializing
    {
        libAddressManager = Lib_AddressManagerUpgradeable(_libAddressManager);
    }

    /**
     * @dev get address of contract by its Name
     */
    function resolve(string memory _name) public view returns (address) {
        return libAddressManager.getAddress(_name);
    }

    /**
     * @dev get address of SideGate by chainId
     */
    function resolveGate(uint256 _chainId) public view returns (address) {
        return libAddressManager.getGateAddress(_chainId);
    }

    /**
     * @dev get address of SideTransactor by chainId
     */
    function resolveTransactor(uint256 _chainId) public view returns (address) {
        return libAddressManager.getTransactorAddress(_chainId);
    }
}
