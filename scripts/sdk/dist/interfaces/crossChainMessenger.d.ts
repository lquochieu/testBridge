import { Event, BigNumber, Overrides } from 'ethers';
import { Provider, BlockTag, TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { MessageLike, MessageRequestLike, TransactionLike, AddressLike, NumberLike, CrossChainMessage, CrossChainMessageRequest, MessageDirection, MessageStatus, NFTBridgeMessage, OEContracts, MessageReceipt, StateRoot, StateRootBatch, BridgeAdapters } from './types';
import { IBridgeAdapter } from './bridge-adapter';
export interface ICrossChainMessenger {
    MainSignerOrProvider: Signer | Provider;
    SideSignerOrProvider: Signer | Provider;
    MainChainId: number;
    contracts: OEContracts;
    bridges: BridgeAdapters;
    MainProvider: Provider;
    SideProvider: Provider;
    MainSigner: Signer;
    SideSigner: Signer;
    // depositConfirmationBlocks: number;
    // l1BlockTimeSeconds: number;
    // getMessagesByTransaction(transaction: TransactionLike, opts?: {
    //     direction?: MessageDirection;
    // }): Promise<CrossChainMessage[]>;
    // getMessagesByAddress(address: AddressLike, opts?: {
    //     direction?: MessageDirection;
    //     fromBlock?: NumberLike;
    //     toBlock?: NumberLike;
    // }): Promise<CrossChainMessage[]>;
    getBridgeForTokenPair(mainNFT: AddressLike, sideNFT: AddressLike): Promise<IBridgeAdapter>;
    // getDepositsByAddress(address: AddressLike, opts?: {
    //     fromBlock?: BlockTag;
    //     toBlock?: BlockTag;
    // }): Promise<NFTBridgeMessage[]>;
    // getWithdrawalsByAddress(address: AddressLike, opts?: {
    //     fromBlock?: BlockTag;
    //     toBlock?: BlockTag;
    // }): Promise<NFTBridgeMessage[]>;
    // toCrossChainMessage(message: MessageLike): Promise<CrossChainMessage>;
    // getMessageStatus(message: MessageLike): Promise<MessageStatus>;
    // getMessageReceipt(message: MessageLike): Promise<MessageReceipt>;
    // waitForMessageReceipt(message: MessageLike, opts?: {
    //     confirmations?: number;
    //     pollIntervalMs?: number;
    //     timeoutMs?: number;
    // }): Promise<MessageReceipt>;
    // waitForMessageStatus(message: MessageLike, status: MessageStatus, opts?: {
    //     pollIntervalMs?: number;
    //     timeoutMs?: number;
    // }): Promise<void>;
    // estimateL2MessageGasLimit(message: MessageRequestLike, opts?: {
    //     bufferPercent?: number;
    //     from?: string;
    // }): Promise<BigNumber>;
    // estimateMessageWaitTimeSeconds(message: MessageLike): Promise<number>;
    // getChallengePeriodSeconds(): Promise<number>;
    // getMessageStateRoot(message: MessageLike): Promise<StateRoot | null>;
    // getStateBatchAppendedEventByBatchIndex(batchIndex: number): Promise<Event | null>;
    // getStateBatchAppendedEventByTransactionIndex(transactionIndex: number): Promise<Event | null>;
    // getStateRootBatchByTransactionIndex(transactionIndex: number): Promise<StateRootBatch | null>;
    // getMessageProof(message: MessageLike): Promise<CrossChainMessageProof>;
    // sendMessage(message: CrossChainMessageRequest, opts?: {
    //     signer?: Signer;
    //     sideGasLimit?: NumberLike;
    //     overrides?: Overrides;
    // }): Promise<TransactionResponse>;
    // resendMessage(message: MessageLike, messageGasLimit: NumberLike, opts?: {
    //     signer?: Signer;
    //     overrides?: Overrides;
    // }): Promise<TransactionResponse>;
    // finalizeMessage(message: MessageLike, opts?: {
    //     signer?: Signer;
    //     overrides?: Overrides;
    // }): Promise<TransactionResponse>;
    // depositETH(tokenId: NumberLike, opts?: {
    //     signer?: Signer;
    //     recipient?: AddressLike;
    //     l2GasLimit?: NumberLike;
    //     overrides?: Overrides;
    // }): Promise<TransactionResponse>;
    // withdrawETH(tokenId: NumberLike, opts?: {
    //     signer?: Signer;
    //     recipient?: AddressLike;
    //     overrides?: Overrides;
    // }): Promise<TransactionResponse>;
    approval(mainNFT: AddressLike, sideNFT: AddressLike, opts?: {
        signer?: Signer;
    }): Promise<BigNumber>;
    // approveNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
    //     signer?: Signer;
    //     overrides?: Overrides;
    // }): Promise<TransactionResponse>;
    // depositNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
    //     signer?: Signer;
    //     recipient?: AddressLike;
    //     l2GasLimit?: NumberLike;
    //     overrides?: Overrides;
    // }): Promise<TransactionResponse>;
    // withdrawNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
    //     signer?: Signer;
    //     recipient?: AddressLike;
    //     overrides?: Overrides;
    // }): Promise<TransactionResponse>;
    populateTransaction: {
        // sendMessage: (message: CrossChainMessageRequest, opts?: {
        //     l2GasLimit?: NumberLike;
        //     overrides?: Overrides;
        // }) => Promise<TransactionRequest>;
        // resendMessage(message: MessageLike, messageGasLimit: NumberLike, opts?: {
        //     overrides?: Overrides;
        // }): Promise<TransactionRequest>;
        // finalizeMessage(message: MessageLike, opts?: {
        //     overrides?: Overrides;
        // }): Promise<TransactionRequest>;
        approveNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
            overrides?: Overrides;
        }): Promise<TransactionRequest>;
        // depositETH(tokenId: NumberLike, opts?: {
        //     recipient?: AddressLike;
        //     l2GasLimit?: NumberLike;
        //     overrides?: Overrides;
        // }): Promise<TransactionRequest>;
        // withdrawETH(tokenId: NumberLike, opts?: {
        //     recipient?: AddressLike;
        //     overrides?: Overrides;
        // }): Promise<TransactionRequest>;
        // depositNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
        //     recipient?: AddressLike;
        //     l2GasLimit?: NumberLike;
        //     overrides?: Overrides;
        // }): Promise<TransactionRequest>;
        // withdrawNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
        //     recipient?: AddressLike;
        //     overrides?: Overrides;
        // }): Promise<TransactionRequest>;
    };
    estimateGas: {
        // sendMessage: (message: CrossChainMessageRequest, opts?: {
        //     l2GasLimit?: NumberLike;
        //     overrides?: Overrides;
        // }) => Promise<BigNumber>;
        // resendMessage(message: MessageLike, messageGasLimit: NumberLike, opts?: {
        //     overrides?: Overrides;
        // }): Promise<BigNumber>;
        // finalizeMessage(message: MessageLike, opts?: {
        //     overrides?: Overrides;
        // }): Promise<BigNumber>;
        approveNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
            overrides?: Overrides;
        }): Promise<BigNumber>;
        // depositETH(tokenId: NumberLike, opts?: {
        //     recipient?: AddressLike;
        //     l2GasLimit?: NumberLike;
        //     overrides?: Overrides;
        // }): Promise<BigNumber>;
        // withdrawETH(tokenId: NumberLike, opts?: {
        //     recipient?: AddressLike;
        //     overrides?: Overrides;
        // }): Promise<BigNumber>;
        // depositNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
        //     recipient?: AddressLike;
        //     l2GasLimit?: NumberLike;
        //     overrides?: Overrides;
        // }): Promise<BigNumber>;
        // withdrawNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
        //     recipient?: AddressLike;
        //     overrides?: Overrides;
        // }): Promise<BigNumber>;
    };
}
