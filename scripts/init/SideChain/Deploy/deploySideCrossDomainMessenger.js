const {ethers} = require("hardhat");

require("dotenv").config();

async function main () {
    const SideCrossDomainMessengerContract = await ethers.getContractFactory("SideCrossDomainMessenger");
    const SideCrossDomainMessenger = await SideCrossDomainMessengerContract.deploy(process.env.MAIN_CROSS_DOMAIN_MESSENGER);
    console.log("SideCrossDomainMessenger deployed at: ", SideCrossDomainMessenger.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  