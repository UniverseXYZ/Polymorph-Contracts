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
execution_count="1">

``` typescript
const env = require('dotenv').config({path:'../.env'});
const { getDefaultProvider, providers, Wallet, Contract, utils } = require("ethers");
```

</div>

<div id="74e9e118-0c87-4d2e-916b-7875d4b1a8df" class="cell markdown">

## Declaring addresses of deployed contracts

</div>

<div id="ad01f6f0-6f07-489a-9574-dd050e6306a5" class="cell code"
execution_count="2">

``` typescript
const POLY_ROOT_ADDRESS = "0x9e950dD2Ac6Cb90D939406e521B3A81C045A5Dc7";

const ROOT_TUNNEL_ADDRESS = "0xC23887Ed467bc6B9dF48d505e3C1A0326d50eA9A";

const POLY_CHILD_ADDRESS = "0x3120E82A86Ff02283670644486FcCd26df305Ebe";

const CHILD_TUNNEL_ADDRESS = "0x86E79AC4a9CC7003Eb8E0EdD5848891aF6A206D0";

const TEST_ERC_20_ADDRESS = "0x4Fb90bc32709d73A5E745B56708C84A6Ad7Ab5C9";
```

</div>

<div id="2e6a71c5-fe79-49e0-93e4-323c68ab50d8" class="cell code"
execution_count="3">

``` typescript
const gasLimit = "0x100000";
```

</div>

<div id="e455d42c-622a-47dd-92b0-917c6dd02c7d" class="cell markdown"
tags="[]">

## Declaring providers and Signers

</div>

<div id="4baabe76-dbb7-4a29-96e7-f6f04e340d5e" class="cell code"
execution_count="4">

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
execution_count="5">

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
execution_count="6">

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
execution_count="7">

``` typescript
const setContractInRootTx = await tunnelRootInst.setPolymorphContract(
           POLY_ROOT_ADDRESS, {gasLimit : utils.hexlify(gasLimit)
        });
```

</div>

<div id="08cf3120-48f2-4f88-adb1-90f5a9f39f06" class="cell code"
execution_count="8" tags="[]">

``` typescript
setContractInRootTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 46,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f92c', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x100000', _isBigNumber: true },
      to: '0xC23887Ed467bc6B9dF48d505e3C1A0326d50eA9A',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xc8509ec20000000000000000000000009e950dd2ac6cb90d939406e521b3a81c045a5dc7',
      accessList: [],
      hash: '0x892de67ebc49e99ea4d510a4f08e600a7163e48ef7b45e52971d4e3e2d4dd00e',
      v: 0,
      r: '0xa90f32db328177a2224363ab80e2fcee8d7ec442bd248527eab4ea69769e15d0',
      s: '0x47e2a0c34f462499448e9eb02c9033176ea9fbd675ae2d76de55eb71483960b9',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="6262da7e-c6d3-4432-b5cb-ac0221c13fb7" class="cell code"
execution_count="9">

``` typescript
const setContractInChildTx = await tunnelChildInst.setPolymorphContract(
           POLY_CHILD_ADDRESS, {gasLimit : utils.hexlify(gasLimit)
        });
```

</div>

<div id="fbd7911c-7192-4e74-81aa-688f5a8a3eff" class="cell code"
execution_count="10" tags="[]">

``` typescript
setContractInChildTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 58,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x950a536e', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x100000', _isBigNumber: true },
      to: '0x86E79AC4a9CC7003Eb8E0EdD5848891aF6A206D0',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xc8509ec20000000000000000000000003120e82a86ff02283670644486fccd26df305ebe',
      accessList: [],
      hash: '0xd107470f17b878b95277af462af6eef4cc1c618b0ac5a50825100da25ac177c4',
      v: 0,
      r: '0xbb2dcd2aa553b6859287e33c859749afa18c2a1f57a3755e10c72222624e1595',
      s: '0x6b7e684dcffe178fb7570d3da84ee359fb84b032837842ac49db7f9951a9d595',
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
execution_count="11">

``` typescript
const whiteListTx = await polyRootInst.whitelistBridgeAddress(ROOT_TUNNEL_ADDRESS, true);
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

<div id="7375fe6a-e95a-45d5-9d9c-3ef0f64fb374" class="cell code"
execution_count="12" tags="[]">

``` typescript
whiteListTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 47,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f924', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xb57f', _isBigNumber: true },
      to: '0x9e950dD2Ac6Cb90D939406e521B3A81C045A5Dc7',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xab39a3c8000000000000000000000000c23887ed467bc6b9df48d505e3c1a0326d50ea9a0000000000000000000000000000000000000000000000000000000000000001',
      accessList: [],
      hash: '0xc2b178b082d9fb110ceeeb1d563d1b425d6595b9e7b2f6eadcf38c5600fb46f0',
      v: 1,
      r: '0x651be6cf394cfd9f5c33d179acb93e812cc69065e1d5ca67a88a32d6a15146d8',
      s: '0x6c1db5b153be9af726f072ab8fffe9b40679730d4abd4bdbdc9c7daedd499d05',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="72ef9a6d-a94d-4e05-b3f7-6581bbb717b1" class="cell code"
execution_count="13">

