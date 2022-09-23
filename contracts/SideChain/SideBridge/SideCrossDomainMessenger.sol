// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Lib_CrossDomainUtils} from "../../libraries/bridge/Lib_CrossDomainUtils.sol";
import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_AddressManager} from "../../libraries/resolver/Lib_AddressManager.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract SideCrossDomainMessenger is
    Lib_AddressResolver,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    uint256 public messageNonce;
    address internal xDomainMsgSender =
        Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;
    address public mainCrossDomainMessenger;

    mapping(bytes32 => bool) public blockedMessages;
    mapping(bytes32 => bool) public relayedMessages;
    mapping(bytes32 => bool) public successfulMessages;
    mapping(bytes32 => bool) public sentMessages;

    event MessageBlocked(bytes32 indexed _xDomainCallDataHash);
    event MessageAllowed(bytes32 indexed _xDomainCallDataHash);

    event SideTransactorEvent(address indexed target, uint256 gasLimit, bytes data);

    event SentMessage(
        address indexed target,
        address sender,
        bytes message,
        uint256 messageNonce,
        uint256 gasLimit
    );

    event RelayedMessage(bytes32 indexed msgHash);
    event FailedRelayedMessage(bytes32 indexed msgHash);

    constructor(address _mainCrossDomainMessenger)
        Lib_AddressResolver(address(0))
    {
        mainCrossDomainMessenger = _mainCrossDomainMessenger;
    }

    function initialize(address _libAddressManager) public onlyOwner {
        require(
            address(libAddressManager) == address(0),
            "SideCrossDomainMessenger already intialized"
        );
        libAddressManager = Lib_AddressManager(_libAddressManager);
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

    function sendMessage(
        address _target,
        bytes memory _message,
        uint256 _gasLimit
    ) public {
        require(
            msg.sender == resolve("SideBridge"),
            "Only SideBridge can send message"
        );

        bytes memory xDomainCallData = Lib_CrossDomainUtils
            .encodeXDomainCallData(_target, msg.sender, _message, messageNonce);

        require(!sentMessages[keccak256(xDomainCallData)], "Message was sent!");

        sentMessages[keccak256(xDomainCallData)] = true;

        emit SideTransactorEvent(
            resolve("MainCrossDomainMessenger"),
            _gasLimit,
            xDomainCallData
        );

        emit SentMessage(
            _target,
            msg.sender,
            _message,
            messageNonce,
            _gasLimit
        );

        messageNonce += 1;
    }

    function relayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _messageNonce
    ) public nonReentrant whenNotPaused onlyOwner {
        require(
            msg.sender == resolve("SideTransactor"),
            "Provided message could not be verified."
        );

        bytes memory xDomainCallData = Lib_CrossDomainUtils
            .encodeXDomainCallData(_target, _sender, _message, _messageNonce);

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
}
