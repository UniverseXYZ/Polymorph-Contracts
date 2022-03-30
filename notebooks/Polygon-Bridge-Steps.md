<div id="a46c21cd-7e28-4f4c-a961-72ed814e9de8" class="cell markdown">

# Polygon Plasma Bridge utilized for Polymorphs NFT Collection

-   This is a notebook that can serve as a guide to explore bridging
    Polymorph NFTs from Ethereum to Polygon and vice versa.

</div>

<div id="97b7666c-0b4f-4adc-97a1-075f64e6be51" class="cell markdown"
tags="[]">

# Ethereum -\> Polygon Steps

0\) Deploy all 5 contracts to the corresponding networks. For reference
on how to do that see `README.md`.

1\) Call `setFxChildTunnel` on deployed RootTunnel with the address of
child tunnel

2\) Call `setFxRootTunnel` on deployed ChildTunnel with address of root
tunnel

3\) Call `setPolymorphContract` on RootTunnel to point to the
RootPolymorph address

4\) Call `setPolymorphContract` on ChildTunnel to point to the
ChildPolymorph address

5\) WhiteList `PolyRoot Tunnel` from `PolymorphRoot`

6\) WhiteList `PolyChild Tunnel` from `PolymorphChild`

7\) Mint new NFT either with call/sendTransaction or bulkBuy()

8\) Approve `Root Tunnel Contract` to manage an NFT

9\) Call MoveThroughWormhole(tokenId) on `Root Tunnel Contract`

-   Go to Polygon network and observe the genome of the NFT that you
    have bridged. It should have changed :)
    -   Note: It may take 10-20 mins in order for your bridge
        transaction to be validated.
    -   You can observe the events of the fxChild Contract in Mumbai -
        `0xCf73231F28B7331BBe3124B907840A94851f9f11` as when your
        transaction gets validated, it will appear there.

</div>

<div id="060309c8-6617-470c-9412-0d3f3d1fd67f" class="cell code"
execution_count="2">

``` typescript
const env = require('dotenv').config({path:'../.env'});
const { getDefaultProvider, providers, Wallet, Contract, utils } = require("ethers");
```

</div>

<div id="74e9e118-0c87-4d2e-916b-7875d4b1a8df" class="cell markdown">

## Declaring addresses of deployed contracts

</div>

<div id="ad01f6f0-6f07-489a-9574-dd050e6306a5" class="cell code"
execution_count="3">

``` typescript
const POLY_ROOT_ADDRESS = "0x764bADa71B2B7a03a7a7Ae2615c88a514664d6a0";

const ROOT_TUNNEL_ADDRESS = "0xE5F5D0a68A215110Fc0803d87D44253Ee5382f6c";

const POLY_CHILD_ADDRESS = "0x2d16C6825D2377b2B87D378F359130B17C727367";

const CHILD_TUNNEL_ADDRESS = "0xD43e3ecCe4430dE35bb01461dB8474CBf3CCd917";

const TEST_ERC_20_ADDRESS = "0xa2D7431aA391d1814516449b32B01735590fdec1";
```

</div>

<div id="2e6a71c5-fe79-49e0-93e4-323c68ab50d8" class="cell code"
execution_count="4">

``` typescript
const gasLimit = "0x100000";
```

</div>

<div id="e455d42c-622a-47dd-92b0-917c6dd02c7d" class="cell markdown"
tags="[]">

## Declaring providers and Signers

</div>

<div id="4baabe76-dbb7-4a29-96e7-f6f04e340d5e" class="cell code"
execution_count="5">

``` typescript
const GOERLI_TESTNET = "goerli";

const MUMBAI_TESTNET = "maticmum";

const PROVIDER_GOERLI = getDefaultProvider(GOERLI_TESTNET, {
    alchemy: env.parsed.GOERLI_ALCHEMY_KEY
});

const PROVIDER_MUMBAI = new providers.AlchemyProvider(MUMBAI_TESTNET, env.parsed.MUMBAI_ALCHEMY_KEY);

const SIGNER_GOERLI = new Wallet(env.parsed.PRIVATE_KEY, PROVIDER_GOERLI);

const SIGNER_MUMBAI = new Wallet(env.parsed.PRIVATE_KEY, PROVIDER_MUMBAI);
```

</div>

<div id="09c318fc-7758-415d-9b87-d9267d16e4a6" class="cell markdown">

## Import ABIs

</div>

<div id="1a8fbc93-6a0c-4710-9b5a-08054f81bdee" class="cell code"
execution_count="6">

``` typescript
import POLYMORPH_ROOT_ABI from './abis/POLYROOT_ABI.json';

import POLYMORPH_CHILD_ABI from './abis/POLYCHILD_ABI.json';

import TUNNEL_ROOT_ABI from './abis/TUNNEL_ROOT_ABI.json';

import TUNNEL_CHILD_ABI from './abis/TUNNEL_CHILD_ABI.json';
```

</div>

<div id="9f1d5892-f58e-44c2-8ed6-19ab7a9ba5ef" class="cell markdown">

## Instantiating Contracts

</div>

<div id="5d71dd33-9416-4d1e-9446-61d52f276a8e" class="cell code"
execution_count="7">

``` typescript
const polyRootInst = new Contract(POLY_ROOT_ADDRESS, POLYMORPH_ROOT_ABI, SIGNER_GOERLI);

const tunnelRootInst = new Contract(ROOT_TUNNEL_ADDRESS, TUNNEL_ROOT_ABI, SIGNER_GOERLI);

const polyChildInst = new Contract(POLY_CHILD_ADDRESS, POLYMORPH_CHILD_ABI, SIGNER_MUMBAI);

const tunnelChildInst = new Contract(CHILD_TUNNEL_ADDRESS, TUNNEL_CHILD_ABI, SIGNER_MUMBAI);
```

