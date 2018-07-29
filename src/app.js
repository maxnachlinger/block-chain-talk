const { promisify, inspect } = require('util');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

const {
  block,
  transaction,
  blockChain,
  addTransactionsToBlock,
  getLatestBlockTransaction,
  getLatestBlock,
  addBlockToChain,
} = require('./lib');

const { publicKey, privateKey } = require('../common/keys');
const writeFile = promisify(fs.writeFile);

const createCakeBlockChain = () => {
  const cakeBlockChain = blockChain();
  const cakeBlock = block(getLatestBlock(cakeBlockChain), privateKey, publicKey);

  const configureCake = transaction({
    previousTransaction: getLatestBlockTransaction(cakeBlock),
    data: {
      size: 'quarter-sheet',
      flavor: 'chocolate',
      icing: 'buttercreme',
      icingColor: 'chocolate',
      filling: 'strawberry',
      topBorderStyle: 'shells',
      topBorderColor: 'red',
      bottomBorderStyle: 'reverse-shell',
      bottomBorderColor: 'red',
      decoration: 'confetti',
      decorationColor: 'primary',
      message: 'This is a test message',
      messageColor: 'white',
      note: 'This is a test note',
    },
  });

  const reserveCakeSlot = transaction({
    previousTransaction: configureCake,
    data: {
      reservationId: uuidv4(),
      pickupDate: 1532131200000,
      slot: uuidv4(),
    },
  });

  const orderCake = transaction({
    previousTransaction: reserveCakeSlot,
    data: {
      orderId: uuidv4(),
    },
  });

  const updatedCakeBlock = addTransactionsToBlock({
    privateKey,
    block: cakeBlock,
    transactions: [configureCake, reserveCakeSlot, orderCake],
  });

  const updatedCakeBlockChain = addBlockToChain({
    chain: cakeBlockChain,
    block: updatedCakeBlock,
  });

  return updatedCakeBlockChain;
};

(async () => {
  const cakeBlockChain = createCakeBlockChain();
  const str = inspect(cakeBlockChain, { depth: null });

  console.log(str);
  await writeFile('./example-block-chain.js', `module.exports = ${str}`);
})();