``` typescript
const whiteListTx = await polyChildInst.whitelistBridgeAddress(CHILD_TUNNEL_ADDRESS, true);
```

</div>

<div id="0013f928-7289-46e0-befd-323b8b3ebb65" class="cell code"
execution_count="14" tags="[]">

``` typescript
whiteListTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 59,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x95097f36', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xb57e', _isBigNumber: true },
      to: '0x3120E82A86Ff02283670644486FcCd26df305Ebe',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xab39a3c800000000000000000000000086e79ac4a9cc7003eb8e0edd5848891af6a206d00000000000000000000000000000000000000000000000000000000000000001',
      accessList: [],
      hash: '0xb28596c9050046b75a92317e25f541c22e04742a80af2169cc481b70f5763e66',
      v: 1,
      r: '0x0f83ae584afd5cd0ab284656c5d71c1fe52c0e9cc0d8a0ab211925a9396904ab',
      s: '0x76ee9df0e2adb826d0a0269419daeb435c16797bc30484450552a2fa3f8633d8',
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
execution_count="15">

``` typescript
const setFxChildTunnelTx = await tunnelRootInst.setFxChildTunnel(CHILD_TUNNEL_ADDRESS);
```

</div>

<div id="a550a130-213a-4220-b2db-3e7c07fd8fa6" class="cell code"
execution_count="16" tags="[]">

``` typescript
setFxChildTunnelTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 48,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f922', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xac5c', _isBigNumber: true },
      to: '0xC23887Ed467bc6B9dF48d505e3C1A0326d50eA9A',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xaea4e49e00000000000000000000000086e79ac4a9cc7003eb8e0edd5848891af6a206d0',
      accessList: [],
      hash: '0x806bad1d2bfe0779b31d8df92da327a54e729f870a8ed234a563d643eea2b582',
      v: 0,
      r: '0xb4d7e764a8ffb7cc91d9556a5c817a9c1ce87cfd5db57a6bca0756923dc7bd95',
      s: '0x2e0cd57bdd716326569b5013c98180e9e21ab2214bd8a330bbadf7d8ff5578ea',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="be021571-e0b5-4873-a9ac-fed1f891b395" class="cell code"
execution_count="17">

``` typescript
const setFxRootTunnelTx = await tunnelChildInst.setFxRootTunnel(ROOT_TUNNEL_ADDRESS);
```

</div>

<div id="eda4f8db-68a1-4676-a401-61449c04ae63" class="cell code"
execution_count="18" tags="[]">

``` typescript
setFxRootTunnelTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 60,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x950977c8', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xac03', _isBigNumber: true },
      to: '0x86E79AC4a9CC7003Eb8E0EdD5848891aF6A206D0',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0x88837094000000000000000000000000c23887ed467bc6b9df48d505e3c1a0326d50ea9a',
      accessList: [],
      hash: '0x62e11213838c0d4c818d4d8ad6af38bbca61cf2d743b9c03bd3de9c67de2ae9f',
      v: 1,
      r: '0xc1dd0463b5f3f3a5c5447bc98155c35c843a0e09f16cd771d8d04aff85b20b0f',
      s: '0x72921d3e98de88fba3f7f26de8e800833e931da139db708ea10a3d42a80b12f2',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="30510276-da0b-40e9-812b-faf09d69d8ea" class="cell markdown">

## Mint NFTs to PolymorphRoot Contract

</div>

<div id="473c4bd9-5db5-459d-9fb6-d2c536df5f76" class="cell markdown">

`Note:`

-   Since this is a V2 burnToMint version of the contracts,
    start_token_id=10000 and total_supply=10000 too.
-   If we now want to mint new tokens, tx will revert with
    `total supply reached`
-   That's why DAO needs to vote on new totalSupply amount

</div>

<div id="a46adccf-63e9-499c-8fbe-891e30f42180" class="cell code"
execution_count="26">

``` typescript
const newMaxSupply = 10500;
```

</div>

<div id="f0bc9501-d83e-47f6-874d-0d82c8bb847b" class="cell code"
execution_count="27">

``` typescript
const daoTotalSupplyVote = await polyRootInst.setMaxSupply(newMaxSupply, {gasLimit : utils.hexlify(gasLimit)});
```

</div>

<div id="7af00361-0b85-43c4-b436-8214d1ca729c" class="cell code"
execution_count="28">

``` typescript
daoTotalSupplyVote
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 50,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f910', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x100000', _isBigNumber: true },
      to: '0x9e950dD2Ac6Cb90D939406e521B3A81C045A5Dc7',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0x6f8b44b00000000000000000000000000000000000000000000000000000000000002904',
      accessList: [],
      hash: '0xd54b570a78bce1ed0ab7f4419ef0615dedbfc0a5c2cd23091388a03bee5e3f98',
      v: 1,
      r: '0xdf6afccb53c2777f3a7fc562a8eccbb1a3dfcf4fa44e598dc6ec8084ee5d9024',
      s: '0x04809c4f6804b3a45448ae23d64f11d79f3d1be2d20f17c79083bce059467eba',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="e0369e9b-c643-49c1-9b73-6d0769e522a4" class="cell code"
execution_count="19">

``` typescript
const tokensToBuyAmount = 3;
```

</div>

<div id="34c85fb1-37cc-4bf7-963b-91db208cfe95" class="cell code"
execution_count="29">

