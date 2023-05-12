const { ethers } = require("hardhat");
const { mainOwner } = require("../sdk/rdOwner");

require("dotenv").config();

const addressContract = [
  "MainBridge",
  "MainCanonicalTransactionChain",
  "MainGate",
  "MainTransactor",
];
const envAddressContract = [
  "MAIN_BRIDGE",
  "MAIN_CANONICAL_TRANSACTION_CHAIN",
  "MAIN_GATE",
  "MAIN_TRANSACTOR",
];

const main = async () => {
  /*
    SideBridge
  */
  const RandBridge = await ethers.getContractFactory("MainBridge");
  const rdBridge = await RandBridge.attach(process.env.MAIN_BRIDGE);
  const rdOwnerBridge = await rdBridge.connect(mainOwner);
  // /*
  //   Set SideBridge on ETH
  // */
  const setSideNFTBridge = await rdOwnerBridge.setSideNFTBridge(
    process.env.ETH_CHAIN_ID,
    process.env.SIDE_BRIDGE
  );
  await setSideNFTBridge.wait();
  console.log(1, await rdOwnerBridge.getSideNFTBridge(process.env.ETH_CHAIN_ID));

  /*
    Set NFT are being supported
  */
  const setSupportsForNFTCollectionBridge =
    await rdOwnerBridge.setSupportsForNFTCollectionBridge(
      true,
      process.env.ETH_CHAIN_ID,
      process.env.MAIN_NFT_COLLECTION,
      process.env.SIDE_NFT_COLLECTION
    );
  await setSupportsForNFTCollectionBridge.wait();
  console.log(
    2,
    await rdOwnerBridge.supportsForNFTCollectionBridge(
      process.env.ETH_CHAIN_ID,
      process.env.MAIN_NFT_COLLECTION,
      process.env.SIDE_NFT_COLLECTION
    )
  );

  /*
    Lib_AddressManagerUpgradeable
  */
  const RandLib_AddressManagerUpgradeable = await ethers.getContractFactory("Lib_AddressManagerUpgradeable");
  const rdLib_AddressManagerUpgradeable = await RandLib_AddressManagerUpgradeable.attach(process.env.MAIN_LIB_ADDRESS_MANAGER);
  const rdOwnerLib_AddressManagerUpgradeable = await rdLib_AddressManagerUpgradeable.connect(mainOwner);

  let setAddress;
  for(let i = 0; i < addressContract.length; i++) {
    setAddress = await rdOwnerLib_AddressManagerUpgradeable.setAddress(addressContract[i], process.env[envAddressContract[i]], {gasLimit: BigInt(1e7)});
    await setAddress.wait();
    console.log(i+3, addressContract[i], await rdOwnerLib_AddressManagerUpgradeable.getAddress(addressContract[i]));
  }

  setAddress = await rdOwnerLib_AddressManagerUpgradeable.setGate(process.env.ETH_CHAIN_ID, process.env.SIDE_GATE);
  await setAddress.wait();
  console.log("SIDE_GATE = ", await rdOwnerLib_AddressManagerUpgradeable.getGateAddress(process.env.ETH_CHAIN_ID));

  setAddress = await rdOwnerLib_AddressManagerUpgradeable.setTransactor(process.env.ETH_CHAIN_ID, process.env.SIDE_TRANSACTOR);
  await setAddress.wait();
  console.log("SIDE_TRANSACTOR = ", await rdOwnerLib_AddressManagerUpgradeable.getTransactorAddress(process.env.ETH_CHAIN_ID));

  // /*
  //   NFTCollection
  // */
  // const RandNFTCollection = await ethers.getContractFactory(
  //   "MainNFTCollection"
  // );
  // const rdNFTCollection = await RandNFTCollection.attach(
  //   process.env.MAIN_NFT_COLLECTION
  // );
  // const rdOwnerNFTCollection = await rdNFTCollection.connect(owner);
  // // const rdReceiverNFTCollection = await rdNFTCollection.connect(receiver);

  // // /*
  // //   Mint NFT for receiver
  // // */
  // // const mintNFT = await rdOwnerNFTCollection.mintNFTCollection(receiverKey.publicKey);
  // // await mintNFT.wait();
  // // console.log(1, mintNFT);
  // // console.log(addressContract.length + 2, "Owner of NFT ", 2, await rdOwnerNFTCollection.ownerOf(0));

  // /*
  //   Set approval for MainBridge
  // */
  // const setApprovalForAll = await rdOwnerNFTCollection.setApprovalForAll(
  //   process.env.MAIN_BRIDGE,
  //   true,
  //   { gasLimit: BigInt(1e7) }
  // );
  // await setApprovalForAll.wait();
  // console.log("1: ", setApprovalForAll);
  // console.log(
  //   "2: ",
  //   await rdOwnerNFTCollection.isApprovedForAll(
  //     adminKey.publicKey,
  //     process.env.MAIN_BRIDGE
  //   )
  // );

  // /*
  //   Transactor
  // */
  //   const RandTransactor = await ethers.getContractFactory(
  //     "MainTransactor"
  //   );
  //   const rdTransactor = await RandTransactor.attach(
  //     process.env.MAIN_TRANSACTOR
  //   );
  //   const rdOwnerTransactor = await rdTransactor.connect(owner);

  //   const setSigner = await rdOwnerTransactor.setSigners(
  //     adminKey.publicKey,
  //     true,
  //     {gasLimit: BigInt(1e7)}
  //   );

  //   await setSigner.wait();

  //   console.log(await rdOwnerTransactor.Signers(adminKey.publicKey));

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
