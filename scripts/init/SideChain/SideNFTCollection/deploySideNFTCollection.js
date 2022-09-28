const {ethers, upgrades} = require("hardhat");
require("dotenv").config();

async function main () {
    const SideNFTCollection = await ethers.getContractFactory("SideNFTCollection");
    const sideNFTCollection = await upgrades.deployProxy(SideNFTCollection, [
      process.env.SIDE_BRIDGE,
      process.env.MAIN_NFT_COLLECTION,
      "TRAVA",
      "TRAVA"
    ]);

    await sideNFTCollection.deployed();
    console.log("SideNFTCollection deployed at: ", sideNFTCollection.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  