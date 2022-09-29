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
  const Rand = await ethers.getContractFactory("SideBridge");
  const rd = await Rand.attach(process.env.SIDE_BRIDGE);
  const rdOwner = await rd.connect(owner);

  const withdrawNFT = await rdOwner.withdrawTo(
    process.env.SIDE_NFT_COLLECTION,
    adminKey.publicKey,
    222,
    "0x",
    {gasLimit: BigInt(1e7)}
  );
  await withdrawNFT.wait();
  console.log(1, withdrawNFT);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
