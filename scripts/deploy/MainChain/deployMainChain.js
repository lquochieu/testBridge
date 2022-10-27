const { ethers, upgrades } = require("hardhat");

require("dotenv").config();

async function main() {
  /*
    Deploy Main_LibAddressManager.sol
  */
  let Lib_AddressManager = await ethers.getContractFactory(
    "Lib_AddressManager"
  );
  let lib_AddressManager = await upgrades.deployProxy(Lib_AddressManager, []);
  await lib_AddressManager.deployed();
  console.log("Lib_AddressManager deployed at: ", lib_AddressManager.address);

  /*
    Deploy MainGate.sol
  */
  const MainGate = await ethers.getContractFactory("MainGate");
  const mainGate = await upgrades.deployProxy(MainGate, [
    lib_AddressManager.address,
  ]);
  await mainGate.deployed();
  console.log("MainGate deployed at: ", mainGate.address);

  /*
    Deploy MainBridge.sol
  */
  const MainBridge = await ethers.getContractFactory("MainBridge");
  const mainBridge = await upgrades.deployProxy(MainBridge, [mainGate.address]);
  await mainBridge.deployed();
  console.log("MainBridge deployed at: ", mainBridge.address);

  // /*
  //   Deploy MainNFTCollection.sol
  // */
  // const MainNFTCollection = await ethers.getContractFactory(
  //   "MainNFTCollection"
  // );
  // const mainNFTCollection = await upgrades.deployProxy(MainNFTCollection, [
  //   "TRAVA",
  //   "TRAVA",
  // ]);
  // await mainNFTCollection.deployed();
  // console.log("MainNFT deployed at: ", mainNFTCollection.address);

  /*
    Deploy MainCanonicalTransactionChain.sol
  */
  const MainCanonicalTransactionChain = await ethers.getContractFactory(
    "MainCanonicalTransactionChain"
  );
  const mainCanonicalTransactionChain = await upgrades.deployProxy(
    MainCanonicalTransactionChain,
    [lib_AddressManager.address]
  );
  await mainCanonicalTransactionChain.deployed();
  console.log(
    "MainCanonicalTransactionChain deployed at: ",
    mainCanonicalTransactionChain.address
  );

  /*
    Deploy MainTransactor.sol
  */
  const MainTransactor = await ethers.getContractFactory("MainTransactor");
  const mainTransactor = await upgrades.deployProxy(MainTransactor, [
    lib_AddressManager.address,
  ]);
  await mainTransactor.deployed();
  console.log("MainTransactor deployed at: ", mainTransactor.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
