const { ethers } = require("hardhat");

require("dotenv").config();
const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const signer = new ethers.Wallet(adminKey.privateKey, ethers.provider);

const typedData = {
  types: {
    // EIP712Domain: [
    //   { name: "name", type: "string" },
    //   { name: "version", type: "string" },
    //   { name: "chainId", type: "uint256" },
    //   { name: "verifyingContract", type: "address" },
    // ],
    changeOwner: [{ name: "newOwner", type: "address" }],
  },
  primaryType: "changeOwner",
  domain: {
    name: "2_Owner",
    version: "1",
    chainId: 97,
    verifyingContract: "0x4C007c60295a5634210FCA4B8d59910C205a06D7",
  },
  message: {
    newOwner: "0x72e03B6E7AB9DdFe1699B65B8A46A3Cf30092020",
  },
};

const main = async () => {
  const signature = await signer._signTypedData(
    typedData.domain,
    typedData.types,
    typedData.message
  );

  const verifiedAddress = ethers.utils.verifyTypedData(
    typedData.domain,
    typedData.types,
    typedData.message,
    signature
  );

  const r = "0x" + signature.substring(2, 66);
  const s = "0x" + signature.substring(66, 130);
  const v = parseInt(signature.substring(130, 132), 16);
  console.log(signature);
  console.log(verifiedAddress);
  console.log("r:", r);
  console.log("s:", s);
  console.log("v:", v);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
