const {ethers} = require("hardhat");

require("dotenv").config();

async function main () {
    const sideNFTContract = await ethers.getContractFactory("SideNFTCore");
    const sideNFT = await sideNFTContract.deploy(process.env.SIDE_BRIDGE, process.env.MAIN_NFT_CORE);
    console.log("SideNFT deployed at: ", sideNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  