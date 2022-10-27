const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { genSignature } = require("../signature");

require("dotenv").config();

const adminKey = {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
};

const goerliProvider = new ethers.providers.InfuraProvider(
    "goerli",
    process.env.ABI_KEY
);

const owner = new ethers.Wallet(adminKey.privateKey, goerliProvider);

const main = async () => {
    const Rand = await ethers.getContractFactory("SideTransactor");
    const rd = await Rand.attach(process.env.SIDE_TRANSACTOR);
    const rdOwner = await rd.connect(owner);

    const chainId = 5;
    // console.log(chainId);
    const target = "0xAe81d4aaA796B7ee73362D3C9F417052BeA6ee51";
    // console.log(target);
    const sender = "0x7c939DD5067c4A073fab343a9AEE3c8CDbe2DFe5";
    // console.log(sender);
    const data = "0xe8c32bbd0000000000000000000000001b9356df6b10ed01752f6361c8c0a982c99b8ca400000000000000000000000073eecc4463f47a82c951f2b859ce100d44e3f040000000000000000000000000595622cbd0fc4727df476a1172ada30a9ddf8f43000000000000000000000000595622cbd0fc4727df476a1172ada30a9ddf8f4300000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000061000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000df000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000f78e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    // console.log(data);
    const nonce = 4;
    console.log(nonce);
    const deadline = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    const signature = await genSignature(
        chainId,
        target,
        sender,
        data,
        nonce,
        deadline
    );

    console.log(signature);

    const claimNFTCollection = await rdOwner.claimNFTCollection(
        target,
        sender,
        data,
        nonce,
        deadline,
        signature
    );
    await claimNFTCollection.wait();
    console.log(1, claimNFTCollection);
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
