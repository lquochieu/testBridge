const mongoose = require("mongoose");

let properties = {
  id: Number,
  name: String,
  password: String,
};
let dbModel = "customer";
let Model = mongoose.model(dbModel, properties);

const getModel = async () => {
    return  Model;
}

const insertValue = async () => {
    Model.create({
        id: 2,
        name: "Hijin-san",
        password: "123456"
    })
}

const insertManyValue = async () => {
    Model.insertMany({
        id: 3,
        name: "Hijin",
        password: "123456"
    },
    {
        id: 4,
        name: "Hijin-chan",
        password: "123456"
    }
    );
}



module.exports = {
  getModel,
  insertValue,
  insertManyValue
};
