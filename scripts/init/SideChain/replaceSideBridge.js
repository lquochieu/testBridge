const { ethers } = require("hardhat");
const { sideOwner } = require("../../sdk/rdOwner");
// const { rdOwnerSideNFTCollection } = require("../../sdk/rdOwner");

require("dotenv").config();

const main = async () => {
  // const rdOwner = await rdOwnerSideNFTCollection();
  const Rand = await ethers.getContractFactory("SideNFTCollection");
  const rd = await Rand.attach(process.env.SIDE_NFT_COLLECTION);
  const rdOwner = await rd.connect(sideOwner);

  const updateSideBridge = await rdOwner.updateSideBridge(process.env.SIDE_BRIDGE);
  await updateSideBridge.wait();
  console.log("SideBridge: ", await rdOwner.getSideBridge());

  const registerVault = await rdOwner.registerVault(process.env.SIDE_BRIDGE);
  await registerVault.wait();
  console.log(registerVault);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
