const {ethers} = require("hardhat");

async function main () {
    const mainNFTContract = await ethers.getContractFactory("MainNFTCore");
    const mainNFT = await mainNFTContract.deploy();
    console.log("MainNFT deployed at: ", mainNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  