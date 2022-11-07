"use strict";
exports.goerliProvider = exports.MainBridgeContract = exports.MainGateContract = exports.MainCanonicalTransactionChainContract = exports.SideBridgeContract = exports.SideGateContract = exports.SideCanonicalTransactionChainContract = void 0;

const { ethers } = require("hardhat");
const MainBridgeArtifact = require("../../artifacts/contracts/MainChain/MainBridge/MainBridge.sol/MainBridge.json");
const MainGateArtifact = require("../../artifacts/contracts/MainChain/MainBridge/MainGate.sol/MainGate.json");
const MainCanonicalTransactionChainContractArtifact = require("../../artifacts/contracts/MainChain/MainBridge/MainCanonicalTransactionChain.sol/MainCanonicalTransactionChain.json");
const SideBridgeArtifact = require("../../artifacts/contracts/SideChain/SideBridge/SideBridge.sol/SideBridge.json");
const SideGateArtifact = require("../../artifacts/contracts/SideChain/SideBridge/SideGate.sol/SideGate.json");
const SideCanonicalTransactionChainArtifact = require("../../artifacts/contracts/SideChain/SideBridge/SideCanonicalTransactionChain.sol/SideCanonicalTransactionChain.json");
const { goerliProvider } = require("./rdOwner");

require("dotenv").config();

const getMainBridgeContract = () => {
    return new ethers.Contract(
        process.env.MAIN_BRIDGE,
        MainBridgeArtifact.abi,
        ethers.provider
    );
}
const MainBridgeContract = getMainBridgeContract();
exports.MainBridgeContract = MainBridgeContract;

const getMainGateContract = () => {
    return new ethers.Contract(
        process.env.MAIN_GATE,
        MainGateArtifact.abi,
        ethers.provider
    );
}
const MainGateContract = getMainGateContract();
exports.MainGateContract = MainGateContract;

const getMainCanonicalTransactionChainContract = () => {
    return new ethers.Contract(
        process.env.MAIN_CANONICAL_TRANSACTION_CHAIN,
        MainCanonicalTransactionChainContractArtifact.abi,
        ethers.provider
    );
}
const MainCanonicalTransactionChainContract = getMainCanonicalTransactionChainContract();
exports.MainCanonicalTransactionChainContract = MainCanonicalTransactionChainContract;


const getSideBridgeContract = () => {
    return new ethers.Contract(
        process.env.SIDE_BRIDGE,
        SideBridgeArtifact.abi,
        goerliProvider
    );
}
const SideBridgeContract = getSideBridgeContract();
exports.SideBridgeContract = SideBridgeContract;

const getSideGateContract = () => {
    return new ethers.Contract(
        process.env.SIDE_GATE,
        SideGateArtifact.abi,
        goerliProvider
    );
}
const SideGateContract = getSideGateContract();
exports.SideGateContract = SideGateContract;

const getSideCanonicalTransactionChainContract = () => {
    return new ethers.Contract(
        process.env.SIDE_CANONICAL_TRANSACTION_CHAIN,
        SideCanonicalTransactionChainArtifact.abi,
        goerliProvider
    );
}
const SideCanonicalTransactionChainContract = getSideCanonicalTransactionChainContract();
exports.SideCanonicalTransactionChainContract = SideCanonicalTransactionChainContract;

