const { ethers } = require("hardhat");

require("dotenv").config();

const MainGateContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainGate.sol/MainGate.json");
const MainCanonicalTransactionChainContract = require("../../../../artifacts/contracts/MainChain/MainBridge/MainCanonicalTransactionChain.sol/MainCanonicalTransactionChain.json");
const SideGateContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideGate.sol/SideGate.json");
const sideBridgeContract = require("../../../../artifacts/contracts/SideChain/SideBridge/SideBridge.sol/SideBridge.json");

const adminKey = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
};

const goerliProvider = new ethers.providers.InfuraProvider(
  "goerli",
  process.env.ABI_KEY
);

const owner = new ethers.Wallet(adminKey.privateKey, goerliProvider);

const MainGate = new ethers.Contract(
  process.env.MAIN_GATE,
  MainGateContract.abi,
  ethers.provider
);

const MainCanonicalTransactionChain = new ethers.Contract(
  process.env.MAIN_CANONICAL_TRANSACTION_CHAIN,
  MainCanonicalTransactionChainContract.abi,
  ethers.provider
);

const SideGate = new ethers.Contract(
  process.env.SIDE_GATE,
  SideGateContract.abi,
  goerliProvider
);

const sideBridge = new ethers.Contract(
  process.env.SIDE_BRIDGE,
  sideBridgeContract.abi,
  goerliProvider
);

const main = async () => {
  const Rand = await ethers.getContractFactory("SideTransactor");
  const rd = await Rand.attach(process.env.SIDE_TRANSACTOR);
  const rdOwner = await rd.connect(owner);

  MainGate.on(
    "SentMessage",
    async (chainId, target, sender, message, nonce, event) => {
      console.log(`
        SentMessage
        - chainId = ${chainId}
        - target = ${target}
        - sender = ${sender}
        - message = ${message}
        - nonce = ${nonce}
        `);
        const claimNFTCollection = await rdOwner.claimNFTCollection(
          chainId,
          target,
          sender,
          message,
          nonce,
          0,
          0,
          {
            gasLimit: BigInt(1e7)
          }
        )
        await claimNFTCollection.wait();
        console.log(claimNFTCollection);
    }
  );

  MainCanonicalTransactionChain.on(
    "TransactorEvent",
    async (sender, target, data, queueIndex, timestamp, event) => {
      console.log(`
      TransactorEvent
      - sender = ${sender}
      - target = ${target}
      - data = ${data}
      - queueIndex = ${queueIndex}
      - timestamp = ${timestamp}
      `);
    }
  );

  SideGate.on("RelayedMessage", (event) => {
    console.log("Deposit NFT success!");
  });

  sideBridge.on("DepositFailed", (event) => {
    console.log("Deposit failed!");
  });
};

main();
