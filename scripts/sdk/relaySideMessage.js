const { ethers } = require("hardhat");
const {
  MainBridgeContract,
  MainGateContract,
  MainCanonicalTransactionChain,
  SideGateContract,
  SideBridgeContract,
} = require("./contract");
const { genSignature } = require("./signature.js");
require("dotenv").config();

const main = async () => {
  MainBridgeContract.on(
    "NFTDepositInitiated",
    async (
      _mainNFTCollection,
      _sideNFTCollection,
      _from,
      _to,
      _nftCollection,
      _sideChainId,
      _data,
      event
    ) => {
      console.log(`
      NFTDepositInitiated
      - mainNFTCollection = ${_mainNFTCollection}
      - sideNFTCollection = ${_sideNFTCollection}
      - from = ${_from}
      - to = ${_to}
      - nftCollection = ${_nftCollection}
      - data = ${_data}
      - blocknumber = ${event.blockNumber}
      `);
    }
  );

  MainGateContract.on(
    "SentMessage",
    async (_chainId, _target, _sender, _message, _nonce, event) => {
      let deadline = Math.floor(Date.now() / 1000) + 100000;
      let signature = await genSignature(
        _chainId,
        _target,
        _sender,
        _message,
        _nonce,
        deadline
      );

      console.log(`
      SentMessage
      - chainId = ${_chainId}
      - target = ${_target}
      - sender = ${_sender}
      - message = ${_message}
      - nonce = ${_nonce}
      - deadline = ${deadline}
      - signature = ${signature}
      - blocknumber = ${event.blockNumber}
      `);
    }
  );

  SideGateContract.on("RelayedMessage", async (_data, event) => {
    console.log(`
    Deposit NFT success
    - xDomainData = ${_data}
    `);
  });

  SideGateContract.on("FailedRelayedMessage", async (_data, event) => {
    console.log(`
    Deposit NFT failed
    - xDomainData = ${_data}
    `);
  });

  SideBridgeContract.on(
    "DepositFinalized",
    async (
      _mainNFTCollection,
      _sideNFTCollection,
      _from,
      _to,
      [_chainId, _rarity, _collectionId, _level, _experience, _rank, _url],
      _data,
      event
    ) => {
      console.log(`
    DepositFinalized
  - mainNFTCollection = ${_mainNFTCollection}
  - sideNFTCollection = ${_sideNFTCollection}
  - from = ${_from}
  - to = ${_to}
  - nftCollection {
      chainId = ${_chainId}
      rarity = ${_rarity}
      collectionId = ${_collectionId}
      level = ${_level}
      experience = ${_experience}
      rank = ${_rank}
      url = ${_url}
      }
  - data = ${_data}
  - blocknumber = ${event.blockNumber}
  `);
    }
  );

  SideBridgeContract.on(
    "DepositFailed",
    async (
      _mainNFTCollection,
      _sideNFTCollection,
      _from,
      _to,
      [_chainId, _rarity, _collectionId, _level, _experience, _rank, _url],
      _data,
      event
    ) => {
      console.log(`
      DepositFailed
  - mainNFTCollection = ${_mainNFTCollection}
  - sideNFTCollection = ${_sideNFTCollection}
  - from = ${_from}
  - to = ${_to}
  - nftCollection {
      chainId = ${_chainId}
      rarity = ${_rarity}
      collectionId = ${_collectionId}
      level = ${_level}
      experience = ${_experience}
      rank = ${_rank}
      url = ${_url}
      }
  - data = ${_data}
  - blocknumber = ${event.blockNumber}
  `);
    }
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
