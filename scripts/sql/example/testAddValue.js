// getting-started.js
const mongoose = require("mongoose");
const { getWithdrawModel } = require("../model");
require("dotenv").config();

const urlDatabase = `mongodb://${process.env.LOCAL_HOST}:27017/testBridge`;

async function main() {
  console.log(123);
  await mongoose.connect(urlDatabase);
  const withdrawModel = await getWithdrawModel();

  await withdrawModel.create({
    mainNFTCollection: "0x1B9356df6b10Ed01752F6361C8c0a982C99b8cA4",
    sideNFTCollection: "0x73eEcC4463f47A82C951f2B859cE100d44E3F040",
    sideSender: "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    mainReceiver: "0x595622cBd0Fc4727DF476a1172AdA30A9dDf8F43",
    collectionId: 183,
    data: "0x",
    status: 0,
    blockNumber: 7807580
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
