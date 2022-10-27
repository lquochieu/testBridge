const {ethers, upgrades} = require("hardhat");

async function main () {
    const MainNFTCollection = await ethers.getContractFactory("MainNFTCollection");
    const mainNFTCollection = await upgrades.deployProxy(MainNFTCollection, [
      "TRAVA",
      "TRAVA"
    ]);

    await mainNFTCollection.deployed();
    console.log("MainNFT deployed at: ", mainNFTCollection.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  