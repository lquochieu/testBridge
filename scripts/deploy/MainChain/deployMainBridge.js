const {ethers, upgrades} = require("hardhat");
require("dotenv").config();

async function main () {
    const MainBridge = await ethers.getContractFactory("MainBridge");
    const mainBridge = await upgrades.deployProxy(MainBridge, [
      process.env.MAIN_GATE
    ]);
    
    await mainBridge.deployed();
    console.log("MainBridge deployed at: ", mainBridge.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  