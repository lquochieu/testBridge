"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainBridgeAdapter = void 0;
const ethers_1 = require("ethers");
const contracts_1 = require("../../../contracts/dist");
const core_utils_1 = require("../../../core-utils/dist");
const interface_1 = require("../interfaces");
const utils_1 = require("../utils");
class MainBridgeAdapter {
    constructor(opts) {
        this.populateTransaction = {
            approve: async (mainNFT, sideNFT, tokenId, opts) => {
                if (!(await this.supportsNFTPair(mainNFT, sideNFT))) {
                    throw new Error(`NFT pair not supported by bridge`);
                }
                const mainNFTCoreContract = new ethers_1.Contract(utils_1.toAddress(mainNFT), contracts_1.getContractInterface('MainNFTCore'), this.messenger.mainProvider);
                return mainNFTCoreContract.populateTransaction.approve(this.mainBridge.address, tokenId, (opts === null || opts === void 0 ? void 0 : opts.overrides) || {});
            },
            setApprovalForAll: async (mainNFT, opts) => {

                const mainNFTCoreContract = new ethers_1.Contract(utils_1.toAddress(mainNFT), contracts_1.getContractInterface('MainNFTCore'), this.messenger.mainProvider);
                return mainNFTCoreContract.populateTransaction.setApprovalForAll(this.mainBridge.address, true, (opts === null || opts === void 0 ? void 0 : opts.overrides) || {});
            },
            // deposit: async (mainNFT, sideNFT, tokenId, opts) => {
            //     if (!(await this.supportsNFTPair(mainNFT, sideNFT))) {
            //         throw new Error(`NFT pair not supported by bridge`);
            //     }
            //     if ((opts === null || opts === void 0 ? void 0 : opts.recipient) === undefined) {
            //         return this.mainBridge.populateTransaction.depositERC20(utils_1.toAddress(mainNFT), utils_1.toAddress(sideNFT), tokenId, (opts === null || opts === void 0 ? void 0 : opts.l2GasLimit) || 200000, '0x', (opts === null || opts === void 0 ? void 0 : opts.overrides) || {});
            //     }
            //     else {
            //         return this.mainBridge.populateTransaction.depositERC20To(utils_1.toAddress(mainNFT), utils_1.toAddress(sideNFT), utils_1.toAddress(opts.recipient), tokenId, (opts === null || opts === void 0 ? void 0 : opts.l2GasLimit) || 200000, '0x', (opts === null || opts === void 0 ? void 0 : opts.overrides) || {});
            //     }
            // },
            // withdraw: async (mainNFT, sideNFT, tokenId, opts) => {
            //     if (!(await this.supportsNFTPair(mainNFT, sideNFT))) {
            //         throw new Error(`NFT pair not supported by bridge`);
            //     }
            //     if ((opts === null || opts === void 0 ? void 0 : opts.recipient) === undefined) {
            //         // console.log("abc");
            //         return this.sideBridge.populateTransaction.withdraw(utils_1.toAddress(sideNFT), tokenId, 0, '0x', (opts === null || opts === void 0 ? void 0 : opts.overrides) || {});
            //     }
            //     else {
            //         return this.sideBridge.populateTransaction.withdrawTo(utils_1.toAddress(sideNFT), utils_1.toAddress(opts.recipient), tokenId, 0, '0x', (opts === null || opts === void 0 ? void 0 : opts.overrides) || {});
            //     }
            // },
        };
        this.estimateGas = {
            approve: async (mainNFT, sideNFT, tokenId, opts) => {
                return this.messenger.mainProvider.estimateGas(await this.populateTransaction.approve(mainNFT, sideNFT, tokenId, opts));
            },
            setApprovalForAll: async (mainNFT, opts) => {
                return this.messenger.mainProvider.estimateGas(await this.populateTransaction.setApprovalForAll(mainNFT, opts));
            },
            // deposit: async (mainNFT, sideNFT, tokenId, opts) => {
            //     return this.messenger.mainProvider.estimateGas(await this.populateTransaction.deposit(mainNFT, sideNFT, tokenId, opts));
            // },
            // withdraw: async (mainNFT, sideNFT, tokenId, opts) => {
            //     return this.messenger.sideProvider.estimateGas(await this.populateTransaction.withdraw(mainNFT, sideNFT, tokenId, opts));
            // },
        };
        this.messenger = opts.messenger;
        this.mainBridge = new ethers_1.Contract(utils_1.toAddress(opts.mainBridge), contracts_1.getContractInterface('MainBridge'), this.messenger.mainProvider);
        this.sideBridge = new ethers_1.Contract(utils_1.toAddress(opts.sideBridge), contracts_1.getContractInterface('SideBridge'), this.messenger.sideProvider);
    }
    // async getDepositsByAddress(address, opts) {
    //     const events = await this.mainBridge.queryFilter(this.mainBridge.filters.ERC20DepositInitiated(undefined, undefined, address), opts === null || opts === void 0 ? void 0 : opts.fromBlock, opts === null || opts === void 0 ? void 0 : opts.toBlock);
    //     return events
    //         .filter((event) => {
    //         return (!core_utils_1.hexStringEquals(event.args._mainNFT, ethers_1.ethers.constants.AddressZero) &&
    //             !core_utils_1.hexStringEquals(event.args._sideNFT, contracts_1.predeploys.OVM_ETH));
    //     })
    //         .map((event) => {
    //         return {
    //             direction: interfaces_1.MessageDirection.L1_TO_L2,
    //             from: event.args._from,
    //             to: event.args._to,
    //             mainNFT: event.args._mainNFT,
    //             sideNFT: event.args._sideNFT,
    //             tokenId: event.args._tokenId,
    //             data: event.args._data,
    //             logIndex: event.logIndex,
    //             blockNumber: event.blockNumber,
    //             transactionHash: event.transactionHash,
    //         };
    //     })
    //         .sort((a, b) => {
    //         return b.blockNumber - a.blockNumber;
    //     });
    // }
    // async getWithdrawalsByAddress(address, opts) {
    //     const events = await this.sideBridge.queryFilter(this.sideBridge.filters.WithdrawalInitiated(undefined, undefined, address), opts === null || opts === void 0 ? void 0 : opts.fromBlock, opts === null || opts === void 0 ? void 0 : opts.toBlock);
    //     return events
    //         .filter((event) => {
    //         return (!core_utils_1.hexStringEquals(event.args._mainNFT, ethers_1.ethers.constants.AddressZero) &&
    //             !core_utils_1.hexStringEquals(event.args._sideNFT, contracts_1.predeploys.OVM_ETH));
    //     })
    //         .map((event) => {
    //         return {
    //             direction: interfaces_1.MessageDirection.L2_TO_L1,
    //             from: event.args._from,
    //             to: event.args._to,
    //             mainNFT: event.args._mainNFT,
    //             sideNFT: event.args._sideNFT,
    //             tokenId: event.args._tokenId,
    //             data: event.args._data,
    //             logIndex: event.logIndex,
    //             blockNumber: event.blockNumber,
    //             transactionHash: event.transactionHash,
    //         };
    //     })
    //         .sort((a, b) => {
    //         return b.blockNumber - a.blockNumber;
    //     });
    // }
    async supportsNFTPair(mainNFT, sideNFT) {
        try {
            const contract = new ethers_1.Contract(utils_1.toAddress(sideNFT), contracts_1.getContractInterface('SideNFTCore'), this.messenger.sideProvider);
            if (core_utils_1.hexStringEquals(utils_1.toAddress(mainNFT), ethers_1.ethers.constants.AddressZero)) {
                return false;
            }
            const remoteMainNFT = await contract.mainNFT();
            if (!core_utils_1.hexStringEquals(remoteMainNFT, utils_1.toAddress(mainNFT))) {
                return false;
            }
            const remoteSideBridge = await contract.sideBridge();
            if (!core_utils_1.hexStringEquals(remoteSideBridge, this.sideBridge.address)) {
                return false;
            }
            return true;
        }
        catch (err) {
            if (err.message.toString().includes('CALL_EXCEPTION')) {
                return false;
            }
            else {
                throw err;
            }
        }
    }
    async setApprovalForAll(mainNFT, signer, opts) {
        return signer.sendTransaction(await this.populateTransaction.setApprovalForAll(mainNFT, opts));
    }
    async approve(mainNFT, sideNFT, tokenId, signer, opts) {
        return signer.sendTransaction(await this.populateTransaction.approve(mainNFT, sideNFT, tokenId, opts));
    }
    // async deposit(mainNFT, sideNFT, tokenId, signer, opts) {
    //     return signer.sendTransaction(await this.populateTransaction.deposit(mainNFT, sideNFT, tokenId, opts));
    // }
    // async withdraw(mainNFT, sideNFT, tokenId, signer, opts) {
    //     return signer.sendTransaction(await this.populateTransaction.withdraw(mainNFT, sideNFT, tokenId, opts));
    // }
}
exports.MainBridgeAdapter = MainBridgeAdapter;