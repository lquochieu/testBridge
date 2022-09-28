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
  const Rand = await ethers.getContractFactory("MainNFTCollection");
  const rd = await Rand.attach(process.env.MAIN_NFT_COLLECTION);
  const rdReceiver = await rd.connect(receiver);

  const setApprovalForAll = await rdReceiver.setApprovalForAll(process.env.MAIN_BRIDGE, true, {gasLimit: BigInt(1e7)});
  await setApprovalForAll.wait();
  console.log("1: ", setApprovalForAll);
  console.log("2: ", await rdReceiver.isApprovedForAll(receiverKey.publicKey, process.env.MAIN_BRIDGE));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
