const { ethers } = require("hardhat");
const { genSignature } = require("../../../generateSignature.js");

require("dotenv").config();

const MainBridgeContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainBridge.sol/MainBridge.json");
const MainGateContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainGate.sol/MainGate.json");
const SideCanonicalTransactionChainContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideCanonicalTransactionChain.sol/SideCanonicalTransactionChain.json");
const SideGateContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideGate.sol/SideGate.json");
const SideBridgeContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideBridge.sol/SideBridge.json");

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const receiverKey = {
  publicKey: process.env.PUBLIC_KEY_RECEIVER,
  privateKey: process.env.PRIVATE_KEY_RECEIVER,
};

const goerliProvider = new ethers.providers.InfuraProvider(
  "goerli",
  process.env.ABI_KEY
);

const owner = new ethers.Wallet(adminKey.privateKey, ethers.provider);
const receiver = new ethers.Wallet(receiverKey.privateKey, goerliProvider);

const MainBridge = new ethers.Contract(
  process.env.MAIN_BRIDGE,
  MainBridgeContract.abi,
  ethers.provider
);

const MainGate = new ethers.Contract(
  process.env.MAIN_GATE,
  MainGateContract.abi,
  ethers.provider
);

const SideGate = new ethers.Contract(
  process.env.SIDE_GATE,
  SideGateContract.abi,
  goerliProvider
);

const SideCanonicalTransactionChain = new ethers.Contract(
  process.env.SIDE_CANONICAL_TRANSACTION_CHAIN,
  SideCanonicalTransactionChainContract.abi,
  goerliProvider
);

const SideBridge = new ethers.Contract(
  process.env.SIDE_BRIDGE,
  SideBridgeContract.abi,
  goerliProvider
);

const main = async () => {
  const Rand = await ethers.getContractFactory("MainTransactor");
  const rd = await Rand.attach(process.env.MAIN_TRANSACTOR);
  const rdOwner = await rd.connect(owner);

  SideBridge.on(
    "WithdrawalInitiated",
    (
      mainNFTCollection,
      sideNFTCollection,
      from,
      to,
      collectionId,
      data,
      event
    ) => {
      console.log(`
    WithdrawalInitiated
      - mainNFTCollection = ${mainNFTCollection}
      - sideNFTCollection = ${sideNFTCollection}
      - from = ${from}
      - to = ${to}
      - collectionId = ${collectionId}
      - data = ${data}
      `);
    }
  );

  SideGate.on("SentMessage", async (target, sender, message, nonce, event) => {
    let deadline = Math.floor(Date.now() / 1000) + 10000;
    let signature = await genSignature(
      97,
      target,
      sender,
      message,
      nonce,
      deadline
    );

    console.log(`
      SentMessage
      - chainId = 97
      - target = ${target}
      - sender = ${sender}
      - message = ${message}
      - nonce = ${nonce}
      - deadline = ${deadline}
      - signature = ${signature}
      `);

    const claimNFTCollection = await rdOwner.claimNFTCollection(
      97,
      target,
      sender,
      message,
      nonce,
      deadline,
      signature,
      {
        gasLimit: BigInt(1e7),
      }
    );
    await claimNFTCollection.wait();
    console.log(claimNFTCollection);
  });

  SideCanonicalTransactionChain.on(
    "TransactorEvent",
    async (sender, target, data, queueIndex, timestamp, event) => {
      console.log(`
      TransactorEvent
      - sender = ${sender}
      - target = ${target}
      - data = ${data}
      - queueIndex = ${queueIndex}
      - timestamp = ${timestamp}
      `);
    }
  );

  MainGate.on("RelayedMessage", (event) => {
    console.log("Withdraw NFT success!");
  });

  MainGate.on("FailedRelayedMessage", (event) => {
    console.log("Withdraw failed!");
  });

  MainBridge.on(
    "NFTWithdrawalFinalized",
    (
      mainNFTCollection,
      sideNFTCollection,
      from,
      to,
      collectionId,
      data,
      event
    ) => {
      console.log(`
      NFTWithdrawalFinalized
      - mainNFTCollection = ${mainNFTCollection}
      - sideNFTCollection = ${sideNFTCollection}
      - from = ${from}
      - to = ${to}
      - collectionId = ${collectionId}
      - data = ${data}
      `);
    }
  );
};

main();
