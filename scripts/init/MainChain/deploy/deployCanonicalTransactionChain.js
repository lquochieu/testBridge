const {ethers} = require("hardhat");
require("dotenv").config();

async function main () {
    const CanonicalTransactionChainContract = await ethers.getContractFactory("CanonicalTransactionChain");
    const CanonicalTransactionChain = await CanonicalTransactionChainContract.deploy(
        process.env.MAIN_LIB_ADDRESS_MANAGER,
        BigInt(1e18),
        1,
        BigInt(1e6)
    );
    console.log("CanonicalTransactionChain deployed at: ", CanonicalTransactionChain.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  