const {ethers, upgrades} = require("hardhat");

require("dotenv").config();

async function main () {
    let Lib_AddressManagerUpgradeable = await ethers.getContractFactory("Lib_AddressManagerUpgradeable");
    let lib_AddressManagerUpgradeable = await upgrades.deployProxy(Lib_AddressManagerUpgradeable, []);
    
    await lib_AddressManagerUpgradeable.deployed();
    console.log("Lib_AddressManagerUpgradeable deployed at: ", lib_AddressManagerUpgradeable.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  