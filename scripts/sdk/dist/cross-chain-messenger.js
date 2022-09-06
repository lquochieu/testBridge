"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossChainMessenger = void 0;
const abstract_provider_1 = require("@ethersproject/abstract-provider");
const ethers_1 = require("ethers");
const utils_1 = require("./utils");

class CrossChainMessenger {
  constructor(opts) {
    this.populateTransaction = {
      approveMainNFT: async (mainNFT, sideNFT, tokenId, opts) => {
        const mainBridge = await this.getBridgeForNFTPair(mainNFT, sideNFT);
        return mainBridge.populateTransaction.approve(
          mainNFT,
          sideNFT,
          tokenId,
          opts
        );
      },
      setApprovalForAllMainNFT: async (mainNFT, opts) => {
        return mainBridge.populateTransaction.setApprovalForAll(mainNFT, opts);
      },
    };

    this.estimateGas = {
      approveMainNFT: async (mainNFT, sideNFT, tokenId, opts) => {
        return this.mainProvider.estimateGas(
          await this.populateTransaction.approveMainNFT(
            mainNFT,
            sideNFT,
            tokenId,
            opts
          )
        );
      },
      setApprovalForAllMainNFT: async (mainNFT, opts) => {
        return this.mainProvider.estimateGas(
          await this.populateTransaction.setApprovalForAllMainNFT(mainNFT, opts)
        );
      },
    };
    this.mainSignerOrProvider = utils_1.toSignerOrProvider(
      opts.mainSignerOrProvider
    );
    this.sideSignerOrProvider = utils_1.toSignerOrProvider(
      opts.sideSignerOrProvider
    );
    this.mainChainId = utils_1.toNumber(opts.SideChainId);
    this.contracts = utils_1.getAllOEContracts(this.mainChainId, {
      mainSignerOrProvider: this.mainSignerOrProvider,
      sideSignerOrProvider: this.sideSignerOrProvider,
      overrides: opts.contracts,
    });
    this.bridges = utils_1.getBridgeAdapters(this.mainChainId, this, {
      overrides: opts.bridges,
    });
  }

  get mainProvider() {
    if (abstract_provider_1.Provider.isProvider(this.mainSignerOrProvider)) {
      return this.mainSignerOrProvider;
    } else {
      return this.mainSignerOrProvider.provider;
    }
  }

  get sideProvider() {
    if (abstract_provider_1.Provider.isProvider(this.sideSignerOrProvider)) {
      return this.sideSignerOrProvider;
    } else {
      return this.sideSignerOrProvider.provider;
    }
  }

  get mainSigner() {
    if (abstract_provider_1.Provider.isProvider(this.mainSignerOrProvider)) {
      throw new Error(`messenger has no L1 signer`);
    } else {
      return this.mainSignerOrProvider;
    }
  }

  get sideSigner() {
    if (abstract_provider_1.Provider.isProvider(this.sideSignerOrProvider)) {
      throw new Error(`messenger has no L1 signer`);
    } else {
      return this.sideSignerOrProvider;
    }
  }

  async getBridgeForNFTPair(mainNFT, sideNFT) {
    const bridges = [];
    for (const bridge of Object.values(this.bridges)) {
      if (await bridge.supportsTokenPair(mainNFT, sideNFT)) {
        bridges.push(bridge);
      }
    }
    if (bridges.length === 0) {
      throw new Error(`no supported bridge for token pair`);
    }
    if (bridges.length > 1) {
      throw new Error(`found more than one bridge for token pair`);
    }
    return bridges[0];
  }

  async approveMainNFT(mainNFT, sideNFT, tokenId, opts) {
    return ((opts === null || opts === void 0 ? void 0 : opts.signer) || this.mainSigner).sendTransaction(await this.populateTransaction.approveMainNFT(mainNFT, sideNFT, tokenId, opts));
  }
}

exports.CrossChainMessenger = CrossChainMessenger;
