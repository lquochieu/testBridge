const { ethers } = require("hardhat");

const {
  MainBridgeContract,
  MainGateContract,
  MainCanonicalTransactionChainContract,
  SideGateContract,
  SideBridgeContract,
  SideCollectionContract,
  MainCollectionContract,
  SideCanonicalTransactionChainContract,
} = require("./contract");
const multiCall = require("./multicall");
const MainCollectionArtifact = require("../../artifacts/contracts/MainChain/Tokens/MainNFTCollection.sol/MainNFTCollection.json");
const MainCanonicalTransactionChainContractArtifact = require("../../artifacts/contracts/MainChain/MainBridge/MainCanonicalTransactionChain.sol/MainCanonicalTransactionChain.json");
const SideCanonicalTransactionChainArtifact = require("../../artifacts/contracts/SideChain/SideBridge/SideCanonicalTransactionChain.sol/SideCanonicalTransactionChain.json");
const SideCollectionArtifact = require("../../artifacts/contracts/SideChain/Tokens/SideNFTCollection.sol/SideNFTCollection.json");
const sidemultiCall = require("./sidemulticall");
const NFTCoreABI = require("./MainNFTCoreABI.json");
const NFTCollectionMainABI = require("./MainCollectionABI.json");

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

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
const signer = new ethers.Wallet(adminKey.privateKey, ethers.provider);

const genSignature = async (
  chainId,
  target,
  sender,
  message,
  nonce,
  deadline
) => {
  let msg = Buffer.from(
    ethers.utils
      .solidityKeccak256(
        ["uint256", "address", "address", "bytes", "uint256", "uint256"],
        [chainId, target, sender, message, nonce, deadline]
      )
      .substring(2),
    "hex"
  );

  return await signer.signMessage(msg);
};

module.exports = {
  genSignature,
};

