const {ethers} = require("hardhat");

require("dotenv").config();

async function main () {
    const sideBridgeContract = await ethers.getContractFactory("SideBridge");
    const sideBridge = await sideBridgeContract.deploy(process.env.SIDE_CROSS_DOMAIN_MESSENGER, process.env.MAIN_BRIDGE);
    console.log("sideBridge deployed at: ", sideBridge.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  