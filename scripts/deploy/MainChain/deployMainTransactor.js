const {ethers, upgrades} = require("hardhat");
require("dotenv").config();

async function main () {
    const MainTransactor = await ethers.getContractFactory("MainTransactor");
    const mainTransactor = await upgrades.deployProxy(MainTransactor, [
      process.env.MAIN_LIB_ADDRESS_MANAGER
    ]);

    await mainTransactor.deployed();
    console.log("MainTransactor deployed at: ", mainTransactor.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  