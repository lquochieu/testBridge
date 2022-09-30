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
  const MainTransactor = await ethers.getContractFactory("MainTransactor");
    const mainTransactor = await upgrades.deployProxy(MainTransactor, [
      process.env.MAIN_LIB_ADDRESS_MANAGER
    ]);

    await mainTransactor.deployed();
    console.log("MainTransactor deployed at: ", mainTransactor.address);
  /*
     Set Side Transactor in Goerli
   */
  const RandETH = await ethers.getContractFactory("Lib_AddressManager");
  const rdETH = await RandETH.attach(process.env.SIDE_LIB_ADDRESS_MANAGER);
  const rdOwnerETH = await rdETH.connect(ownerETH);

  let setAddress;
  setAddress = await rdOwnerETH.setTransactor(
    process.env.GOERLI_CHAIN_ID,
    mainTransactor.address
  );
  await setAddress.wait();
  console.log(
    "MAIN_TRANSACTOR = ",
    await rdOwnerETH.getTransactorAddress(process.env.GOERLI_CHAIN_ID)
  );

  /*
     Set Side Transactor in BSC
   */
  const RandBSC = await ethers.getContractFactory("Lib_AddressManager");
  const rdBSC = await RandBSC.attach(process.env.MAIN_LIB_ADDRESS_MANAGER);
  const rdOwnerBSC = await rdBSC.connect(ownerBSC);

  setAddress = await rdOwnerBSC.setAddress(
    "MainTransactor",
    mainTransactor.address
  );
  await setAddress.wait();
  console.log(
    "MAIN_TRANSACTOR = ",
    await rdOwnerBSC.getAddress("MainTransactor")
  );

  setAddress = await rdOwnerBSC.setTransactor(
    process.env.BSC_TESTNET_CHAIN_ID,
    mainTransactor.address
  );
  await setAddress.wait();
  console.log(
    "MAIN_TRANSACTOR = ",
    await rdOwnerBSC.getTransactorAddress(process.env.BSC_TESTNET_CHAIN_ID)
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
