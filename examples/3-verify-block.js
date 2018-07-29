'use strict';
const crypto = require('crypto');
const _ = require('lodash');
const sha3256 = require('js-sha3').sha3_256;
const { blocks } = require('./example-block-chain');

const hashObject = (o) => sha3256(JSON.stringify(o));

const blockHashDifficulty = 4;
const blockHashLeadingCharacter = '0';

const blockHashIsAcceptable = (hash) => {
  return hash.startsWith(blockHashLeadingCharacter.repeat(blockHashDifficulty));
};

const verifyBlockSignature = (block) => {
  const blockWithoutSignature = JSON.stringify(_.omit(block, 'signature'));
  const verify = crypto.createVerify('SHA256');
  verify.update(blockWithoutSignature);
  return verify.verify(block.creatorPublicKey, block.signature, 'hex');
};

const verifyBlockHash = (block) => {
  return hashObject(_.omit(block, 'hash', 'signature')) === block.hash;
};

const blockIsValid = (previousBlock, block) => {
  return (
    previousBlock.hash === block.previousHash &&
    verifyBlockSignature(block) &&
    verifyBlockHash(block) &&
    blockHashIsAcceptable(block.hash)
  );
};

console.log('blockIsValid', blockIsValid(blocks[0], blocks[1]));
