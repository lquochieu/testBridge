// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Transactor
 * @notice Transactor is a minimal contract that can send transactions.
 */
contract Transactor is Ownable {

    constructor() {}

    function CALL(
        address _target,
        bytes memory _data
    ) external payable onlyOwner returns (bool) {
        (bool success, ) =  _target.call(_data);
        return success;
    }

    /**
     * Sends a DELEGATECALL to a target address.
     *
     * @param _target Address to call.
     * @param _data   Data to send with the call.
     * @param _gas    Amount of gas to send with the call.
     *
     * @return Boolean success value.
     * @return Bytes data returned by the call.
     */
    function DELEGATECALL(
        address _target,
        bytes memory _data,
        uint256 _gas
    ) external payable onlyOwner returns (bool, bytes memory) {
        // slither-disable-next-line controlled-delegatecall
        return _target.delegatecall{ gas: _gas }(_data);
    }
}
