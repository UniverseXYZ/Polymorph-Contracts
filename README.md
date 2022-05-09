# Polymorph

## Overview

**The goal of the system is to create NFTs that can change their form (genome). The changes need to be random, or as random as allowed by the on chain execution. The generation of the Polymorphs will be done via contract and the price for single NFT creation will be flat. In addition the holder of a polymorph can choose to pay to randomly mutate a single gene. This price for a single gene mutation is doubled after morph starting at a minimum cost. Every user can randomize their polymorph reseting their genome change cost to the base cost.**

## Setup
### Contracts deployment
- `./scripts/deploy.sh`

### Etherscan verification

- `./scripts/verify.sh`

  - Polymorph Root Verification:
      - `npx hardhat verify --network goerli contractAddress --constructor-args ./deployment/args/root-polymorph-args.js`

  - RootTunnel Verification:
      - `npx hardhat verify --network goerli <contractAddress> <"checkPointAddress"> <"fxRootAddress"> <"daoAddress">`

  - Polymorph Child Verification:
      - `npx hardhat verify --network mumbai <contractAddress> --constructor-args ./deployment/args/child-polymorph-args.js`
     
  - ChildTunnel Verification:
      - `npx hardhat verify --network mumbai <contractAddress> <"fxChildAddress"> <"daoAddress">`

  - TestERC20 Verification:
    - `npx hardhat verify --network mumbai --contract contracts/polygon/TestERC20.sol:TestERC20 <contractAddress>`

## Genome

The genome - the combination of the different traits of a polymorph are called genome. The genome is represented by a uint256. Each two decimal places (apart from the last one) represent a single gene. This enables for 100 different options for each attribute.
Randomization of the genome is based on generating a hash. The seed for this hash includes network and user specific parameters:

- msg.sender - address creating the NFT
- tx.origin - originator of the transaction (will frequently be the same as msg.sender)
- gasleft() - how much gas is left in this transaction. Tricky to control for an attacker as minor variances of gas costs of operations will always happen and will lead to massively unpredictable results.
- g.lastRandom - the last random number generated
- block.timestamp - the current block timestamp
- block.number - the current block number
- blockhash(block.number) - the hash of the current block
- blockhash(block.number-100) - the hash of the block 100 blocks ago.

- Note: The random generated genome is `77` digits long. However, sometimes this generator produces `76` instead of `77` digits. Can be observed on some V1 polymorphs.

Theoretically it is possible for a miner to have a slightly bigger chance in generating a morph of his liking compared to a regular user. This risk, however is negligible for both economical and behavioral reasons. On one hand, the miner will likely be risking a significant block reward and the price of Polymorph needs to be sky high in order to make it worth the hassle. On the other hand, polymorph desirability and affinity is a very subjective matter - meaning that if they are going to like or dislike the new morph will depend on the person operating the mining node.

## Changing single gene

The holder of a Polymorph can decide to pay to change a single trait. The price for single gene change doubles every time you change a gene, until you completely randomize the polymorph through a dedicated randomization function, in which case the price resets to a default.

Gene positions:

- 0 - base character. Will not be morphable nor be able to be scrambled. Dont pass it
- 1 - background attribute
- 2 - pants attribute
- 3 - torso attribute
- 4 - shoes attribute
- 5 - face attribute
- 6 - head attribute
- 7 - right weapon attribute
- 8 - left weapon attribute

- Note: Currently there are `8` attributes that correspond to digital pictures/pngs. However the contracts support up to `38` attributes (see `PolymorphWithGeneChanger` contract `TOTAL_ATTRIBUTES`) in case on a later stage a decision is made to add more.
- If you pass a gene attribute greater than `8` when morphing, the genome will change but visually there won't be any difference to the polymorph. 

## Polygon Bridge

Every polymorph owner has the ability to transfer it's polymorph to Polygon using the Polygon bridge. It implemented in order to save the users the gas fees on mainnet. The bridge works in both directions thanks to [Polygon's StateSync pattern](https://docs.matic.network/docs/develop/l1-l2-communication/state-transfer/).

- Moving the polymorph from Ethereum to Polygon will lock the polymorph in the tunnel contract until it's transfered back to Ethereum. After that the Polygon contract will mint a polymorph with the same token id, gene, genome change price and virginity information as on Ethereum.

- The user is then able to have the same functionalities on Polygon without the huge gas fees.

- Moving the polymorph from Polygon to Ethereum will burn the polymorph on Polygon and transfer the ownership of the polymorph back to the owner(trading is supported) as well as any state that has changed during that period.

- Separate contracts implementations of the polymorph contracts have been made for each of the networks because they have slight differences.

- **For a detailed step-by-step explanation and showcase of each transcation of how the Polygon Bridge works with the Polymorph Contracts, check `notebooks/Polygon-Bridge-Steps`**

### Polymorphs Bridge Flow

![Bridge Flow](https://github.com/UniverseXYZ/Polymorph-Contracts/blob/polymorph-v2-polygon-bridge/diagrams/Polymorph%20Bridge%20Flow.png "Bridge Flow")

### Ethereum to Polygon Bridge Flow

![Ethereum to Polygon Bridge Flow](https://github.com/UniverseXYZ/Polymorph-Contracts/blob/polymorph-v2-polygon-bridge/diagrams/EthereumToPolygonTransfer.png "Ethereum to Polygon Bridge Flow")

### Polygon to Ethereum Bridge Flow

![Polygon to Ethereum Bridge Flow](https://github.com/UniverseXYZ/Polymorph-Contracts/blob/polymorph-v2-polygon-bridge/diagrams/PolymorphToEthereumTransfer.png "Polygon to Ethereum Bridge Flow")

## Contracts Description

### Hierarchy

![Contracts Hierarchy](https://github.com/UniverseXYZ/Polymorph-Contracts/blob/polymorph-v2-polygon-bridge/diagrams/PolymorphsBridge.png "Contracts Hierarchy")

### ERC721PresetMinterPauserAutoId

Standard OZ one with changed visibility modifier for the token counter

### PolymorphGeneGenerator

The library used for randomness generation.

### Polymorph

The base abstract contract acting as an ERC721 but also carrying the gene generation and gene state logic.

### PolymorphWithGeneChanger

Abstract contract extending the Polymorph contract enabling gene mutation and updating gene when transfering polymorph from another network(Polygon).

### PolymorphRoot

The main contract on Ethereum's side. It enables pre-minting, minting, bulk buying and burning V1 polymorphs.

### PolymorphChild

The main contract on other networks's (Polygon) side. It enables minting with predefined token id.

### FxBaseChildTunnel

Polygon contract implementation which enables the ability to transfer state(polymorphs and their data) to Ethereum.

### FxBaseRootTunnel

Ethereum contract implementation enables the ability to transfer state(polymorphs and their data) to Polygon.

### PolymorphTunnel

Base abstract contract implementation. It handles the decoding of messages send via the tunnels.

### PolymorphRootTunnel

Tunnel contract implementation on Ethereum's side. It handles the receiving and sending messages from the child tunnel on polygon

### PolymorphChildTunnel

Tunnel contract implementation on Polygons's side. It handles the receiving and sending messages from the root tunnel on Ethereum

### DAOControlled

Contract which adds a dao field and a modifer to check if the address matches the dao address

### TunnelEnabled

Contract which adds a tunnel mapping of addresses field and a modifer to check if the in address has been whitelisted as a tunnel.
