const { ethers } = require("hardhat");
const mongoose = require("mongoose");
const { checkDepositedNFTCollection, addPrepareDepositNFTCollectionValue, addDepositedValue, addMainSentMessageValue, addMainTransactorValue } = require("./sdk/getTransactionDeposited");
const { MainSentMessageModel } = require("./sql/model");
require("dotenv").config();

const urlDatabase = `mongodb://${process.env.LOCAL_HOST}:27017/testBridge`;

const adminKey = {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
};

// const goerliProvider = new ethers.providers.InfuraProvider(
//     "goerli",
//     process.env.ABI_KEY
// );

const owner = new ethers.Wallet(adminKey.privateKey, ethers.provider);

const main = async () => {

    const RandMainCanonicalTransactionChain = await ethers.getContractFactory("MainCanonicalTransactionChain");
    const rdMainCanonicalTransactionChain = await RandMainCanonicalTransactionChain.attach(process.env.MAIN_CANONICAL_TRANSACTION_CHAIN);
    const rdOwnerMainCanonicalTransactionChain = await rdMainCanonicalTransactionChain.connect(owner);

    const RandMainNFTCollection = await ethers.getContractFactory("MainNFTCollection");
    const rdMainNFTCollection = await RandMainNFTCollection.attach(process.env.MAIN_NFT_COLLECTION);
    const rdOwnerMainNFTCollection = await rdMainNFTCollection.connect(owner);

    const depositedLength = await rdOwnerMainCanonicalTransactionChain.getQueueLength();
    await mongoose.connect(urlDatabase);

    const listIndex = await checkDepositedNFTCollection(0, depositedLength - 1);

    if (listIndex.length) {
        for (const i of listIndex) {
            if ((await MainSentMessageModel.find({ nonce: i })).length == 0) {
                console.log(i);
                await addDepositedValue(rdOwnerMainCanonicalTransactionChain, i);
                await addMainSentMessageValue(rdOwnerMainCanonicalTransactionChain, i, 24* 60 * 60);
                await addMainTransactorValue(rdOwnerMainCanonicalTransactionChain, i);
                await addPrepareDepositNFTCollectionValue(rdOwnerMainCanonicalTransactionChain, rdOwnerMainNFTCollection, i, 0);
            }
        }
    } 
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });