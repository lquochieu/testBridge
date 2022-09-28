const {ethers, upgrades} = require("hardhat");

require("dotenv").config();

async function main () {
    let Lib_AddressManager = await ethers.getContractFactory("Lib_AddressManager");
    let lib_AddressManager = await upgrades.deployProxy(Lib_AddressManager, []);
    
    await lib_AddressManager.deployed();
    console.log("Lib_AddressManager deployed at: ", lib_AddressManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  