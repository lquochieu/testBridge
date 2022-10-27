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

const addressContract = [
  "SideBridge",
  "SideCanonicalTransactionChain",
  "SideGate",
];
const envAddressContract = [
  "SIDE_BRIDGE",
  "SIDE_CANONICAL_TRANSACTION_CHAIN",
  "SIDE_GATE",
];

const main = async () => {
  const Rand = await ethers.getContractFactory("Lib_AddressManager");
  const rd = await Rand.attach(process.env.SIDE_LIB_ADDRESS_MANAGER);
  const rdOwner = await rd.connect(owner);

  let setAddress;
  for (let i = 0; i < addressContract.length-2; i++) {
    setAddress = await rdOwner.setAddress(
      addressContract[i],
      process.env[envAddressContract[i]]
    );
    await setAddress.wait();
    console.log(
      addressContract[i],
      await rdOwner.getAddress(addressContract[i])
    );
  }

  // setAddress = await rdOwner.setGate(
  //   process.env.BSC_TESTNET_CHAIN_ID,
  //   process.env.MAIN_GATE
  // );
  // await setAddress.wait();
  // console.log(
  //   "MAIN_GATE = ",
  //   await rdOwner.getGateAddress(process.env.BSC_TESTNET_CHAIN_ID)
  // );

  // setAddress = await rdOwner.setTransactor(
  //   process.env.BSC_TESTNET_CHAIN_ID,
  //   process.env.MAIN_TRANSACTOR
  // );
  // await setAddress.wait();
  // console.log(
  //   "MAIN_TRANSACTOR = ",
  //   await rdOwner.getTransactorAddress(process.env.BSC_TESTNET_CHAIN_ID)
  // );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
