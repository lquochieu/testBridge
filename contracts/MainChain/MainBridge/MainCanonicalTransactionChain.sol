// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_OVMCodec} from "../../libraries/codec/Lib_OVMCodec.sol";

contract MainCanonicalTransactionChain is
    Lib_AddressResolver,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    Lib_OVMCodec.QueueElement[] queueElements;

    /*╔══════════════════════════════╗
      ║            EVENTS            ║
      ╚══════════════════════════════╝*/

    event TransactorEvent(
        address indexed sender,
        address indexed target,
        bytes data,
        uint256 indexed queueIndex,
        uint256 timestamp
    );

    /*╔══════════════════════════════╗
      ║           MODIFIER           ║
      ╚══════════════════════════════╝*/

    modifier onlyGateAdmin() {
        require(
            _msgSender() == resolve("MainGate") || _msgSender() == owner(),
            "Only Gate admin can enqueue message"
        );
        _;
    }

    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/

    function initialize(address _libAddressManager) public initializer {
        require(
            address(libAddressManager) == address(0),
            "MainGate already intialized"
        );

        __Lib_AddressResolver_init(_libAddressManager);
        __Context_init_unchained();
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

    /*╔══════════════════════════════╗
      ║            ENQUEUE           ║
      ╚══════════════════════════════╝*/

    /**
     * @dev store transaction was sent from MainChain to SideChain
     * @param _chainId chainId of SideChain
     * @param _target address of SideGate
     * @param _data data of of relayMessage function was encodeWithSlector on MainChain
     */

    function enqueue(
        uint256 _chainId,
        address _target,
        bytes memory _data
    ) external nonReentrant whenNotPaused onlyGateAdmin {
        address sender;
        if (_msgSender() == tx.origin) {
            sender = _msgSender();
        } else {
            sender = resolveTransactor(_chainId);
        }

        bytes32 transactionHash = keccak256(abi.encode(sender, _target, _data));

        queueElements.push(
            Lib_OVMCodec.QueueElement({
                transactionHash: transactionHash,
                timestamp: uint40(block.timestamp),
                blockNumber: uint40(block.number)
            })
        );

        uint256 queueIndex = queueElements.length - 1;
        emit TransactorEvent(
            sender,
            _target,
            _data,
            queueIndex,
            block.timestamp
        );
    }

    /*╔══════════════════════════════╗
      ║            DEQUEUE           ║
      ╚══════════════════════════════╝*/

    /**
     * @dev delete transaction was sent from MainChain to SideChain
     */
    function dequeue(uint256 _fromIndex, uint256 _toIndex)
        external
        nonReentrant
        whenNotPaused
        onlyOwner
    {
        require(
            _toIndex <= queueElements.length,
            "Not enough length to dequeue"
        );
        for (uint256 i = _fromIndex; i <= _toIndex; i++) {
            delete queueElements[i];
        }
    }

    /*╔══════════════════════════════╗
      ║            GETTERS           ║
      ╚══════════════════════════════╝*/

    function getQueueElement(uint256 _index)
        public
        view
        returns (Lib_OVMCodec.QueueElement memory _element)
    {
        return queueElements[_index];
    }

    function getQueueLength() public view returns (uint40) {
        return uint40(queueElements.length);
    }
}
