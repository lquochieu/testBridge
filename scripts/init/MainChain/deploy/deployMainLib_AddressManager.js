const {ethers} = require("hardhat");

require("dotenv").config();

async function main () {
    const Lib_AddressManagerContract = await ethers.getContractFactory("Lib_AddressManager");
    const Lib_AddressManager = await Lib_AddressManagerContract.deploy();
    console.log("Lib_AddressManager deployed at: ", Lib_AddressManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  