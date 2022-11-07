const { ethers } = require("hardhat");
const { mainOwner } = require("../../sdk/provider");

require("dotenv").config();

const main = async () => {
  const Rand = await ethers.getContractFactory("MainBridge");
  const rd = await Rand.attach(process.env.MAIN_BRIDGE);
  const rdOwner = await rd.connect(mainOwner);

  const setSideNFTBridge = await rdOwner.setSideNFTBridge(
    process.env.GOERLI_CHAIN_ID,
    process.env.SIDE_BRIDGE
  );
  await setSideNFTBridge.wait();
  console.log(1, await rdOwner.getSideNFTBridge(process.env.GOERLI_CHAIN_ID));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
