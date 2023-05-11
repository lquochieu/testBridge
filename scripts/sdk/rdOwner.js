
"use strict";
exports.sideProvider = exports.mainOwner = exports.sideOwner = exports.rdOwnerMainBridge = exports.rdOwnerMainGate = exports.rdOwnerMainCanonicalTransactionChain = exports.rdOwnerMainTransactor = exports.rdOwnerMainNFTCollection = exports.rdOwnerSideLib_AddressManager = exports.rdOwnerSideBridge = exports.rdOwnerSideGate = exports.rdOwnerSideCanonicalTransactionChain = exports.rdOwnerSideTransactor = exports.rdOwnerSideNFTCollection = void 0;

const { ethers } = require("hardhat");

require("dotenv").config();

const adminKey = {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
};

const getSideProvider = () => {
    return new ethers.providers.InfuraProvider(
        "goerli",
        process.env.ABI_KEY
    );

}
const sideProvider = getSideProvider();
exports.sideProvider = sideProvider;

const getMainOwner = () => {
    return new ethers.Wallet(adminKey.privateKey, ethers.provider);
}
const mainOwner = getMainOwner();
exports.mainOwner = mainOwner;

const getSideOwner = () => {
    return new ethers.Wallet(adminKey.privateKey, sideProvider);
}
const sideOwner = getSideOwner();
exports.sideOwner = sideOwner;

/*  ╔══════════════════════════════╗
    ║        Owner MainChain       ║
    ╚══════════════════════════════╝ */
const rdOwnerMainBridge = async () => {
    const RandMainBridge = await ethers.getContractFactory("MainBridge");
    const rdMainBridge = RandMainBridge.attach(process.env.MAIN_BRIDGE);
    const rdOwnerMainBridge = rdMainBridge.connect(mainOwner);
    return rdOwnerMainBridge;
}
exports.rdOwnerMainBridge = rdOwnerMainBridge;

const rdOwnerMainGate = async () => {
    const RandMainGate = await ethers.getContractFactory("MainGate");
    const rdMainGate = RandMainGate.attach(process.env.MAIN_GATE);
    const rdOwnerMainGate = rdMainGate.connect(mainOwner);
    return rdOwnerMainGate;
}
exports.rdOwnerMainGate = rdOwnerMainGate

const rdOwnerMainCanonicalTransactionChain = async () => {
    const RandMainCanonicalTransactionChain = await ethers.getContractFactory("MainCanonicalTransactionChain");
    const rdMainCanonicalTransactionChain = RandMainCanonicalTransactionChain.attach(process.env.MAIN_CANONICAL_TRANSACTION_CHAIN);
    const rdOwnerMainCanonicalTransactionChain = rdMainCanonicalTransactionChain.connect(mainOwner);
    return rdOwnerMainCanonicalTransactionChain;
}
exports.rdOwnerMainCanonicalTransactionChain = rdOwnerMainCanonicalTransactionChain

const rdOwnerMainTransactor = async () => {
    const RandMainTransactor = await ethers.getContractFactory("MainTransactor");
    const rdMainTransactor = RandMainTransactor.attach(process.env.MAIN_TRANSACTOR);
    const rdOwnerMainTransactor = rdMainTransactor.connect(mainOwner);
    return rdOwnerMainTransactor;
}
exports.rdOwnerMainTransactor = rdOwnerMainTransactor

const rdOwnerMainNFTCollection = async () => {
    const RandMainNFTCollection = await ethers.getContractFactory("MainNFTCollection");
    const rdMainNFTCollection = RandMainNFTCollection.attach(process.env.MAIN_NFT_COLLECTION);
    const rdOwnerMainNFTCollection = rdMainNFTCollection.connect(mainOwner);
    return rdOwnerMainNFTCollection;
}
exports.rdOwnerMainNFTCollection = rdOwnerMainNFTCollection


/*  ╔══════════════════════════════╗
    ║        Owner SideChain       ║
    ╚══════════════════════════════╝ */
const rdOwnerSideLib_AddressManager = async () => {
    const RandSideLib_AddressManager = await ethers.getContractFactory("Lib_AddressManager");
    const rdSideLib_AddressManager = RandSideLib_AddressManager.attach(process.env.SIDE_LIB_ADDRESS_MANAGER);
    const rdOwnerSideLib_AddressManager = rdSideLib_AddressManager.connect(sideOwner);
    return rdOwnerSideLib_AddressManager;
}
exports.rdOwnerSideLib_AddressManager = rdOwnerSideLib_AddressManager

const rdOwnerSideBridge = async () => {
    const RandSideBridge = await ethers.getContractFactory("SideBridge");
    const rdSideBridge = RandSideBridge.attach(process.env.SIDE_BRIDGE);
    const rdOwnerSideBridge = rdSideBridge.connect(sideOwner);
    return rdOwnerSideBridge;
}
exports.rdOwnerSideBridge = rdOwnerSideBridge

const rdOwnerSideGate = async () => {
    const RandSideGate = await ethers.getContractFactory("SideGate");
    const rdSideGate = RandSideGate.attach(process.env.SIDE_GATE);
    const rdOwnerSideGate = rdSideGate.connect(sideOwner);
    return rdOwnerSideGate;
}
exports.rdOwnerSideGate = rdOwnerSideGate

const rdOwnerSideCanonicalTransactionChain = async () => {
    const RandSideCanonicalTransactionChain = await ethers.getContractFactory("SideCanonicalTransactionChain");
    const rdSideCanonicalTransactionChain = RandSideCanonicalTransactionChain.attach(process.env.SIDE_CANONICAL_TRANSACTION_CHAIN);
    const rdOwnerSideCanonicalTransactionChain = rdSideCanonicalTransactionChain.connect(sideOwner);
    return rdOwnerSideCanonicalTransactionChain;
}
exports.rdOwnerSideCanonicalTransactionChain = rdOwnerSideCanonicalTransactionChain

const rdOwnerSideTransactor = async () => {
    const RandSideTransactor = await ethers.getContractFactory("SideTransactor");
    const rdSideTransactor = RandSideTransactor.attach(process.env.SIDE_TRANSACTOR);
    const rdOwnerSideTransactor = rdSideTransactor.connect(sideOwner);
    return rdOwnerSideTransactor;
}
exports.rdOwnerSideTransactor = rdOwnerSideTransactor

const rdOwnerSideNFTCollection = async () => {
    const RandSideNFTCollection = await ethers.getContractFactory("SideNFTCollection");
    const rdSideNFTCollection = RandSideNFTCollection.attach(process.env.SIDE_NFT_COLLECTION);
    const rdOwnerSideNFTCollection = rdSideNFTCollection.connect(sideOwner);
    return rdOwnerSideNFTCollection;
}
exports.rdOwnerSideNFTCollection = rdOwnerSideNFTCollection

