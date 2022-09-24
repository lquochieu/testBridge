const { ethers } = require("hardhat");

require("dotenv").config();

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const owner = new ethers.Wallet(adminKey.privateKey, ethers.provider);

const main = async () => {
  const Rand = await ethers.getContractFactory("MainGate");
  const rd = await Rand.attach(process.env.MAIN_CROSS_DOMAIN_MESSENGER);
  const rdOwner = await rd.connect(owner);

  const initializeMainGate = await rdOwner.initialize(
    process.env.MAIN_LIB_ADDRESS_MANAGER
  );
  await initializeMainGate.wait();
  console.log("Lib_AddressManager", await rdOwner.libAddressManager());
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
