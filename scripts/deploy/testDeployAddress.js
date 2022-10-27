const { ethers } = require("hardhat");

require("dotenv").config();

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const goerliProvider = new ethers.providers.InfuraProvider(
  "goerli",
  "ba63b223746842d89619ef053b179319"
);

const mainContract = ["MAIN_LIB_ADDRESS_MANAGER", "MAIN_GATE", "MAIN_BRIDGE", "MAIN_NFT_COLLECTION", "MAIN_CANONICAL_TRANSACTION_CHAIN", "MAIN_TRANSACTOR"];
const sideContract = ["SIDE_LIB_ADDRESS_MANAGER", "SIDE_GATE", "SIDE_BRIDGE", "SIDE_NFT_COLLECTION", "SIDE_CANONICAL_TRANSACTION_CHAIN", "SIDE_TRANSACTOR"];

const main = async () => {
  // const Token = await ethers.getContractFactory("TokenTQH");
  // const token = await Token.deploy();
  // await token.deployed();
  // console.log("Token deployed at: ", token.address);
  let sideNonce = await goerliProvider.getTransactionCount(adminKey.publicKey);
  let mainNonce = await ethers.provider.getTransactionCount(adminKey.publicKey);
  let mainSize = mainContract.length + mainNonce;
  let sideSize = sideContract.length + sideNonce;
  let deployedMainAddress = 0;
  let deployedSideAddress = 0;

  console.log("BSC testnet: ");
  for (let i =  0; i + mainNonce < mainSize; i++) {
    deployedMainAddress = ethers.utils.getAddress(
      ethers.utils.getContractAddress({ from: adminKey.publicKey, nonce: i + 1 + mainNonce})
    );
    console.log(mainContract[i], " = ", deployedMainAddress);
  }

  console.log("Goerli testnet")
  for (let i =  0; i + sideNonce < sideSize; i++) {
    deployedSideAddress = ethers.utils.getAddress(
      ethers.utils.getContractAddress({ from: adminKey.publicKey, nonce: i + 1 + sideNonce})
    );
    console.log(sideContract[i], " = ", deployedSideAddress);
  }

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
