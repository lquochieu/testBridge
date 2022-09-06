const { ethers } = require("hardhat");

require("dotenv").config();

const mainCrossDomainMessengerContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainCrossDomainMessenger.sol/MainCrossDomainMessenger.json");
const sideCrossDomainMessengerContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideCrossDomainMessenger.sol/SideCrossDomainMessenger.json");
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

const sideBridge = new ethers.Contract(
  process.env.SIDE_BRIDGE,
  sideBridgeContract.abi,
  goerliProvider
);

const main = async () => {
  const Rand = await ethers.getContractFactory("SideCrossDomainMessenger");
  const rd = await Rand.attach(process.env.SIDE_CROSS_DOMAIN_MESSENGER);
  const rdOwner = await rd.connect(owner);

  mainCrossDomainMessenger.on(
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
      const relayMessage = await rdOwner.relayMessage(target, sender, message, messageNonce);
      await relayMessage.wait();
      console.log(1, relayMessage);
    }
  );

  sideCrossDomainMessenger.on("RelayedMessage", (event) => {
    console.log("Deposit NFT success!");
  });

  sideBridge.on("DepositFailed", (event) => {
    console.log("Deposit failed!");
  });
};

main();
