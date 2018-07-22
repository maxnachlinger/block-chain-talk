const { promisify } = require('util');
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

const writeFile = promisify(fs.writeFile);

const createCakeBlockChain = () => {
  const userId = uuidv4();

  const cakeBlockChain = blockChain();
  const cakeBlock = block(getLatestBlock(cakeBlockChain));

  const configureCake = transaction({
    previousTransaction: getLatestBlockTransaction(cakeBlock),
    creator: userId,
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
    creator: userId,
    data: {
      reservationId: uuidv4(),
      pickupDate: 1532131200000,
      slot: uuidv4(),
    },
  });

  const orderCake = transaction({
    previousTransaction: reserveCakeSlot,
    creator: userId,
    data: {
      orderId: uuidv4(),
    },
  });

  const updatedCakeBlock = addTransactionsToBlock({
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

  console.log(JSON.stringify(cakeBlockChain, null, 2));

  await writeFile('./cake-block-chain.json', JSON.stringify(cakeBlockChain, null, 2));
})();
