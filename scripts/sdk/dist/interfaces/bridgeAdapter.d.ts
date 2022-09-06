import { Contract, Overrides, Signer, BigNumber } from 'ethers';
import { TransactionRequest, TransactionResponse, BlockTag } from '@ethersproject/abstract-provider';
import { NumberLike, AddressLike, TokenBridgeMessage } from './types';
import { ICrossChainMessenger } from './cross-chain-messenger';
export interface IBridgeAdapter {
    messenger: ICrossChainMessenger;
    mainBridge: Contract;
    sideBridge: Contract;
    supportsTokenPair(mainNFT: AddressLike, sideNFT: AddressLike): Promise<boolean>;
    populateTransaction: {
        approveNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
            overrides?: Overrides;
        }): Promise<TransactionRequest>;
        depositNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
            recipient?: AddressLike;
            l2GasLimit?: NumberLike;
            overrides?: Overrides;
        }): Promise<TransactionRequest>;
        withdrawNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
            recipient?: AddressLike;
            overrides?: Overrides;
        }): Promise<TransactionRequest>;
    };
    estimateGas: {
        approveNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
            overrides?: Overrides;
        }): Promise<BigNumber>;
        depositNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
            recipient?: AddressLike;
            l2GasLimit?: NumberLike;
            overrides?: Overrides;
        }): Promise<BigNumber>;
        withdrawNFT(mainNFT: AddressLike, sideNFT: AddressLike, tokenId: NumberLike, opts?: {
            recipient?: AddressLike;
            overrides?: Overrides;
        }): Promise<BigNumber>;
    };
}
