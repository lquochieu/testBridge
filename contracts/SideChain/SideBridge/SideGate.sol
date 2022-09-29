// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_AddressManager} from "../../libraries/resolver/Lib_AddressManager.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";
import {Lib_OVMCodec} from "../../libraries/codec/Lib_OVMCodec.sol";

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import {ISideCanonicalTransactionChain} from "../../interfaces/SideChain/SideBridge/ISideCanonicalTransactionChain.sol";
import {IMainGate} from "../../interfaces/MainChain/MainBridge/IMainGate.sol";

contract SideGate is
    Lib_AddressResolver,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    address internal xDomainMsgSender;

    mapping(bytes32 => bool) public blockedMessages;
    mapping(bytes32 => bool) public relayedMessages;
    mapping(bytes32 => bool) public successfulMessages;
    mapping(bytes32 => bool) public sentMessages;

    /*╔══════════════════════════════╗
      ║            EVENTS            ║
      ╚══════════════════════════════╝*/

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

    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/

    function initialize(address _libAddressManager) public initializer {
        require(
            address(libAddressManager) == address(0),
            "Side already initialized"
        );

        xDomainMsgSender = Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER;

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

    /*  ╔══════════════════════════════╗
      ║        ADMIN FUNCTIONS       ║
      ╚══════════════════════════════╝ */

    function blockMessage(bytes32 _xDomainCallDataHash) external onlyOwner {
        blockedMessages[_xDomainCallDataHash] = true;
        emit MessageBlocked(_xDomainCallDataHash);
    }

    function allowMessage(bytes32 _xDomainCallDataHash) external onlyOwner {
        blockedMessages[_xDomainCallDataHash] = false;
        emit MessageAllowed(_xDomainCallDataHash);
    }

    /*  ╔══════════════════════════════╗
      ║        ENCODE FUNCTIONS        ║
      ╚══════════════════════════════╝ */

    function _encodeRelayMessage(
        address _target,
        address _sender,
        bytes memory _data,
        uint256 _messageNonce
    ) internal pure returns (bytes memory) {
        return
            abi.encodeWithSelector(
                IMainGate.relayMessage.selector,
                _target,
                _sender,
                _data,
                _messageNonce
            );
    }

    /*  ╔══════════════════════════════╗
      ║           SEND MESSAGE         ║
      ╚══════════════════════════════╝ */

    /** After receive info NFT will withdraw at SidBridge,
     * SideBridge will call function sendMessage in SideGate to prepare data for withdraw
     * @dev prepare infor to send message
     * @param _chainId chainId of MainChain
     * @param _target address of MainBridge
     * @param _message message was created by abi.encodeWithSelector of function finalizeWithdraw on MainChain
     */
    function sendMessage(
        uint256 _chainId,
        address _target,
        bytes memory _message
    ) public whenNotPaused {
        require(
            _msgSender() == resolve("SideBridge"),
            "Only SideBridge can send message"
        );

        address ovmCanonicalTransactionChain = resolve(
            "SideCanonicalTransactionChain"
        );

        uint40 nonce = ISideCanonicalTransactionChain(
            ovmCanonicalTransactionChain
        ).getQueueLength();

        bytes memory xDomainCallData = _encodeRelayMessage(
            _target,
            _msgSender(),
            _message,
            nonce
        );

        require(!sentMessages[keccak256(xDomainCallData)], "Message was sent!");

        sentMessages[keccak256(xDomainCallData)] = true;

        _sendXDomainMessage(
            _chainId,
            ovmCanonicalTransactionChain,
            xDomainCallData
        );

        emit SentMessage(_target, _msgSender(), _message, nonce);
    }

    /**
     * @dev resend message if it has any problem
     * @param _queueIndex the blocknumber of transaction failed before
     * amd the others param also is the param of transaction failed before
     */

    function replayMessage(
        uint256 _chainId,
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _queueIndex
    ) public nonReentrant whenNotPaused {
        require(
            _msgSender() == resolve("SideBridge"),
            "Only SideBridge or admin can replay message"
        );
        // Verify that the message is in the queue:
        address canonicalTransactionChain = resolve(
            "SideCanonicalTransactionChain"
        );
        Lib_OVMCodec.QueueElement
            memory element = ISideCanonicalTransactionChain(
                canonicalTransactionChain
            ).getQueueElement(_queueIndex);

        // Compute the calldata that was originally used to send the message.
        bytes memory xDomainCallData = _encodeRelayMessage(
            _target,
            _sender,
            _message,
            _queueIndex
        );

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

    /**
     * @dev store transaction was sent from MainChain to MainChain
     * @param _canonicalTransactionChain address of contract will store these transaction
     * @param _message message of relayMessage function was encodeWithSlectoron MainChain
     */

    function _sendXDomainMessage(
        uint256 _chainId,
        address _canonicalTransactionChain,
        bytes memory _message
    ) internal {
        ISideCanonicalTransactionChain(_canonicalTransactionChain).enqueue(
            _chainId,
            resolveGate(_chainId),
            _message
        );
    }

    /*  ╔══════════════════════════════╗
      ║           RELAY MESSAGE        ║
      ╚══════════════════════════════╝ */

    /**
     * @dev receive and check information receive from MainChain
     * @param _target address will call message, when receive infor withdraw,
     * target is SideBridge
     * @param _message message when withdraw is function finalizeDeposit of SideBridge
     * was encodeWithSeclectoron MainChain
     * @param _nonce the number of message was sent by MainChain for SideChain,
     * it guarantee  a message from MainChain can't be sent many times
     */

    function relayMessage(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _nonce
    ) public nonReentrant whenNotPaused {
        require(
            _msgSender() == resolve("SideTransactor") ||
                _msgSender() == owner(),
            "Provided message could not be verified."
        );

        bytes memory xDomainCallData = _encodeRelayMessage(
            _target,
            _sender,
            _message,
            _nonce
        );

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
            abi.encodePacked(xDomainCallData, _msgSender(), block.number)
        );

        // slither-disable-next-line reentrancy-benign
        relayedMessages[relayId] = true;
    }

    /*╔══════════════════════════════╗
      ║            GETTERS           ║
      ╚══════════════════════════════╝*/

    function xDomainMessageSender() public view returns (address) {
        require(
            xDomainMsgSender != Lib_DefaultValues.DEFAULT_XDOMAIN_SENDER,
            "xDomainMessageSender is not set"
        );
        return xDomainMsgSender;
    }
}
