const {ethers} = require("hardhat");

async function main () {
    const OVM_SideToMainMessagePasserContract = await ethers.getContractFactory("OVM_SideToMainMessagePasser");
    const OVM_SideToMainMessagePasser = await OVM_SideToMainMessagePasserContract.deploy();
    console.log("OVM_SideToMainMessagePasser deployed at: ", OVM_SideToMainMessagePasser.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  