# Polymorph
## Overview
The goal of the system is to create NFTs that change their form (genome) every time they are transferred - Polymorphs. The changes need to be random, or as random as allowed by the on chain execution. The generation of the Polymorphs will be done via contract and the price for single NFT creation will be based on a increasing bonding curve. In addition the holder of a polymorph can choose to pay to randomly mutate a single gene. This price for a single gene mutation is doubled after every starting at a minimum cost. Every user can randomize their polymorph reseting their genome change cost to the base cost.
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

Theoretically it is possible for a miner to have a slightly bigger chance in generating a morph of his liking compared to a regular user. This risk, however is negligible for both economical and behavioral reasons. On one hand, the miner will likely be risking a significant block reward and the price of Polymorph needs to be sky high in order to make it worth the hassle. On the other hand, polymorph desirability and affinity is a very subjective matter - meaning that if they are going to like or dislike the new morph will depend on the person operating the mining node.
## Bonding curve
The actual shape and formula of the bonding curve can be seen here https://www.desmos.com/calculator/e2tftzkgfm
The bonding curve is used to gradually increase the price per Polymorph with the increase of Polymorphs in existence.
## Changing single gene
The holder of a Polymorph can decide to pay to change a single trait. The price for single gene change doubles every time you change a gene, until you completely randomize the polymorph through a dedicated randomization function, in which case the price resets to a default.
# Contracts
## BMath and BNum
BNum - Math related - part of the Balancer math. BMath is the implementation of the formula.
## ERC721PresetMinterPauserAutoId
Standard OZ one with changed visibility modifier for the token counter
## Polymorph
The main contract acting as an ERC721 but also carrying the minting logic. 
## PolymorphGeneGenerator
The library used for randomness generation.
## PolymorphWithGenChanger
Extension to the Polymorph contract enabling single gene mutation.