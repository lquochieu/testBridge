// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_OVMCodec} from "../../libraries/codec/Lib_OVMCodec.sol";
import {AddressAliasHelper} from "../../standards/AddressAliasHelper.sol";

contract CanonicalTransactionChain is Lib_AddressResolver {
    uint256 public constant MIN_ROLLUP_TX_GAS = 100000;
    uint256 public constant MAX_ROLLUP_TX_SIZE = 50000;

    uint256 public maxTransactionGasLimit;
    uint256 public sideGasDiscountDivisor;
    uint256 public enqueueGasCost;
    uint256 public enqueueSideGasPrepaid;

    Lib_OVMCodec.QueueElement[] queueElements;

    event TransactionEnqueued(
        address indexed _l1TxOrigin,
        address indexed _target,
        uint256 _gasLimit,
        bytes _data,
        uint256 indexed _queueIndex,
        uint256 _timestamp
    );

    constructor(
        address _libAddressManager,
        uint256 _maxTransactionGasLimit,
        uint256 _sideGasDiscountDivisor,
        uint256 _enqueueGasCost
    ) Lib_AddressResolver(_libAddressManager) {
        maxTransactionGasLimit = _maxTransactionGasLimit;
        sideGasDiscountDivisor = _sideGasDiscountDivisor;
        enqueueGasCost = _enqueueGasCost;
        enqueueSideGasPrepaid = _sideGasDiscountDivisor * _enqueueGasCost;
    }

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

        
        // require(
        //     _data.length <= MAX_ROLLUP_TX_SIZE,
        //     "Transaction data size exceeds maximum for rollup transaction."
        // );

        // require(
        //     _gasLimit <= maxTransactionGasLimit,
        //     "Transaction gas limit exceeds maximum for rollup transaction."
        // );

        // require(_gasLimit >= MIN_ROLLUP_TX_GAS, "Transaction gas limit too low to enqueue.");

        // if (_gasLimit > enqueueSideGasPrepaid) {
        //     uint256 gasToConsume = (_gasLimit - enqueueSideGasPrepaid) / sideGasDiscountDivisor;
        //     uint256 startingGas = gasleft();

        //     require(startingGas > gasToConsume, "Insufficient gas for L2 rate limiting burn.");

        //     uint256 i;
        //     while (startingGas - gasleft() < gasToConsume) {
        //         i++;
        //     }
        // }

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
        emit TransactionEnqueued(
            sender,
            _target,
            _gasLimit,
            _data,
            queueIndex,
            block.timestamp
        );
    }
}
