"use strict";
exports.DepositModel = exports.createDepositModel = void 0;
const mongoose = require("mongoose");

const createDepositModel = async () => {
  const depositModel = new DepositModel;
  await depositModel.save();
  console.log("create DepositModel completed!");
};
exports.createDepositModel = createDepositModel;

const getDepositModel = () => {
  let dbModel = "Deposit";
  let properties = new mongoose.Schema({
    mainNFTCollection: { type: String },
    sideNFTCollection: { type: String },
    mainSender: { type: String },
    sideReceiver: { type: String },
    collectionId: { type: Number },
    sideChainId: { type: Number },
    data: { type: String },
    status: { type: Number }, // 0: isDepositing, 1: depositCompleted, 2: relayMessageFailed, 3: depositFailed
    blockNumber: { type: Number, unique: true },
  });

  return mongoose.model(dbModel, properties);
};
const DepositModel = getDepositModel();
exports.DepositModel = DepositModel;
