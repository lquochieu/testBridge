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

const ownerBSC = new ethers.Wallet(adminKey.privateKey, ethers.provider);
const ownerETH = new ethers.Wallet(adminKey.privateKey, goerliProvider);

const receiver = new ethers.Wallet(receiverKey.privateKey, ethers.provider);

const main = async () => {
  // const SideTransactor = await ethers.getContractFactory("SideTransactor");
  // const sideTransactor = await upgrades.deployProxy(SideTransactor, [
  //   "SideTransactor",
  //   "1",
  //   process.env.SIDE_LIB_ADDRESS_MANAGER,
  // ]);

  // await sideTransactor.deployed();
  // console.log("SideTransactor deployed at: ", process.env.SIDE_TRANSACTOR);
  /*
     Set Side Transactor in BSC
   */
  const RandBSC = await ethers.getContractFactory("Lib_AddressManager");
  const rdBSC = await RandBSC.attach(process.env.MAIN_LIB_ADDRESS_MANAGER);
  const rdOwnerBSC = await rdBSC.connect(ownerBSC);

  let setAddress;
  setAddress = await rdOwnerBSC.setTransactor(
    process.env.GOERLI_CHAIN_ID,
    process.env.SIDE_TRANSACTOR
  );
  await setAddress.wait();
  console.log(
    "SIDE_TRANSACTOR = ",
    await rdOwnerBSC.getTransactorAddress(process.env.GOERLI_CHAIN_ID)
  );

  /*
     Set Side Transactor in ETH
   */
  const RandETH = await ethers.getContractFactory("Lib_AddressManager");
  const rdETH = await RandETH.attach(process.env.SIDE_LIB_ADDRESS_MANAGER);
  const rdOwnerETH = await rdETH.connect(ownerETH);

  setAddress = await rdOwnerETH.setAddress(
    "SideTransactor",
    process.env.SIDE_TRANSACTOR
  );
  await setAddress.wait();
  console.log(
    "SIDE_TRANSACTOR = ",
    await rdOwnerETH.getAddress("SideTransactor")
  );

  setAddress = await rdOwnerETH.setTransactor(
    process.env.GOERLI_CHAIN_ID,
    process.env.SIDE_TRANSACTOR
  );
  await setAddress.wait();
  console.log(
    "SIDE_TRANSACTOR = ",
    await rdOwnerBSC.getTransactorAddress(process.env.GOERLI_CHAIN_ID)
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
