"use strict";
exports.WithdrawModel = exports.createWithdrawModel = void 0;
const mongoose = require("mongoose");

const createWithdrawModel = async () => {
  const withdrawModel = new WithdrawModel;
  await withdrawModel.save();
  console.log("create WithdrawModel completed!");
};
exports.createWithdrawModel = createWithdrawModel;

const getWithdrawModel = () => {
  let dbModel = "Withdraw";
  let properties = new mongoose.Schema({
    mainNFTCollection: { type: String },
    sideNFTCollection: { type: String },
    sideSender: { type: String },
    mainReceiver: { type: String },
    collectionId: { type: Number },
    data: { type: String },
    status: { type: Number }, // 0: isWithdrawing, 1: WithdrawCompleted, 2: WithdrawFailed
    blockNumber: { type: Number },
  });
  return mongoose.model(dbModel, properties);
};
const WithdrawModel = getWithdrawModel();
exports.WithdrawModel = WithdrawModel;
