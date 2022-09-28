// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {ECDSAUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {ISideGate} from "../../interfaces/SideChain/SideBridge/ISideGate.sol";

/**
 * @title Transactor
 * @notice Transactor is a minimal contract that can send transactions.
 */
contract SideTransactor is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    EIP712Upgradeable,
    Lib_AddressResolver
{
    mapping(address => bool) public Signers;

    function initialize(string memory name, string memory version, address _libAddressManager)
        public
        initializer
    {
        require(
            address(libAddressManager) == address(0),
            "MainGate already initialized"
        );

        __Lib_AddressResolver_init(_libAddressManager);

        __EIP712_init_unchained(name, version);
        __Ownable_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();
    }

    /**
     * Pause relaying.
     */
    function pause() external onlyOwner {
        _pause();
    }

    function setSigners(address _signer, bool _isSigner) public onlyOwner {
        require(Signers[_signer] != _isSigner, "Signer was setted");
        Signers[_signer] = _isSigner;
    }

    function _verifySignature(
        uint256 _chainId,
        address _target,
        address _sender,
        bytes memory _data,
        uint256 _nonce,
        uint256 _deadline,
        bytes memory _signature
    ) internal pure returns (bool) {
        return true;
    }

    function claimNFTCollection(
        uint256 _chainId,
        address _target,
        address _sender,
        bytes memory _data,
        uint256 _nonce,
        uint256 _deadline,
        bytes memory _signature
    ) public nonReentrant whenNotPaused {

        require(
            _verifySignature(
                _chainId,
                _target,
                _sender,
                _data,
                _nonce,
                _deadline,
                _signature
            ),
            "Invalid signature"
        );
        
        ISideGate(resolve("SideGate")).relayMessage(
            _target,
            _sender,
            _data,
            _nonce
        );
    }
}
