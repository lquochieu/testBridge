// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AddressAliasHelper} from "../../standards/AddressAliasHelper.sol";
import {Lib_CrossDomainUtils} from "../../libraries/bridge/Lib_CrossDomainUtils.sol";
import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_AddressManager} from "../../libraries/resolver/Lib_AddressManager.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";
import {IOVM_SideToMessagePasser} from "../../interfaces/SideChain/predeploys/IOVM_SideToMainMessagePasser.sol";

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract SideCrossDomainMessenger is
    Lib_AddressResolver,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    mapping(bytes32 => bool) public relayedMessages;
    mapping(bytes32 => bool) public successfulMessages;
    mapping(bytes32 => bool) public sentMessages;
    uint256 public messageNonce;
    address internal xDomainMsgSender =
        Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;
    address public mainCrossDomainMessenger;

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

    function sendMessage(
        address _target,
        bytes memory _message,
        uint256 _gasLimit
    ) public {
        bytes memory xDomainCalldata = Lib_CrossDomainUtils
            .encodeXDomainCalldata(_target, msg.sender, _message, messageNonce);

        require(!sentMessages[keccak256(xDomainCalldata)], "Message was sent!");

        sentMessages[keccak256(xDomainCalldata)] = true;

        IOVM_SideToMessagePasser(resolve("OVMSideToMainMessagePasser"))
            .passMessageToMainChain(xDomainCalldata);

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

        bytes memory xDomainCalldata = Lib_CrossDomainUtils
            .encodeXDomainCalldata(_target, _sender, _message, _messageNonce);

        bytes32 xDomainCalldataHash = keccak256(xDomainCalldata);

        require(
            successfulMessages[xDomainCalldataHash] == false,
            "Provided message has already been received."
        );

        // Prevent calls to OVM_L2ToL1MessagePasser, which would enable
        // an attacker to maliciously craft the _message to spoof
        // a call from any L2 account.
        if (_target == resolve("OVMSideToMainMessagePasser")) {
            successfulMessages[xDomainCalldataHash] = true;
            return;
        }

        xDomainMsgSender = _sender;

        // slither-disable-next-line reentrancy-no-eth, reentrancy-events, reentrancy-benign
        (bool success, ) = _target.call(_message);
        // slither-disable-next-line reentrancy-benign
        xDomainMsgSender = Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;

        if (success == true) {
            // slither-disable-next-line reentrancy-no-eth
            successfulMessages[xDomainCalldataHash] = true;
            // slither-disable-next-line reentrancy-events
            emit RelayedMessage(xDomainCalldataHash);
        } else {
            // slither-disable-next-line reentrancy-events
            emit FailedRelayedMessage(xDomainCalldataHash);
        }

        // Store an identifier that can be used to prove that the given message was relayed by some
        // user. Gives us an easy way to pay relayers for their work.
        bytes32 relayId = keccak256(
            abi.encodePacked(xDomainCalldata, msg.sender, block.number)
        );

        // slither-disable-next-line reentrancy-benign
        relayedMessages[relayId] = true;
    }
}
