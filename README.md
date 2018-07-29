## Block-chain intro

## Some concepts first:

### Hash function:

A hash function takes in arbitrary input and returns a string of a fixed size that's unique to the input.

Hash functions are:

- idempotent, the same input gives you the same output:
- infeasible to invert

[Hash function example](./examples/0-hash-function.js)

### Public Key Encryption:

Everyone has 2 keys, a public and a private one

- Anyone can encrypt a message to me using my public key, using my private key I can decrypt that message
  (hey keep your private keys safe!)

- Using my private key I can sign a message, anyone can verify my signature with my public key

[Public key encryption example](./examples/1-public-key-encryption.js)

## A block

A block is a data structure that contains at least:

- A cryptographic hash of the previous block
- A creation timestamp
- The owner's public key
- Some data - usually a set of transactions
- A hash of the above
- A signature of the above + the hash by the owner

## The block chain

The block chain is the linkage between blocks via each block containing a hash of the previous one. The block chain
starts off with a special block often called a Genesis Block.

## How to add a block to the chain - overview

1.  Get some data, perhaps a set of transactions
2.  Generate a block for that transaction
3.  The network determines if the block is part of the authoritative chain

### Generate a block / Proof of work / mining

- Start with a nonce - a number
- Hash the block
- See if the hash is under the current target, a 256-bit number
- If it's not, increment nonce and try again

[Proof of work example](./examples/2-proof-of-work.js)

#### Proof of work benefits:

- It takes a good amount of computation to solve, but takes very little computation to verify. Other nodes can verify
  the validity of the block by checking that the hash of the data of the block is less than a preset number.
  [Here's an example of block verification](./examples/3-verify-block.js). Note: the present number is continually 
  modified to be harder as more miners join the network.
- Security: Let's say a bad actor wants to change a block. This isn't computationally feasible since the bad actor
  would have to change that block and then change every subsequent block in the chain before the network could generate
  the next block.

### The network determines if the block is part of the authoritative chain

#### Consensus

Problem: N users can have different "correct" copies of the block-chain.

- Blockchains use consensus algorithms to elect a leader who will decide the contents of the next block. That leader
  is also responsible for broadcasting the block to the network, so that the other peers can verify the validity of
  its contents.
- The consensus (or the single source of truth) is in the blocks at the longest chain - or put another way, the chain
that has the most work put into it.

#### How consensus thwarts sneaky folks:
Say Alejandro creates a new fraudulent block, and starts broadcasting it. Other miners will continue posting blocks off 
of the previous block as well. Since our algorithm says we'll ditch chains with fewer blocks, Alejandro will have to 
continue mining blocks and broadcasting them faster than all the other miners on the network. That would only happen if 
Alejandro had > 50% of the computing power.

One collorary here is that you shouldn't trust every new block, you should wait for several new blocks to be added after
it.

### Proof of Work drawbacks:

- Lots of wasted power for mining blocks - I've read the bitcoin mining uses more power than the entire continent of
  Africa.

### Alternative to Proof of Work
TODO

### Merkle trees for transactions in blocks
TODO
