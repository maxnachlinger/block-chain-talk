'use strict';

const crypto = require('crypto');
const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const { privateKey, publicKey } = require('../common/keys');

const hashObject = (o) =>
  crypto
    .createHash('sha256')
    .update(JSON.stringify(o))
    .digest('hex');

const signBlock = (privateKey, block) => {
  const sign = crypto.createSign('SHA256');
  sign.update(JSON.stringify(_.omit(block, 'signature')));
  return { ...block, signature: sign.sign(privateKey, 'hex') };
};

const blockHashDifficulty = 4;
const blockHashLeadingCharacter = '0';

const generatedBlockHashIsAcceptable = (hash) => {
  return hash.startsWith(blockHashLeadingCharacter.repeat(blockHashDifficulty));
};

const mineBlock = (block) => {
  console.log('proof of work...');
  const localBlock = _.assign({ nonce: 0 }, _.omit(block, ['hash', 'nonce', 'signature']));

  // this is a proof of work / mining, we ensure that our hash starts with a blockHashDifficulty
  // amount of blockHashLeadingCharacter
  let hash = hashObject(localBlock);
  while (!generatedBlockHashIsAcceptable(hash)) {
    localBlock.nonce++;
    hash = hashObject(localBlock);
  }

  console.log('Found acceptable hash', hash, 'nonce', localBlock.nonce);
  return { ...localBlock, hash };
};

const block = (previousBlock, creatorPrivateKey, creatorPublicKey, data) => {
  return _.flow([mineBlock, _.partial(signBlock, creatorPrivateKey)])({
    index: previousBlock.index + 1,
    timestamp: Date.now(),
    previousHash: previousBlock.hash,
    creatorPublicKey,
    data,
  });
};

const createGenesisBlock = (creatorPrivateKey, creatorPublicKey) =>
  block({ index: -1, hash: '0' }, creatorPrivateKey, creatorPublicKey, {
    value: uuidv4(),
    note: 'Genesis block',
  });

const genesisBlock = createGenesisBlock(privateKey, publicKey);
const newBlock = block(genesisBlock, privateKey, publicKey, { key: 'value' });

console.log(JSON.stringify(newBlock, null, 2));
