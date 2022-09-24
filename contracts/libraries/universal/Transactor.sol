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
        uint256 _messageNonce,
        uint256 _deadline,
        bytes memory _signature
    ) internal view returns (bool) {
        require(block.timestamp < _deadline, "Singed transaction expired!");
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "call(address sender, address target, bytes data, uint256 messageNonce,  uint256 deadline)"
                    ),
                    address(this),
                    _target,
                    keccak256(_data),
                    _messageNonce,
                    _deadline
                )
            )
        );
        address signer = ECDSA.recover(digest, _signature);
        require(signer != address(0), "ECDSA: invalid signature");
        return Signers[signer];
    }

    function claimNFTCollection(
        address _target,
        bytes memory _data,
        uint256 _messageNonce,
        uint256 _deadline,
        bytes memory _signature
    ) external returns (bool) {
        require(
            executeSignature(
                _target,
                _data,
                _messageNonce,
                _deadline,
                _signature
            ),
            "Invalid signature"
        );
        (bool success, ) = _target.call(_data);
        return success;
    }
}
