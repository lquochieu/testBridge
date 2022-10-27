"use strict";
exports.MainTransactorModel = exports.createMainTransactorModel = void 0;
const mongoose = require("mongoose");

const createMainTransactorModel = async () => {
  const mainTransactorModel = new MainTransactorModel;
  await mainTransactorModel.save();
  console.log("create MainTransactorModel completed!");
};
exports.createMainTransactorModel = createMainTransactorModel;

const getMainTransactorModel = () => {
  let dbModel = "MainTransactor";
  let properties = new mongoose.Schema({
    sender: { type: String },
    target: { type: String },
    data: { type: String },
    queueIndex: { type: Number, unique: true },
    timestamp: { type: Date },
    blockNumber: { type: Number },
  });

  return mongoose.model(dbModel, properties);
};
const MainTransactorModel = getMainTransactorModel();
exports.MainTransactorModel = MainTransactorModel;
