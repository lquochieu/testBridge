// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Lib_AddressResolver} from "../../libraries/resolver/Lib_AddressResolver.sol";
import {Lib_OVMCodec} from "../../libraries/codec/Lib_OVMCodec.sol";
import {AddressAliasHelper} from "../../standards/AddressAliasHelper.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract CanonicalTransactionChain is Lib_AddressResolver {
    uint256 public constant MIN_ROLLUP_TX_GAS = 100000;
    uint256 public constant MAX_ROLLUP_TX_SIZE = 50000;

    

    Lib_OVMCodec.QueueElement[] queueElements;

    int public bnbPrice;
    int public ethPrice;

    event TransactionEnqueued(
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

    modifier onlyBurnAdmin() {
        require(
            msg.sender == libAddressManager.owner(),
            "Only callable by the Burn Admin."
        );
        _;
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
        require(
            _data.length <= MAX_ROLLUP_TX_SIZE,
            "Transaction data size exceeds maximum for rollup transaction."
        );

        // if (_gasLimit > sideGasPrepaid) {
        //     uint256 gasToConsume = (_gasLimit - sideGasPrepaid) / sideGasDiscountDivisor;
        //     uint256 startingGas = gasleft();

        //     require(startingGas > gasToConsume, "Insufficient gas for side rate limiting burn.");

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
