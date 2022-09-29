const { ethers, upgrades } = require("hardhat");

require("dotenv").config();

async function main() {
  /*
    Deploy Side_LibAddressManager.sol
  */
  let Lib_AddressManager = await ethers.getContractFactory(
    "Lib_AddressManager"
  );
  let lib_AddressManager = await upgrades.deployProxy(Lib_AddressManager, []);
  await lib_AddressManager.deployed();
  console.log("Lib_AddressManager deployed at: ", lib_AddressManager.address);

  /*
    Deploy SideGate.sol
  */
  const SideGate = await ethers.getContractFactory("SideGate");
  const sideGate = await upgrades.deployProxy(SideGate, [
    lib_AddressManager.address,
  ]);
  await sideGate.deployed();
  console.log("SideGate deployed at: ", sideGate.address);

  /*
    Deploy SideBridge.sol
  */
  const SideBridge = await ethers.getContractFactory("SideBridge");
  const sideBridge = await upgrades.deployProxy(SideBridge, [
    sideGate.address,
    process.env.MAIN_BRIDGE,
  ]);
  await sideBridge.deployed();
  console.log("SideBridge deployed at: ", sideBridge.address);

  /*
    Deploy SideNFTCollection.sol
  */
  const SideNFTCollection = await ethers.getContractFactory(
    "SideNFTCollection"
  );
  const sideNFTCollection = await upgrades.deployProxy(SideNFTCollection, [
    sideBridge.address,
    process.env.MAIN_NFT_COLLECTION,
    "TRAVA",
    "TRAVA",
  ]);
  await sideNFTCollection.deployed();
  console.log("SideNFTCollection deployed at: ", sideNFTCollection.address);

  /*
    Deploy SideCanonicalTransactionChain.sol
  */
  const SideCanonicalTransactionChain = await ethers.getContractFactory(
    "SideCanonicalTransactionChain"
  );
  const sideCanonicalTransactionChain = await upgrades.deployProxy(
    SideCanonicalTransactionChain,
    [lib_AddressManager.address]
  );
  await sideCanonicalTransactionChain.deployed();
  console.log(
    "SideCanonicalTransactionChain deployed at: ",
    sideCanonicalTransactionChain.address
  );

  /*
    Deploy SideTransactor.sol
  */
  const SideTransactor = await ethers.getContractFactory("SideTransactor");
  const sideTransactor = await upgrades.deployProxy(SideTransactor, [
    lib_AddressManager.address,
  ]);
  await sideTransactor.deployed();
  console.log("SideTransactor deployed at: ", sideTransactor.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
