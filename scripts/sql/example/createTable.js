// getting-started.js
const mongoose = require("mongoose");

const url = "mongodb://172.17.32.1:27017/";
async function main() {

  let dbName = "testBridge";
  let dbModel = "customer";
  let properties = new mongoose.Schema({
    id: {type: Number, unique: true},
    name: String,
    password: String
  });

  let value = {
    id: 1,
    name: "Hijikata-san",
    password: "passwd"
  }
  await mongoose.connect(url + dbName);

  const Model = mongoose.model(dbModel, properties);

  const addValueModel = new Model(value);
  await addValueModel.save();
  console.log("meow");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
