"use strict";
exports.addSideTransactorValue = exports.addSideSentMessageValue = exports.addPrepareWithdrawNFTCollectionValue = exports.addWithdrawedValue = exports.getSideTransactorEvent = exports.getSideSentMessageEvent = exports.getNFTWithdrawalInitiatedEvent = exports.getSideBlockNumberByIndex = exports.checkWithdrawedNFTCollection = void 0;
const { SideSentMessageModel, WithdrawModel, PrepareNFTCollectionModel, SideTransactorModel } = require("../sql/model");
const { SideBridgeContract, SideGateContract, SideCanonicalTransactionChainContract } = require("./contract");
const { rdOwnerSideNFTCollection } = require("./rdOwner");
const { genSignature } = require("./signature");

const addSideTransactorValue = async (nonce) => {
    let event = await getSideTransactorEvent(nonce);

    await SideTransactorModel.create({
        sender: event.sender,
        target: event.target,
        data: event.data,
        queueIndex: event.queueIndex,
        timestamp: event.timestamp
    })
}
exports.addSideTransactorValue = addSideTransactorValue;

const addSideSentMessageValue = async (nonce, expireTime) => {

    let blockNumber = await getSideBlockNumberByIndex(nonce);
    let event = await getSideSentMessageEvent(nonce);
    let timestampDeposited = (await SideCanonicalTransactionChainContract.queryFilter("TransactorEvent", blockNumber, blockNumber))[0].args.timestamp.toNumber() * 1000;
    let deadline = timestampDeposited + expireTime;
    let signature = await genSignature(
        process.env.BSC_CHAIN_ID,
        event.target,
        event.sender,
        event.message,
        event.nonce,
        deadline
    );

    SideSentMessageModel.create({
        target: event.target,
        sender: event.sender,
        message: event.message,
        nonce: event.nonce,
        deadline: deadline,
        signature: signature,
        blocknumber: blockNumber,
    });

}

exports.addSideSentMessageValue = addSideSentMessageValue;

const addPrepareWithdrawNFTCollectionValue = async (nonce, status) => {
    let event = await getNFTWithdrawalInitiatedEvent(nonce);
    // console.log(event);
    if ((await PrepareNFTCollectionModel.find({ collectionId: event.collectionId.toNumber() })).length) {

        try {
            let ownerNFTCollection = await (await rdOwnerSideNFTCollection()).ownerOf(event.collectionId.toNumber());
            await PrepareNFTCollectionModel.updateOne(
                { collectionId: event.collectionId.toNumber() },
                {
                    $set: {
                        status: status
                    }
                });
        } catch (err) {
            await PrepareNFTCollectionModel.updateOne(
                { collectionId: event.collectionId.toNumber() },
                {
                    $set: {
                        chainId: process.env.BSC_CHAIN_ID,
                        address: event.mainNFTCollection,
                        status: status
                    }
                });
        }
        if ((await rdOwnerSideNFTCollection.ownerOf(event.collectionId.toNumber()))) {


        } else {

        }
    } else {
        await PrepareNFTCollectionModel.create({
            chainId: process.env.BSC_CHAIN_ID,
            address: event.mainNFTCollection,
            status: status
        })
    }
}
exports.addPrepareWithdrawNFTCollectionValue = addPrepareWithdrawNFTCollectionValue;

const addWithdrawedValue = async (nonce) => {
    let event = await getNFTWithdrawalInitiatedEvent(nonce);

    await WithdrawModel.create({
        mainNFTCollection: event.mainNFTCollection,
        sideNFTCollection: event.sideNFTCollection,
        sideSender: event.from,
        mainReceiver: event.to,
        collectionId: event.nftCollection.collectionId,
        data: event.data,
        status: 0,
        blockNumber: await getSideBlockNumberByIndex(nonce),
    });
}
exports.addWithdrawedValue = addWithdrawedValue;

const getSideTransactorEvent = async (nonce) => {
    let blockNumber = await getSideBlockNumberByIndex(nonce);

    const events = (await SideCanonicalTransactionChainContract.queryFilter("TransactorEvent", blockNumber, blockNumber))[0].args;

    return {
        sender: events.sender,
        target: events.target,
        data: events.data,
        queueIndex: events.queueIndex,
        timestamp: events.timestamp.toNumber() * 1000
    }
}
exports.getSideTransactorEvent = getSideTransactorEvent;

const getSideSentMessageEvent = async (nonce) => {
    let blockNumber = await getSideBlockNumberByIndex(nonce);

    const events = (await SideGateContract.queryFilter("SentMessage", blockNumber, blockNumber))[0].args;
    return {
        target: events.target,
        sender: events.sender,
        message: events.message,
        nonce: events.messageNonce
    }
}
exports.getSideSentMessageEvent = getSideSentMessageEvent;

const getNFTWithdrawalInitiatedEvent = async (nonce) => {

    let blockNumber = await getSideBlockNumberByIndex(nonce);

    const events = (await SideBridgeContract.queryFilter("NFTWithdrawalInitiated", blockNumber, blockNumber))[0].args;
    return {
        mainNFTCollection: events.mainNFTCollection,
        sideNFTCollection: events.sideNFTCollection,
        from: events.from,
        to: events.to,
        collectionId: events.collectionId,
        data: events.data
    }
}
exports.getNFTWithdrawalInitiatedEvent = getNFTWithdrawalInitiatedEvent;

const getSideBlockNumberByIndex = async (nonce) => {

    const blockNumber = (await (await rdOwnerSideCanonicalTransactionChain()).getQueueElement(
        nonce
    )).blockNumber;

    return blockNumber;
}
exports.getSideBlockNumberByIndex = getSideBlockNumberByIndex;

const checkWithdrawedNFTCollection = async (startIndex, endIndex) => {
    let index = [];
    for (let i = startIndex; i <= endIndex; ++i) {
        if ((await SideSentMessageModel.find({ nonce: i })).length == 0) {
            console.log(i);
            index.push(i);
        }
    }
    return index;
}
exports.checkWithdrawedNFTCollection = checkWithdrawedNFTCollection;