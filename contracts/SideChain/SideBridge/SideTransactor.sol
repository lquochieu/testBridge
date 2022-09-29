// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Signature} from "../../libraries/verify/Signature.sol";
import {ISideGate} from "../../interfaces/SideChain/SideBridge/ISideGate.sol";

/**
 * @title SideTransactor
 * @notice SideTransactor is a minimal contract that will verify signature from MainChain when user want to claim NFT Collection what was deposited
 */
contract SideTransactor is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    Lib_AddressResolver
{
    mapping(address => bool) public Signers;

    /*╔══════════════════════════════╗
      ║           MODIFIER           ║
      ╚══════════════════════════════╝*/

    modifier onlyEOA() {
        require(
            !AddressUpgradeable.isContract(_msgSender()),
            "Account not EOA"
        );
        _;
    }

    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/

    function initialize(address _libAddressManager) public initializer {
        require(
            address(libAddressManager) == address(0),
            "MainGate already initialized"
        );

        __Lib_AddressResolver_init(_libAddressManager);
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

    function unpauseContract() external onlyOwner {
        _unpause();
    }

    /*  ╔══════════════════════════════╗
      ║        ADMIN FUNCTIONS       ║
      ╚══════════════════════════════╝ */
      
    /**
     * Set signer who can sign message
     */
    
    function setSigners(address _signer, bool _isSigner) public onlyOwner {
        require(Signers[_signer] != _isSigner, "Signer was setted");
        Signers[_signer] = _isSigner;
    }

    /*  ╔══════════════════════════════╗
      ║      CLAIM NFT COLLECTION      ║
      ╚══════════════════════════════╝ */

    /**
     * @dev receive NFT Collection was depositedon MainChain
     * @param _chainId chainId of this chain
     * @param _target address will call message, when receive infor deposit,
     * target is SideBridge
     * @param _data data when claim is function finalizeDeposit of SideBridge
     * was encodeWithSeclector on MainChain
     * @param _nonce the number of message was sent by MainChain for MainChain,
     * it guarantee  a message from MainChain can't be sent many times
     * @param _deadline deadline of signature
     * @param _signature signature of person who verify these transaction on MainChain
     */

    function claimNFTCollection(
        uint256 _chainId,
        address _target,
        address _sender,
        bytes memory _data,
        uint256 _nonce,
        uint256 _deadline,
        bytes memory _signature
    ) public nonReentrant whenNotPaused onlyEOA {
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

    /**
     * @dev verify signature
     * @return Return true if the signature is valid
     */

    function _verifySignature(
        uint256 _chainId,
        address _target,
        address _sender,
        bytes memory _data,
        uint256 _nonce,
        uint256 _deadline,
        bytes memory _signature
    ) internal view returns (bool) {
        require(block.timestamp < _deadline, "Singed transaction expired!");

        address signer = Signature.verifySignature(
            keccak256(
                abi.encodePacked(
                    _chainId,
                    _target,
                    _sender,
                    _data,
                    _nonce,
                    _deadline
                )
            ),
            _signature
        );

        require(signer != address(0), "ECDSA: invalid signature");
        return Signers[signer];
    }


}