</div>

<div id="543cfec6-c717-4f8c-98bb-fb62b94be44e" class="cell markdown">

## Running Bridge Prerequisites

</div>

<div id="3def9958-f500-4387-880d-2be607c2b868" class="cell markdown">

### Link Root And Child Polymorph Contracts with the respective tunnels

</div>

<div id="c663cc39-7172-469b-b4b1-b65a730a0429" class="cell code"
execution_count="8">

``` typescript
const setContractInRootTx = await tunnelRootInst.setPolymorphContract(
           POLY_ROOT_ADDRESS, {gasLimit : utils.hexlify(gasLimit)
        });
```

<div class="output stream stdout">

    ========= NOTICE =========
    Request-Rate Exceeded  (this message will not be repeated)

    The default API keys for each service are provided as a highly-throttled,
    community resource for low-traffic projects and early prototyping.

    While your application will continue to function, we highly recommended
    signing up for your own API keys to improve performance, increase your
    request rate/limit and enable other perks, such as metrics and advanced APIs.

    For more details: https://docs.ethers.io/api-keys/
    ==========================

</div>

</div>

<div id="08cf3120-48f2-4f88-adb1-90f5a9f39f06" class="cell code"
execution_count="9" tags="[]">

``` typescript
setContractInRootTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 28,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f910', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x100000', _isBigNumber: true },
      to: '0xE5F5D0a68A215110Fc0803d87D44253Ee5382f6c',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xc8509ec2000000000000000000000000764bada71b2b7a03a7a7ae2615c88a514664d6a0',
      accessList: [],
      hash: '0x2afb48eb9d0bc24d90ffd94ed928f15e79c06d1724ac0b0009084ce51345ffe1',
      v: 0,
      r: '0x76a2bd13273148f880d675aaf7cd548bfea778be35fb028c0ea0dbf30b3c40df',
      s: '0x434fce7f47d7269daa8d12439043e077036f47decacc6c5f3f1c70aeed6b6b31',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="6262da7e-c6d3-4432-b5cb-ac0221c13fb7" class="cell code"
execution_count="10">

``` typescript
const setContractInChildTx = await tunnelChildInst.setPolymorphContract(
           POLY_CHILD_ADDRESS, {gasLimit : utils.hexlify(gasLimit)
        });
```

</div>

<div id="fbd7911c-7192-4e74-81aa-688f5a8a3eff" class="cell code"
execution_count="11" tags="[]">

``` typescript
setContractInChildTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 42,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x05d210770c', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x100000', _isBigNumber: true },
      to: '0xD43e3ecCe4430dE35bb01461dB8474CBf3CCd917',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xc8509ec20000000000000000000000002d16c6825d2377b2b87d378f359130b17c727367',
      accessList: [],
      hash: '0xa22add7b0c993dcf0fb3107156245d2a7e89d717b8302117df6e0fcd28d3ea68',
      v: 1,
      r: '0x8e58cf277a0630f3ba041167f3ff1927782c9a02dbe3fbe07faf3c28caf54f38',
      s: '0x772965d301be141bc9e6af35b4b6c93e334ee66953324f7d6cbd6430caa87e52',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="c6dc7592-167f-46ef-a6bf-00ef8182a57f" class="cell markdown">

### Whitelist Bridge Addresses

</div>

<div id="2628f8d2-721f-4df2-8c17-d0ac5a844de6" class="cell code"
execution_count="12">

``` typescript
const whiteListTx = await polyRootInst.whitelistBridgeAddress(ROOT_TUNNEL_ADDRESS, true);
```

</div>

<div id="7375fe6a-e95a-45d5-9d9c-3ef0f64fb374" class="cell code"
execution_count="13" tags="[]">

``` typescript
whiteListTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 29,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f912', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xb53e', _isBigNumber: true },
      to: '0x764bADa71B2B7a03a7a7Ae2615c88a514664d6a0',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xab39a3c8000000000000000000000000e5f5d0a68a215110fc0803d87d44253ee5382f6c0000000000000000000000000000000000000000000000000000000000000001',
      accessList: [],
      hash: '0x0c441ca1a6fdab9b1d37909dabe03121ef9f397ac1b26434c111c03f6a5337c2',
      v: 1,
      r: '0x3c8395921ad854375339549c17b672bc0c0da676573ddd287cd06d83f5bd7173',
      s: '0x208871e901290fa9c9a5c315f27a0b8c46a7b696333783e0130a8333dd6dea1c',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="72ef9a6d-a94d-4e05-b3f7-6581bbb717b1" class="cell code"
execution_count="14">

``` typescript
const whiteListTx = await polyChildInst.whitelistBridgeAddress(CHILD_TUNNEL_ADDRESS, true);
```

</div>

<div id="0013f928-7289-46e0-befd-323b8b3ebb65" class="cell code"
execution_count="15" tags="[]">

``` typescript
whiteListTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 43,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x03fdc41606', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xb543', _isBigNumber: true },
      to: '0x2d16C6825D2377b2B87D378F359130B17C727367',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xab39a3c8000000000000000000000000d43e3ecce4430de35bb01461db8474cbf3ccd9170000000000000000000000000000000000000000000000000000000000000001',
      accessList: [],
      hash: '0xb50fee26cc2fa16fd5951c73640f66061982a0fde84ae8dceac71d85b40d2bbd',
      v: 0,
      r: '0xfa7d96ba7420f1cfe90af7b0edef2d843e80095df7078f97eb6194ba95dbf776',
      s: '0x04352d85da4ee1821cd1854a3b2adca743d7488801c2d5fd6185d19f9b727385',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="646f95f0-acff-4e38-8938-b010b7050050" class="cell markdown">

