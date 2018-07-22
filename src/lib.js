const uuidv4 = require('uuid/v4');
const sha3256 = require('js-sha3').sha3_256;
const MerkleTools = require('merkle-tools');

const systemName = 'system';

const hashObject = (o) => sha3256(JSON.stringify(o));

const addHashToTransaction = (transaction) => ({
  ...transaction,
  hash: hashObject(transaction),
});

const transaction = ({ previousTransaction, creator, data }) => {
  return addHashToTransaction({
    index: previousTransaction.index + 1,
    timestamp: Date.now(),
    creator,
    data,
    previousHash: previousTransaction.hash,
  });
};

const genesisTransaction = () => {
  return addHashToTransaction({
    index: 0,
    timestamp: Date.now(),
    creator: systemName,
    data: { [systemName]: uuidv4() },
    previousHash: '0',
  });
};

const transactionIsValid = (transaction) => {
  const { hash: existingHash, index, timestamp, creator, data, previousHash } = transaction;
  return (
    hashObject({
      index,
      timestamp,
      creator,
      data,
      previousHash,
    }) === existingHash
  );
};

const getBlockTransactionsHash = (block) => {
  const merkleTools = new MerkleTools();
  merkleTools.addLeaves(block.transactions.map(({ hash }) => hash));
  merkleTools.makeTree();
  return merkleTools.getMerkleRoot().toString('hex');
};

const blockHashDifficulty = 4;
const blockHashLeadingCharacter = '0';

const generatedBlockHashIsAcceptable = (hash) => {
  return hash.startsWith(blockHashLeadingCharacter.repeat(blockHashDifficulty));
};

const getBlockHashAndNonce = (block) => {
  const keysToIgnore = { hash: true, nonce: true };
  const localBlock = Object.keys(block).reduce(
    (acc, key) => (keysToIgnore[key] ? acc : { ...acc, [key]: block[key] }),
    { nonce: 0 },
  );

  // this is a proof of work / mining, we ensure that our hash starts with a blockHashDifficulty
  // amount of blockHashLeadingCharacter
  let hash = hashObject(localBlock);
  while (!generatedBlockHashIsAcceptable(hash)) {
    localBlock.nonce++;
    hash = hashObject(localBlock);
  }

  return { nonce: localBlock.nonce, hash };
};

const mineBlock = (block) => {
  const localBlock = {
    ...block,
    transactionsHash: getBlockTransactionsHash(block),
  };
  return { ...localBlock, ...getBlockHashAndNonce(localBlock) };
};

const block = (previousBlock) => {
  return mineBlock({
    index: previousBlock.index + 1,
    timestamp: Date.now(),
    previousHash: previousBlock.hash,
    transactions: [genesisTransaction()],
  });
};

const genesisBlock = () => block({ index: -1, hash: '0' });

const blockIsValid = (block) => {
  return (
    block.transactionsHash === getBlockTransactionsHash(block) &&
    getBlockHashAndNonce(block).hash === block.hash
  );
};

const addTransactionsToBlock = ({ block, transactions }) => {
  const { index, timestamp, previousHash, transactions: existingTransactions } = block;

  const newTransactions = existingTransactions.concat(transactions);
  const invalidTransactions = newTransactions.filter((t) => !transactionIsValid(t));

  if (invalidTransactions.length > 0) {
    throw new Error('Invalid transactions found.');
  }

  return mineBlock({
    index,
    timestamp,
    previousHash,
    transactions: newTransactions,
  });
};

const getLatestBlockTransaction = (block) => block.transactions[block.transactions.length - 1];

const hashBlockChain = ({ blocks, index }) => {
  return hashObject({ blocks, index });
};

const blockChain = () => {
  const ret = { blocks: [genesisBlock()], index: 0 };
  return {
    ...ret,
    hash: hashBlockChain(ret)
  };
};

const addBlockToChain = ({ chain, block }) => {
  if (!blockIsValid(block)) {
    throw new Error('Invalid block.');
  }

  chain.blocks.push(block);
  chain.index = chain.blocks.length - 1;
  chain.hash = hashBlockChain(chain);
  return chain;
};

const getLatestBlock = (chain) => chain.blocks[chain.index];

const chainIsValid = (chain) => {
  return hashBlockChain(chain) === chain.hash;
};

module.exports = {
  transaction,
  block,
  getLatestBlockTransaction,
  addTransactionsToBlock,
  blockChain,
  getLatestBlock,
  addBlockToChain,
  transactionIsValid,
  blockIsValid,
  chainIsValid,
};
