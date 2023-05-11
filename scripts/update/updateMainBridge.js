const { ethers } = require("hardhat");

require("dotenv").config();

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

// const receiverKey = {
//   publicKey: process.env.PUBLIC_KEY_RECEIVER,
//   privateKey: process.env.PRIVATE_KEY_RECEIVER,
// };

// const sideProvider = new ethers.providers.InfuraProvider(
//   "goerli",
//   process.env.ABI_KEY
// );

// const ownerBSC = new ethers.Wallet(adminKey.privateKey, ethers.provider);
// const ownerETH = new ethers.Wallet(adminKey.privateKey, sideProvider);

// const receiver = new ethers.Wallet(receiverKey.privateKey, ethers.provider);

const main = async () => {
  /*
    Deploy MainBridge.sol
  */
  const MainBridge = await ethers.getContractFactory("MainBridge");
  const mainBridge = await upgrades.deployProxy(MainBridge, [
    process.env.MAIN_GATE,
  ]);
  await mainBridge.deployed();
  console.log("MainBridge deployed at: ", mainBridge.address);

  const RandBridge = await ethers.getContractFactory("MainBridge");
  const rdBridge = await RandBridge.attach(process.env.MAIN_BRIDGE);
  const rdOwnerBridge = await rdBridge.connect(owner);
  /*
    Set SideBridge on ETH
  */
  const setSideNFTBridge = await rdOwnerBridge.setSideNFTBridge(
    process.env.ETH_CHAIN_ID,
    process.env.SIDE_BRIDGE
  );
  await setSideNFTBridge.wait();
  console.log(
    1,
    await rdOwnerBridge.getSideNFTBridge(process.env.ETH_CHAIN_ID)
  );

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
     Lib_AddressManager
   */
  const RandMainLib_AddressManager = await ethers.getContractFactory(
    "Lib_AddressManager"
  );
  const rdMainLib_AddressManager = await RandMainLib_AddressManager.attach(
    process.env.MAIN_LIB_ADDRESS_MANAGER
  );
  const rdOwnerMainLib_AddressManager = await rdMainLib_AddressManager.connect(
    owner
  );

  let setAddress;
  /*
     Set address MainBridge
   */
  setAddress = await rdOwnerMainLib_AddressManager.setAddress(
    "MainBridge",
    mainBridge.address
  );
  await setAddress.wait();
  console.log(
    "MainBrige",
    await rdOwnerMainLib_AddressManager.getAddress("MainBridge")
  );

  // /*
  //   NFTCollection
  // */
  const RandNFTCollection = await ethers.getContractFactory(
    "MainNFTCollection"
  );
  const rdNFTCollection = await RandNFTCollection.attach(
    process.env.MAIN_NFT_COLLECTION
  );
  const rdOwnerNFTCollection = await rdNFTCollection.connect(owner);
  /*
    Set approval for MainBridge
  */
  const setApprovalForAll = await rdOwnerNFTCollection.setApprovalForAll(
    process.env.MAIN_BRIDGE,
    true,
    { gasLimit: BigInt(1e7) }
  );
  await setApprovalForAll.wait();
  console.log("1: ", setApprovalForAll);
  console.log(
    "2: ",
    await rdOwnerNFTCollection.isApprovedForAll(
      adminKey.publicKey,
      process.env.MAIN_BRIDGE
    )
  );


};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
