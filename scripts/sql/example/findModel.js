// getting-started.js
const mongoose = require("mongoose");
const { getModel, insertValue, insertManyValue } = require("./model");

async function main() {
  await mongoose.connect("mongodb://172.20.240.1:27017/testBridge");

  const a = await getModel();

  // (await a.find("id").gt(0)).forEach((e) => {
  //   console.log(e.id);
  // });
  const res = (
    await a
      .find({
        id: {
          $gt: 0,
        },
      })
      .sort({ xyz: -1 })
      .skip(10)
      .limit(5)
  ).forEach((e) => console.log(e));

  // for(const e of res) => {

  // }

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
