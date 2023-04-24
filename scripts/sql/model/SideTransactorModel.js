"use strict";
exports.SideTransactorModel = exports.createSideTransactorModel = void 0;
const mongoose = require("mongoose");

const createSideTransactorModel = async () => {
  const sideTransactorModel = new SideTransactorModel;
  await sideTransactorModel.save();
  console.log("create SideTransactorModel completed!");
};
exports.createSideTransactorModel = createSideTransactorModel;

const getSideTransactorModel = () => {
  let dbModel = "SideTransactor";
  let properties = new mongoose.Schema({
    sender: { type: String },
    target: { type: String },
    data: { type: String },
    queueIndex: { type: Number, unique: true },
    timestamp: { type: Date },
    blockNumber: { type: Number, unique: true },
  });

  return mongoose.model(dbModel, properties);
};
const SideTransactorModel = getSideTransactorModel();
exports.SideTransactorModel = SideTransactorModel;
