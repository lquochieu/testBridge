// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_AddressManager} from "../../libraries/resolver/Lib_AddressManager.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";
import {Lib_OVMCodec} from "../../libraries/codec/Lib_OVMCodec.sol";

import {IMainCanonicalTransactionChain} from "../../interfaces/MainChain/MainBridge/IMainCanonicalTransactionChain.sol";
import {ISideGate} from "../../interfaces/SideChain/SideBridge/ISideGate.sol";
contract MainGate is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    Lib_AddressResolver
{
    address internal xDomainMsgSender;

    /**********
     * Events *
     **********/

    event MessageBlocked(bytes32 indexed _xDomainCallDataHash);

    event MessageAllowed(bytes32 indexed _xDomainCallDataHash);

    event SentMessage(
        uint256 chainId,
        address indexed target,
        address sender,
        bytes message,
        uint256 messageNonce
    );
    event RelayedMessage(bytes32 indexed msgHash);
    event FailedRelayedMessage(bytes32 indexed msgHash);

    /**********************
     * Contract Variables *
     **********************/

    mapping(bytes32 => bool) public blockedMessages;
    mapping(bytes32 => bool) public relayedMessages;
    mapping(bytes32 => bool) public successfulMessages;
    mapping(bytes32 => bool) public sentMessages;

    /***************
     * Constructor *
     ***************/

    function initialize(address _libAddressManager) public initializer {
        require(
            address(libAddressManager) == address(0),
            "MainGate already initialized"
        );

        xDomainMsgSender = Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;
        
        __Lib_AddressResolver_init(_libAddressManager);
        __Context_init_unchained(); 
        __Ownable_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();
        
    }

    function xDomainMessageSender() public view returns (address) {
        require(
            xDomainMsgSender != Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER,
            "xDomainMsgSender is not set"
        );
        return xDomainMsgSender;
    }

    function _encodeRelayMessage(address _target, address _sender, bytes memory _data, uint256 _messageNonce) internal pure returns(bytes memory) {
        return abi.encodeWithSelector(
            ISideGate.relayMessage.selector,
            _target,
            _sender,
            _data,
            _messageNonce
        );
    }

    /**
     * Pause relaying.
     */
    function pause() external onlyOwner {
        _pause();
    }

    function blockMessage(bytes32 _xDomainCallDataHash) external onlyOwner {
        blockedMessages[_xDomainCallDataHash] = true;
        emit MessageBlocked(_xDomainCallDataHash);
    }

    function allowMessage(bytes32 _xDomainCallDataHash) external onlyOwner {
        blockedMessages[_xDomainCallDataHash] = false;
        emit MessageAllowed(_xDomainCallDataHash);
    }
    function sendMessage(
        uint256 _chainId,
        address _target,
        bytes memory _message
    ) public whenNotPaused {

        require(
            _msgSender() == resolve("MainBridge"),
            "Only MainBridge can send message"
        );

        address ovmCanonicalTransactionChain = resolve(
            "MainCanonicalTransactionChain"
        );

        uint40 nonce = IMainCanonicalTransactionChain(ovmCanonicalTransactionChain)
            .getQueueLength();

        bytes memory xDomainCallData = _encodeRelayMessage( _target, _msgSender(), _message, nonce);

        require(!sentMessages[keccak256(xDomainCallData)], "Message was sent!");
        sentMessages[keccak256(xDomainCallData)] = true;

        _sendXDomainMessage(
            _chainId,
            ovmCanonicalTransactionChain,
            xDomainCallData
        );

        emit SentMessage(_chainId, _target, _msgSender(), _message, nonce);
    }

    function relayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _messageNonce
    ) public nonReentrant whenNotPaused {

        require(msg.sender == resolve("MainTransactor"), "Invalid sender");

        bytes memory xDomainCallData = _encodeRelayMessage(_target, _sender, _message, _messageNonce);

        bytes32 xDomainCallDataHash = keccak256(xDomainCallData);

        require(
            successfulMessages[xDomainCallDataHash] == false,
            "Provided message has already been received."
        );

        require(
            blockedMessages[xDomainCallDataHash] == false,
            "Provided message has been blocked."
        );
        xDomainMsgSender = _sender;

        (bool success, ) = _target.call(_message);

        xDomainMsgSender = Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;

        if (success == true) {
            successfulMessages[xDomainCallDataHash] = true;
            emit RelayedMessage(xDomainCallDataHash);
        } else {
            emit FailedRelayedMessage(xDomainCallDataHash);
        }

        bytes32 relayId = keccak256(
            abi.encodePacked(xDomainCallData, _msgSender(), block.number)
        );
        relayedMessages[relayId] = true;
    }

    function replayMessage(
        uint256 _chainId,
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _queueIndex
    ) public nonReentrant whenNotPaused {
        require(
            _msgSender() == resolve("MainBridge") || _msgSender() == owner(),
            "Only MainBridge or admin can replay message"
        );
        // Verify that the message is in the queue:
        address canonicalTransactionChain = resolve(
            "MainCanonicalTransactionChain"
        );
        Lib_OVMCodec.QueueElement memory element = IMainCanonicalTransactionChain(
            canonicalTransactionChain
        ).getQueueElement(_queueIndex);

        // Compute the calldata that was originally used to send the message.
        bytes memory xDomainCallData = _encodeRelayMessage(_target, _sender, _message, _queueIndex);

        // Compute the transactionHash
        bytes32 transactionHash = keccak256(
            abi.encode(
                resolveTransactor(_chainId),
                resolveGate(_chainId),
                xDomainCallData
            )
        );

        // Now check that the provided message data matches the one in the queue element.
        require(
            transactionHash == element.transactionHash,
            "Provided message has not been enqueued."
        );

        _sendXDomainMessage(
            _chainId,
            canonicalTransactionChain,
            xDomainCallData
        );
    }

    function _sendXDomainMessage(
        uint256 _chainId,
        address _canonicalTransactionChain,
        bytes memory _message
    ) internal {
        IMainCanonicalTransactionChain(_canonicalTransactionChain).enqueue(
            _chainId,
            resolveGate(_chainId),
            _message
        );
    }
}
