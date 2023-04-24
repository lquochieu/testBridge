"use strict";
exports.PrepareNFTCollectionModel = exports.createPrepareNFTCollectionModel = void 0;
const mongoose = require("mongoose");

const createPrepareNFTCollectionModel = async () => {
  const prepareNFTCollectionModel = new PrepareNFTCollectionModel;
  await prepareNFTCollectionModel.save();
  console.log("create PrepareNFTCollectionModel completed!");
};
exports.createPrepareNFTCollectionModel = createPrepareNFTCollectionModel;

const getPrepareNFTCollectionModel = () => {
  let dbModel = "PrepareNFTCollection";
  let properties = new mongoose.Schema({
    chainId: { type: Number },
    address: { type: String },
    rarity: { type: Number },
    collectionId: { type: Number, unique: true },
    level: { type: Number },
    experience: { type: Number },
    rank: { type: Number },
    url: { type: String },
    status: { type: Number }, // 1: hasOwner, 0: notHasOwner
  });

  return mongoose.model(dbModel, properties);
};
const PrepareNFTCollectionModel = getPrepareNFTCollectionModel();
exports.PrepareNFTCollectionModel = PrepareNFTCollectionModel;
