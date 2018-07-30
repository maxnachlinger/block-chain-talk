'use strict';
const crypto = require('crypto');

const hash = crypto
  .createHash('sha256')
  .update('test input')
  .digest('hex');

console.log(hash);
