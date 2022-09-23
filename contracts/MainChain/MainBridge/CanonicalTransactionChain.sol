// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_OVMCodec} from "../../libraries/codec/Lib_OVMCodec.sol";

contract CanonicalTransactionChain is Lib_AddressResolver {
    Lib_OVMCodec.QueueElement[] queueElements;


    event MainTransactorEvent(
        address indexed sender,
        address indexed target,
        uint256 gasLimit,
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
        address _target,
        uint256 _gasLimit,
        bytes memory _data
    ) external {
        
        address sender;
        if (msg.sender == tx.origin) {
            sender = msg.sender;
        } else {
            sender = resolve("SideTransactor");
        }

        bytes32 transactionHash = keccak256(
            abi.encode(sender, _target, _gasLimit, _data)
        );

        queueElements.push(
            Lib_OVMCodec.QueueElement({
                transactionHash: transactionHash,
                timestamp: uint40(block.timestamp),
                blockNumber: uint40(block.number)
            })
        );

        uint256 queueIndex = queueElements.length - 1;
        emit MainTransactorEvent(
            sender,
            _target,
            _gasLimit,
            _data,
            queueIndex,
            block.timestamp
        );
    }
}
