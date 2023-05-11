const { ethers } = require("hardhat");

require("dotenv").config();
const adminKey = {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
};

const sideProvider = new ethers.providers.InfuraProvider(
    "goerli",
    process.env.ABI_KEY
);
const owner = new ethers.Wallet(adminKey.privateKey, ethers.provider);
const main = async () => {
    const Rand = await ethers.getContractFactory("MainNFTCollection");
    const rd = await Rand.attach(process.env.MAIN_NFT_COLLECTION);
    const rdOwner = await rd.connect(owner);
    try {
        await rdOwner.ownerOf(300);
    } catch (err) {
        console.log("NOt exist token")
    }
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
