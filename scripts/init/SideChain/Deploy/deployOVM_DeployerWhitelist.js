const {ethers} = require("hardhat");

async function main () {
    const OVM_DeployerWhitelistContract = await ethers.getContractFactory("OVM_DeployerWhitelist");
    const OVM_DeployerWhitelist = await OVM_DeployerWhitelistContract.deploy();
    console.log("OVM_DeployerWhitelist deployed at: ", OVM_DeployerWhitelist.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  