### Link both tunnels each other

</div>

<div id="926d5507-ecad-4cce-8e5f-1413198714ed" class="cell code"
execution_count="16">

``` typescript
const setFxChildTunnelTx = await tunnelRootInst.setFxChildTunnel(CHILD_TUNNEL_ADDRESS);
```

</div>

<div id="a550a130-213a-4220-b2db-3e7c07fd8fa6" class="cell code"
execution_count="17" tags="[]">

``` typescript
setFxChildTunnelTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 30,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f912', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xac5c', _isBigNumber: true },
      to: '0xE5F5D0a68A215110Fc0803d87D44253Ee5382f6c',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xaea4e49e000000000000000000000000d43e3ecce4430de35bb01461db8474cbf3ccd917',
      accessList: [],
      hash: '0xacaf984434997dcedd46a3fab6e4af16528c4efa308d8f0ec74969af49a51a8d',
      v: 0,
      r: '0x363602b22e91785cd40dda511664b65652624fd2969470e132f1107daa74f12c',
      s: '0x7fde6e338bb9cf08b4ee074e75c2006059d31002845ef3e8394f023f95f72e73',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="be021571-e0b5-4873-a9ac-fed1f891b395" class="cell code"
execution_count="18">

``` typescript
const setFxRootTunnelTx = await tunnelChildInst.setFxRootTunnel(ROOT_TUNNEL_ADDRESS);
```

</div>

<div id="eda4f8db-68a1-4676-a401-61449c04ae63" class="cell code"
execution_count="19" tags="[]">

``` typescript
setFxRootTunnelTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 44,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x042fbe651e', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xac03', _isBigNumber: true },
      to: '0xD43e3ecCe4430dE35bb01461dB8474CBf3CCd917',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0x88837094000000000000000000000000e5f5d0a68a215110fc0803d87d44253ee5382f6c',
      accessList: [],
      hash: '0x4cdbdf499fd44de8444b6bbbc49dd89003b3d39e1dc64e9c0ae081095c3350cc',
      v: 0,
      r: '0xb9d4b96877a1a0b2873a9bf31e2e905fe411c75978e107afab2c2980d6dbdb6f',
      s: '0x1c42e3076db29a9126f6075e3c9c52b7c9d6e8c8d7d9a3a4670d014344cc98fe',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="30510276-da0b-40e9-812b-faf09d69d8ea" class="cell markdown">

## Mint NFTs to PolymorphRoot Contract

</div>

<div id="e0369e9b-c643-49c1-9b73-6d0769e522a4" class="cell code"
execution_count="20">

``` typescript
const tokensToBuyAmount = 3;
```

</div>

<div id="34c85fb1-37cc-4bf7-963b-91db208cfe95" class="cell code"
execution_count="21">

``` typescript
const bulkBuyTx = await polyRootInst.bulkBuy(tokensToBuyAmount, {value: utils.parseEther("0.06")}); // excess will be returned
```

</div>

<div id="03b469b7-dd55-4ded-b871-6767043c9acb" class="cell code"
execution_count="22" tags="[]">

``` typescript
bulkBuyTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 31,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f914', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x07eb6f', _isBigNumber: true },
      to: '0x764bADa71B2B7a03a7a7Ae2615c88a514664d6a0',
      value: BigNumber { _hex: '0xd529ae9e860000', _isBigNumber: true },
      data: '0xd5a83d3e0000000000000000000000000000000000000000000000000000000000000003',
      accessList: [],
      hash: '0x255092a1d8689c87ffeaba064b5c21f8e4a156f9a14e354da3756a888024a26e',
      v: 1,
      r: '0xa81f781bc88a62e7925b2474e54e14321ade1aaecc2ad01be3b2867edc8350e9',
      s: '0x5337fed373dc044909349308cfab068bec00cf27c95650f520f28072b9134f08',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="128b88d1-7687-4a78-8611-74e65b192b7d" class="cell code"
execution_count="11">

``` typescript
const lastTokenId = await polyRootInst.lastTokenId();
```

</div>

<div id="c9b7fac4-45ff-425d-b0e3-5aa5da7e8cdd" class="cell code"
execution_count="12">

``` typescript
lastTokenId
```

<div class="output stream stdout">

    BigNumber { _hex: '0x03', _isBigNumber: true }

</div>

</div>

<div id="26df523d-5b75-4281-a2f2-07a14888e64f" class="cell code"
execution_count="24">

``` typescript
const geneOfLastTokenId = await polyRootInst.geneOf(lastTokenId.toNumber());
```

</div>

<div id="08bc1639-2e27-4db5-b36e-a6b79087c9af" class="cell code"
execution_count="26">

``` typescript
geneOfLastTokenId
```

<div class="output stream stdout">

    BigNumber {
      _hex: '0x9f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6d3e37f4644',
      _isBigNumber: true
    }

</div>

</div>

<div id="d97164b2-29fa-4eed-9745-e566e49da7d3" class="cell markdown">

## Approve RootTunnel to manage an NFT

</div>

<div id="323e40f7-844d-4619-b037-d1b3fcf61e22" class="cell code"
execution_count="33">

``` typescript
// Approve NFT #3 (last token)
const approveTx = await polyRootInst.approve(ROOT_TUNNEL_ADDRESS, lastTokenId.toNumber());
```

</div>

<div id="68fe1227-6262-4a8d-b8f1-a50947f5bccf" class="cell code"
execution_count="34" tags="[]">

``` typescript
approveTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 32,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f910', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xbe90', _isBigNumber: true },
      to: '0x764bADa71B2B7a03a7a7Ae2615c88a514664d6a0',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0x095ea7b3000000000000000000000000e5f5d0a68a215110fc0803d87d44253ee5382f6c0000000000000000000000000000000000000000000000000000000000000003',
      accessList: [],
      hash: '0xc9390a2e466a2b61eb10a73ad62fae2802b39bcff680d22965cbdbee4886fc63',
      v: 1,
      r: '0x05877cf09b490c0c7060aaf96be55bd63537e10d07e2e7e92340db7fffc463df',
      s: '0x0d9d4adb4bd82bebdee7d8acaa82b6e3c46386f36714e1b1c57b5e849e328bcc',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="12051095-59d4-4ed2-924a-b89000c3aa6d" class="cell markdown">

