const {ethers, upgrades} = require("hardhat");
require("dotenv").config();

async function main () {
    const SideTransactor = await ethers.getContractFactory("SideTransactor");
    const sideTransactor = await upgrades.deployProxy(SideTransactor, [
      process.env.SIDE_LIB_ADDRESS_MANAGER
    ]);

    await sideTransactor.deployed();
    console.log("SideTransactor deployed at: ", sideTransactor.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  