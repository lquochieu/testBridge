// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Lib_AddressManager is Ownable {

    mapping(bytes32 => address) private addresses;

    function setAddress(string memory _name, address _address) external onlyOwner {
        bytes32 nameHash = _getNameHash(_name);
        addresses[nameHash] = _address;
    }

    function getAddress(string memory _name) external view returns (address) {
        return addresses[_getNameHash(_name)];
    }

    function _getNameHash(string memory _name) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_name));
    }
}