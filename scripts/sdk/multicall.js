const { ethers } = require("hardhat");
const multicallABI = require("./multicallABI.json");

const multiCall = async (abi, calls, provider) => {
  const multi = new ethers.Contract(
    "0xd808400FbF312ACA5C7487cd30B0D1386e04BC78",
    multicallABI,
    ethers.provider
  );
  const itf = new ethers.utils.Interface(abi);

  //prettier-ignore
  const callData = calls.map((call) => [
    call.address.toLowerCase(), 
    itf.encodeFunctionData(call.name, call.params)]
  );
  const { returnData } = await multi.aggregate(callData);
  return returnData.map((call, i) =>
    itf.decodeFunctionResult(calls[i].name, call)
  );
};

module.exports = multiCall;
