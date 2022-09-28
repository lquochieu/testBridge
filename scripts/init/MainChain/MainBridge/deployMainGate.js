const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  const MainGate = await ethers.getContractFactory("MainGate");
  const mainGate = await upgrades.deployProxy(MainGate, [
    process.env.MAIN_LIB_ADDRESS_MANAGER
  ]);

  await mainGate.deployed();
  console.log("MainGate deployed at: ", mainGate.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