async function getUnclaimedOnETH(addressRaw) {
  let address = addressRaw;
  address = address.toLowerCase().substring(2);
  const [
    balanceOfMainBridge,
    balanceOfSideCollection,
    mainQueueLength,
    sideQueueLength,
  ] = await Promise.all([
    MainCollectionContract.balanceOf(process.env.MAIN_BRIDGE),
    SideCollectionContract.totalSupply(),
    MainCanonicalTransactionChainContract.getQueueLength(),
    SideCanonicalTransactionChainContract.getQueueLength(),
  ]);
  const tupleMainBridge = new Array(parseInt(balanceOfMainBridge))
    .fill(1)
    .map((_, idx) => ({
      address: process.env.MAIN_NFT_COLLECTION,
      name: "tokenOfOwnerByIndex",
      params: [process.env.MAIN_BRIDGE, idx],
    }));
  const tupleSideCollection = new Array(parseInt(balanceOfSideCollection))
    .fill(1)
    .map((_, idx) => ({
      address: process.env.SIDE_NFT_COLLECTION,
      name: "tokenByIndex",
      params: [idx],
    }));

  const tupleMainQueue = new Array(parseInt(mainQueueLength))
    .fill(1)
    .map((_, idx) => ({
      address: process.env.MAIN_CANONICAL_TRANSACTION_CHAIN,
      name: "getQueueElement",
      params: [idx],
    }));
  const tupleSideQueue = new Array(parseInt(sideQueueLength))
    .fill(1)
    .map((_, idx) => ({
      address: process.env.SIDE_CANONICAL_TRANSACTION_CHAIN,
      name: "getQueueElement",
      params: [idx],
    }));
  let [listIdMainBridge, listIdSideCollection, listMainQueue, listSideQueue] =
    await Promise.all([
      multiCall(MainCollectionArtifact.abi, tupleMainBridge),
      sidemultiCall(SideCollectionArtifact.abi, tupleSideCollection),
      multiCall(
        MainCanonicalTransactionChainContractArtifact.abi,
        tupleMainQueue
      ),
      sidemultiCall(SideCanonicalTransactionChainArtifact.abi, tupleSideQueue),
    ]);
  listIdMainBridge = listIdMainBridge.flat().map((e) => parseInt(e));
  listIdSideCollection = listIdSideCollection.flat().map((e) => parseInt(e));

  const listIdMainQueue = listMainQueue.flat().map((element) => {
    return parseInt(element.message.substring(586 - 64, 586), 16);
  });
  const listIdSideQueue = listSideQueue.flat().map((el) => {
    return parseInt(el.message.substring(394 - 64, 394), 16);
  });
  const listUnclaimedIndex = [];
  listIdMainQueue.filter((el, index) => {
    let res = listIdSideQueue.indexOf(el) < 0;
    if (!res) {
      listIdSideQueue.splice(listIdSideQueue.indexOf(el), 1);
    } else listUnclaimedIndex.push(index);
    return res;
  });
  const listUnclaimed = listIdMainBridge.filter((el) => {
    return listIdSideCollection.indexOf(el) < 0;
  });
  const collectionIdsFlattened = [];
  listMainQueue = listMainQueue.flat();

  listUnclaimedIndex.forEach((el) => {
    if (
      listUnclaimed.indexOf(listIdMainQueue[el]) >= 0 &&
      listMainQueue[el].message.substring(34 + 64 * 3, 34 + 64 * 3 + 40) ===
        address
    ) {
      collectionIdsFlattened.push(listIdMainQueue[el]);
    }
  });
  return collectionIdsFlattened;
}
async function getUnclaimedOnBSC(addressRaw) {
  let address = addressRaw;
  address = address.toLowerCase().substring(2);
  const [balanceOfMainBridge, mainQueueLength, sideQueueLength] =
    await Promise.all([
      MainCollectionContract.balanceOf(process.env.MAIN_BRIDGE),
      MainCanonicalTransactionChainContract.getQueueLength(),
      SideCanonicalTransactionChainContract.getQueueLength(),
    ]);
  const tupleMainBridge = new Array(parseInt(balanceOfMainBridge))
    .fill(1)
    .map((_, idx) => ({
      address: process.env.MAIN_NFT_COLLECTION,
      name: "tokenOfOwnerByIndex",
      params: [process.env.MAIN_BRIDGE, idx],
    }));
  const tupleMainQueue = new Array(parseInt(mainQueueLength))
    .fill(1)
    .map((_, idx) => ({
      address: process.env.MAIN_CANONICAL_TRANSACTION_CHAIN,
      name: "getQueueElement",
      params: [idx],
    }));
  const tupleSideQueue = new Array(parseInt(sideQueueLength))
    .fill(1)
    .map((_, idx) => ({
      address: process.env.SIDE_CANONICAL_TRANSACTION_CHAIN,
      name: "getQueueElement",
      params: [idx],
    }));
  let [listIdMainBridge, listMainQueue, listSideQueue] = await Promise.all([
    multiCall(MainCollectionArtifact.abi, tupleMainBridge),
    multiCall(
      MainCanonicalTransactionChainContractArtifact.abi,
      tupleMainQueue
    ),
    sidemultiCall(SideCanonicalTransactionChainArtifact.abi, tupleSideQueue),
  ]);
  listIdMainBridge = listIdMainBridge.flat().map((e) => parseInt(e));
  const listIdMainQueue = listMainQueue.flat().map((element) => {
    return parseInt(element.message.substring(586 - 64, 586), 16);
  });
  const listIdSideQueue = listSideQueue.flat().map((el) => {
    return parseInt(el.message.substring(394 - 64, 394), 16);
  });
  const listIdMainCopy = [...listIdMainQueue];
  const listIdSideQueueCopy = [...listIdSideQueue];
  listIdSideQueue.forEach((el) => {
    if (listIdMainCopy.indexOf(el) >= 0 && listIdSideQueue.indexOf(el) >= 0) {
      listIdMainCopy.splice(listIdMainCopy.indexOf(el), 1);
      listIdSideQueueCopy.splice(listIdSideQueueCopy.indexOf(el), 1);
    }
  });
  const listUnclaimed = [];
  const listIdSideQueueReverse = [...listIdSideQueue].reverse();
  const listSideQueueReverse = [...listSideQueue].flat().reverse();
  const listInsert = [];
  listIdSideQueueReverse.forEach((el, index) => {
    if (
      !listIdSideQueueCopy.includes(el) &&
      !listIdMainCopy.includes(el) &&
      listSideQueueReverse[index].message.substring(290, 290 + 40) == address &&
      !listInsert.includes(el) &&
      listIdMainBridge.includes(el)
    ) {
      if (listUnclaimed.indexOf(el) < 0) listUnclaimed.push(el);
    }
    listInsert.push(el);
  });
  return listUnclaimed;
}

