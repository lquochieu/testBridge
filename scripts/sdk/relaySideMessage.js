const { ethers } = require("hardhat");
const mongoose = require("mongoose");
const {
  DepositModel,
  MainSentMessageModel,
  MainTransactorModel,
  PrepareNFTCollectionModel,
} = require("../sql/model");

const {
  MainBridgeContract,
  MainGateContract,
  MainCanonicalTransactionChain,
  SideGateContract,
  SideBridgeContract
} = require("./contract");
const { sideOwner } = require("./provider");

const { genSignature } = require("./signature.js");
require("dotenv").config();

const urlDatabase = `mongodb://${process.env.LOCAL_HOST}:27017/testBridge`;

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const goerliProvider = new ethers.providers.InfuraProvider(
  "goerli",
  process.env.ABI_KEY
);

// const owner = new ethers.Wallet(adminKey.privateKey, goerliProvider);

const main = async () => {
  // const Rand = await ethers.getContractFactory("SideTransactor");
  // const rd = await Rand.attach(process.env.SIDE_TRANSACTOR);
  // const rdOwner = await rd.connect(sideOwner);


  await mongoose.connect(urlDatabase);

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

      await DepositModel.create({
        mainNFTCollection: _mainNFTCollection,
        sideNFTCollection: _sideNFTCollection,
        mainSender: _from,
        sideReceiver: _to,
        collectionId: _nftCollection.collectionId,
        data: _data,
        status: 0,
        blockNumber: event.blockNumber,
      });



      if ((await PrepareNFTCollectionModel.find({ collectionId: _nftCollection.collectionId })).length) {
        await PrepareNFTCollectionModel.updateOne(
          { collectionId: _nftCollection.collectionId },
          {
            $set: {
              chainId: _sideChainId,
              address: _sideNFTCollection,
              rarity: _nftCollection.collectionRarity,
              collectionId: _nftCollection.collectionId,
              level: _nftCollection.collectionLevel,
              experience: _nftCollection.collectionExperience,
              rank: _nftCollection.collectionRank,
              url: _nftCollection.collectionURL,
              status: 0
            }
          })
      } else {
        await PrepareNFTCollectionModel.create({
          chainId: _sideChainId,
          address: _sideNFTCollection,
          rarity: _nftCollection.collectionRarity,
          collectionId: _nftCollection.collectionId,
          level: _nftCollection.collectionLevel,
          experience: _nftCollection.collectionExperience,
          rank: _nftCollection.collectionRank,
          url: _nftCollection.collectionURL,
          status: 0
        })
      }

    }
  );

  MainGateContract.on(
    "SentMessage",
    async (_chainId, _target, _sender, _message, _nonce, event) => {
      let deadline = Math.floor(Date.now() / 1000) + 10000;
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

      await MainSentMessageModel.create({
        chainId: _chainId,
        target: _target,
        sender: _sender,
        message: _message,
        nonce: _nonce,
        deadline: deadline,
        signature: signature,
        blocknumber: event.blockNumber,
      });

      // const claimNFTCollection = await rdOwner.claimNFTCollection(
      //   // chainId,
      //   _target,
      //   _sender,
      //   _message,
      //   _nonce,
      //   deadline,
      //   signature,
      //   { gasLimit: BigInt(1e7) }
      // );
      // await claimNFTCollection.wait();
      // console.log(claimNFTCollection);

    }
  );

  MainCanonicalTransactionChain.on(
    "TransactorEvent",
    async (_sender, _target, _data, _queueIndex, _timestamp, event) => {
      console.log(`
      TransactorEvent
      - sender = ${_sender}
      - target = ${_target}
      - data = ${_data}
      - queueIndex = ${_queueIndex}
      - timestamp = ${_timestamp}
      - blocknumber = ${event.blockNumber}
      `);

      await MainTransactorModel.create({
        sender: _sender,
        target: _target,
        data: _data,
        queueIndex: _queueIndex,
        timestamp: _timestamp,
        blockNumber: event.blockNumber,
      });
    }
  );

  SideGateContract.on("RelayedMessage", async (_data, event) => {
    console.log(`
    Deposit NFT success
    - xDomainData = ${_data}
    `);

    let blockNumber = (await MainTransactorModel.find({ data: _data }))
      .blockNumber;
    await DepositModel.updateOne(
      { blockNumber: blockNumber },
      { $set: { status: 1 } }
    );
  });

  SideGateContract.on("FailedRelayedMessage", async (_data, event) => {
    console.log(`
    Deposit NFT failed
    - xDomainData = ${_data}
    `);

    let blockNumber = (await MainTransactorModel.find({ data: _data }))
      .blockNumber;
    await DepositModel.updateOne(
      { blockNumber: blockNumber },
      { $set: { status: 2 } }
    );
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

      await PrepareNFTCollectionModel.updateOne(
        { collectionId: _collectionId },
        { $set: { status: 1 } }
      );
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

      await DepositModel.updateOne(
        { collectionId: _collectionId },
        { $set: { status: 3 } }
      );
    }
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
