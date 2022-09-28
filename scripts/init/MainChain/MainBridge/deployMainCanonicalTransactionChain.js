const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  const MainCanonicalTransactionChain = await ethers.getContractFactory(
    "MainCanonicalTransactionChain"
  );
  const mainCanonicalTransactionChain = await upgrades.deployProxy(
    MainCanonicalTransactionChain,
    [process.env.MAIN_LIB_ADDRESS_MANAGER]
  );

  await mainCanonicalTransactionChain.deployed();
  console.log(
    "MainCanonicalTransactionChain deployed at: ",
    mainCanonicalTransactionChain.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
