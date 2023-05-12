const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  const SideBridge = await ethers.getContractFactory("SideBridge");
  const sideBridge = await SideBridge.deploy(
    process.env.SIDE_GATE,
    process.env.MAIN_BRIDGE,
    process.env.SIDE_BOT_ADDRESS,
    process.env.SIDE_TRAVA_ADDRESS,
    process.env.SIDE_BRIDGE_FEE
  );

  await sideBridge.deployed();
  console.log("SideBridge deployed at: ", sideBridge.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