app.get("/unclaimedETH", async (req, res) => {
  const addressRaw = req.query.address;
  if (!req.query.address) return res.json([]);
  const result = await getUnclaimedOnETH(addressRaw);
  return res.send(result);
});
app.get("/unclaimedBSC", async (req, res) => {
  const addressRaw = req.query.address;
  if (!req.query.address) res.json([]);
  const result = await getUnclaimedOnBSC(addressRaw);
  return res.send(result);
});
app.get("/ownedETH", async (req, res) => {
  const addressRaw = req.query.address;
  console.log(addressRaw);
  if (!req.query.address) return res.json([]);
  const balance = await SideCollectionContract.balanceOf(addressRaw);

  const tuple = new Array(parseInt(balance)).fill(1).map((_, idx) => ({
    address: process.env.SIDE_NFT_COLLECTION,
    name: "tokenOfOwnerByIndex",
    params: [addressRaw, idx],
  }));

  const [collectionIds] = await Promise.all([
    sidemultiCall(NFTCollectionMainABI, tuple),
  ]);
  const collectionFlat = collectionIds.flat().map((el) => parseInt(el));
  res.json(collectionFlat);
});

app.get("/signature", async (req, res) => {
  const collectionId = req.query.collectionId;
  const queueElement =
    await MainCanonicalTransactionChainContract.getQueueLength();
  const tupleQueue = new Array(parseInt(queueElement))
    .fill(1)
    .map((_, idx) => ({
      address: process.env.MAIN_CANONICAL_TRANSACTION_CHAIN,
      name: "getQueueElement",
      params: [idx],
    }));
  const [listQueue] = await Promise.all([
    multiCall(MainCanonicalTransactionChainContractArtifact.abi, tupleQueue),
  ]);
  const listQueueFlattenned = listQueue.flat().reverse();
  const listQueueTrue = listQueueFlattenned.find((el) => {
    return parseInt(el.message.substring(586 - 64, 586), 16) == collectionId;
  });

  let deadline = Math.floor(Date.now() / 1000) + 5 * 365 * 24 * 60 * 60;
  let signature = await genSignature(
    listQueueTrue.chainId,
    process.env.SIDE_BRIDGE,
    listQueueTrue.sender,
    listQueueTrue.message,
    listQueueTrue.nonce,
    deadline
  );
  const data = {
    ...listQueueTrue,
    target: process.env.SIDE_BRIDGE,
    deadline,
    signature,
  };
  res.json(data);
});
app.get("/signatureETH", async (req, res) => {
  const collectionId = req.query.collectionId;
  const queueElement =
    await SideCanonicalTransactionChainContract.getQueueLength();
  const tupleQueue = new Array(parseInt(queueElement))
    .fill(1)
    .map((_, idx) => ({
      address: process.env.SIDE_CANONICAL_TRANSACTION_CHAIN,
      name: "getQueueElement",
      params: [idx],
    }));
  const [listQueue] = await Promise.all([
    sidemultiCall(SideCanonicalTransactionChainArtifact.abi, tupleQueue),
  ]);
  const listQueueFlattenned = listQueue.flat().reverse();
  const listQueueTrue = listQueueFlattenned.find((el) => {
    return parseInt(el.message.substring(394 - 64, 394), 16) == collectionId;
  });

  let deadline = Math.floor(Date.now() / 1000) + 5 * 365 * 24 * 60 * 60;
  let signature = await genSignature(
    97,
    process.env.MAIN_BRIDGE,
    process.env.SIDE_BRIDGE,
    listQueueTrue.message,
    listQueueTrue.nonce,
    deadline
  );
  const data = {
    ...listQueueTrue,
    target: process.env.MAIN_BRIDGE,
    deadline,
    signature,
  };
  res.json(data);
});

