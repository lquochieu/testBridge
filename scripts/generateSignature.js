const { ethers } = require("hardhat");
require("dotenv").config();

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const signer = new ethers.Wallet(adminKey.privateKey, ethers.provider);

const typedData = {
  domain: {
    name: "Transactor",
    version: "1",
    chainId: 97,
    verifyingContract: "0xD91f3a2867B8087923A4a50dD77CC0b8Deb25821",
  },
  types: {
    // EIP712Domain: [
    //   { name: "name", type: "string" },
    //   { name: "version", type: "string" },
    //   { name: "chainId", type: "uint256" },
    //   { name: "verifyingContract", type: "address" },
    // ],
    call: [
      { name: "sender", type: "address" },
      { name: "target", type: "address" },
      // { name: "data", type: "bytes" },
      { name: "messageNonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  },
  //   primaryType: "call",

  message: {
    sender: process.env.MAIN_TRANSACTOR,
    target: adminKey.publicKey,
    // data: "0x",
    messageNonce: 0,
    deadline: 1665248185,
  },
};

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function getTypeData(sender, target, data, messageNonce, deadline) {
  typedData.message.sender = sender;
  typedData.message.target = target;
  typedData.message.data = data;
  typedData.message.messageNonce = messageNonce;
  typedData.message.deadline = deadline;
}

const main = async () => {

  console.log(typedData);
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