``` typescript
const bulkBuyTx = await polyRootInst.bulkBuy(tokensToBuyAmount, {value: utils.parseEther("0.06"), gasLimit : utils.hexlify(gasLimit)}); // excess will be returned
```

</div>

<div id="03b469b7-dd55-4ded-b871-6767043c9acb" class="cell code"
execution_count="30" tags="[]">

``` typescript
bulkBuyTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 51,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f910', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x100000', _isBigNumber: true },
      to: '0x9e950dD2Ac6Cb90D939406e521B3A81C045A5Dc7',
      value: BigNumber { _hex: '0xd529ae9e860000', _isBigNumber: true },
      data: '0xd5a83d3e0000000000000000000000000000000000000000000000000000000000000003',
      accessList: [],
      hash: '0x0533d51c51e65ae8566ebdbabf18054ee63817d74ae647e63d303f8bdab32be6',
      v: 0,
      r: '0xd33b773395d3330548fc9289d291a16671aafd98f01ab4e225b8353604e4c957',
      s: '0x0f23aa54113354f00bf8c66da0e512e7523a6d79f4d5d3ed22e78a2c275b4c8f',
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

    BigNumber { _hex: '0x2713', _isBigNumber: true }

</div>

</div>

<div id="dec96c79-3b27-4227-baaf-c21d805ce05f" class="cell code"
execution_count="34">

``` typescript
// Should be 10003
lastTokenId.toNumber()
```

<div class="output stream stdout">

    10003

</div>

</div>

<div id="26df523d-5b75-4281-a2f2-07a14888e64f" class="cell code"
execution_count="35">

``` typescript
const geneOfLastTokenId = await polyRootInst.geneOf(lastTokenId.toNumber());
```

</div>

<div id="08bc1639-2e27-4db5-b36e-a6b79087c9af" class="cell code"
execution_count="41">

``` typescript
geneOfLastTokenId
```

<div class="output stream stdout">

    BigNumber {
      _hex: '0x570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab9781f16b1737e',
      _isBigNumber: true
    }

</div>

</div>

<div id="d97164b2-29fa-4eed-9745-e566e49da7d3" class="cell markdown">

## Approve RootTunnel to manage an NFT

</div>

<div id="323e40f7-844d-4619-b037-d1b3fcf61e22" class="cell code"
execution_count="42">

``` typescript
// Approve NFT #10003 (last token)
const approveTx = await polyRootInst.approve(ROOT_TUNNEL_ADDRESS, lastTokenId.toNumber());
```

</div>

<div id="68fe1227-6262-4a8d-b8f1-a50947f5bccf" class="cell code"
execution_count="43" tags="[]">

``` typescript
approveTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 52,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f910', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xbe99', _isBigNumber: true },
      to: '0x9e950dD2Ac6Cb90D939406e521B3A81C045A5Dc7',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0x095ea7b3000000000000000000000000c23887ed467bc6b9df48d505e3c1a0326d50ea9a0000000000000000000000000000000000000000000000000000000000002713',
      accessList: [],
      hash: '0xfa5d7474ef0f8886a2207617ad8dc0b1ff9dc8128749f7a17ddffd33ffe61b0d',
      v: 0,
      r: '0xb6eff5032b232c6cf2bb1d2c65a790549041c1a17621665b717609cbc08a1852',
      s: '0x5eb0363cd910764507b07b23575aea2ce92ff2f3649ea988fbc063afcf5c7793',
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
execution_count="44">

``` typescript
const moveThroughWormHoleTx = await tunnelRootInst.moveThroughWormhole(lastTokenId.toNumber(), {gasLimit : utils.hexlify(gasLimit)});
```

</div>

<div id="ed9724f8-fdd6-4754-b7f5-30e09a925d7d" class="cell code"
execution_count="45">

