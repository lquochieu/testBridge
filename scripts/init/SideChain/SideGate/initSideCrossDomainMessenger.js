const { ethers } = require("hardhat");

require("dotenv").config();

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const goerliProvider = new ethers.providers.InfuraProvider(
  "goerli",
  process.env.ABI_KEY
);

const owner = new ethers.Wallet(adminKey.privateKey, goerliProvider);

const main = async () => {
  const Rand = await ethers.getContractFactory("SideGate");
  const rd = await Rand.attach(process.env.SIDE_CROSS_DOMAIN_MESSENGER);
  const rdOwner = await rd.connect(owner);
  const initializeSideGate = await rdOwner.initialize(
    process.env.SIDE_LIB_ADDRESS_MANAGER
  );
  await initializeSideGate.wait();
  console.log(await rdOwner.libAddressManager());
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
