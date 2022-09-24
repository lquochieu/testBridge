// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Lib_CrossDomainUtils} from "../../libraries/bridge/Lib_CrossDomainUtils.sol";
import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_AddressManager} from "../../libraries/resolver/Lib_AddressManager.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";
import {Lib_OVMCodec} from "../../libraries/codec/Lib_OVMCodec.sol";

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import {ICanonicalTransactionChain} from "../../interfaces/MainChain/MainBridge/ICanonicalTransactionChain.sol";

contract SideGate is
    Lib_AddressResolver,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    address internal xDomainMsgSender =
        Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;
    address internal mainGate;

    mapping(bytes32 => bool) public blockedMessages;
    mapping(bytes32 => bool) public relayedMessages;
    mapping(bytes32 => bool) public successfulMessages;
    mapping(bytes32 => bool) public sentMessages;

    event MessageBlocked(bytes32 indexed _xDomainCallDataHash);
    event MessageAllowed(bytes32 indexed _xDomainCallDataHash);

    event SideTransactorEvent(address indexed target, bytes data);

    event SentMessage(
        address indexed target,
        address sender,
        bytes message,
        uint256 nonce
    );

    event RelayedMessage(bytes32 indexed msgHash);
    event FailedRelayedMessage(bytes32 indexed msgHash);

    constructor(address _mainGate) Lib_AddressResolver(address(0)) {
        mainGate = _mainGate;
    }

    function initialize(address _libAddressManager) public initializer {
        require(
            address(libAddressManager) == address(0),
            "SideGate already intialized"
        );
        libAddressManager = Lib_AddressManager(_libAddressManager);
        xDomainMsgSender = Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;

        // Initialize upgradable OZ contracts
        __Context_init_unchained(); // Context is a dependency for both Ownable and Pausable
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

    function getMainGate() public view returns (address) {
        return mainGate;
    }

    function xDomainMessageSender() public view returns (address) {
        require(
            xDomainMsgSender != Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER,
            "xDomainMessageSender is not set"
        );
        return xDomainMsgSender;
    }

    function blockMessage(bytes32 _xDomainCallDataHash) external onlyOwner {
        blockedMessages[_xDomainCallDataHash] = true;
        emit MessageBlocked(_xDomainCallDataHash);
    }

    function allowMessage(bytes32 _xDomainCallDataHash) external onlyOwner {
        blockedMessages[_xDomainCallDataHash] = false;
        emit MessageAllowed(_xDomainCallDataHash);
    }

    function sendMessage(uint256 _chainId, address _target, bytes memory _message) public {
        
        require(
            msg.sender == resolve("SideBridge"),
            "Only SideBridge can send message"
        );

        address ovmCanonicalTransactionChain = resolve(
            "CanonicalTransactionChain"
        );

        uint40 nonce = ICanonicalTransactionChain(ovmCanonicalTransactionChain)
            .getQueueLength();

        bytes memory xDomainCallData = Lib_CrossDomainUtils
            .encodeXDomainCallData(_target, msg.sender, _message, nonce);

        require(!sentMessages[keccak256(xDomainCallData)], "Message was sent!");

        sentMessages[keccak256(xDomainCallData)] = true;

        _sendXDomainMessage(_chainId, ovmCanonicalTransactionChain, xDomainCallData);

        emit SentMessage(_target, msg.sender, _message, nonce);
    }

    function replayMessage(
        uint256 _chainId,
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _queueIndex
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
        bytes memory xDomainCallData = Lib_CrossDomainUtils
            .encodeXDomainCallData(_target, _sender, _message, _queueIndex);

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

    function relayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _nonce
    ) public nonReentrant whenNotPaused onlyOwner {
        
        require(
            msg.sender == resolveTransactor(Lib_DefaultValues.GOERLI_CHAIN_ID_TESTNET),
            "Provided message could not be verified."
        );

        bytes memory xDomainCallData = Lib_CrossDomainUtils
            .encodeXDomainCallData(_target, _sender, _message, _nonce);

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

        // slither-disable-next-line reentrancy-no-eth, reentrancy-events, reentrancy-benign
        (bool success, ) = _target.call(_message);
        // slither-disable-next-line reentrancy-benign
        xDomainMsgSender = Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;

        if (success == true) {
            // slither-disable-next-line reentrancy-no-eth
            successfulMessages[xDomainCallDataHash] = true;
            // slither-disable-next-line reentrancy-events
            emit RelayedMessage(xDomainCallDataHash);
        } else {
            // slither-disable-next-line reentrancy-events
            emit FailedRelayedMessage(xDomainCallDataHash);
        }

        // Store an identifier that can be used to prove that the given message was relayed by some
        // user. Gives us an easy way to pay relayers for their work.
        bytes32 relayId = keccak256(
            abi.encodePacked(xDomainCallData, msg.sender, block.number)
        );

        // slither-disable-next-line reentrancy-benign
        relayedMessages[relayId] = true;
    }

    function _sendXDomainMessage(
        uint256 _chainId,
        address _canonicalTransactionChain,
        bytes memory _message
    ) internal {
        ICanonicalTransactionChain(_canonicalTransactionChain).enqueue(
            _chainId,
            resolveGate(_chainId),
            _message
        );
    }
}
