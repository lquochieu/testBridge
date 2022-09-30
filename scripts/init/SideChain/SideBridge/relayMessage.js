const { ethers } = require("hardhat");
const { genSignature } = require("../../../generateSignature.js");
require("dotenv").config();

const MainBridgeContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainBridge.sol/MainBridge.json");
const MainGateContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainGate.sol/MainGate.json");
const MainCanonicalTransactionChainContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainCanonicalTransactionChain.sol/MainCanonicalTransactionChain.json");
const SideGateContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideGate.sol/SideGate.json");
const SideBridgeContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideBridge.sol/SideBridge.json");

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const goerliProvider = new ethers.providers.InfuraProvider(
  "goerli",
  process.env.ABI_KEY
);

const owner = new ethers.Wallet(adminKey.privateKey, goerliProvider);

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

const MainCanonicalTransactionChain = new ethers.Contract(
  process.env.MAIN_CANONICAL_TRANSACTION_CHAIN,
  MainCanonicalTransactionChainContract.abi,
  ethers.provider
);

const SideGate = new ethers.Contract(
  process.env.SIDE_GATE,
  SideGateContract.abi,
  goerliProvider
);

const SideBridge = new ethers.Contract(
  process.env.SIDE_BRIDGE,
  SideBridgeContract.abi,
  goerliProvider
);

const main = async () => {
  const Rand = await ethers.getContractFactory("SideTransactor");
  const rd = await Rand.attach(process.env.SIDE_TRANSACTOR);
  const rdOwner = await rd.connect(owner);

  MainBridge.on(
    "NFTDepositInitiated",
    async (
      mainNFTCollection,
      sideNFTCollection,
      from,
      to,
      nftCollection,
      sideChainId,
      data,
      event
    ) => {
      console.log(`
      NFTDepositInitiated
      - mainNFTCollection = ${mainNFTCollection}
      - sideNFTCollection = ${sideNFTCollection}
      - from = ${from}
      - to = ${to}
      - nftCollection = ${nftCollection}
      - data = ${data}
      `);
    }
  );

  MainGate.on(
    "SentMessage",
    async (chainId, target, sender, message, nonce, event) => {
      let deadline = Math.floor(Date.now() / 1000) + 10000;
      let signature = await genSignature(
        chainId,
        target,
        sender,
        message,
        nonce,
        deadline
      );

      console.log(`
      SentMessage
      - chainId = ${chainId}
      - target = ${target}
      - sender = ${sender}
      - message = ${message}
      - nonce = ${nonce}
      - deadline = ${deadline}
      - signature = ${signature}
      `);

      const claimNFTCollection = await rdOwner.claimNFTCollection(
        chainId,
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
    }
  );

  MainCanonicalTransactionChain.on(
    "TransactorEvent",
    (sender, target, data, queueIndex, timestamp, event) => {
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

  SideGate.on("RelayedMessage", (event) => {
    console.log("Deposit NFT success!");
  });

  SideBridge.on(
    "DepositFinalized",
    (
      mainNFTCollection,
      sideNFTCollection,
      from,
      to,
      [chainId, rarity, collectionId, level, experience, rank, url],
      data,
      event
    ) => {
      console.log(`
    DepositFinalized
  - mainNFTCollection = ${mainNFTCollection}
  - sideNFTCollection = ${sideNFTCollection}
  - from = ${from}
  - to = ${to}
  - nftCollection {
      chainId = ${chainId}
      rarity = ${rarity}
      collectionId = ${collectionId}
      level = ${level}
      experience = ${experience}
      rank = ${rank}
      url = ${url}
      }
  - data = ${data}
  `);
    }
  );

  SideBridge.on(
    "DepositFailed",
    (
      mainNFTCollection,
      sideNFTCollection,
      from,
      to,
      [chainId, rarity, collectionId, level, experience, rank, url],
      data,
      event
    ) => {
      console.log(`
    DepositFinalized
  - mainNFTCollection = ${mainNFTCollection}
  - sideNFTCollection = ${sideNFTCollection}
  - from = ${from}
  - to = ${to}
  - nftCollection {
      chainId = ${chainId}
      rarity = ${rarity}
      collectionId = ${collectionId}
      level = ${level}
      experience = ${experience}
      rank = ${rank}
      url = ${url}
      }
  - data = ${data}
  `);
    }
  );
};

main();
