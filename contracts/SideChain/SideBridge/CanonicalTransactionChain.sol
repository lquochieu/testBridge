// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_OVMCodec} from "../../libraries/codec/Lib_OVMCodec.sol";

contract CanonicalTransactionChain is Lib_AddressResolver {
    Lib_OVMCodec.QueueElement[] queueElements;


    event TransactorEvent(
        address indexed sender,
        address indexed target,
        bytes data,
        uint256 indexed queueIndex,
        uint256 timestamp
    );


    constructor(
        address _libAddressManager
    ) Lib_AddressResolver(_libAddressManager) {}

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

    function enqueue(
        uint256 _chainId,
        address _target,
        bytes memory _data
    ) external {
        
        address sender;
        if (msg.sender == tx.origin) {
            sender = msg.sender;
        } else {
            sender = resolveTransactor(_chainId);
        }

        bytes32 transactionHash = keccak256(
            abi.encode(sender, _target, _data)
        );

        queueElements.push(
            Lib_OVMCodec.QueueElement({
                transactionHash: transactionHash,
                timestamp: uint40(block.timestamp),
                blockNumber: uint40(block.number)
            })
        );

        uint256 messageNonce = queueElements.length;
        emit TransactorEvent(
            sender,
            _target,
            _data,
            messageNonce,
            block.timestamp
        );
    }
}
