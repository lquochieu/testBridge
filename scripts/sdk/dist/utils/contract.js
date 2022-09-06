"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBridgeAdapters = exports.getAllOEContracts = exports.getOEContract = exports.BRIDGE_ADAPTER_DATA = exports.CONTRACT_ADDRESSES = exports.DEFAULT_L2_CONTRACT_ADDRESSES = void 0;
const contracts_1 = require("../../../contracts/dist");
const ethers_1 = require("ethers");
const coercion_1 = require("./coercion");
const adapter_1 = require("../adapters");

exports.DEFAULT_SIDE_CONTRACT_ADDRESSES = {
    SideCrossDomainMessenger: contracts_1.predeploys.SideCrossDomainMessenger,
    SideStandardBridge: contracts_1.predeploys.SideStandardBridge,
    OVM_SideToMainMessagePasser: contracts_1.predeploys.OVM_SideToMainMessagePasser,
    OVM_DeployerWhitelist: contracts_1.predeploys.OVM_DeployerWhitelist,
};

const NAME_REMAPPING = {
    AddressManager: 'Lib_AdressManager',
};

exports.CONTRACT_ADDRESSES = {
    4: {
        mainChain: {
            MainAddressManager: '0x2F7E3cAC91b5148d336BbffB224B4dC79F09f01D',
            MainCrossDomainMessenger: '0xEcC89b9EDD804850C4F343A278Be902be11AaF42',
            MainBridge: '0x73298186A143a54c20ae98EEE5a025bD5979De02',
            CanonicalTransactionChain: '0x2ebA8c4EfDB39A8Cd8f9eD65c50ec079f7CEBD81',
        },
        sideChain: exports.DEFAULT_SIDE_CONTRACT_ADDRESSES,
    },
    5: {
        mainChain: {
            MainAddressManager: '0x2F7E3cAC91b5148d336BbffB224B4dC79F09f01D',
            MainCrossDomainMessenger: '0xEcC89b9EDD804850C4F343A278Be902be11AaF42',
            MainBridge: '0x73298186A143a54c20ae98EEE5a025bD5979De02',
            CanonicalTransactionChain: '0x2ebA8c4EfDB39A8Cd8f9eD65c50ec079f7CEBD81',
        },
        sideChain: exports.DEFAULT_SIDE_CONTRACT_ADDRESSES,
    },
    97: {
        mainChain: {
            MainAddressManager: '0x2F7E3cAC91b5148d336BbffB224B4dC79F09f01D',
            MainCrossDomainMessenger: '0xEcC89b9EDD804850C4F343A278Be902be11AaF42',
            MainBridge: '0x73298186A143a54c20ae98EEE5a025bD5979De02',
            CanonicalTransactionChain: '0x2ebA8c4EfDB39A8Cd8f9eD65c50ec079f7CEBD81',
        },
        sideChain: exports.DEFAULT_SIDE_CONTRACT_ADDRESSES,
    },
}

exports.BRIDGE_ADAPTER_DATA = {
    4: {
        NFTCore: {
            Adapter: adapter_1.MainBridgeAdapter,
            mainBridge: exports.CONTRACT_ADDRESSES[4].mainChain.MainBridge,
            sideBridge: contracts_1.predeploys.SideStandardBridge,
        },
    },
    5: {
        NFTCore: {
            Adapter: adapter_1.MainBridgeAdapter,
            mainBridge: exports.CONTRACT_ADDRESSES[4].mainChain.MainBridge,
            sideBridge: contracts_1.predeploys.SideStandardBridge,
        },
    },
    97: {
        NFTCore: {
            Adapter: adapter_1.MainBridgeAdapter,
            mainBridge: exports.CONTRACT_ADDRESSES[4].mainChain.MainBridge,
            sideBridge: contracts_1.predeploys.SideStandardBridge,
        },
    }
}
const getOEContract = (contractName, mainChainId, opts = {}) => {
    const addresses = exports.CONTRACT_ADDRESSES[mainChainId];
    if (addresses === undefined && opts.address === undefined) {
        throw new Error(`cannot get contract ${contractName} for unknown L1 chain ID ${mainChainId}, you must provide an address`);
    }
    return new ethers_1.Contract(coercion_1.toAddress(opts.address || addresses.mainChain[contractName] || addresses.sideChain[contractName]), contracts_1.getContractInterface(NAME_REMAPPING[contractName] || contractName), opts.signerOrProvider);
};
exports.getOEContract = getOEContract;

const getAllOEContracts = (mainChainId, opts = {}) => {
    var _a, _b, _c, _d;
    const addresses = exports.CONTRACT_ADDRESSES[mainChainId] || {
        mainChain: {
            AddressManager: undefined,
            MainCrossDomainMessenger: undefined,
            MainBridge: undefined,
            StateCommitmentChain: undefined,
            CanonicalTransactionChain: undefined,
            BondManager: undefined,
        },
        sideChain: exports.DEFAULT_SIDE_CONTRACT_ADDRESSES,
    };
    const mainContracts = {};
    for (const [contractName, contractAddress] of Object.entries(addresses.mainChain)) {
        mainContracts[contractName] = exports.getOEContract(contractName, mainChainId, {
            address: ((_b = (_a = opts.overrides) === null || _a === void 0 ? void 0 : _a.l1) === null || _b === void 0 ? void 0 : _b[contractName]) || contractAddress,
            signerOrProvider: opts.mainSignerOrProvider,
        });
    }
    const sideContracts = {};
    for (const [contractName, contractAddress] of Object.entries(addresses.sideChain)) {
        sideContracts[contractName] = exports.getOEContract(contractName, mainChainId, {
            address: ((_d = (_c = opts.overrides) === null || _c === void 0 ? void 0 : _c.l2) === null || _d === void 0 ? void 0 : _d[contractName]) || contractAddress,
            signerOrProvider: opts.sideSignerOrProvider,
        });
    }
    return {
        mainChain: mainContracts,
        sideChain: sideContracts,
    };
};
exports.getAllOEContracts = getAllOEContracts;

const getBridgeAdapters = (mainChainId, messenger, opts) => {
    const adapters = {};
    for (const [bridgeName, bridgeData] of Object.entries(Object.assign(Object.assign({}, (exports.BRIDGE_ADAPTER_DATA[mainChainId] || {})), ((opts === null || opts === void 0 ? void 0 : opts.overrides) || {})))) {
        adapters[bridgeName] = new bridgeData.Adapter({
            messenger,
            mainBridge: bridgeData.mainBridge,
            sideBridge: bridgeData.sideBridge,
        });
    }
    return adapters;
};
exports.getBridgeAdapters = getBridgeAdapters;
