const { ethers } = require("hardhat");

require("dotenv").config();

const MainGateContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainGate.sol/MainGate.json");
const SideGateContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideGate.sol/SideGate.json");
const sideBridgeContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideBridge.sol/SideBridge.json");

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const goerliProvider = new ethers.providers.InfuraProvider(
  "goerli",
  process.env.ABI_KEY
);

const owner = new ethers.Wallet(adminKey.privateKey, goerliProvider);

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

const sideBridge = new ethers.Contract(
  process.env.SIDE_BRIDGE,
  sideBridgeContract.abi,
  goerliProvider
);

const main = async () => {
  const Rand = await ethers.getContractFactory("SideGate");
  const rd = await Rand.attach(process.env.SIDE_CROSS_DOMAIN_MESSENGER);
  const rdOwner = await rd.connect(owner);

  MainGate.on(
    "SentMessage",
    async (target, sender, message, messageNonce, gasLimit, event) => {
      console.log(`
        SentMessage
        - target = ${target}
        - sender = ${sender}
        - message = ${message}
        - messageNonce = ${messageNonce}
        - gasLimit = ${gasLimit}
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

  SideGate.on("RelayedMessage", (event) => {
    console.log("Deposit NFT success!");
  });

  sideBridge.on("DepositFailed", (event) => {
    console.log("Deposit failed!");
  });
};

main();
