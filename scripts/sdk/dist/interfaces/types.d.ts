import { Provider, TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Contract, BigNumber } from 'ethers';
import { IBridgeAdapter } from './bridgeAdapter';
export interface OEMainContracts {
    AddressManager: Contract;
    MainCrossDomainMessenger: Contract;
    MainStandardBridge: Contract;
    CanonicalTransactionChain: Contract;
}
export interface OESideContracts {
    SideCrossDomainMessenger: Contract;
    SideStandardBridge: Contract;
    OVM_MainToSideMessagePasser: Contract;
    OVM_DeployerWhitelist: Contract;
}
export interface OEContracts {
    mainChain: OEMainContracts;
    sideChain: OESideContracts;
}
export declare type OEMainContractsLike = {
    [K in keyof OEMainContracts]: AddressLike;
};
export declare type OESideContractsLike = {
    [K in keyof OESideContracts]: AddressLike;
};
export interface OEContractsLike {
    mainChain: OEMainContractsLike;
    sideChain: OESideContractsLike;
}
export interface BridgeAdapterData {
    [name: string]: {
        Adapter: new (opts: {
            messenger: ICrossChainMessenger;
            mainBridge: AddressLike;
            sideBridge: AddressLike;
        }) => IBridgeAdapter;
        mainBridge: AddressLike;
        sideBridge: AddressLike;
    };
}

export interface CrossChainMessageRequest {
    direction: MessageDirection;
    target: string;
    message: string;
}
export interface CoreCrossChainMessage {
    sender: string;
    target: string;
    message: string;
    messageNonce: number;
}
export interface CrossChainMessage extends CoreCrossChainMessage {
    direction: MessageDirection;
    gasLimit: number;
    logIndex: number;
    blockNumber: number;
    transactionHash: string;
}

export interface NFTBridgeMessage {
    direction: MessageDirection;
    from: string;
    to: string;
    mainNFT: string;
    sideNFT: string;
    tokenId: BigNumber;
    data: string;
    logIndex: number;
    blockNumber: number;
    transactionHash: string;
}
export interface BridgeAdapters {
    [name: string]: IBridgeAdapter;
}
export declare enum MessageStatus {
    UNCONFIRMED_L1_TO_L2_MESSAGE = 0,
    FAILED_L1_TO_L2_MESSAGE = 1,
    STATE_ROOT_NOT_PUBLISHED = 2,
    IN_CHALLENGE_PERIOD = 3,
    READY_FOR_RELAY = 4,
    RELAYED = 5
}
export declare enum MessageDirection {
    L1_TO_L2 = 0,
    L2_TO_L1 = 1
}

export declare enum MessageReceiptStatus {
    RELAYED_FAILED = 0,
    RELAYED_SUCCEEDED = 1
}

export declare type TransactionLike = string | TransactionReceipt | TransactionResponse;
export declare type MessageLike = CrossChainMessage | TransactionLike | NFTBridgeMessage;
export declare type MessageRequestLike = CrossChainMessageRequest | CrossChainMessage | TransactionLike | NFTBridgeMessage;
export declare type ProviderLike = string | Provider | any;
export declare type SignerLike = string | Signer;
export declare type SignerOrProviderLike = SignerLike | ProviderLike;
export declare type AddressLike = string | Contract;
export declare type NumberLike = string | number | BigNumber;
