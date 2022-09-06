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

const goerliProvider = new ethers.providers.InfuraProvider(
  "goerli",
  process.env.ABI_KEY
);

const owner = new ethers.Wallet(adminKey.privateKey, goerliProvider);
const receiver = new ethers.Wallet(receiverKey.privateKey, goerliProvider);

const main = async () => {
  const Rand = await ethers.getContractFactory("SideNFTCore");
  const rd = await Rand.attach(process.env.SIDE_NFT_CORE);
  const rdReceiver = await rd.connect(receiver);

  const setApprovalForAll = await rdReceiver.setApprovalForAll(process.env.SIDE_BRIDGE, true);
  await setApprovalForAll.wait();
  console.log("1: ", setApprovalForAll);
  console.log("2: ", await rdReceiver.isApprovedForAll(receiverKey.publicKey, process.env.SIDE_BRIDGE));
  console.log("Owner of token[0] ", await rdReceiver.ownerOf(0));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