const main = async () => {
  const Rand = await ethers.getContractFactory("SideTransactor");
  const rd = await Rand.attach(process.env.SIDE_TRANSACTOR);
  const rdOwner = await rd.connect(owner);

  MainBridgeContract.on(
    "NFTDepositInitiated",
    async (
      mainNFTCollection,
      sideNFTCollection,
      from,
      to,
      nftCollection,
      sideChainId,
      data,
      event
    ) => {
      console.log(`
      NFTDepositInitiated
      - mainNFTCollection = ${mainNFTCollection}
      - sideNFTCollection = ${sideNFTCollection}
      - from = ${from}
      - to = ${to}
      - nftCollection = ${nftCollection}
      - data = ${data}
      `);
    }
  );

  MainGateContract.on(
    "SentMessage",
    async (chainId, target, sender, message, nonce, event) => {
      let deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 60;
      let signature = await genSignature(
        chainId,
        target,
        sender,
        message,
        nonce,
        deadline
      );

      console.log(`
      SentMessage
      - chainId = ${chainId}
      - target = ${target}
      - sender = ${sender}
      - message = ${message}
      - nonce = ${nonce}
      - deadline = ${deadline}
      - signature = ${signature}
      `);
    }
  );

  //   MainCanonicalTransactionChain.on(
  //     "TransactorEvent",
  //     (sender, target, data, queueIndex, timestamp, event) => {

  //       console.log(`
  //       TransactorEvent
  //       - sender = ${sender}
  //       - target = ${target}
  //       - data = ${data}
  //       - queueIndex = ${queueIndex}
  //       - timestamp = ${timestamp}
  //       `);
  //     }
  //   );

  SideGateContract.on("RelayedMessage", (event) => {
    console.log("Deposit NFT success!");
  });

  SideBridgeContract.on(
    "DepositFinalized",
    (
      mainNFTCollection,
      sideNFTCollection,
      from,
      to,
      [chainId, rarity, collectionId, level, experience, rank, url],
      data,
      event
    ) => {
      console.log(`
    DepositFinalized
  - mainNFTCollection = ${mainNFTCollection}
  - sideNFTCollection = ${sideNFTCollection}
  - from = ${from}
  - to = ${to}
  - nftCollection {
      chainId = ${chainId}
      rarity = ${rarity}
      collectionId = ${collectionId}
      level = ${level}
      experience = ${experience}
      rank = ${rank}
      url = ${url}
      }
  - data = ${data}
  `);
    }
  );

  SideBridgeContract.on(
    "DepositFailed",
    (
      mainNFTCollection,
      sideNFTCollection,
      from,
      to,
      [chainId, rarity, collectionId, level, experience, rank, url],
      data,
      event
    ) => {
      console.log(`
    DepositFinalized
  - mainNFTCollection = ${mainNFTCollection}
  - sideNFTCollection = ${sideNFTCollection}
  - from = ${from}
  - to = ${to}
  - nftCollection {
      chainId = ${chainId}
      rarity = ${rarity}
      collectionId = ${collectionId}
      level = ${level}
      experience = ${experience}
      rank = ${rank}
      url = ${url}
      }
  - data = ${data}
  `);
    }
  );
  io.on("connection", (socket) => {
    console.log(socket.id);

    socket.on("send_message", (data) => {
      console.log("ok");
      if (data.sourceChain == 97) {
        MainGateContract.on(
          "SentMessage",
          async (chainId, target, sender, message, nonce, event) => {
            let deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 60;
            let signature = await genSignature(
              chainId,
              target,
              sender,
              message,
              nonce,
              deadline
            );
            socket.emit("send_signature", {
              chainId,
              target,
              sender,
              message,
              nonce,
              deadline,
              signature,
            });
          }
        );
      } else if (data.sourceChain == 5) {
        SideGateContract.on(
          "SentMessage",
          async (_target, _sender, _message, _nonce, event) => {
            let deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 60;
            let signature = await genSignature(
              97,
              _target,
              _sender,
              _message,
              _nonce,
              deadline
            );
            socket.emit("send_signature", {
              target: _target,
              sender: _sender,
              message: _message,
              nonce: _nonce,
              deadline,
              signature,
            });
          }
        );
      }
    });
  });
};
main();

server.listen(3001, () => console.log("Server is running on port 3001"));
