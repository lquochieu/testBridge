const { ethers } = require("hardhat");

require("dotenv").config();

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const owner = new ethers.Wallet(adminKey.privateKey, ethers.provider);

const main = async () => {
  const Rand = await ethers.getContractFactory("MainBridge");
  const rd = await Rand.attach(process.env.MAIN_BRIDGE);
  const rdOwner = await rd.connect(owner);

  const initializeMainBridge = await rdOwner.initialize(process.env.MAIN_CROSS_DOMAIN_MESSENGER, process.env.SIDE_BRIDGE);
  await initializeMainBridge.wait();
  console.log("messenger ", await rdOwner.messenger());
  console.log("sideNFTBridge ", await rdOwner.sideNFTBridge());
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