``` typescript
moveThroughWormHoleTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 5,
      nonce: 53,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f910', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x100000', _isBigNumber: true },
      to: '0xC23887Ed467bc6B9dF48d505e3C1A0326d50eA9A',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xaf57513f0000000000000000000000000000000000000000000000000000000000002713',
      accessList: [],
      hash: '0x257c285a427db3a5864b0ead80ea38a3bf8617bd746ba87f3f636ddccd40fa97',
      v: 0,
      r: '0x93445beb087ff2f31f5e1cde86a792d189c4edb8593c4fa1054275bcb24e7d1e',
      s: '0x5f8f51516cf26117f77015ce218c3cf90e7ddd88add98aba50f071a33949b9ee',
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
execution_count="46">

``` typescript
const ownerOfLastTokenId = await polyRootInst.ownerOf(lastTokenId.toNumber());
```

</div>

<div id="3c2920c7-18f1-4f57-9f5f-40c689653d94" class="cell code"
execution_count="47">

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
execution_count="48">

``` typescript
const bridgedGeneLastToken = await polyChildInst.geneOf(lastTokenId.toNumber());
```

</div>

<div id="2368c9ce-5858-4a47-9beb-f9711c088e7f" class="cell code"
execution_count="49">

``` typescript
bridgedGeneLastToken
```

<div class="output stream stdout">

    BigNumber {
      _hex: '0x570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab9781f16b1737e',
      _isBigNumber: true
    }

</div>

</div>

<div id="e32945de-f3e0-4929-bd48-2ab9cc8b109a" class="cell code"
execution_count="50">

``` typescript
bridgedGeneLastToken._hex === geneOfLastTokenId._hex
```

<div class="output stream stdout">

    true

</div>

</div>

<div id="4f5f6448-9c42-4a1a-b8a0-ab940622b458" class="cell code"
execution_count="51">

``` typescript
const isBridgedNFTVirgin = await polyChildInst.isNotVirgin(lastTokenId.toNumber());
```

</div>

<div id="cbd33687-e193-4eea-8cd7-27346c37a927" class="cell code"
execution_count="52">

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

-   The payment is made directly to the DAO Address. It is mandatory the
    user to approve the PolymorphChild address to spend the desired
    amount of tokens on this wrapped ETH contract. Otherwise
    morphing/randomizing transcations will fail on Polygon.

1\) Approve ChildTunnel contract to manage the NFT

2\) Execute moveThroughWormhole Transaction - Copy its txHash 3) Execute
`node scripts/burnProof.js txHash` to generate a proof that
moveThroughWormhole transacation happened on Polygon

4\) Call receiveMessage(proof) on `polymorphRootTunnel` with the
generated proof

</div>

<div id="faa7d80a-9243-496a-9a0d-8b46da85a348" class="cell code"
execution_count="53">

``` typescript
const maticWethAddress = await polyChildInst.maticWETH();
```

</div>

<div id="6e11828e-3f41-43a1-ade9-9e057812ef96" class="cell code"
execution_count="55">

``` typescript
maticWethAddress
```

<div class="output stream stdout">

    0x4Fb90bc32709d73A5E745B56708C84A6Ad7Ab5C9

</div>

</div>

<div id="05c18586-6ba1-4b68-9274-9dc99b65728c" class="cell markdown">

### Morph a gene

-   so then we can test whether the bridge would return it to Ethereum
    with the new information.

</div>

<div id="394577e1-05ef-4235-99d7-a6e64517e197" class="cell code"
execution_count="56">

``` typescript
const genePosition = 5;
```

</div>

<div id="db233c4b-c0ef-486f-ac30-189e82027c77" class="cell code"
execution_count="57">

``` typescript
const morphAGeneInPolygon = await polyChildInst.morphGene(lastTokenId.toNumber(), genePosition, {value: utils.parseEther("0.2")});
```

</div>

<div id="261ad07f-1dbd-467f-83b9-1683d35e818b" class="cell code"
execution_count="58">

``` typescript
morphAGeneInPolygon
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 62,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x95532f8e', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x01ec06', _isBigNumber: true },
      to: '0x3120E82A86Ff02283670644486FcCd26df305Ebe',
      value: BigNumber { _hex: '0x02c68af0bb140000', _isBigNumber: true },
      data: '0x56a5c92600000000000000000000000000000000000000000000000000000000000027130000000000000000000000000000000000000000000000000000000000000005',
      accessList: [],
      hash: '0xfb95c9b4fa45d0f6564fd33e0dd295765cea8c70f7ca21e17cf16efb54e67c82',
      v: 1,
      r: '0x47ba747c8e9ad8a2afe594f1b79ae57dd118f0fe2eaaf3659986264d18f62b19',
      s: '0x30b68f416de41968627871dcc42db970deaeee6818c072b9981d0ddca211947d',
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

    0x570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e

</div>

</div>

<div id="1af38835-9cc7-462d-83db-d79468063227" class="cell code"
execution_count="61">

``` typescript
geneOfLastTokenId._hex
```

<div class="output stream stdout">

    0x570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab9781f16b1737e

</div>

</div>

<div id="432f45b4-a9fc-4777-aa3f-05d552d29310" class="cell code"
execution_count="62">

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
execution_count="63">

``` typescript
const approveTx = await polyChildInst.approve(CHILD_TUNNEL_ADDRESS, lastTokenId.toNumber());
```

</div>

<div id="41bfd8fb-e682-49fe-a6be-6ef2a3f624c6" class="cell code"
execution_count="64">

