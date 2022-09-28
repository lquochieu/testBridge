const {ethers, upgrades} = require("hardhat");
require("dotenv").config();

async function main () {
    const SideBridge = await ethers.getContractFactory("SideBridge");
    const sideBridge = await upgrades.deployProxy(SideBridge, [
      process.env.SIDE_GATE,
      process.env.MAIN_BRIDGE
    ]);
    
    await sideBridge.deployed();
    console.log("SideBridge deployed at: ", sideBridge.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  