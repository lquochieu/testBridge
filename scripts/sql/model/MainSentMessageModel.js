"use strict";
exports.MainSentMessageModel = exports.createMainSentMessageModel = void 0;
const mongoose = require("mongoose");

const createMainSentMessageModel = async () => {
  const mainSentMessageModel = new MainSentMessageModel;
  await mainSentMessageModel.save();
  console.log("create MainSentMessageModel completed!");
};
exports.createMainSentMessageModel = createMainSentMessageModel;

const getMainSentMessageModel = () => {
  let dbModel = "MainSentMessage";
  let properties = new mongoose.Schema({
    chainId: { type: Number },
    target: { type: String },
    sender: { type: String },
    message: { type: String },
    nonce: { type: Number, unique: true },
    deadline: { type: Date },
    signature: { type: String },
    blocknumber: { type: Number, unique: true },
  });

  return mongoose.model(dbModel, properties);
};
const MainSentMessageModel = getMainSentMessageModel();
exports.MainSentMessageModel = MainSentMessageModel;
