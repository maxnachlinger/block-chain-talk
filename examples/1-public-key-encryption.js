'use strict';

const crypto = require('crypto');
const { privateKey, publicKey } = require('../common/keys');

const encryptMessageTo = (recipientPublicKey, message) => {
  return crypto.publicEncrypt(recipientPublicKey, Buffer.from(message)).toString('hex');
};

const decryptMessage = (recipientPrivateKey, encryptedMessage) => {
  return crypto
    .privateDecrypt(recipientPrivateKey, Buffer.from(encryptedMessage, 'hex'))
    .toString();
};

const signMessage = (senderPrivateKey, message) => {
  const sign = crypto.createSign('SHA256');
  sign.update(message);
  return sign.sign(senderPrivateKey, 'hex');
};

const verifySignature = (senderPublicKey, message, signature) => {
  const verify = crypto.createVerify('SHA256');
  verify.update(message);
  return verify.verify(senderPublicKey, signature, 'hex');
};

const message = 'This is a test message';
const encryptedMessage = encryptMessageTo(publicKey, message);
const decryptedMessage = decryptMessage(privateKey, encryptedMessage);

const signature = signMessage(privateKey, message);
const signatureValid = verifySignature(publicKey, message, signature);

console.log(
  'message:',
  message,
  '\nencryptedMessage:',
  encryptedMessage,
  '\ndecryptedMessage:',
  decryptedMessage,
  '\nsignature:',
  signature,
  '\nsignatureValid:',
  signatureValid,
);
