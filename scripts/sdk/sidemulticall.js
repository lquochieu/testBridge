const { ethers } = require("hardhat");
const multicallABI = require("./multicallABI.json");
const { goerliProvider } = require("./rdOwner");

const sidemultiCall = async (abi, calls, provider) => {
  const multi = new ethers.Contract(
    "0x7C00746d12E56e540e0E9146729b38150F1F5d6C",
    multicallABI,
    goerliProvider
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

module.exports = sidemultiCall;
