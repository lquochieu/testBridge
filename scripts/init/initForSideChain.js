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

const owner = new ethers.Wallet(adminKey.privateKey, goerliProvider);
const receiver = new ethers.Wallet(receiverKey.privateKey, goerliProvider);

const addressContract = [
  "SideBridge",
  "SideCanonicalTransactionChain",
  "SideGate",
  "SideTransactor"
];
const envAddressContract = [
  "SIDE_BRIDGE",
  "SIDE_CANONICAL_TRANSACTION_CHAIN",
  "SIDE_GATE",
  "SIDE_TRANSACTOR"
];

const main = async () => {
  const RandLib_AddressManager = await ethers.getContractFactory(
    "Lib_AddressManager"
  );
  const rdLib_AddressManager = await RandLib_AddressManager.attach(
    process.env.SIDE_LIB_ADDRESS_MANAGER
  );
  const rdOwnerLib_AddressManager = await rdLib_AddressManager.connect(owner);

  let setAddress;
  for (let i = 0; i < addressContract.length; i++) {
    setAddress = await rdOwnerLib_AddressManager.setAddress(
      addressContract[i],
      process.env[envAddressContract[i]]
    );
    await setAddress.wait();
    console.log(
      addressContract[i],
      await rdOwnerLib_AddressManager.getAddress(addressContract[i])
    );
  }

  setAddress = await rdOwnerLib_AddressManager.setGate(
    process.env.BSC_TESTNET_CHAIN_ID,
    process.env.MAIN_GATE
  );
  await setAddress.wait();
  console.log(
    "MAIN_GATE = ",
    await rdOwnerLib_AddressManager.getGateAddress(
      process.env.BSC_TESTNET_CHAIN_ID
    )
  );

  setAddress = await rdOwnerLib_AddressManager.setTransactor(
    process.env.BSC_TESTNET_CHAIN_ID,
    process.env.MAIN_TRANSACTOR
  );
  await setAddress.wait();
  console.log(
    "MAIN_TRANSACTOR = ",
    await rdOwnerLib_AddressManager.getTransactorAddress(
      process.env.BSC_TESTNET_CHAIN_ID
    )
  );

  /*
    set register vault
     */
  const RandSideNFTCollection = await ethers.getContractFactory("SideNFTCollection");
  const rdSideNFTCollection = await RandSideNFTCollection.attach(process.env.SIDE_NFT_COLLECTION);
  const SideNFTCollection = await rdSideNFTCollection.connect(owner);

  const updateSideBridge = await SideNFTCollection.updateSideBridge(
    process.env.SIDE_BRIDGE
  );
  await updateSideBridge.wait();
  console.log("SideBridge: ", await SideNFTCollection.getSideBridge());

  const registerVault = await SideNFTCollection.registerVault(process.env.SIDE_BRIDGE);
  await registerVault.wait();
  console.log(registerVault);

    /*
    Transactor
  */
    const RandTransactor = await ethers.getContractFactory(
      "SideTransactor"
    );
    const rdTransactor = await RandTransactor.attach(
      process.env.SIDE_TRANSACTOR
    );
    const rdOwnerTransactor = await rdTransactor.connect(owner);

    const setSigner = await rdOwnerTransactor.setSigners(
      adminKey.publicKey,
      true
    );

    await setSigner.wait();

    console.log(await rdOwnerTransactor.Signers(adminKey.publicKey));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });