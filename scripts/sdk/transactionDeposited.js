"use strict";
exports.addMainTransactorValue = exports.addMainSentMessageValue = exports.addPrepareNFTCollectionValue = exports.addDepositedValue = exports.addDepositNFTCollectionMissed = exports.getMainTransactorEvent = exports.getMainSentMessageEvent = exports.getNFTDepositInitiatedEvent = exports.getMainBlockNumberByIndex = exports.checkDepositedNFTCollection = void 0;
const { MainSentMessageModel, DepositModel, PrepareNFTCollectionModel, MainTransactorModel } = require("../sql/model");
const { genSignature } = require("./signature");
const { MainBridgeContract, MainGateContract, MainCanonicalTransactionChainContract } = require("./contract");
const { rdOwnerMainCanonicalTransactionChain, rdOwnerMainNFTCollection } = require("./rdOwner");
const { checkNetworkNFTCollection } = require("./infoNFTCollection");

const addMainTransactorValue = async (nonce) => {
    let event = await getMainTransactorEvent(nonce);

    await MainTransactorModel.create({
        sender: event.sender,
        target: event.target,
        data: event.data,
        queueIndex: event.queueIndex,
        timestamp: event.timestamp
    })
}
exports.addMainTransactorValue = addMainTransactorValue;

const addMainSentMessageValue = async (nonce, expireTime) => {

    let blockNumber = await getMainBlockNumberByIndex(nonce);
    let event = await getMainSentMessageEvent(nonce);
    let timestampDeposited = (await MainCanonicalTransactionChainContract.queryFilter("TransactorEvent", blockNumber, blockNumber))[0].args.timestamp.toNumber() * 1000;
    let deadline = timestampDeposited + expireTime;
    let signature = await genSignature(
        event.chainId,
        event.target,
        event.sender,
        event.message,
        event.nonce,
        deadline
    );

    MainSentMessageModel.create({
        chainId: event.chainId,
        target: event.target,
        sender: event.sender,
        message: event.message,
        nonce: event.nonce,
        deadline: deadline,
        signature: signature,
        blocknumber: blockNumber,
    });

}
exports.addMainSentMessageValue = addMainSentMessageValue;

const addPrepareDepositNFTCollectionValue = async (nonce, status) => {
    let event = await getNFTDepositInitiatedEvent(nonce);
    // console.log(event);
    if ((await PrepareNFTCollectionModel.find({ collectionId: event.nftCollection.collectionId.toNumber() })).length) {

        const networkNFTCollection = await checkNetworkNFTCollection(event.nftCollection.collectionId);
        if (networkNFTCollection.chainId == process.env.BSC_CHAIN_ID) {

            await PrepareNFTCollectionModel.updateOne(
                { collectionId: event.nftCollection.collectionId.toNumber() },
                {
                    $set: {
                        chainId: event.chainId.toNumber(),
                        address: event.sideNFTCollection,
                        // rarity: event.nftCollection.collectionRarity.toNumber(),
                        // collectionId: event.nftCollection.collectionId,
                        // level: event.nftCollection.collectionLevel.toNumber(),
                        experience: event.nftCollection.collectionExperience.toNumber(),
                        // rank: event.nftCollection.collectionRank.toNumber(),
                        url: event.nftCollection.collectionURL,
                        status: status
                    }
                })
        } else {
            await PrepareNFTCollectionModel.updateOne(
                { collectionId: event.collectionId.toNumber() },
                {
                    $set: {
                        status: status
                    }
                })
        }
    } else {
        await PrepareNFTCollectionModel.create({
            chainId: event.chainId.toNumber(),
            address: event.sideNFTCollection,
            rarity: event.nftCollection.collectionRarity.toNumber(),
            collectionId: event.nftCollection.collectionId,
            level: event.nftCollection.collectionLevel.toNumber(),
            experience: event.nftCollection.collectionExperience.toNumber(),
            rank: event.nftCollection.collectionRank.toNumber(),
            url: event.nftCollection.collectionURL,
            status: status
        })
    }
}
exports.addPrepareDepositNFTCollectionValue = addPrepareDepositNFTCollectionValue;


const addDepositedValue = async (nonce) => {
    let event = await getNFTDepositInitiatedEvent(nonce);

    await DepositModel.create({
        mainNFTCollection: event.mainNFTCollection,
        sideNFTCollection: event.sideNFTCollection,
        mainSender: event.from,
        sideReceiver: event.to,
        collectionId: event.nftCollection.collectionId,
        data: event.data,
        status: 0,
        blockNumber: await getMainBlockNumberByIndex(nonce),
    });
}
exports.addDepositedValue = addDepositedValue;

const getMainTransactorEvent = async (nonce) => {
    let blockNumber = await getMainBlockNumberByIndex(nonce);

    const events = (await MainCanonicalTransactionChainContract.queryFilter("TransactorEvent", blockNumber, blockNumber))[0].args;

    return {
        sender: events.sender,
        target: events.target,
        data: events.data,
        queueIndex: events.queueIndex,
        timestamp: events.timestamp.toNumber() * 1000
    }
}
exports.getMainTransactorEvent = getMainTransactorEvent;

const getMainSentMessageEvent = async (nonce) => {
    let blockNumber = await getMainBlockNumberByIndex(nonce);

    const events = (await MainGateContract.queryFilter("SentMessage", blockNumber, blockNumber))[0].args;
    return {
        chainId: events.chainId,
        target: events.target,
        sender: events.sender,
        message: events.message,
        nonce: events.messageNonce
    }
}
exports.getMainSentMessageEvent = getMainSentMessageEvent;

const getNFTDepositInitiatedEvent = async (nonce) => {

    let blockNumber = await getMainBlockNumberByIndex(nonce);

    const events = (await MainBridgeContract.queryFilter("NFTDepositInitiated", blockNumber, blockNumber))[0].args;
    return {
        mainNFTCollection: events.mainNFTCollection,
        sideNFTCollection: events.sideNFTCollection,
        from: events.from,
        to: events.to,
        nftCollection: events.nftCollection,
        chainId: events.chainId,
        data: events.data
    }
}
exports.getNFTDepositInitiatedEvent = getNFTDepositInitiatedEvent;

const getMainBlockNumberByIndex = async (nonce) => {

    const blockNumber = (await (await rdOwnerMainCanonicalTransactionChain()).getQueueElement(
        nonce
    )).blockNumber;

    return blockNumber;
}
exports.getMainBlockNumberByIndex = getMainBlockNumberByIndex;


const checkDepositedNFTCollection = async (startIndex, endIndex) => {
    let index = [];
    for (let i = startIndex; i <= endIndex; ++i) {
        if ((await MainSentMessageModel.find({ nonce: i })).length == 0) {
            console.log(i);
            index.push(i);
        }
    }
    return index;
}
exports.checkDepositedNFTCollection = checkDepositedNFTCollection;