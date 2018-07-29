## Block-chain intro

### Some concepts first:

#### Hash function:

A hash function takes in arbitrary input and returns a string of a fixed size that's unique to the input.

Hash functions are:

- idempotent, the same input gives you the same output:
- infeasible to invert

[Here's an example](./examples/0-hash-function.js)

#### Public Key Encryption:

Everyone has 2 keys, a public and a private one

- Anyone can encrypt a message to me using my public key, using my private key I can decrypt that message
  (hey keep your private keys safe!)

- Using my private key I can sign a message, anyone can verify my signature with my public key

[Here's an example](./examples/1-public-key-encryption.js)

### A block

A block is a data structure that contains at least:

- A cryptographic hash of the previous block
- A creation timestamp
- The owner's public key
- Some data - usually a set of transactions
- A hash of the above
- A signature of the above + the hash by the owner

### The block chain

The block chain is the linkage from one block to the previous one via the hash of the previous one.

### How to add a block to the chain - overview

1.  Get some data, perhaps a set of transactions
2.  Generate a block for that transaction
3.  The network determines if the block is part of the authoritative chain

#### 2. Generate a block / Proof of work / mining

- Start with a nonce - a number
- Hash the block
- See if the hash is under the current target, a 256-bit number
- If it's not, increment nonce and try again
  [Here's an example](./examples/2-proof-of-work.js)