## MoveThroughWormHole Transaction

</div>

<div id="bd3882a8-3d01-4d3a-a250-53eec020dac8" class="cell code"
execution_count="35">

``` typescript
const moveThroughWormHoleTx = await tunnelRootInst.moveThroughWormhole(lastTokenId.toNumber(), {gasLimit : utils.hexlify(gasLimit)});
```

</div>

<div id="ed9724f8-fdd6-4754-b7f5-30e09a925d7d" class="cell code"
execution_count="36">

``` typescript
moveThroughWormHoleTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 33,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f910', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x100000', _isBigNumber: true },
      to: '0xE5F5D0a68A215110Fc0803d87D44253Ee5382f6c',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xaf57513f0000000000000000000000000000000000000000000000000000000000000003',
      accessList: [],
      hash: '0x98ca7bc985eaf0bec42c39a3f530ecdab6c8e4707cbd3a3bba231cbbd472aca9',
      v: 1,
      r: '0x4e62717fb7e8027c272ea8edd0d0b281233cbfacfcf121d481af793e455244e6',
      s: '0x79befb8d237c75f34625b7c9db8f75413aa18c101eaf8e6f13153ee923f1924c',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="be506a8f-7163-46ff-9de9-0e9d8c406755" class="cell markdown">

-   At this point, ownership of the token should be transferred to the
    Root Tunnel Contract. Let's check:

</div>

<div id="8968d5f2-7f2f-42b9-ba47-bf024e887c24" class="cell code"
execution_count="37">

``` typescript
const ownerOfLastTokenId = await polyRootInst.ownerOf(lastTokenId.toNumber());
```

</div>

<div id="3c2920c7-18f1-4f57-9f5f-40c689653d94" class="cell code"
execution_count="39">

``` typescript
ownerOfLastTokenId === ROOT_TUNNEL_ADDRESS
```

<div class="output stream stdout">

    true

</div>

</div>

<div id="660cd63f-0d0f-4800-83ae-76f788498633" class="cell markdown">

-   Now the validation of the moveThroughWormohole transaction can take
    up to 20 minutes.

</div>

<div id="1048cb7d-80f5-4a58-9525-04993411f1cb" class="cell markdown">

## Check the gene of the bridged NFT

</div>

<div id="f726ee6d-d679-4499-a90b-d517f484180c" class="cell code"
execution_count="40">

``` typescript
const bridgedGeneLastToken = await polyChildInst.geneOf(lastTokenId.toNumber());
```

</div>

<div id="2368c9ce-5858-4a47-9beb-f9711c088e7f" class="cell code"
execution_count="41">

``` typescript
bridgedGeneLastToken
```

<div class="output stream stdout">

    BigNumber {
      _hex: '0x9f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6d3e37f4644',
      _isBigNumber: true
    }

</div>

</div>

<div id="e32945de-f3e0-4929-bd48-2ab9cc8b109a" class="cell code"
execution_count="44">

``` typescript
bridgedGeneLastToken._hex === geneOfLastTokenId._hex
```

<div class="output stream stdout">

    true

</div>

</div>

<div id="4f5f6448-9c42-4a1a-b8a0-ab940622b458" class="cell code"
execution_count="46">

``` typescript
const isBridgedNFTVirgin = await polyChildInst.isNotVirgin(lastTokenId.toNumber());
```

</div>

<div id="cbd33687-e193-4eea-8cd7-27346c37a927" class="cell code"
execution_count="49">

``` typescript
!isBridgedNFTVirgin // reverting because the function is 'isNotVirgin'
```

<div class="output stream stdout">

    true

</div>

</div>

<div id="7508620d-6b3a-480c-8803-19b3c7d4de4e" class="cell markdown">

## Conclusion

-   Successfully bridged the token with no loss of information!

</div>

<div id="88c9b9ee-78b4-4c5e-add2-c16dbf9e46ed" class="cell markdown">

# Polygon -\> Ethereum Steps

</div>

<div id="8d386472-c494-4dfe-b86c-5d28f586abb8" class="cell markdown">

-   Note: If a user wants to morph/randomize the genome of his token on
    Polygon, he should pay the exact value of how much the same action
    is worth on Ethereum network because 1 MATIC != 1 ETH. That's why
    Wrapped ETH is used on Polygon.

-   The payment is made directly to the DAO Address. This means that it
    is mandatory the user to approve the DAO address to spend the
    desired amount of tokens on this wrapped ETH contract. Otherwise
    morphing/randomizing transcations will fail on Polygon.

0\) Set the payment Wrapped Token (call the setMaticWETHContract()
function on PolymorphChild

1\) Approve ChildTunnel contract to manage the NFT

2\) Execute moveThroughWormhole Transaction - Copy its txHash 3) Execute
`node scripts/burnProof.js txHash` to generate a proof that
moveThroughWormhole transacation happened on Polygon

4\) Call receiveMessage(proof) on `polymorphRootTunnel` with the
generated proof

</div>

<div id="21ca64d0-89aa-4f0d-91c7-6d5b1a5c73a7" class="cell markdown">

### Set the Wrapped Eth Address

</div>

<div id="a1d72a28-73eb-402b-b01a-71b25daffebb" class="cell code"
execution_count="12">

``` typescript
const setWrappedETHAddressTx = await polyChildInst.setMaticWETHContract(TEST_ERC_20_ADDRESS);
```

</div>

<div id="48f23984-c145-4c34-881f-09cfc6decb0c" class="cell code"
execution_count="13">

``` typescript
setWrappedETHAddressTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 45,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x04cf79a944', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xb461', _isBigNumber: true },
      to: '0x2d16C6825D2377b2B87D378F359130B17C727367',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0x87087e61000000000000000000000000a2d7431aa391d1814516449b32b01735590fdec1',
      accessList: [],
      hash: '0x78b0b9960136818358f0ff67b438184e5f5600ab5f05fee77c86bd67feba3ef8',
      v: 0,
      r: '0xd82a243e4d03afb3c04eace525f515b21ec7442e9e92910c830fcfeb1cb29f22',
      s: '0x74c45f072401f90ba0502becebdaf31e7e7f78f6dd6fc40881c117b1bcabd798',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="05c18586-6ba1-4b68-9274-9dc99b65728c" class="cell markdown">

