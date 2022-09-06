const { ethers } = require("hardhat");

require("dotenv").config();

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const receiverKey = {
  publicKey: process.env.PUBLIC_KEY_RECEIVER,
  privateKey: process.env.PRIVATE_KEY_RECEIVER,
};

const owner = new ethers.Wallet(adminKey.privateKey, ethers.provider);
const receiver = new ethers.Wallet(receiverKey.privateKey, ethers.provider);

const main = async () => {
  const Rand = await ethers.getContractFactory("MainBridge");
  const rd = await Rand.attach(process.env.MAIN_BRIDGE);
  const rdReceiver = await rd.connect(receiver);

  const depositNFT = await rdReceiver.depositNFTBridge(
    process.env.MAIN_NFT_CORE,
    process.env.SIDE_NFT_CORE,
    0,
    0,
    "0x"
  );
  await depositNFT.wait();
  console.log(1, depositNFT);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });