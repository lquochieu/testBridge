const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  const SideGate = await ethers.getContractFactory("SideGate");
  const sideGate = await upgrades.deployProxy(SideGate, [
    process.env.SIDE_LIB_ADDRESS_MANAGER
  ]);

  await sideGate.deployed();
  console.log("SideGate deployed at: ", sideGate.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
