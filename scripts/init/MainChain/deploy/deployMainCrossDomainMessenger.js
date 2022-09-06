const {ethers} = require("hardhat");

async function main () {
    const MainCrossDomainMessengerContract = await ethers.getContractFactory("MainCrossDomainMessenger");
    const MainCrossDomainMessenger = await MainCrossDomainMessengerContract.deploy();
    console.log("MainCrossDomainMessenger deployed at: ", MainCrossDomainMessenger.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  