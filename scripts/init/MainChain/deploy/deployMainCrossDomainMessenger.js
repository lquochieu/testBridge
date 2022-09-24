const { ethers } = require("hardhat");

async function main() {
  const MainGateContract = await ethers.getContractFactory("MainGate");
  const MainGate = await MainGateContract.deploy();
  console.log("MainGate deployed at: ", MainGate.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
