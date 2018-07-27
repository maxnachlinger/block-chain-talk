const crypto = require('crypto')
const _ = require('lodash')
const uuidv4 = require('uuid/v4')
const sha3256 = require('js-sha3').sha3_256
const MerkleTools = require('merkle-tools')
const {privateKey, publicKey} = require('./keys')

const hashObject = (o) => sha3256(JSON.stringify(o))

const addHashToTransaction = (transaction) => ({
  ...transaction,
  hash: hashObject(transaction),
})

const transaction = ({previousTransaction, data}) => {
  return addHashToTransaction({
    index: previousTransaction.index + 1,
    timestamp: Date.now(),
    data,
    previousHash: previousTransaction.hash,
  })
}

const genesisTransaction = () => {
  return addHashToTransaction({
    index: 0,
    timestamp: Date.now(),
    data: {value: uuidv4()},
    previousHash: '0',
  })
}

const transactionIsValid = (transaction) => {
  const {hash: existingHash, id, index, timestamp, data, previousHash} = transaction
  return (
    hashObject({
      id,
      index,
      timestamp,
      data,
      previousHash,
    }) === existingHash
  )
}

const getBlockTransactionsHash = (block) => {
  const merkleTools = new MerkleTools()
  merkleTools.addLeaves(_.map(block.transactions, 'hash'))
  merkleTools.makeTree()
  return merkleTools.getMerkleRoot().toString('hex')
}

const blockHashDifficulty = 4
const blockHashLeadingCharacter = '0'

const generatedBlockHashIsAcceptable = (hash) => {
  return hash.startsWith(blockHashLeadingCharacter.repeat(blockHashDifficulty))
}

const getBlockHashAndNonce = (block) => {
  const localBlock = _.assign({nonce: 0}, _.omit(block, ['hash', 'nonce', 'signature']))

  // this is a proof of work / mining, we ensure that our hash starts with a blockHashDifficulty
  // amount of blockHashLeadingCharacter
  let hash = hashObject(localBlock)
  while (!generatedBlockHashIsAcceptable(hash)) {
    localBlock.nonce++
    hash = hashObject(localBlock)
  }

  return {nonce: localBlock.nonce, hash}
}

const mineBlock = (block) => {
  const localBlock = {
    ...block,
    transactionsHash: getBlockTransactionsHash(block),
  }
  return {...localBlock, ...getBlockHashAndNonce(localBlock)}
}

const signBlock = (privateKey, block) => {
  const sign = crypto.createSign('SHA256')
  sign.update(JSON.stringify(_.omit(block, 'signature')))
  return {...block, signature: sign.sign(privateKey, 'hex')}
}

const verifyBlockSignature = (block) => {
  const blockWithoutSignature = JSON.stringify(_.omit(block, 'signature'))
  const verify = crypto.createVerify('SHA256')
  verify.update(blockWithoutSignature)
  return verify.verify(block.creatorPublicKey, block.signature, 'hex')
}

const block = (previousBlock, privateKey, creatorPublicKey) => {
  return _.flow([
    mineBlock,
    _.partial(signBlock, privateKey)
  ])({
    index: previousBlock.index + 1,
    timestamp: Date.now(),
    previousHash: previousBlock.hash,
    creatorPublicKey,
    transactions: [genesisTransaction()],
  })
}

const genesisBlock = () => block({index: -1, hash: '0'}, privateKey, publicKey)

const blockIsValid = (block) => {
  return (
    verifyBlockSignature(block) &&
    block.transactionsHash === getBlockTransactionsHash(block) &&
    getBlockHashAndNonce(block).hash === block.hash
  )
}

const addTransactionsToBlock = ({block, privateKey, transactions}) => {
  const {
    index,
    creatorPublicKey,
    timestamp,
    previousHash,
    transactions: existingTransactions,
  } = block

  const newTransactions = existingTransactions.concat(transactions)
  const invalidTransactions = newTransactions.filter((t) => !transactionIsValid(t))

  if (invalidTransactions.length > 0) {
    throw new Error('Invalid transactions found.')
  }

  return _.flow([
    mineBlock,
    _.partial(signBlock, privateKey)
  ])({
    index,
    creatorPublicKey,
    timestamp,
    previousHash,
    transactions: newTransactions,
  })
}

const getLatestBlockTransaction = (block) => block.transactions[block.transactions.length - 1]

const hashBlockChain = ({blocks, index}) => {
  return hashObject({blocks, index})
}

const blockChain = () => {
  const ret = {blocks: [genesisBlock()], index: 0}
  return {
    ...ret,
    hash: hashBlockChain(ret),
  }
}

const addBlockToChain = ({chain, block}) => {
  if (!blockIsValid(block)) {
    throw new Error('Invalid block.')
  }

  chain.blocks.push(block)
  chain.index = chain.blocks.length - 1
  chain.hash = hashBlockChain(chain)
  return chain
}

const getLatestBlock = (chain) => chain.blocks[chain.index]

const chainIsValid = (chain) => {
  return hashBlockChain(chain) === chain.hash
}

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
}
