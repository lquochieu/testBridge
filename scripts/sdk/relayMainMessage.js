const { ethers } = require("hardhat");
const mongoose = require("mongoose");

const {
  SideBridgeContract,
  SideGateContract,
  SideCanonicalTransactionChainContract,
  MainGateContract,
  MainBridgeContract
} = require("./contract");
const {
  WithdrawModel,
  PrepareNFTCollectionModel,
  SideSentMessageModel,
  SideTransactorModel,
} = require("../sql/model");
const { genSignature } = require("./signature.js");
require("dotenv").config();

const urlDatabase = `mongodb://${process.env.LOCAL_HOST}:27017/testBridge`;

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

const owner = new ethers.Wallet(adminKey.privateKey, ethers.provider);
const receiver = new ethers.Wallet(receiverKey.privateKey, goerliProvider);

const main = async () => {
  const Rand = await ethers.getContractFactory("MainTransactor");
  const rd = await Rand.attach(process.env.MAIN_TRANSACTOR);
  const rdOwner = await rd.connect(owner);

  await mongoose.connect(urlDatabase);

  SideBridgeContract.on(
    "WithdrawalInitiated",
    async (
      _mainNFTCollection,
      _sideNFTCollection,
      _from,
      _to,
      _collectionId,
      _data,
      event
    ) => {
      console.log(`
    WithdrawalInitiated
      - mainNFTCollection = ${_mainNFTCollection}
      - sideNFTCollection = ${_sideNFTCollection}
      - from = ${_from}
      - to = ${_to}
      - collectionId = ${_collectionId}
      - data = ${_data}
      - blockNumber = ${event.blockNumber}
      `);

      console.log(event);

      await WithdrawModel.create({
        mainNFTCollection: _mainNFTCollection,
        sideNFTCollection: _sideNFTCollection,
        sideSender: _from,
        mainReceiver: _to,
        collectionId: _collectionId,
        data: _data,
        status: 0,
        blockNumber: event.blockNumber
      });

      await PrepareNFTCollectionModel.updateOne(
        { collectionId: _collectionId },
        {
          $set: {
            chainId: process.env.BSC_TESTNET_CHAIN_ID,
            address: _mainNFTCollection,
            status: 0
          }
        }
      )
    }
  );

  SideGateContract.on("SentMessage", async (_target, _sender, _message, _nonce, event) => {
    let deadline = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    let signature = await genSignature(
      97,
      _target,
      _sender,
      _message,
      _nonce,
      deadline
    );

    console.log(`
      SentMessage
      - chainId = 97
      - target = ${_target}
      - sender = ${_sender}
      - message = ${_message}
      - nonce = ${_nonce}
      - deadline = ${deadline}
      - signature = ${signature}
      - blockNumber = ${event.blockNumber}
      `);

    console.log(event);

    await SideSentMessageModel.create({
      target: _target,
      sender: _sender,
      message: _message,
      nonce: _nonce,
      deadline: deadline,
      signature: signature,
      blocknumber: event.blocknumber
    });
  });

  SideCanonicalTransactionChainContract.on(
    "TransactorEvent",
    async (_sender, _target, _data, _queueIndex, _timestamp, event) => {
      console.log(`
      TransactorEvent
      - sender = ${_sender}
      - target = ${_target}
      - data = ${_data}
      - queueIndex = ${_queueIndex}
      - timestamp = ${_timestamp}
      - blockNumber = ${event.blockNumber}
      `);

      await SideTransactorModel.create({
        sender: _sender,
        target: _target,
        data: _data,
        queueIndex: _queueIndex,
        timestamp: _timestamp,
        blockNumber: event.blockNumber
      })
    }
  );

  MainBridgeContract.on(
    "NFTWithdrawalFinalized",
    async (
      _mainNFTCollection,
      _sideNFTCollection,
      _from,
      _to,
      _collectionId,
      _data,
      event
    ) => {
      console.log(`
      NFTWithdrawalFinalized
      - mainNFTCollection = ${_mainNFTCollection}
      - sideNFTCollection = ${_sideNFTCollection}
      - from = ${_from}
      - to = ${_to}
      - collectionId = ${_collectionId}
      - data = ${_data}
      - blockNumber = ${event.blockNumber}
      `);

      await PrepareNFTCollectionModel.updateOne(
        { collectionId: _collectionId },
        {
          $set: {
            status: 1
          }
        }
      )
    }
  );
  
  MainGateContract.on("RelayedMessage", async (_data, event) => {
    console.log(`
    Withdraw NFT success!
    - xDomainData = ${_data}
    - blockNumber = ${event.blockNumber}
    `
    );

    let blockNumber = (await SideTransactorModel.find({ data: _data })).blockNumber;
    await WithdrawModel.updateOne(
      { blockNumber: blockNumber },
      { $set: { status: 1 } }
    )
  });

  MainGateContract.on("FailedRelayedMessage", async (_data, event) => {
    console.log(`
    Withdraw failed!
    - xDomainData = ${_data}
    - blockNumber = ${event.blockNumber}
    `
    );
    let blockNumber = (await sideTransactorModel.find({ data: _data })).blockNumber;
    await PrepareNFTCollectionModel.updateOne(
      { blockNumber: blockNumber },
      { $set: { status: 2 } }
    )
  });

};

main();
