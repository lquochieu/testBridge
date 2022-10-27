"use strict";
exports.MainBridgeContract = exports.MainGateContract = exports.MainCanonicalTransactionChainContract = exports.SideBridgeContract = exports.SideGateContract = exports.SideCanonicalTransactionChainContract = void 0;

const { ethers } = require("hardhat");
const MainBridgeArtifact = require("../../artifacts/contracts/MainChain/MainBridge/MainBridge.sol/MainBridge.json");
const MainGateArtifact = require("../../artifacts/contracts/MainChain/MainBridge/MainGate.sol/MainGate.json");
const MainCanonicalTransactionChainContract = require("../../artifacts/contracts/MainChain/MainBridge/MainCanonicalTransactionChain.sol/MainCanonicalTransactionChain.json");
const SideBridgeArtifact = require("../../artifacts/contracts/SideChain/SideBridge/SideBridge.sol/SideBridge.json");
const SideGateArtifact = require("../../artifacts/contracts/SideChain/SideBridge/SideGate.sol/SideGate.json");
const SideCanonicalTransactionChainArtifact = require("../../artifacts/contracts/SideChain/SideBridge/SideCanonicalTransactionChain.sol/SideCanonicalTransactionChain.json");

require("dotenv").config();

const goerliProvider = new ethers.providers.InfuraProvider(
    "goerli",
    process.env.ABI_KEY
);

exports.MainBridgeContract = new ethers.Contract(
    process.env.MAIN_BRIDGE,
    MainBridgeArtifact.abi,
    ethers.provider
);

exports.MainGateContract = new ethers.Contract(
    process.env.MAIN_GATE,
    MainGateArtifact.abi,
    ethers.provider
);

exports.MainCanonicalTransactionChainContract = new ethers.Contract(
    process.env.MAIN_CANONICAL_TRANSACTION_CHAIN,
    MainCanonicalTransactionChainContract.abi,
    ethers.provider
);

exports.SideBridgeContract = new ethers.Contract(
    process.env.SIDE_BRIDGE,
    SideBridgeArtifact.abi,
    goerliProvider
);

exports.SideGateContract = new ethers.Contract(
    process.env.SIDE_GATE,
    SideGateArtifact.abi,
    goerliProvider
);

exports.SideCanonicalTransactionChainContract = new ethers.Contract(
    process.env.SIDE_CANONICAL_TRANSACTION_CHAIN,
    SideCanonicalTransactionChainArtifact.abi,
    goerliProvider
);

