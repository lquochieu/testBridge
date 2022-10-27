const { ethers } = require("hardhat");
require("dotenv").config();

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const signer = new ethers.Wallet(adminKey.privateKey, ethers.provider);

const genSignature = async (
  chainId,
  target,
  sender,
  message,
  nonce,
  deadline
) => {
  let msg = Buffer.from(
    ethers.utils
      .solidityKeccak256(
        ["uint256", "address", "address", "bytes", "uint256", "uint256"],
        [chainId, target, sender, message, nonce, deadline]
      )
      .substring(2),
    "hex"
  );

  return await signer.signMessage(msg);
};

module.exports = {
  genSignature,
};
