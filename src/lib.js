const uuidv4 = require('uuid/v4');
const sha3256 = require('js-sha3').sha3_256;
const MerkleTools = require('merkle-tools');

const systemName = 'system';

const hashObject = (o) => sha3256(JSON.stringify(o));

const addHashToTransaction = (transaction) => ({ ...transaction, hash: hashObject(transaction) });

const transaction = ({ previousTransaction, creator, data }) =>
  addHashToTransaction({
    index: previousTransaction.index + 1,
    timestamp: Date.now(),
    creator,
    data,
    previousHash: previousTransaction.hash,
  });

const genesisTransaction = () =>
  addHashToTransaction({
    index: 0,
    timestamp: Date.now(),
    creator: systemName,
    data: { [systemName]: uuidv4() },
    previousHash: '0',
  });

const addHashesToBlock = (block) => {
  // hash the transactions
  const merkleTools = new MerkleTools();
  merkleTools.addLeaves(block.transactions.map(({ hash }) => hash));
  merkleTools.makeTree();
  const transactionsHash = merkleTools.getMerkleRoot().toString('hex');

  // hash the whole block
  const localBlock = { ...block, transactionsHash };
  return { ...localBlock, hash: hashObject(localBlock) };
};

const block = (previousBlock) =>
  addHashesToBlock({
    index: previousBlock.index + 1,
    timestamp: Date.now(),
    previousHash: previousBlock.hash,
    transactions: [genesisTransaction()],
  });

const genesisBlock = () =>
  addHashesToBlock({
    index: 0,
    timestamp: Date.now(),
    previousHash: '0',
    transactions: [genesisTransaction()],
  });

const addTransactionsToBlock = ({
  block: { index, timestamp, previousHash, transactions: existingTransactions },
  transactions,
}) =>
  addHashesToBlock({
    index,
    timestamp,
    previousHash,
    transactions: existingTransactions.concat(transactions),
  });

const getLatestBlockTransaction = (block) => block.transactions[block.transactions.length - 1];

const blockChain = () => [genesisBlock()];

const addBlockToChain = ({ chain, block }) => chain.concat([block]);

const getLatestBlock = (chain) => chain[chain.length - 1];

module.exports = {
  transaction,
  block,
  getLatestBlockTransaction,
  addTransactionsToBlock,
  blockChain,
  getLatestBlock,
  addBlockToChain,
};
