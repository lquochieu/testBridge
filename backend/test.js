import { buildPedersenHash, buildBabyjub } from "circomlibjs";
import { toBufferLE, toBigIntLE, toBigIntBE } from "bigint-buffer";
import MerkleTree from "fixed-merkle-tree";
import { randomBytes } from "crypto";

const pedersen = await buildPedersenHash();
const babyJub = await buildBabyjub();
const F = babyJub.F;
const tree = new MerkleTree(20);

function hash(msg) {
  return F.toObject(babyJub.unpackPoint(pedersen.hash(msg))[0]);
}

function randomBigInt(n) {
  return toBigIntLE(randomBytes(n));
}

function generateDeposit() {
  let deposit = {
    secret: randomBigInt(31),
    nullifier: randomBigInt(8),
    sideOwner: BigInt('0x0a38Ad8281202e11fEE8F1c0E1eBED6C8E410015'),
    collectionId: 0n,
    status:0n
  };

  const nullifierImage = Buffer.concat([
    toBufferLE(deposit.nullifier, 8),
    toBufferLE(deposit.sideOwner, 20),
    toBufferLE(deposit.collectionId, 2),
    toBufferLE(deposit.status, 1),
  ]);

  deposit.nullifier = toBigIntLE(nullifierImage);
  
  const preimage = Buffer.concat([
    toBufferLE(deposit.nullifier, 31),
    toBufferLE(deposit.secret, 31),
  ]);

  deposit.commintment = hash(preimage);
  return deposit;
}

const main = async () => {
  const deposit = generateDeposit();
  tree.insert(deposit.commintment);
  const { pathElements, pathIndices } = tree.path(0);
  console.log(toBufferLE(deposit.nullifier, 31));
  const input = {
    root:  tree.root(),
    nullifierHash: hash(toBufferLE(deposit.nullifier, 31)),
    sideOwner: deposit.sideOwner,
    collectionId: Number(deposit.collectionId),
    nonce: 0,
    status: Number(deposit.status),

    nullifier: deposit.nullifier,
    secret: deposit.secret,
    pathElements: pathElements,
    pathIndices: pathIndices
  }
  console.log(input);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
