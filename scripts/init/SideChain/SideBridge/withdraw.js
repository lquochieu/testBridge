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
  const rdReceiver = await rd.connect(receiver);

  const withdrawNFT = await rdReceiver.withdraw(
    process.env.SIDE_NFT_CORE,
    0,
    0,
    "0x"
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
