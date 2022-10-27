const { ethers } = require("hardhat");

require("dotenv").config();

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const receiverKey = {
  publicKey: process.env.PUBLIC_KEY_RECEIVER,
  privateKey: process.env.PRIVATE_KEY_RECEIVER,
};

const goerliProvider = new ethers.providers.InfuraProvider(
  "goerli",
  process.env.ABI_KEY
);

const owner = new ethers.Wallet(adminKey.privateKey, goerliProvider);
const receiver = new ethers.Wallet(receiverKey.privateKey, goerliProvider);

const main = async () => {
  const Rand = await ethers.getContractFactory("SideNFTCollection");
  const rd = await Rand.attach(process.env.SIDE_NFT_COLLECTION);
  const rdOwner = await rd.connect(owner);

  const updateSideBridge = await rdOwner.updateSideBridge(process.env.SIDE_BRIDGE);
  await updateSideBridge.wait();
  console.log("SideBridge: ", await rdOwner.getSideBridge());

  const registerVault = await rdOwner.registerVault(process.env.SIDE_BRIDGE);
  await registerVault.wait();
  console.log(registerVault);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
