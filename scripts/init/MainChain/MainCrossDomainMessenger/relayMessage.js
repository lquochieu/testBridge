const { ethers } = require("hardhat");

require("dotenv").config();

const mainCrossDomainMessengerContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainCrossDomainMessenger.sol/MainCrossDomainMessenger.json");
const sideCrossDomainMessengerContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideCrossDomainMessenger.sol/SideCrossDomainMessenger.json");
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

const mainCrossDomainMessenger = new ethers.Contract(
  process.env.MAIN_CROSS_DOMAIN_MESSENGER,
  mainCrossDomainMessengerContract.abi,
  ethers.provider
);

const sideCrossDomainMessenger = new ethers.Contract(
  process.env.SIDE_CROSS_DOMAIN_MESSENGER,
  sideCrossDomainMessengerContract.abi,
  goerliProvider
);

const mainBridge = new ethers.Contract(
  process.env.MAIN_BRIDGE,
  mainBridgeContract.abi,
  ethers.provider
);

const main = async () => {
  const Rand = await ethers.getContractFactory("MainCrossDomainMessenger");
  const rd = await Rand.attach(process.env.MAIN_CROSS_DOMAIN_MESSENGER);
  const rdOwner = await rd.connect(owner);

  sideCrossDomainMessenger.on(
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
      const relayMessage = await rdOwner.relayMessage(target, sender, message, messageNonce);
      await relayMessage.wait();
      console.log(1, relayMessage);
    }
  );

  mainCrossDomainMessenger.on("RelayedMessage", (event) => {
    console.log("Withdraw NFT success!");
  });

  mainCrossDomainMessenger.on("FailedRelayedMessage", (event) => {
    console.log("Withdraw failed!");
  });
};

main();
