"use strict"
exports.ownerNFTCollectionOnMainChain = exports.ownerNFTCollectionOnSideChain = exports.checkNetworkNFTCollection = void 0;

const { ethers } = require("hardhat");
const { PrepareNFTCollectionModel } = require("../sql/model");
const { mainOwner, sideOwner, rdOwnerMainNFTCollection, rdOwnerSideNFTCollection, rdOwnerMainNFTCollection } = require("./rdOwner");

require("dotenv").config();

const getMetadataNFTColletion = async (collectionId) => {
    const rdOwnerMainNFTCollection = await rdOwnerMainNFTCollection();
    let rarity = await rdOwnerMainNFTCollection.viewCollectionRarity(collectionId);
    let level = await rdOwnerMainNFTCollection.getCollectionLevel(collectionId);
    let experience = await rdOwnerMainNFTCollection.getCollectionExperience(collectionId);
    let rank = rarity < 5 ? 1 : (await rdOwnerMainNFTCollection.getUniqueRank(collectionId));
    let url = await rdOwnerMainNFTCollection.getCollectionURL(collectionId);
    return {
        rarity: rarity,
        level: level,
        experience: experience,
        rank: rank,
        url: url
    }
}

const ownerNFTCollectionOnMainChain = async (collectionId) => {
    let ownerNFTCollection;
    try {
        ownerNFTCollection = await (await rdOwnerMainNFTCollection()).ownerOf(collectionId);
    } catch (err) {
        ownerNFTCollection = 0;
    }

    return ownerNFTCollection;
}
exports.ownerNFTCollectionOnMainChain = ownerNFTCollectionOnMainChain;


const ownerNFTCollectionOnSideChain = async (collectionId, sideChainId) => {
    let ownerNFTCollection;
    try {
        ownerNFTCollection = await (await rdOwnerSideNFTCollection()).ownerOf(collectionId);
    } catch (err) {
        ownerNFTCollection = 0;
    }

    return ownerNFTCollection;
}
exports.ownerNFTCollectionOnSideChain = ownerNFTCollectionOnSideChain;

const checkNetworkNFTCollection = async (collectionId) => {
    let chainId = process.env.BSC_TESTNET_CHAIN_ID;
    let mainStatus = 0;
    let sideStatus = 0;

    if (await ownerNFTCollectionOnMainChain(collectionId) != process.env.MAIN_BRIDGE) {

        mainStatus = 1;
    } else {
        mainStatus = 0;
    }

    if (await ownerNFTCollectionOnSideChain(collectionId) != 0) {
        if (mainStatus == 1) {
            console.log("ERROR: NFT is on multi chain");
            return 0;
        } else {
            sideStatus = 1;
            chainId = process.env.GOERLI_CHAINID;
        }
    } else {
        if (mainStatus == 0) {
            chainId = process.env.GOERLI_CHAINID;
        }
        sideStatus = 0;
    }

    return {
        chainId,
        mainStatus,
        sideStatus
    }
}
exports.checkNetworkNFTCollection = checkNetworkNFTCollection;

const addPrepareDepositNFTCollectionValue = async (metadata) => {
    if ((await PrepareNFTCollectionModel.find({ collectionId: metadata.collectionId })).length) {



        await PrepareNFTCollectionModel.updateOne(
            { collectionId: metadata.collectionId },
            {
                $set: {
                    chainId: metadata.chainId,
                    address: metadata.sideNFTCollection,
                    // rarity: event.nftCollection.collectionRarity.toNumber(),
                    // collectionId: event.nftCollection.collectionId,
                    // level: event.nftCollection.collectionLevel.toNumber(),
                    experience: metadata.collectionExperience,
                    // rank: event.nftCollection.collectionRank.toNumber(),
                    url: metadata.collectionURL,
                    status: metadata.status
                }
            })

    } else {
        await PrepareNFTCollectionModel.create({
            chainId: metadata.chainId,
            address: metadata.sideNFTCollection,
            rarity: metadata.collectionRarity,
            collectionId: metadata.collectionId,
            level: metadata.collectionLevel,
            experience: metadata.collectionExperience,
            rank: metadata.collectionRank,
            url: metadata.collectionURL,
            status: metadata.status
        })
    }
}
exports.addPrepareDepositNFTCollectionValue = addPrepareDepositNFTCollectionValue;

const updateInfoPrepareNFTCollection = async (collectionId) => {
    const inforNFTCollection = await checkNetworkNFTCollection(collectionId);
    const metadata = await getMetadataNFTColletion(collectionId);
    metadata.chainId = inforNFTCollection.chainId;
    let status = 0;
    if (inforNFTCollection == 0) {
        return 0;
    } else {
        if (inforNFTCollection.chainId == process.env.BSC_TESTNET_CHAIN_ID) {
            if (sideStatus == 1) {
                
            }
        }
    }
}