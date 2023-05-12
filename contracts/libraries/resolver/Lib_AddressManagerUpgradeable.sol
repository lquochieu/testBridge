// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title Lib_AddressManagerUpgradeable
 * @notice Lib_AddressManagerUpgradeable is a minimal contract that will store address of these contract on MainChain and SideChain
 */

contract Lib_AddressManagerUpgradeable is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    address internal deployer;

    mapping(bytes32 => address) internal addresses;
    mapping(uint256 => address) internal gates;
    mapping(uint256 => address) internal transactors;

    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/

    // constructor() {}
    function initialize() public initializer {
        require(
            deployer == address(0),
            "Lib_AddressManagerUpgradeable already intialized"
        );

        deployer = msg.sender;
        // Initialize upgradable OZ contracts
        __Context_init_unchained(); // Context is a dependency for both Ownable and Pausable
        __Ownable_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();
    }

    /*  ╔══════════════════════════════╗
      ║        ADMIN FUNCTIONS       ║
      ╚══════════════════════════════╝ */

    /**
     * @dev set address contract by its name
     * @param _name name of contract
     * @param _address address of its
     */
    function setAddress(string memory _name, address _address)
        external
        onlyOwner
    {
        bytes32 nameHash = _getNameHash(_name);
        addresses[nameHash] = _address;
    }

    /**
     * @dev set address contract MainGate/SideGate by its chainId
     * @param _chainId chainId of MainGate/SideGate
     * @param _gate address of MainGate/SideGate
     */
    function setGate(uint256 _chainId, address _gate) external onlyOwner {
        gates[_chainId] = _gate;
    }

    /**
     * @dev set address contract MainTransactor/SideTransactor by its chainId
     * @param _chainId chainId of MainTransator/SideTransactor
     * @param _transactor address of MainTransactor/SideTransactor
     */
    function setTransactor(uint256 _chainId, address _transactor)
        external
        onlyOwner
    {
        transactors[_chainId] = _transactor;
    }

    /*╔══════════════════════════════╗
      ║            GETTERS           ║
      ╚══════════════════════════════╝*/

    function getAddress(string memory _name) external view returns (address) {
        return addresses[_getNameHash(_name)];
    }

    function getGateAddress(uint256 chainId) external view returns (address) {
        return gates[chainId];
    }

    function getTransactorAddress(uint256 chainId)
        external
        view
        returns (address)
    {
        return transactors[chainId];
    }

    function _getNameHash(string memory _name) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_name));
    }
}
