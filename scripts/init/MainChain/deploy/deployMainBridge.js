const {ethers} = require("hardhat");

async function main () {
    const mainBridgeContract = await ethers.getContractFactory("MainBridge");
    const mainBridge = await mainBridgeContract.deploy();
    console.log("MainBridge deployed at: ", mainBridge.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  