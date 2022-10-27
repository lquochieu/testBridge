"use strict";
exports.SideSentMessageModel = exports.createSideSentMessageModel = void 0;
const mongoose = require("mongoose");

const createSideSentMessageModel = async () => {
  const sideSentMessageModel = new SideSentMessageModel;
  await sideSentMessageModel.save();
  console.log("create SideSentMessageModel completed!");
};
exports.createSideSentMessageModel = createSideSentMessageModel;

const getSideSentMessageModel = () => {
  let dbModel = "SideSentMessage";
  let properties = new mongoose.Schema({
    target: { type: String },
    sender: { type: String },
    message: { type: String },
    nonce: { type: Number, unique: true },
    deadline: { type: Date },
    signature: { type: String },
    blocknumber: { type: Number },
  });

  return mongoose.model(dbModel, properties);
};
const SideSentMessageModel = getSideSentMessageModel();
exports.SideSentMessageModel = SideSentMessageModel;
