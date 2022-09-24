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
    verifyingContract: process.env.MAIN_TRANSACTOR,
  },
  types: {
    // EIP712Domain: [
    //   { name: "name", type: "string" },
    //   { name: "version", type: "string" },
    //   { name: "chainId", type: "uint256" },
    //   { name: "verifyingContract", type: "address" },
    // ],
    call: [
      { name: "target", type: "address" },
      { name: "data", type: "bytes" },
      { name: "deadline", type: "uint256" },
      { name: "gas", type: "uint256" },
    ],
  },
  //   primaryType: "call",

  message: {
    target: "0x72e03B6E7AB9DdFe1699B65B8A46A3Cf30092020",
    data: "0x",
    deadline: 10000,
    gas: 0,
  },
};

function getTypeData(target, data, deadline, gas) {
  typedData.message.target = target;
  typedData.message.data = data;
  typedData.message.deadline = deadline;
  typedData.message.gas = gas;
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
