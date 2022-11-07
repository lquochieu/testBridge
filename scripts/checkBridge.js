const { ethers } = require("hardhat");
const mongoose = require("mongoose");
const { mainOwner, rdOwnerMainBridge } = require("./sdk/rdOwner");
const { checkDepositedNFTCollection, addPrepareDepositNFTCollectionValue, addDepositedValue, addMainSentMessageValue, addMainTransactorValue } = require("./sdk/transactionDeposited");
const { MainSentMessageModel } = require("./sql/model");
require("dotenv").config();

const urlDatabase = `mongodb://${process.env.LOCAL_HOST}:27017/testBridge`;

const main = async () => {

    console.log(await rdOwnerMainBridge());
    // const depositedLength = await rdOwnerMainCanonicalTransactionChain.getQueueLength();
    // await mongoose.connect(urlDatabase);

    // const listIndex = await checkDepositedNFTCollection(0, depositedLength - 1);

    // if (listIndex.length) {
    //     for (const i of listIndex) {
    //         if ((await MainSentMessageModel.find({ nonce: i })).length == 0) {
    //             console.log(i);
    //             await addDepositedValue(rdOwnerMainCanonicalTransactionChain, i);
    //             await addMainSentMessageValue(rdOwnerMainCanonicalTransactionChain, i, 24* 60 * 60);
    //             await addMainTransactorValue(rdOwnerMainCanonicalTransactionChain, i);
    //             await addPrepareDepositNFTCollectionValue(rdOwnerMainCanonicalTransactionChain, rdOwnerMainNFTCollection, i, 0);
    //         }
    //     }
    // } 
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });