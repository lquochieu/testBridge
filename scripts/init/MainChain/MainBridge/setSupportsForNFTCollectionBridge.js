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
  const rdOwner = await rd.connect(owner);

  const setSupportsForNFTCollectionBridge =
    await rdOwner.setSupportsForNFTCollectionBridge(
      true,
      process.env.GOERLI_CHAIN_ID,
      process.env.MAIN_NFT_COLLECTION,
      process.env.SIDE_NFT_COLLECTION
    );
  await setSupportsForNFTCollectionBridge.wait();
  console.log(
    1,
    await rdOwner.supportsForNFTCollectionBridge(
      process.env.GOERLI_CHAIN_ID,
      process.env.MAIN_NFT_COLLECTION,
      process.env.SIDE_NFT_COLLECTION
    )
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
