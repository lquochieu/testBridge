// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_AddressManager} from "../../libraries/resolver/Lib_AddressManager.sol";
import {Lib_CrossDomainUtils} from "../../libraries/bridge/Lib_CrossDomainUtils.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";
import {Lib_OVMCodec} from "../../libraries/codec/Lib_OVMCodec.sol";

import {ICanonicalTransactionChain} from "../../interfaces/MainChain/rollup/ICanonicalTransactionChain.sol";

contract MainCrossDomainMessenger is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    Lib_AddressResolver
{
    address internal xDomainMsgSender =
        Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;

    /**********
     * Events *
     **********/

    event MessageBlocked(bytes32 indexed _xDomainCalldataHash);

    event MessageAllowed(bytes32 indexed _xDomainCalldataHash);

    event SentMessage(
        address indexed target,
        address sender,
        bytes message,
        uint256 messageNonce,
        uint256 gasLimit
    );
    event RelayedMessage(bytes32 indexed msgHash);
    event FailedRelayedMessage(bytes32 indexed msgHash);

    /**********************
     * Contract Variables *
     **********************/

    mapping(bytes32 => bool) public blockedMessages;
    mapping(bytes32 => bool) public relayedMessages;
    mapping(bytes32 => bool) public successfulMessages;

    /***************
     * Constructor *
     ***************/

    constructor() Lib_AddressResolver(address(0)) {}

    function initialize(address _libAddressManager) public onlyOwner {
        require(
            address(libAddressManager) == address(0),
            "MainCrossDomainMessenger already intialized"
        );
        libAddressManager = Lib_AddressManager(_libAddressManager);

        xDomainMsgSender = Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;

        // Initialize upgradable OZ contracts
        __Context_init_unchained(); // Context is a dependency for both Ownable and Pausable
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

    /**
     * Pause relaying.
     */
    function pause() external onlyOwner {
        _pause();
    }

    function blockMessage(bytes32 _xDomainCalldataHash) external onlyOwner {
        blockedMessages[_xDomainCalldataHash] = true;
        emit MessageBlocked(_xDomainCalldataHash);
    }

    function allowMessage(bytes32 _xDomainCalldataHash) external onlyOwner {
        blockedMessages[_xDomainCalldataHash] = false;
        emit MessageAllowed(_xDomainCalldataHash);
    }

    function sendMessage(
        address _target,
        bytes memory _message,
        uint256 _gasLimit
    ) public {
        require(
            msg.sender == resolve("MainBridge"),
            "Only MainBridge can send message"
        );

        address ovmCanonicalTransactionChain = resolve(
            "CanonicalTransactionChain"
        );

        uint40 nonce = ICanonicalTransactionChain(ovmCanonicalTransactionChain)
            .getQueueLength();

        bytes memory xDomainCallData = Lib_CrossDomainUtils
            .encodeXDomainCalldata(_target, msg.sender, _message, nonce);

        _sendXDomainMessage(
            ovmCanonicalTransactionChain,
            xDomainCallData,
            _gasLimit
        );

        emit SentMessage(_target, msg.sender, _message, nonce, _gasLimit);
    }

    function relayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _messageNonce
    ) public nonReentrant whenNotPaused onlyOwner {
        bytes memory xDomainCalldata = Lib_CrossDomainUtils
            .encodeXDomainCalldata(_target, _sender, _message, _messageNonce);

        bytes32 xDomainCalldataHash = keccak256(xDomainCalldata);


        require(
            successfulMessages[xDomainCalldataHash] == false,
            "Provided message has already been received."
        );

        require(
            blockedMessages[xDomainCalldataHash] == false,
            "Provided message has been blocked."
        );

        require(
            _target != resolve("CanonicalTransactionChain"),
            "Cannot send SideChain -> MainChain messages to Main system contracts."
        );

        xDomainMsgSender = _sender;

        (bool success, ) = _target.call(_message);

        xDomainMsgSender = Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;

        if (success == true) {
            successfulMessages[xDomainCalldataHash] = true;
            emit RelayedMessage(xDomainCalldataHash);
        } else {
            emit FailedRelayedMessage(xDomainCalldataHash);
        }

        bytes32 relayId = keccak256(
            abi.encodePacked(xDomainCalldata, msg.sender, block.number)
        );
        relayedMessages[relayId] = true;
    }

    function replayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _queueIndex,
        uint256 _oldGasLimit,
        uint256 _newGasLimit
    ) public {
        require(
            msg.sender == resolve("MainBridge") || msg.sender == owner(),
            "Only MainBridge or admin can replay message"
        );
        // Verify that the message is in the queue:
        address canonicalTransactionChain = resolve(
            "CanonicalTransactionChain"
        );
        Lib_OVMCodec.QueueElement memory element = ICanonicalTransactionChain(
            canonicalTransactionChain
        ).getQueueElement(_queueIndex);

        // Compute the calldata that was originally used to send the message.
        bytes memory xDomainCalldata = Lib_CrossDomainUtils
            .encodeXDomainCalldata(_target, _sender, _message, _queueIndex);

        // Compute the transactionHash
        bytes32 transactionHash = keccak256(
            abi.encode(
                resolve("SideTransactor"),
                resolve("SideCrossDomainMessenger"),
                _oldGasLimit,
                xDomainCalldata
            )
        );

        // Now check that the provided message data matches the one in the queue element.
        require(
            transactionHash == element.transactionHash,
            "Provided message has not been enqueued."
        );

        // Send the same message but with the new gas limit.
        _sendXDomainMessage(
            canonicalTransactionChain,
            xDomainCalldata,
            _newGasLimit
        );
    }

    function _sendXDomainMessage(
        address _canonicalTransactionChain,
        bytes memory _message,
        uint256 _gasLimit
    ) internal {
        ICanonicalTransactionChain(_canonicalTransactionChain).enqueue(
            resolve("SideCrossDomainMessenger"),
            _gasLimit,
            _message
        );
    }
}
