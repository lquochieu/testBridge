// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Lib_AddressManager is Ownable {

    mapping(bytes32 => address) private addresses;
    mapping(uint256 => address) private gates;
    mapping(uint256 => address) private transactors;

    function setAddress(string memory _name, address _address) external onlyOwner {
        bytes32 nameHash = _getNameHash(_name);
        addresses[nameHash] = _address;
    }

    function setGate(uint256 _chainId, address _gate) external onlyOwner {
        gates[_chainId] = _gate;
    }

    function setTransactor(uint256 _chainId, address _transactor) external onlyOwner {
        transactors[_chainId] = _transactor;
    }

    function getAddress(string memory _name) external view returns (address) {
        return addresses[_getNameHash(_name)];
    }

    function _getNameHash(string memory _name) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_name));
    }

    function getGateAddress(uint256 chainId) external view returns(address) {
        return gates[chainId];
    }

    function getTransactorAddress(uint256 chainId) external view returns(address) {
        return transactors[chainId];
    }
}