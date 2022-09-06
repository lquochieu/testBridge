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
  const Rand = await ethers.getContractFactory("Lib_AddressManager");
  const rd = await Rand.attach(process.env.SIDE_LIB_ADDRESS_MANAGER);
  const rdOwner = await rd.connect(owner);
  const setAddress = await rdOwner.setAddress("OVMSideToMainMessagePasser", process.env.OVM_SIDE_TO_MAIN_MESSAGE_PASSER);
  await setAddress.wait();
  console.log("OVMSideToMainMessagePasser = ", await rdOwner.getAddress("OVMSideToMainMessagePasser"));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
