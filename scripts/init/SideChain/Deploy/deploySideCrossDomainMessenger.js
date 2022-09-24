const { ethers } = require("hardhat");

require("dotenv").config();

async function main() {
  const SideGateContract = await ethers.getContractFactory("SideGate");
  const SideGate = await SideGateContract.deploy(
    process.env.MAIN_CROSS_DOMAIN_MESSENGER
  );
  console.log("SideGate deployed at: ", SideGate.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