``` typescript
approveTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 63,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x951a951e', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0xbeaf', _isBigNumber: true },
      to: '0x3120E82A86Ff02283670644486FcCd26df305Ebe',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0x095ea7b300000000000000000000000086e79ac4a9cc7003eb8e0edd5848891af6a206d00000000000000000000000000000000000000000000000000000000000002713',
      accessList: [],
      hash: '0x6c0f8cd45f5666a4f58a75bada1e7eb52a022496c2da7cbc47ca0b01ebb9c515',
      v: 1,
      r: '0xff7ab50dc884f1cdd83a336d52c050d845b88656f928f8928d949620c3faa950',
      s: '0x0fc4b9a0cfee0c58708f8e85ee8a1e7735c5cdd70f1ecba5c7354434192d7a77',
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
execution_count="65">

``` typescript
const moveThroughWormHoleBackTx = await tunnelChildInst.moveThroughWormhole(lastTokenId.toNumber());
```

</div>

<div id="6de94829-2362-49da-a604-ab42a8fcf1d5" class="cell code"
execution_count="66">

``` typescript
moveThroughWormHoleBackTx
```

<div class="output stream stdout">

    {
      type: 2,
      chainId: 80001,
      nonce: 64,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x951896ba', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x0166a2', _isBigNumber: true },
      to: '0x86E79AC4a9CC7003Eb8E0EdD5848891aF6A206D0',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xaf57513f0000000000000000000000000000000000000000000000000000000000002713',
      accessList: [],
      hash: '0x3c4156a2366893f69de7426eeff3c0021771521b9c1e8bb173cf56040cdf34d6',
      v: 0,
      r: '0x2e86439cd65e76b5883a322f9ccbefa2f84555a9a305237b9bcb2c867620e69d',
      s: '0x1c80885252f4b92d7eff4bf8fc86dbaa5f22524b1110a99cbaf96981842348ae',
      from: '0x8FcE67537676879Bc5a1B86B403400E1614Bfce6',
      confirmations: 0,
      wait: [Function (anonymous)]
    }

</div>

</div>

<div id="bc6d4194-ff42-4898-980b-978ec5e5550e" class="cell markdown">

-   copy tx hash

</div>

<div id="0f5de6c4-b49d-44d0-b35d-428cea0f6aa8" class="cell code"
execution_count="67">

``` typescript
const bridgeBackHash = moveThroughWormHoleBackTx.hash;
```

</div>

<div id="4079b2f5-aed3-4940-812b-fceea20f5cf6" class="cell code"
execution_count="68">

``` typescript
bridgeBackHash
```

<div class="output stream stdout">

    0x3c4156a2366893f69de7426eeff3c0021771521b9c1e8bb173cf56040cdf34d6

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
execution_count="9">

``` typescript
!node ../scripts/burnProof.js "0x3c4156a2366893f69de7426eeff3c0021771521b9c1e8bb173cf56040cdf34d6"
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
    args method [Arguments] { '0': 'headerBlocks', '1': '362530000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '543790000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '634420000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '679740000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '702400000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '713730000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '719390000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '722220000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '723640000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '724350000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '724700000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '724880000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '724970000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '725010000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '725030000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '725040000' }
    sending tx with config undefined
    args method [Arguments] { '0': 'headerBlocks', '1': '0x2b376290' }
    sending tx with config undefined
    0xf91053842b376290b90100231f07d98a77e02cbb381dfa1f41d8785bdb18c8292ce31e66dbd11243cf33e345155d7720d2c5cb6dd27345a910c021fe7514b7bc4e83995fe3cc6dbe919693adf78249aadac1f23f1967d51c4af84e94684897034901f8dc0467627c45b842fad4a69a92141c75100e3693870ef026450960a01d88370bfeebaafa43b4767ac9184615a5bf68f2be9d48ddde424bd90e7ab39e46fd4d0def7e2c60ef0e0ed984bd87046ad6e6dc903de1af1f189396ad306ce3ce3923e112987a5e98ce8fbeac60224eaade3b811fa9cafab6a717224dbf84dad51a679ccbd61d7235a3a0336ba0c64ee38edb1eb6fae76fff63e5eaa34a51cdeb56a0aff218992bc9bf2f61840189cc0884624bee61a08a4e2ffc2c6f2f7f721df27a2258e835530e3adea13e70d6f39c31c77ecfbb08a0652371afde3d113404f71ba969073c861cfac498513f279fc89129708ecc8d5cb9062202f9061e0183516f3fb9010080000100000000000000400000000000000000000000000000000000000000000100000000000200001000000000000000008000000000000000100100200000000001000000000000000008000000900000000000000000000100000000004000000000020000000000200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000001000000000002000000000000000000000004000011002000000000401000100000000000000000000000000500040000020000010000000000000000000000000000000010000000000000000000020100000f90513f89c943120e82a86ff02283670644486fccd26df305ebef884a042ef856c2602f37ce625d252830bed486c5c8e9a4de8aa36cc3d15f304eb662ba00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f8db943120e82a86ff02283670644486fccd26df305ebef842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000002713b880570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c943120e82a86ff02283670644486fccd26df305ebef884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f89c943120e82a86ff02283670644486fccd26df305ebef884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f901199486e79ac4a9cc7003eb8e0edd5848891af6a206d0e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000027130000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a7005cdfa800000000000000000000000000000000000000000000000000049e6e3f2d98bd16000000000000000000000000000000000000000000000e8ce904a5bd087be04d000000000000000000000000000000000000000000000000049dc73ed0b91516000000000000000000000000000000000000000000000e8ce9054cbd655b884db908d3f908d0f891a03fefb55df6781070c1c80b656a98a2f874f6a4ffd5836842fa7ab5a3f6272f73a02cf79fe9332c9f0e9b321c2a9054bc5ed8696cb0368bd4421b5e355f12054e09a05019548085a2772a70c627297c15471c9c4b5fd46a38e64ece8bbaaa095652048080808080a0902291b75bb9cf6bf126629fa4a29ef061ffa070175e893142760a60518a85ea8080808080808080f90211a0e82b634dc80584e92fa4d749b263803c368b500602611d6e0ba4dcce2a72179ea01cb16990c15d66061af242aae1a3695331278d2b4bd1427ad72f33a471db631aa075dcad89fbde8b9d6640a90f8693135add896f4bb49c52eea85640c669952144a0780ad07f2ad1979bc70d07efefeaa04b203d85415f1e4d78f04c4bc7ef48b9baa0a915d7d820baa4ba7dbe0586d7f46c45518472862a6039b259de248f35d5c3e4a0c3a5d17051f3daf48a712ec8c8f5b567f08816d9ad35c44eafafd7207b09d929a03835a0d510a7411272bb83c4ec52c31789a04ebfa84c370329d8017c694ae0c9a00859c85e4f043d2dc10cc605c5e70622213c09392a080f468dcf0f713e08fb4aa051d77e5a76c239d42ffcdab03fda5cd8ce6b1a2b4eab6178819556a5a1ef5720a0da3223074027a47ac126a619717fba751b5619b67e787bb724b4f58c4999a8d2a09a6a68b0adf8375e5c6528ac8f768198910a5946950e5889c45ce831e7f1882fa00be9d70ef30e027fd80bd1229cb1cb29c5cdfcc82e6ca830917ef799872f1513a083b7ed29a3016e70def0b8f2e599fa5bbad1fda84bf776eacf9580be03832fdda0e1a0387332519fa6050d1f92986f1beeb95aaea3f73d4e5ee803fc466f16e8e0a014644e8edbae9d08bb36cd7759b9be0bc9831ee6bed99ba191a9be24ef23905ea011d0395899aad7bf3ee3aa42d83f59ff84fe6135de4f25068a298931ca1bb97f80f9062620b9062202f9061e0183516f3fb9010080000100000000000000400000000000000000000000000000000000000000000100000000000200001000000000000000008000000000000000100100200000000001000000000000000008000000900000000000000000000100000000004000000000020000000000200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000001000000000002000000000000000000000004000011002000000000401000100000000000000000000000000500040000020000010000000000000000000000000000000010000000000000000000020100000f90513f89c943120e82a86ff02283670644486fccd26df305ebef884a042ef856c2602f37ce625d252830bed486c5c8e9a4de8aa36cc3d15f304eb662ba00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f8db943120e82a86ff02283670644486fccd26df305ebef842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000002713b880570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c943120e82a86ff02283670644486fccd26df305ebef884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f89c943120e82a86ff02283670644486fccd26df305ebef884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f901199486e79ac4a9cc7003eb8e0edd5848891af6a206d0e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000027130000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a7005cdfa800000000000000000000000000000000000000000000000000049e6e3f2d98bd16000000000000000000000000000000000000000000000e8ce904a5bd087be04d000000000000000000000000000000000000000000000000049dc73ed0b91516000000000000000000000000000000000000000000000e8ce9054cbd655b884d82001804

</div>

</div>

<div id="32f7b275-f58c-46a7-a6cd-dc8347537c7e" class="cell code"
execution_count="7">

``` typescript
const proof = "0xf91053842b376290b90100231f07d98a77e02cbb381dfa1f41d8785bdb18c8292ce31e66dbd11243cf33e345155d7720d2c5cb6dd27345a910c021fe7514b7bc4e83995fe3cc6dbe919693adf78249aadac1f23f1967d51c4af84e94684897034901f8dc0467627c45b842fad4a69a92141c75100e3693870ef026450960a01d88370bfeebaafa43b4767ac9184615a5bf68f2be9d48ddde424bd90e7ab39e46fd4d0def7e2c60ef0e0ed984bd87046ad6e6dc903de1af1f189396ad306ce3ce3923e112987a5e98ce8fbeac60224eaade3b811fa9cafab6a717224dbf84dad51a679ccbd61d7235a3a0336ba0c64ee38edb1eb6fae76fff63e5eaa34a51cdeb56a0aff218992bc9bf2f61840189cc0884624bee61a08a4e2ffc2c6f2f7f721df27a2258e835530e3adea13e70d6f39c31c77ecfbb08a0652371afde3d113404f71ba969073c861cfac498513f279fc89129708ecc8d5cb9062202f9061e0183516f3fb9010080000100000000000000400000000000000000000000000000000000000000000100000000000200001000000000000000008000000000000000100100200000000001000000000000000008000000900000000000000000000100000000004000000000020000000000200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000001000000000002000000000000000000000004000011002000000000401000100000000000000000000000000500040000020000010000000000000000000000000000000010000000000000000000020100000f90513f89c943120e82a86ff02283670644486fccd26df305ebef884a042ef856c2602f37ce625d252830bed486c5c8e9a4de8aa36cc3d15f304eb662ba00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f8db943120e82a86ff02283670644486fccd26df305ebef842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000002713b880570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c943120e82a86ff02283670644486fccd26df305ebef884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f89c943120e82a86ff02283670644486fccd26df305ebef884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f901199486e79ac4a9cc7003eb8e0edd5848891af6a206d0e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000027130000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a7005cdfa800000000000000000000000000000000000000000000000000049e6e3f2d98bd16000000000000000000000000000000000000000000000e8ce904a5bd087be04d000000000000000000000000000000000000000000000000049dc73ed0b91516000000000000000000000000000000000000000000000e8ce9054cbd655b884db908d3f908d0f891a03fefb55df6781070c1c80b656a98a2f874f6a4ffd5836842fa7ab5a3f6272f73a02cf79fe9332c9f0e9b321c2a9054bc5ed8696cb0368bd4421b5e355f12054e09a05019548085a2772a70c627297c15471c9c4b5fd46a38e64ece8bbaaa095652048080808080a0902291b75bb9cf6bf126629fa4a29ef061ffa070175e893142760a60518a85ea8080808080808080f90211a0e82b634dc80584e92fa4d749b263803c368b500602611d6e0ba4dcce2a72179ea01cb16990c15d66061af242aae1a3695331278d2b4bd1427ad72f33a471db631aa075dcad89fbde8b9d6640a90f8693135add896f4bb49c52eea85640c669952144a0780ad07f2ad1979bc70d07efefeaa04b203d85415f1e4d78f04c4bc7ef48b9baa0a915d7d820baa4ba7dbe0586d7f46c45518472862a6039b259de248f35d5c3e4a0c3a5d17051f3daf48a712ec8c8f5b567f08816d9ad35c44eafafd7207b09d929a03835a0d510a7411272bb83c4ec52c31789a04ebfa84c370329d8017c694ae0c9a00859c85e4f043d2dc10cc605c5e70622213c09392a080f468dcf0f713e08fb4aa051d77e5a76c239d42ffcdab03fda5cd8ce6b1a2b4eab6178819556a5a1ef5720a0da3223074027a47ac126a619717fba751b5619b67e787bb724b4f58c4999a8d2a09a6a68b0adf8375e5c6528ac8f768198910a5946950e5889c45ce831e7f1882fa00be9d70ef30e027fd80bd1229cb1cb29c5cdfcc82e6ca830917ef799872f1513a083b7ed29a3016e70def0b8f2e599fa5bbad1fda84bf776eacf9580be03832fdda0e1a0387332519fa6050d1f92986f1beeb95aaea3f73d4e5ee803fc466f16e8e0a014644e8edbae9d08bb36cd7759b9be0bc9831ee6bed99ba191a9be24ef23905ea011d0395899aad7bf3ee3aa42d83f59ff84fe6135de4f25068a298931ca1bb97f80f9062620b9062202f9061e0183516f3fb9010080000100000000000000400000000000000000000000000000000000000000000100000000000200001000000000000000008000000000000000100100200000000001000000000000000008000000900000000000000000000100000000004000000000020000000000200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000001000000000002000000000000000000000004000011002000000000401000100000000000000000000000000500040000020000010000000000000000000000000000000010000000000000000000020100000f90513f89c943120e82a86ff02283670644486fccd26df305ebef884a042ef856c2602f37ce625d252830bed486c5c8e9a4de8aa36cc3d15f304eb662ba00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f8db943120e82a86ff02283670644486fccd26df305ebef842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000002713b880570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c943120e82a86ff02283670644486fccd26df305ebef884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f89c943120e82a86ff02283670644486fccd26df305ebef884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f901199486e79ac4a9cc7003eb8e0edd5848891af6a206d0e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000027130000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a7005cdfa800000000000000000000000000000000000000000000000000049e6e3f2d98bd16000000000000000000000000000000000000000000000e8ce904a5bd087be04d000000000000000000000000000000000000000000000000049dc73ed0b91516000000000000000000000000000000000000000000000e8ce9054cbd655b884d82001804";
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
      nonce: 54,
      maxPriorityFeePerGas: BigNumber { _hex: '0x9502f900', _isBigNumber: true },
      maxFeePerGas: BigNumber { _hex: '0x9502f910', _isBigNumber: true },
      gasPrice: null,
      gasLimit: BigNumber { _hex: '0x072460', _isBigNumber: true },
      to: '0xC23887Ed467bc6B9dF48d505e3C1A0326d50eA9A',
      value: BigNumber { _hex: '0x00', _isBigNumber: true },
      data: '0xf953cec700000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000001056f91053842b376290b90100231f07d98a77e02cbb381dfa1f41d8785bdb18c8292ce31e66dbd11243cf33e345155d7720d2c5cb6dd27345a910c021fe7514b7bc4e83995fe3cc6dbe919693adf78249aadac1f23f1967d51c4af84e94684897034901f8dc0467627c45b842fad4a69a92141c75100e3693870ef026450960a01d88370bfeebaafa43b4767ac9184615a5bf68f2be9d48ddde424bd90e7ab39e46fd4d0def7e2c60ef0e0ed984bd87046ad6e6dc903de1af1f189396ad306ce3ce3923e112987a5e98ce8fbeac60224eaade3b811fa9cafab6a717224dbf84dad51a679ccbd61d7235a3a0336ba0c64ee38edb1eb6fae76fff63e5eaa34a51cdeb56a0aff218992bc9bf2f61840189cc0884624bee61a08a4e2ffc2c6f2f7f721df27a2258e835530e3adea13e70d6f39c31c77ecfbb08a0652371afde3d113404f71ba969073c861cfac498513f279fc89129708ecc8d5cb9062202f9061e0183516f3fb9010080000100000000000000400000000000000000000000000000000000000000000100000000000200001000000000000000008000000000000000100100200000000001000000000000000008000000900000000000000000000100000000004000000000020000000000200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000001000000000002000000000000000000000004000011002000000000401000100000000000000000000000000500040000020000010000000000000000000000000000000010000000000000000000020100000f90513f89c943120e82a86ff02283670644486fccd26df305ebef884a042ef856c2602f37ce625d252830bed486c5c8e9a4de8aa36cc3d15f304eb662ba00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f8db943120e82a86ff02283670644486fccd26df305ebef842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000002713b880570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c943120e82a86ff02283670644486fccd26df305ebef884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f89c943120e82a86ff02283670644486fccd26df305ebef884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f901199486e79ac4a9cc7003eb8e0edd5848891af6a206d0e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000027130000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a7005cdfa800000000000000000000000000000000000000000000000000049e6e3f2d98bd16000000000000000000000000000000000000000000000e8ce904a5bd087be04d000000000000000000000000000000000000000000000000049dc73ed0b91516000000000000000000000000000000000000000000000e8ce9054cbd655b884db908d3f908d0f891a03fefb55df6781070c1c80b656a98a2f874f6a4ffd5836842fa7ab5a3f6272f73a02cf79fe9332c9f0e9b321c2a9054bc5ed8696cb0368bd4421b5e355f12054e09a05019548085a2772a70c627297c15471c9c4b5fd46a38e64ece8bbaaa095652048080808080a0902291b75bb9cf6bf126629fa4a29ef061ffa070175e893142760a60518a85ea8080808080808080f90211a0e82b634dc80584e92fa4d749b263803c368b500602611d6e0ba4dcce2a72179ea01cb16990c15d66061af242aae1a3695331278d2b4bd1427ad72f33a471db631aa075dcad89fbde8b9d6640a90f8693135add896f4bb49c52eea85640c669952144a0780ad07f2ad1979bc70d07efefeaa04b203d85415f1e4d78f04c4bc7ef48b9baa0a915d7d820baa4ba7dbe0586d7f46c45518472862a6039b259de248f35d5c3e4a0c3a5d17051f3daf48a712ec8c8f5b567f08816d9ad35c44eafafd7207b09d929a03835a0d510a7411272bb83c4ec52c31789a04ebfa84c370329d8017c694ae0c9a00859c85e4f043d2dc10cc605c5e70622213c09392a080f468dcf0f713e08fb4aa051d77e5a76c239d42ffcdab03fda5cd8ce6b1a2b4eab6178819556a5a1ef5720a0da3223074027a47ac126a619717fba751b5619b67e787bb724b4f58c4999a8d2a09a6a68b0adf8375e5c6528ac8f768198910a5946950e5889c45ce831e7f1882fa00be9d70ef30e027fd80bd1229cb1cb29c5cdfcc82e6ca830917ef799872f1513a083b7ed29a3016e70def0b8f2e599fa5bbad1fda84bf776eacf9580be03832fdda0e1a0387332519fa6050d1f92986f1beeb95aaea3f73d4e5ee803fc466f16e8e0a014644e8edbae9d08bb36cd7759b9be0bc9831ee6bed99ba191a9be24ef23905ea011d0395899aad7bf3ee3aa42d83f59ff84fe6135de4f25068a298931ca1bb97f80f9062620b9062202f9061e0183516f3fb9010080000100000000000000400000000000000000000000000000000000000000000100000000000200001000000000000000008000000000000000100100200000000001000000000000000008000000900000000000000000000100000000004000000000020000000000200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000001000000000002000000000000000000000004000011002000000000401000100000000000000000000000000500040000020000010000000000000000000000000000000010000000000000000000020100000f90513f89c943120e82a86ff02283670644486fccd26df305ebef884a042ef856c2602f37ce625d252830bed486c5c8e9a4de8aa36cc3d15f304eb662ba00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f8db943120e82a86ff02283670644486fccd26df305ebef842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000002713b880570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c943120e82a86ff02283670644486fccd26df305ebef884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f89c943120e82a86ff02283670644486fccd26df305ebef884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000271380f901199486e79ac4a9cc7003eb8e0edd5848891af6a206d0e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000027130000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a7005cdfa800000000000000000000000000000000000000000000000000049e6e3f2d98bd16000000000000000000000000000000000000000000000e8ce904a5bd087be04d000000000000000000000000000000000000000000000000049dc73ed0b91516000000000000000000000000000000000000000000000e8ce9054cbd655b884d8200180400000000000000000000',
      accessList: [],
      hash: '0x71f4de28e93fe88311d683c212c9320c59b4fc1a70885357e2d1ef3bcf1b309c',
      v: 1,
      r: '0x194188ad6e10d78ebe361c5701e03291614d47ecceadf6d4d0486aa42631c2ee',
      s: '0x32dfa9a70ae8753a4eb1629f81cc98e6370b7936ff1e1d710579b2bf7befd5f7',
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
      _hex: '0x570d4109f00e9daedbdab84a4829cfe48ab77b5cac60f495dab977aaac5eeb7e',
      _isBigNumber: true
    }

</div>

</div>

<div id="80c765b3-1163-42ee-8c32-3b40543a5f22" class="cell code"
execution_count="17">

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
execution_count="18">

``` typescript
const ownerOfLastTokenId = await polyRootInst.ownerOf(lastTokenId.toNumber());
```

</div>

<div id="7aa453f9-4971-462f-a5fd-ecbc38824872" class="cell code"
execution_count="19">

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
