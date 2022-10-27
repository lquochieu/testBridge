// getting-started.js
const mongoose = require("mongoose");
const {
  createDeposit,
  createMainSentMessage,
  createMainTransactor,
  createSideTransactor,
  createWithdraw,
  createSideSentMessage,
  createPrepareNFTCollectionModel,
} = require("./model
const url = "mongodb://172.17.32.1:27017/testBridge";

async function main() {
  await mongoose.connect(url);

  await createMainSentMessage();
  await createMainTransactor();
  await createSideSentMessage();
  await createSideTransactor();
  await createDeposit();
  await createWithdraw();
  await createPrepareNFTCollectionModel();
  getDepositModel
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
