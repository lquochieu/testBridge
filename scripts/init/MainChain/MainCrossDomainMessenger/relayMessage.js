const { ethers } = require("hardhat");

require("dotenv").config();

const MainGateContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainGate.sol/MainGate.json");
const SideGateContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideGate.sol/SideGate.json");
const mainBridgeContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainBridge.sol/MainBridge.json");
const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const goerliProvider = new ethers.providers.InfuraProvider(
  "goerli",
  process.env.ABI_KEY
);

const owner = new ethers.Wallet(adminKey.privateKey, ethers.provider);

const MainGate = new ethers.Contract(
  process.env.MAIN_CROSS_DOMAIN_MESSENGER,
  MainGateContract.abi,
  ethers.provider
);

const SideGate = new ethers.Contract(
  process.env.SIDE_CROSS_DOMAIN_MESSENGER,
  SideGateContract.abi,
  goerliProvider
);

const mainBridge = new ethers.Contract(
  process.env.MAIN_BRIDGE,
  mainBridgeContract.abi,
  ethers.provider
);

const main = async () => {
  const Rand = await ethers.getContractFactory("MainGate");
  const rd = await Rand.attach(process.env.MAIN_CROSS_DOMAIN_MESSENGER);
  const rdOwner = await rd.connect(owner);

  SideGate.on(
    "SentMessage",
    async (target, sender, message, messageNonce, gasLimit, event) => {
      console.log(`
        SentMessage
        - target = ${target}
        - sender = ${sender}
        - message = ${message}
        - messageNonce = ${messageNonce}
        - gasLimite = ${gasLimit}
        `);
      const relayMessage = await rdOwner.relayMessage(
        target,
        sender,
        message,
        messageNonce
      );
      await relayMessage.wait();
      console.log(1, relayMessage);
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
