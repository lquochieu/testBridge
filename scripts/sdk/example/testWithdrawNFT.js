const { ethers } = require("hardhat");
const { sideOwner } = require("../provider");

require("dotenv").config();

const main = async () => {
  const Rand = await ethers.getContractFactory("SideBridge");
  const rd = await Rand.attach(process.env.SIDE_BRIDGE);
  const rdOwner = await rd.connect(sideOwner);

  const withdrawNFT = await rdOwner.withdrawTo(
    process.env.SIDE_NFT_COLLECTION,
    adminKey.publicKey,
    183,
    "0x",
    { gasLimit: BigInt(1e7) }
  );
  await withdrawNFT.wait();
  console.log(1, withdrawNFT);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
