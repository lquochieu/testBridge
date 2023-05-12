const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  const SideCanonicalTransactionChain = await ethers.getContractFactory(
    "SideCanonicalTransactionChain"
  );
  const sideCanonicalTransactionChain = await SideCanonicalTransactionChain.deploy(
    process.env.SIDE_LIB_ADDRESS_MANAGER
  );

  await sideCanonicalTransactionChain.deployed();

  console.log(
    "SideCanonicalTransactionChain deployed at: ",
    sideCanonicalTransactionChain.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
