const { ethers } = require("hardhat");
const { mainOwner } = require("../../sdk/rdOwner");

require("dotenv").config();

const addressContract = ["MainBridge", "MainCanonicalTransactionChain", "MainGate", "MainTransactor"];
const envAddressContract = ["MAIN_BRIDGE", "MAIN_CANONICAL_TRANSACTION_CHAIN", "MAIN_GATE", "MAIN_TRANSACTOR"];
const main = async () => {
  const Rand = await ethers.getContractFactory("Lib_AddressManagerUpgradeable");
  const rd = await Rand.attach(process.env.MAIN_LIB_ADDRESS_MANAGER);
  const rdOwner = await rd.connect(mainOwner);

  let setAddress;
  for (let i = 3; i < addressContract.length; i++) {
    setAddress = await rdOwner.setAddress(addressContract[i], process.env[envAddressContract[i]]);
    await setAddress.wait();
    console.log(addressContract[i], await rdOwner.getAddress(addressContract[i]));
  }

  // setAddress = await rdOwner.setGate(process.env.ETH_CHAIN_ID, process.env.SIDE_GATE);
  // await setAddress.wait();
  // console.log("SIDE_GATE = ", await rdOwner.getGateAddress(process.env.ETH_CHAIN_ID));

  // setAddress = await rdOwner.setTransactor(process.env.ETH_CHAIN_ID, process.env.SIDE_TRANSACTOR);
  // await setAddress.wait();
  // console.log("SIDE_TRANSACTOR = ", await rdOwner.getTransactorAddress(process.env.ETH_CHAIN_ID));
  // const setAddressMainBridge = await rdOwner.setAddress("MainBridge", process.env.MAIN_BRIDGE);
  // await setAddressMainBridge.wait();
  // console.log(1, setAddressMainBridge);
  // console.log("MainBridge = ", await rdOwner.getAddress("MainBridge"));

  // const setAddressMainCanonicalTransactionChain = await rdOwner.setAddress("MainCanonicalTransactionChain", process.env.CANONICAL_TRANSACTION_CHAIN);
  // await setAddressMainCanonicalTransactionChain.wait();
  // console.log(2, setAddressMainCanonicalTransactionChain);
  // console.log("MainCanonicalTransactionChain = ", await rdOwner.getAddress("MainCanonicalTransactionChain"));

  // const setAddressMainGate = await rdOwner.setAddress("MainGate", process.env.MAIN_GATE);
  // await setAddressMainGate.wait();
  // console.log(3, setAddressMainGate);
  // console.log("MainGate = ", await rdOwner.getAddress("MainGate"));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
