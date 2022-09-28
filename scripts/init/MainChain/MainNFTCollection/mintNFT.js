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


const main = async () => {
  const Rand = await ethers.getContractFactory("MainNFTCollection");
  const rd = await Rand.attach(process.env.MAIN_NFT_COLLECTION);
  const rdOwner = await rd.connect(owner);

  const mintNFT = await rdOwner.mintNFTCollection(receiverKey.publicKey);
  await mintNFT.wait();
  console.log(1, mintNFT);
  console.log("Owner of NFT ", 2, await rdOwner.ownerOf(1));

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
