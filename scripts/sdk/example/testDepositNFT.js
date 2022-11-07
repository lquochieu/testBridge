const { ethers } = require("hardhat");
const { mainOwner } = require("../provider");

require("dotenv").config();

const main = async () => {

  const Rand = await ethers.getContractFactory("MainBridge");
  const rd = await Rand.attach(process.env.MAIN_BRIDGE);
  const rdOwner = await rd.connect(mainOwner);

  const depositNFT = await rdOwner.depositNFTBridgeTo(
    5,
    process.env.MAIN_NFT_COLLECTION,
    process.env.SIDE_NFT_COLLECTION,
    adminKey.publicKey,
    223,
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