### Morph a gene

-   so then we can test whether the bridge would return it to Ethereum
    with the new information.

</div>

<div id="394577e1-05ef-4235-99d7-a6e64517e197" class="cell code"
execution_count="16">

``` typescript
const genePosition = 5;
```

</div>

<div id="db233c4b-c0ef-486f-ac30-189e82027c77" class="cell code"
execution_count="20">

``` typescript
const morphAGeneInPolygon = await polyChildInst.morphGene(lastTokenId.toNumber(), genePosition, {value: utils.parseEther("0.2")});
```

</div>

<div id="261ad07f-1dbd-467f-83b9-1683d35e818b" class="cell code"
execution_count="21">

``` typescript
morphAGeneInPolygon
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 48,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x02b2da4ec4', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x01e4e2', _isBigNumber: true },
      to: '0x2d16C6825D2377b2B87D378F359130B17C727367',
      value: BigNumber { _hex: '0x02c68af0bb140000', _isBigNumber: true },
      data: '0x56a5c92600000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000005',
      accessList: [],
      hash: '0x876421cb5fd63f6a3fdd25dd5f796935ff4f1a5742e09ffc6d718e015dad52b8',
      v: 1,
      r: '0x00f3de69f2b3ed78e979ded896af86fc3c139ff3b7f37a5be4d387cf4af255d1',
      s: '0x1b35765bf960e2937b2b22fce1eed7981bcd641d8fda71bff14ab33f431b26d2',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="a9d421ef-ae46-4ba3-87a4-8ab7dec7cd06" class="cell markdown">

-   Check the gene whether it's morphed

</div>

<div id="f8cb48d9-abd4-49be-9221-bdb2ee848dd1" class="cell code"
execution_count="15">

``` typescript
const morphedGene = await polyChildInst.geneOf(lastTokenId.toNumber());
```

</div>

<div id="f876f829-00df-4233-a3e3-32d8f4997af0" class="cell code"
execution_count="16">

``` typescript
morphedGene._hex
```

<div class="output stream stdout">

    0x9f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba44

</div>

</div>

<div id="1af38835-9cc7-462d-83db-d79468063227" class="cell code"
execution_count="26">

``` typescript
geneOfLastTokenId._hex
```

<div class="output stream stdout">

    0x9f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6d3e37f4644

</div>

</div>

<div id="432f45b4-a9fc-4777-aa3f-05d552d29310" class="cell code"
execution_count="27">

``` typescript
morphedGene._hex === geneOfLastTokenId._hex
```

<div class="output stream stdout">

    false

</div>

</div>

<div id="f64d89a6-e989-40d7-8d50-aefc5ad2d9d2" class="cell markdown">

-   as we can see, genes differ, so we have morphed it successfully ;)

</div>

<div id="906ae8ab-9099-4c2d-b344-79762279fcf7" class="cell markdown">

### Approve PolymorphChildTunnel to manage the NFT

</div>

<div id="9fc1c2f8-cd81-4a8d-ab30-7332769c1666" class="cell code"
execution_count="29">

``` typescript
const approveTx = await polyChildInst.approve(CHILD_TUNNEL_ADDRESS, lastTokenId.toNumber());
```

</div>

<div id="41bfd8fb-e682-49fe-a6be-6ef2a3f624c6" class="cell code"
execution_count="30">

``` typescript
approveTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 49,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x04294a5582', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xbeac', _isBigNumber: true },
      to: '0x2d16C6825D2377b2B87D378F359130B17C727367',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0x095ea7b3000000000000000000000000d43e3ecce4430de35bb01461db8474cbf3ccd9170000000000000000000000000000000000000000000000000000000000000003',
      accessList: [],
      hash: '0x6a15c458ee58646a06a6231fe4f6b57a947eb6a4615a6a3713679e663f555e60',
      v: 0,
      r: '0x6b59c6bfd7a06bf5b52660ed972e2f76c71dca92d8a2ef6ec7f5d107078e26c0',
      s: '0x3a21f81149d7d19747ed6b2718ac814c11018264af431f9f01ba6a42fcf05aad',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="9fe5bbc6-2063-49cd-8735-de611f37707c" class="cell markdown">

