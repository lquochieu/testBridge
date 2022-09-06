const { ethers } = require("hardhat");

require("dotenv").config();

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const owner = new ethers.Wallet(adminKey.privateKey, ethers.provider);

const main = async () => {
  const Rand = await ethers.getContractFactory("Lib_AddressManager");
  const rd = await Rand.attach(process.env.MAIN_LIB_ADDRESS_MANAGER);
  const rdOwner = await rd.connect(owner);

  const setAddressMainBridge = await rdOwner.setAddress("MainBridge", process.env.MAIN_BRIDGE);
  await setAddressMainBridge.wait();
  console.log(1, setAddressMainBridge);
  console.log("MainBridge = ", await rdOwner.getAddress("MainBridge"));

  const setAddressCanonicalTransactionChain = await rdOwner.setAddress("CanonicalTransactionChain", process.env.CANONICAL_TRANSACTION_CHAIN);
  await setAddressCanonicalTransactionChain.wait();
  console.log(2, setAddressCanonicalTransactionChain);
  console.log("CanonicalTransactionChain = ", await rdOwner.getAddress("CanonicalTransactionChain"));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
