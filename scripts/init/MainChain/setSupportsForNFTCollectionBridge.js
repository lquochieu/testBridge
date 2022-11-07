const { ethers } = require("hardhat");
const { mainOwner } = require("../../sdk/provider");

require("dotenv").config();

const main = async () => {
  const Rand = await ethers.getContractFactory("MainBridge");
  const rd = await Rand.attach(process.env.MAIN_BRIDGE);
  const rdOwner = await rd.connect(mainOwner);

  const setSupportsForNFTCollectionBridge =
    await rdOwner.setSupportsForNFTCollectionBridge(
      true,
      process.env.GOERLI_CHAIN_ID,
      process.env.MAIN_NFT_COLLECTION,
      process.env.SIDE_NFT_COLLECTION
    );
  await setSupportsForNFTCollectionBridge.wait();
  console.log(
    1,
    await rdOwner.supportsForNFTCollectionBridge(
      process.env.GOERLI_CHAIN_ID,
      process.env.MAIN_NFT_COLLECTION,
      process.env.SIDE_NFT_COLLECTION
    )
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