### MoveThroughWormHole tx

</div>

<div id="81d7693c-b27b-46c0-bfe6-83f4aec078dc" class="cell code"
execution_count="31">

``` typescript
const moveThroughWormHoleBackTx = await tunnelChildInst.moveThroughWormhole(lastTokenId.toNumber());
```

</div>

<div id="6de94829-2362-49da-a604-ab42a8fcf1d5" class="cell code"
execution_count="3">

``` typescript
moveThroughWormHoleBackTx
```

<div class="output stream stderr">

    1:1 - Cannot find name 'moveThroughWormHoleBackTx'.

</div>

</div>

<div id="bc6d4194-ff42-4898-980b-978ec5e5550e" class="cell markdown">

-   copy tx hash

</div>

<div id="0f5de6c4-b49d-44d0-b35d-428cea0f6aa8" class="cell code"
execution_count="2">

``` typescript
const bridgeBackHash = moveThroughWormHoleBackTx.hash;
```

<div class="output stream stderr">

    1:24 - Cannot find name 'moveThroughWormHoleBackTx'.

</div>

</div>

<div id="4079b2f5-aed3-4940-812b-fceea20f5cf6" class="cell code"
execution_count="1">

``` typescript
bridgeBackHash
```

<div class="output stream stderr">

    1:1 - Cannot find name 'bridgeBackHash'.

</div>

</div>

<div id="e4f4bdf2-95cb-481a-b4fd-0431914838d7" class="cell markdown">

### Generate proof

-   Switch the kernel to Python3 in order to execute the next command as
    tslab does not support it(?).

-   Note: it's possible for the transaction to take a while before
    checkpointed.

</div>

<div id="da972a39-ab4b-490a-bdc2-04f3004c96c5" class="cell code"
execution_count="17">

``` typescript
!node ../scripts/burnProof.js "0x08d051ac476d42b728e1ffa4380c8af9fc36c8ac840cebcb0636e4749e81d6c8"
```

