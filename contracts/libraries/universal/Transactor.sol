// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

/**
 * @title Transactor
 * @notice Transactor is a minimal contract that can send transactions.
 */
contract Transactor is Ownable, EIP712 {
    mapping(address => bool) public Signers;

    constructor(string memory name, string memory version)
        EIP712(name, version)
    {
        Signers[msg.sender] = true;
    }

    function setSigners(address _signer, bool _isSigner) public onlyOwner {
        require(Signers[_signer] != _isSigner, "Signer was setted");
        Signers[_signer] = _isSigner;
    }

    function executeSignature(
        address _target,
        bytes memory _data,
        bytes memory _signature,
        uint256 _deadline,
        uint256 _gas
    ) internal view returns (bool) {

        require(block.timestamp < _deadline, "Singed transaction expired!");
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "call(address target, bytes data, uint256 _deadline, uint256 gas)"
                    ),
                    _target,
                    _data,
                    _deadline,
                    _gas
                )
            )
        );
        address signer = ECDSA.recover(digest, _signature);
        require(signer != address(0), "ECDSA: invalid signature");
        return signer == owner();
    }

    function CALL(
        address _target,
        bytes memory _data,
        bytes memory _signature,
        uint256 _deadline
    ) external payable onlyOwner returns (bool) {
        require(
            executeSignature(_target, _data, _signature, _deadline, 0),
            "Invalid signature"
        );
        (bool success, ) = _target.call(_data);
        return success;
    }

    /**
     * Sends a DELEGATECALL to a target address.
     *
     * @param _target Address to call.
     * @param _data   Data to send with the call.
     * @param _signature Signature of owner
     * @param _gas    Amount of gas to send with the call.
     *
     * @return Boolean success value.
     * @return Bytes data returned by the call.
     */
    function DELEGATECALL(
        address _target,
        bytes memory _data,
        bytes memory _signature,
        uint256 _deadline,
        uint256 _gas
    ) external payable onlyOwner returns (bool, bytes memory) {
        // slither-disable-next-line controlled-delegatecall
        require(
            executeSignature(_target, _data, _signature, _deadline, _gas),
            "Invalid signature"
        );
        return _target.delegatecall{gas: _gas}(_data);
    }
}
