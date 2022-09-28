const { ethers } = require("hardhat");

require("dotenv").config();

const MainGateContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainGate.sol/MainGate.json");
const SideCanonicalTransactionChainContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideCanonicalTransactionChain.sol/SideCanonicalTransactionChain.json");
const SideGateContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideGate.sol/SideGate.json");
const mainBridgeContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainBridge.sol/MainBridge.json");

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

const mainBridge = new ethers.Contract(
  process.env.MAIN_BRIDGE,
  mainBridgeContract.abi,
  ethers.provider
);

const main = async () => {
  const Rand = await ethers.getContractFactory("MainTransactor");
  const rd = await Rand.attach(process.env.MAIN_TRANSACTOR);
  const rdOwner = await rd.connect(owner);

  console.log(SideGate);
  SideGate.on("SentMessage", async (target, sender, message, nonce, event) => {
    console.log(`
        SentMessage
        - target = ${target}
        - sender = ${sender}
        - message = ${message}
        - nonce = ${nonce}
        `);
    const claimNFTCollection = await rdOwner.claimNFTCollection(
      5,
      target,
      sender,
      data,
      nonce,
      0,
      0,
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
};

main();