<div class="output stream stdout">

    init called ABIManager { networkName: 'testnet', version: 'mumbai' }
    args method [Arguments] { '0': 'getLastChildBlock' }
    sending tx with config undefined
    Is Checkpointed:  true
    args method [Arguments] { '0': 'getLastChildBlock' }
    sending tx with config undefined
    args method [Arguments] { '0': 'currentHeaderBlock' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '359680000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '539520000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '629440000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '674400000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '696880000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '708120000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '713740000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '716550000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '717960000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '718660000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '719010000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '719190000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '719100000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '719050000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '719030000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '0x2adb86f0' }
    sending tx with config undefined
    0xf90f37842adb86f0b90100c13adae1fb747d5decca3202c5024e3cbb8e68160a2fca91eb2997634695bd60ce9dbd9cf930c681a5efa75a3a62eb09746c8708f92846ea9bc3177bd40c6bdf2565bbdb0e9fbb894ad252bb1a1990de0d2576441beb60d505aca71c27ff88fbb3a7d7ebb0fc8e552fd576b7f98a561c6e20b5395de0da5801987e6ddfedd72a8d7a0352107853deb5d6997057df7c3125d0a9feb28e8fe802cf7265576c54d1e3ca662e33585cc455cdda71123cbe28ccac9fb5c616caaf4b39f9ae2b566a5e9333586d6ca57c47c4885fa75d8a3a19da3891a890ac12365ec22c1a092d0454b58bec69492875a9869c38777a6c30206e09650f2307fcbfb75623ab55672cce840187291784623b442ba0dc4aa166a4d91c204c10468014325c72306b97f2f973cac8ffad10deb454b3d0a057c47be28efa80d1b5875157bc4d3392573f577e3d27c86358d4faef36377fedb9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208fb90855f90852f8b1a0d53ff64da7f3e9922d4df9d070bc6adf20099324e6969b79ab6e7f67f79b2882a044c9b41771d7bf4d369de422cbe97a17f52ff9c551100f3cc062dcf846152b27a0dc4006dc44ac50d5873ad9776c4ea17ed72c4d9ed39f6295295db15d3368ab77a007f752f67b510fe532ed0f8660cbb0e03e4bc34f72268b269d91f1df7fd70a4480808080a017287050d3a9fe69336a98a6837cbe5d051eaf6a12a6720ebff7de3bab4e73bf8080808080808080f90211a0f44380fc79e13ebd734bce4fb2b1c69304ebc309e97661036626e7ef78f5c1b4a0506f829a1c0bf6429aec66698fc98dab3c0a7530afbec99b6008546ec99e38eba0ea6fe3f302fe4141a4b1b2d874089f6305fb7f947ddb9c130a89806f50d6ce5da02bf4e7a7bd1c25f990f4686040f71a22a1c3a0e2515f55900889b96b209746b7a0c9c13f7880b971ba6a882c0f7908536107ce068df61f846c275e05d1825735ffa0f3979f8334c7fda7575856b48bfb74582346346382a025f278008f19ec2af427a0645228303b295734fb3078790a012b497b7bfa7ed98d08c97bea2a736097c2e6a057ad46b22e1c165cee617093d9568003739f30c09ffa7026f31203fbf484543fa04703b98334fbda27243d604af674928da9308f1faf92f088f81c6f7aad1f59bca09cc5064c0f3e635083d4f45e7ae83da317dff3faffa3800f47994692f2fa7360a0661e5bd7e12c7df4898c92b8ad97cd71e0a5c9efe88b2cd210870287537c5bb4a090449e79f90e5831d3a4a5239d927644b1ab67482c8db39b26f845b9c53aee95a077e7097450ef4b253d8701a971a49f0ab0aa147a5b7bfd0faf4d931522bc5b68a058d08a8e9220f913aeeb183bd2ba970a9ca1bca7a12b503eb1a1d07015e4b7aca04695fd44f324977ea30208cb29778da0074b6d0c092873995e10a9f89b9ad18ca04a8784941d02a389cbf2964ecac10c2a0f08110eed7c7ac20155005e17cc0efc80f9058820b9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208f82002903

</div>

</div>

<div id="32f7b275-f58c-46a7-a6cd-dc8347537c7e" class="cell code"
execution_count="1">

``` typescript
const proof = "0xf90f37842adb86f0b90100c13adae1fb747d5decca3202c5024e3cbb8e68160a2fca91eb2997634695bd60ce9dbd9cf930c681a5efa75a3a62eb09746c8708f92846ea9bc3177bd40c6bdf2565bbdb0e9fbb894ad252bb1a1990de0d2576441beb60d505aca71c27ff88fbb3a7d7ebb0fc8e552fd576b7f98a561c6e20b5395de0da5801987e6ddfedd72a8d7a0352107853deb5d6997057df7c3125d0a9feb28e8fe802cf7265576c54d1e3ca662e33585cc455cdda71123cbe28ccac9fb5c616caaf4b39f9ae2b566a5e9333586d6ca57c47c4885fa75d8a3a19da3891a890ac12365ec22c1a092d0454b58bec69492875a9869c38777a6c30206e09650f2307fcbfb75623ab55672cce840187291784623b442ba0dc4aa166a4d91c204c10468014325c72306b97f2f973cac8ffad10deb454b3d0a057c47be28efa80d1b5875157bc4d3392573f577e3d27c86358d4faef36377fedb9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208fb90855f90852f8b1a0d53ff64da7f3e9922d4df9d070bc6adf20099324e6969b79ab6e7f67f79b2882a044c9b41771d7bf4d369de422cbe97a17f52ff9c551100f3cc062dcf846152b27a0dc4006dc44ac50d5873ad9776c4ea17ed72c4d9ed39f6295295db15d3368ab77a007f752f67b510fe532ed0f8660cbb0e03e4bc34f72268b269d91f1df7fd70a4480808080a017287050d3a9fe69336a98a6837cbe5d051eaf6a12a6720ebff7de3bab4e73bf8080808080808080f90211a0f44380fc79e13ebd734bce4fb2b1c69304ebc309e97661036626e7ef78f5c1b4a0506f829a1c0bf6429aec66698fc98dab3c0a7530afbec99b6008546ec99e38eba0ea6fe3f302fe4141a4b1b2d874089f6305fb7f947ddb9c130a89806f50d6ce5da02bf4e7a7bd1c25f990f4686040f71a22a1c3a0e2515f55900889b96b209746b7a0c9c13f7880b971ba6a882c0f7908536107ce068df61f846c275e05d1825735ffa0f3979f8334c7fda7575856b48bfb74582346346382a025f278008f19ec2af427a0645228303b295734fb3078790a012b497b7bfa7ed98d08c97bea2a736097c2e6a057ad46b22e1c165cee617093d9568003739f30c09ffa7026f31203fbf484543fa04703b98334fbda27243d604af674928da9308f1faf92f088f81c6f7aad1f59bca09cc5064c0f3e635083d4f45e7ae83da317dff3faffa3800f47994692f2fa7360a0661e5bd7e12c7df4898c92b8ad97cd71e0a5c9efe88b2cd210870287537c5bb4a090449e79f90e5831d3a4a5239d927644b1ab67482c8db39b26f845b9c53aee95a077e7097450ef4b253d8701a971a49f0ab0aa147a5b7bfd0faf4d931522bc5b68a058d08a8e9220f913aeeb183bd2ba970a9ca1bca7a12b503eb1a1d07015e4b7aca04695fd44f324977ea30208cb29778da0074b6d0c092873995e10a9f89b9ad18ca04a8784941d02a389cbf2964ecac10c2a0f08110eed7c7ac20155005e17cc0efc80f9058820b9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208f82002903";
```

</div>

<div id="9636ac4f-c110-4ae2-8cc6-eef1b571ba48" class="cell markdown">

### Call receiveMessage() with the proof

</div>

<div id="934a48ee-1800-46c5-ae6f-51d4a75e6af4" class="cell code"
execution_count="8">

``` typescript
const receiveMessageFromChildTx = await tunnelRootInst.receiveMessage(proof);
```

<div class="output stream stdout">

    ========= NOTICE =========
    Request-Rate Exceeded  (this message will not be repeated)

    The default API keys for each service are provided as a highly-throttled,
    community resource for low-traffic projects and early prototyping.

    While your application will continue to function, we highly recommended
    signing up for your own API keys to improve performance, increase your
    request rate/limit and enable other perks, such as metrics and advanced APIs.

    For more details: https://docs.ethers.io/api-keys/
    ==========================

</div>

</div>

<div id="c2860d6e-673e-4e71-9961-d3908cc55bb1" class="cell code"
execution_count="9">

``` typescript
receiveMessageFromChildTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 34,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f912', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x06ebcf', _isBigNumber: true },
      to: '0xE5F5D0a68A215110Fc0803d87D44253Ee5382f6c',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xf953cec700000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000f3af90f37842adb86f0b90100c13adae1fb747d5decca3202c5024e3cbb8e68160a2fca91eb2997634695bd60ce9dbd9cf930c681a5efa75a3a62eb09746c8708f92846ea9bc3177bd40c6bdf2565bbdb0e9fbb894ad252bb1a1990de0d2576441beb60d505aca71c27ff88fbb3a7d7ebb0fc8e552fd576b7f98a561c6e20b5395de0da5801987e6ddfedd72a8d7a0352107853deb5d6997057df7c3125d0a9feb28e8fe802cf7265576c54d1e3ca662e33585cc455cdda71123cbe28ccac9fb5c616caaf4b39f9ae2b566a5e9333586d6ca57c47c4885fa75d8a3a19da3891a890ac12365ec22c1a092d0454b58bec69492875a9869c38777a6c30206e09650f2307fcbfb75623ab55672cce840187291784623b442ba0dc4aa166a4d91c204c10468014325c72306b97f2f973cac8ffad10deb454b3d0a057c47be28efa80d1b5875157bc4d3392573f577e3d27c86358d4faef36377fedb9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208fb90855f90852f8b1a0d53ff64da7f3e9922d4df9d070bc6adf20099324e6969b79ab6e7f67f79b2882a044c9b41771d7bf4d369de422cbe97a17f52ff9c551100f3cc062dcf846152b27a0dc4006dc44ac50d5873ad9776c4ea17ed72c4d9ed39f6295295db15d3368ab77a007f752f67b510fe532ed0f8660cbb0e03e4bc34f72268b269d91f1df7fd70a4480808080a017287050d3a9fe69336a98a6837cbe5d051eaf6a12a6720ebff7de3bab4e73bf8080808080808080f90211a0f44380fc79e13ebd734bce4fb2b1c69304ebc309e97661036626e7ef78f5c1b4a0506f829a1c0bf6429aec66698fc98dab3c0a7530afbec99b6008546ec99e38eba0ea6fe3f302fe4141a4b1b2d874089f6305fb7f947ddb9c130a89806f50d6ce5da02bf4e7a7bd1c25f990f4686040f71a22a1c3a0e2515f55900889b96b209746b7a0c9c13f7880b971ba6a882c0f7908536107ce068df61f846c275e05d1825735ffa0f3979f8334c7fda7575856b48bfb74582346346382a025f278008f19ec2af427a0645228303b295734fb3078790a012b497b7bfa7ed98d08c97bea2a736097c2e6a057ad46b22e1c165cee617093d9568003739f30c09ffa7026f31203fbf484543fa04703b98334fbda27243d604af674928da9308f1faf92f088f81c6f7aad1f59bca09cc5064c0f3e635083d4f45e7ae83da317dff3faffa3800f47994692f2fa7360a0661e5bd7e12c7df4898c92b8ad97cd71e0a5c9efe88b2cd210870287537c5bb4a090449e79f90e5831d3a4a5239d927644b1ab67482c8db39b26f845b9c53aee95a077e7097450ef4b253d8701a971a49f0ab0aa147a5b7bfd0faf4d931522bc5b68a058d08a8e9220f913aeeb183bd2ba970a9ca1bca7a12b503eb1a1d07015e4b7aca04695fd44f324977ea30208cb29778da0074b6d0c092873995e10a9f89b9ad18ca04a8784941d02a389cbf2964ecac10c2a0f08110eed7c7ac20155005e17cc0efc80f9058820b9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208f82002903000000000000',
      accessList: [],
      hash: '0xcaeffae90f02b37aaca3d676a47f7ef256b4a25b86f1835a6a478a9461a1b344',
      v: 0,
      r: '0x0c3964bf004e33c4dc8daf1fbb2cd720b2248a0a51986c32178d7c569b15948f',
      s: '0x5353a105f7b73aa911286e5bb7aed61a2fc64ee9f7f6530d76856dfa695a7dba',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="5979646c-86bf-4c35-a3e2-e12bfd4d8b2d" class="cell code"
execution_count="13">

``` typescript
const newGeneOfLastTokenId = await polyRootInst.geneOf(lastTokenId.toNumber());
```

</div>

<div id="78466bcc-1712-4775-8992-7eb843148656" class="cell code"
execution_count="14">

``` typescript
newGeneOfLastTokenId
```

<div class="output stream stdout">

    BigNumber {
      _hex: '0x9f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba44',
      _isBigNumber: true
    }

</div>

</div>

<div id="80c765b3-1163-42ee-8c32-3b40543a5f22" class="cell code"
execution_count="18">

``` typescript
morphedGene._hex === newGeneOfLastTokenId._hex
```

<div class="output stream stdout">

    true

</div>

</div>

<div id="78e5ecd9-cb33-4f75-b99c-74d27476ff76" class="cell markdown">

-   Also, ownership of the NFT should now be the user address

</div>

<div id="f75a0fee-8bed-4074-8fc5-52def806c3f1" class="cell code"
execution_count="19">

``` typescript
const ownerOfLastTokenId = await polyRootInst.ownerOf(lastTokenId.toNumber());
```

</div>

<div id="7aa453f9-4971-462f-a5fd-ecbc38824872" class="cell code"
execution_count="20">

``` typescript
ownerOfLastTokenId
```

<div class="output stream stdout">

    0x8FcE67537676879Bc5a1B86B403400E1614Bfce6

</div>

</div>

<div id="202c51ee-278a-45c0-a68f-6c8a289c6cad" class="cell markdown">

## Conclusion

</div>

<div id="17adc713-0d1b-4acb-807b-8f7bfe46031c" class="cell markdown">

-   Successfully bridged back the morphed NFT with no loss of
    information about the new gene!

</div>
