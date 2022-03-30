# Polygon Plasma Bridge utilized for Polymorphs NFT Collection
- This is a notebook that can serve as a guide to explore bridging Polymorph NFTs from Ethereum to Polygon and vice versa.

# Ethereum -> Polygon Steps

0) Deploy all 5 contracts to the corresponding networks. For reference on how to do that see `README.md`. 

1) Call `setFxChildTunnel` on deployed RootTunnel with the address of child tunnel

2) Call `setFxRootTunnel` on deployed ChildTunnel with address of root tunnel

3) Call `setPolymorphContract` on RootTunnel to point to the RootPolymorph address

4) Call `setPolymorphContract` on ChildTunnel to point to the ChildPolymorph address

5) WhiteList `PolyRoot Tunnel` from `PolymorphRoot`

6) WhiteList `PolyChild Tunnel` from `PolymorphChild`

7) Mint new NFT either with call/sendTransaction or bulkBuy()

8) Approve `Root Tunnel Contract` to manage an NFT

9) Call MoveThroughWormhole(tokenId) on `Root Tunnel Contract`

- Go to Polygon network and observe the genome of the NFT that you have bridged. It should have changed :)
    - Note: It may take 10-20 mins in order for your bridge transaction to be validated. 
    - You can observe the events of the fxChild Contract in Mumbai - `0xCf73231F28B7331BBe3124B907840A94851f9f11` as when your transaction gets validated, it will appear there.


```typescript
const env = require('dotenv').config({path:'../.env'});
const { getDefaultProvider, providers, Wallet, Contract, utils } = require("ethers");
```

## Declaring addresses of deployed contracts


```typescript
const POLY_ROOT_ADDRESS = "0x764bADa71B2B7a03a7a7Ae2615c88a514664d6a0";

const ROOT_TUNNEL_ADDRESS = "0xE5F5D0a68A215110Fc0803d87D44253Ee5382f6c";

const POLY_CHILD_ADDRESS = "0x2d16C6825D2377b2B87D378F359130B17C727367";

const CHILD_TUNNEL_ADDRESS = "0xD43e3ecCe4430dE35bb01461dB8474CBf3CCd917";

const TEST_ERC_20_ADDRESS = "0xa2D7431aA391d1814516449b32B01735590fdec1";
```


```typescript
const gasLimit = "0x100000";
```

## Declaring providers and Signers


```typescript
const GOERLI_TESTNET = "goerli";

const MUMBAI_TESTNET = "maticmum";

const PROVIDER_GOERLI = getDefaultProvider(GOERLI_TESTNET, {
    alchemy: env.parsed.GOERLI_ALCHEMY_KEY
});

const PROVIDER_MUMBAI = new providers.AlchemyProvider(MUMBAI_TESTNET, env.parsed.MUMBAI_ALCHEMY_KEY);

const SIGNER_GOERLI = new Wallet(env.parsed.PRIVATE_KEY, PROVIDER_GOERLI);

const SIGNER_MUMBAI = new Wallet(env.parsed.PRIVATE_KEY, PROVIDER_MUMBAI);
```

## Import ABIs


```typescript
import POLYMORPH_ROOT_ABI from './abis/POLYROOT_ABI.json';

import POLYMORPH_CHILD_ABI from './abis/POLYCHILD_ABI.json';

import TUNNEL_ROOT_ABI from './abis/TUNNEL_ROOT_ABI.json';

import TUNNEL_CHILD_ABI from './abis/TUNNEL_CHILD_ABI.json';
```

## Instantiating Contracts


```typescript
const polyRootInst = new Contract(POLY_ROOT_ADDRESS, POLYMORPH_ROOT_ABI, SIGNER_GOERLI);

const tunnelRootInst = new Contract(ROOT_TUNNEL_ADDRESS, TUNNEL_ROOT_ABI, SIGNER_GOERLI);

const polyChildInst = new Contract(POLY_CHILD_ADDRESS, POLYMORPH_CHILD_ABI, SIGNER_MUMBAI);

const tunnelChildInst = new Contract(CHILD_TUNNEL_ADDRESS, TUNNEL_CHILD_ABI, SIGNER_MUMBAI);
```

## Running Bridge Prerequisites

### Link Root And Child Polymorph Contracts with the respective tunnels


```typescript
const setContractInRootTx = await tunnelRootInst.setPolymorphContract(
           POLY_ROOT_ADDRESS, {gasLimit : utils.hexlify(gasLimit)
        });
```

    ========= NOTICE =========
    Request-Rate Exceeded  (this message will not be repeated)
    
    The default API keys for each service are provided as a highly-throttled,
    community resource for low-traffic projects and early prototyping.
    
    While your application will continue to function, we highly recommended
    signing up for your own API keys to improve performance, increase your
    request rate/limit and enable other perks, such as metrics and advanced APIs.
    
    For more details: https://docs.ethers.io/api-keys/
    ==========================



```typescript
setContractInRootTx
```

    {
      type: [33m2[39m,
      chainId: [33m5[39m,
      nonce: [33m28[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x9502f910'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0x100000'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0xE5F5D0a68A215110Fc0803d87D44253Ee5382f6c'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0xc8509ec2000000000000000000000000764bada71b2b7a03a7a7ae2615c88a514664d6a0'[39m,
      accessList: [],
      hash: [32m'0x2afb48eb9d0bc24d90ffd94ed928f15e79c06d1724ac0b0009084ce51345ffe1'[39m,
      v: [33m0[39m,
      r: [32m'0x76a2bd13273148f880d675aaf7cd548bfea778be35fb028c0ea0dbf30b3c40df'[39m,
      s: [32m'0x434fce7f47d7269daa8d12439043e077036f47decacc6c5f3f1c70aeed6b6b31'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }



```typescript
const setContractInChildTx = await tunnelChildInst.setPolymorphContract(
           POLY_CHILD_ADDRESS, {gasLimit : utils.hexlify(gasLimit)
        });
```


```typescript
setContractInChildTx
```

    {
      type: [33m2[39m,
      chainId: [33m80001[39m,
      nonce: [33m42[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x05d210770c'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0x100000'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0xD43e3ecCe4430dE35bb01461dB8474CBf3CCd917'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0xc8509ec20000000000000000000000002d16c6825d2377b2b87d378f359130b17c727367'[39m,
      accessList: [],
      hash: [32m'0xa22add7b0c993dcf0fb3107156245d2a7e89d717b8302117df6e0fcd28d3ea68'[39m,
      v: [33m1[39m,
      r: [32m'0x8e58cf277a0630f3ba041167f3ff1927782c9a02dbe3fbe07faf3c28caf54f38'[39m,
      s: [32m'0x772965d301be141bc9e6af35b4b6c93e334ee66953324f7d6cbd6430caa87e52'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }


### Whitelist Bridge Addresses


```typescript
const whiteListTx = await polyRootInst.whitelistBridgeAddress(ROOT_TUNNEL_ADDRESS, true);
```


```typescript
whiteListTx
```

    {
      type: [33m2[39m,
      chainId: [33m5[39m,
      nonce: [33m29[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x9502f912'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0xb53e'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0x764bADa71B2B7a03a7a7Ae2615c88a514664d6a0'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0xab39a3c8000000000000000000000000e5f5d0a68a215110fc0803d87d44253ee5382f6c0000000000000000000000000000000000000000000000000000000000000001'[39m,
      accessList: [],
      hash: [32m'0x0c441ca1a6fdab9b1d37909dabe03121ef9f397ac1b26434c111c03f6a5337c2'[39m,
      v: [33m1[39m,
      r: [32m'0x3c8395921ad854375339549c17b672bc0c0da676573ddd287cd06d83f5bd7173'[39m,
      s: [32m'0x208871e901290fa9c9a5c315f27a0b8c46a7b696333783e0130a8333dd6dea1c'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }



```typescript
const whiteListTx = await polyChildInst.whitelistBridgeAddress(CHILD_TUNNEL_ADDRESS, true);
```


```typescript
whiteListTx
```

    {
      type: [33m2[39m,
      chainId: [33m80001[39m,
      nonce: [33m43[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x03fdc41606'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0xb543'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0x2d16C6825D2377b2B87D378F359130B17C727367'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0xab39a3c8000000000000000000000000d43e3ecce4430de35bb01461db8474cbf3ccd9170000000000000000000000000000000000000000000000000000000000000001'[39m,
      accessList: [],
      hash: [32m'0xb50fee26cc2fa16fd5951c73640f66061982a0fde84ae8dceac71d85b40d2bbd'[39m,
      v: [33m0[39m,
      r: [32m'0xfa7d96ba7420f1cfe90af7b0edef2d843e80095df7078f97eb6194ba95dbf776'[39m,
      s: [32m'0x04352d85da4ee1821cd1854a3b2adca743d7488801c2d5fd6185d19f9b727385'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }


### Link both tunnels each other


```typescript
const setFxChildTunnelTx = await tunnelRootInst.setFxChildTunnel(CHILD_TUNNEL_ADDRESS);
```


```typescript
setFxChildTunnelTx
```

    {
      type: [33m2[39m,
      chainId: [33m5[39m,
      nonce: [33m30[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x9502f912'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0xac5c'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0xE5F5D0a68A215110Fc0803d87D44253Ee5382f6c'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0xaea4e49e000000000000000000000000d43e3ecce4430de35bb01461db8474cbf3ccd917'[39m,
      accessList: [],
      hash: [32m'0xacaf984434997dcedd46a3fab6e4af16528c4efa308d8f0ec74969af49a51a8d'[39m,
      v: [33m0[39m,
      r: [32m'0x363602b22e91785cd40dda511664b65652624fd2969470e132f1107daa74f12c'[39m,
      s: [32m'0x7fde6e338bb9cf08b4ee074e75c2006059d31002845ef3e8394f023f95f72e73'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }



```typescript
const setFxRootTunnelTx = await tunnelChildInst.setFxRootTunnel(ROOT_TUNNEL_ADDRESS);
```


```typescript
setFxRootTunnelTx
```

    {
      type: [33m2[39m,
      chainId: [33m80001[39m,
      nonce: [33m44[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x042fbe651e'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0xac03'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0xD43e3ecCe4430dE35bb01461dB8474CBf3CCd917'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0x88837094000000000000000000000000e5f5d0a68a215110fc0803d87d44253ee5382f6c'[39m,
      accessList: [],
      hash: [32m'0x4cdbdf499fd44de8444b6bbbc49dd89003b3d39e1dc64e9c0ae081095c3350cc'[39m,
      v: [33m0[39m,
      r: [32m'0xb9d4b96877a1a0b2873a9bf31e2e905fe411c75978e107afab2c2980d6dbdb6f'[39m,
      s: [32m'0x1c42e3076db29a9126f6075e3c9c52b7c9d6e8c8d7d9a3a4670d014344cc98fe'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }


## Mint NFTs to PolymorphRoot Contract


```typescript
const tokensToBuyAmount = 3;
```


```typescript
const bulkBuyTx = await polyRootInst.bulkBuy(tokensToBuyAmount, {value: utils.parseEther("0.06")}); // excess will be returned
```


```typescript
bulkBuyTx
```

    {
      type: [33m2[39m,
      chainId: [33m5[39m,
      nonce: [33m31[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x9502f914'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0x07eb6f'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0x764bADa71B2B7a03a7a7Ae2615c88a514664d6a0'[39m,
      value: BigNumber { _hex: [32m'0xd529ae9e860000'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0xd5a83d3e0000000000000000000000000000000000000000000000000000000000000003'[39m,
      accessList: [],
      hash: [32m'0x255092a1d8689c87ffeaba064b5c21f8e4a156f9a14e354da3756a888024a26e'[39m,
      v: [33m1[39m,
      r: [32m'0xa81f781bc88a62e7925b2474e54e14321ade1aaecc2ad01be3b2867edc8350e9'[39m,
      s: [32m'0x5337fed373dc044909349308cfab068bec00cf27c95650f520f28072b9134f08'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }



```typescript
const lastTokenId = await polyRootInst.lastTokenId();
```


```typescript
lastTokenId
```

    BigNumber { _hex: [32m'0x03'[39m, _isBigNumber: [33mtrue[39m }



```typescript
const geneOfLastTokenId = await polyRootInst.geneOf(lastTokenId.toNumber());
```


```typescript
geneOfLastTokenId
```

    BigNumber {
      _hex: [32m'0x9f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6d3e37f4644'[39m,
      _isBigNumber: [33mtrue[39m
    }


## Approve RootTunnel to manage an NFT


```typescript
// Approve NFT #3 (last token)
const approveTx = await polyRootInst.approve(ROOT_TUNNEL_ADDRESS, lastTokenId.toNumber());
```


```typescript
approveTx
```

    {
      type: [33m2[39m,
      chainId: [33m5[39m,
      nonce: [33m32[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x9502f910'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0xbe90'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0x764bADa71B2B7a03a7a7Ae2615c88a514664d6a0'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0x095ea7b3000000000000000000000000e5f5d0a68a215110fc0803d87d44253ee5382f6c0000000000000000000000000000000000000000000000000000000000000003'[39m,
      accessList: [],
      hash: [32m'0xc9390a2e466a2b61eb10a73ad62fae2802b39bcff680d22965cbdbee4886fc63'[39m,
      v: [33m1[39m,
      r: [32m'0x05877cf09b490c0c7060aaf96be55bd63537e10d07e2e7e92340db7fffc463df'[39m,
      s: [32m'0x0d9d4adb4bd82bebdee7d8acaa82b6e3c46386f36714e1b1c57b5e849e328bcc'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }


## MoveThroughWormHole Transaction


```typescript
const moveThroughWormHoleTx = await tunnelRootInst.moveThroughWormhole(lastTokenId.toNumber(), {gasLimit : utils.hexlify(gasLimit)});
```


```typescript
moveThroughWormHoleTx
```

    {
      type: [33m2[39m,
      chainId: [33m5[39m,
      nonce: [33m33[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x9502f910'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0x100000'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0xE5F5D0a68A215110Fc0803d87D44253Ee5382f6c'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0xaf57513f0000000000000000000000000000000000000000000000000000000000000003'[39m,
      accessList: [],
      hash: [32m'0x98ca7bc985eaf0bec42c39a3f530ecdab6c8e4707cbd3a3bba231cbbd472aca9'[39m,
      v: [33m1[39m,
      r: [32m'0x4e62717fb7e8027c272ea8edd0d0b281233cbfacfcf121d481af793e455244e6'[39m,
      s: [32m'0x79befb8d237c75f34625b7c9db8f75413aa18c101eaf8e6f13153ee923f1924c'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }


- At this point, ownership of the token should be transferred to the Root Tunnel Contract. Let's check:


```typescript
const ownerOfLastTokenId = await polyRootInst.ownerOf(lastTokenId.toNumber());
```


```typescript
ownerOfLastTokenId === ROOT_TUNNEL_ADDRESS
```

    [33mtrue[39m


- Now the validation of the moveThroughWormohole transaction can take up to 20 minutes.

## Check the gene of the bridged NFT


```typescript
const bridgedGeneLastToken = await polyChildInst.geneOf(lastTokenId.toNumber());
```


```typescript
bridgedGeneLastToken
```

    BigNumber {
      _hex: [32m'0x9f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6d3e37f4644'[39m,
      _isBigNumber: [33mtrue[39m
    }



```typescript
bridgedGeneLastToken._hex === geneOfLastTokenId._hex
```

    [33mtrue[39m



```typescript
const isBridgedNFTVirgin = await polyChildInst.isNotVirgin(lastTokenId.toNumber());
```


```typescript
!isBridgedNFTVirgin // reverting because the function is 'isNotVirgin'
```

    [33mtrue[39m


## Conclusion
- Successfully bridged the token with no loss of information!

# Polygon -> Ethereum Steps

- Note: If a user wants to morph/randomize the genome of his token on Polygon, he should pay the exact value of how much the same action is worth on Ethereum network because 1 MATIC != 1 ETH. That's why Wrapped ETH is used on Polygon.

- The payment is made directly to the DAO Address. This means that it is mandatory the user to approve the DAO address to spend the desired amount of tokens on this wrapped ETH contract. Otherwise morphing/randomizing transcations will fail on Polygon.

0) Set the payment Wrapped Token (call the setMaticWETHContract() function on PolymorphChild

1) Approve ChildTunnel contract to manage the NFT

2) Execute moveThroughWormhole Transaction
    - Copy its txHash
3) Execute `node scripts/burnProof.js txHash` to generate a proof that moveThroughWormhole transacation happened on Polygon

4) Call receiveMessage(proof) on `polymorphRootTunnel` with the generated proof

### Set the Wrapped Eth Address


```typescript
const setWrappedETHAddressTx = await polyChildInst.setMaticWETHContract(TEST_ERC_20_ADDRESS);
```


```typescript
setWrappedETHAddressTx
```

    {
      type: [33m2[39m,
      chainId: [33m80001[39m,
      nonce: [33m45[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x04cf79a944'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0xb461'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0x2d16C6825D2377b2B87D378F359130B17C727367'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0x87087e61000000000000000000000000a2d7431aa391d1814516449b32b01735590fdec1'[39m,
      accessList: [],
      hash: [32m'0x78b0b9960136818358f0ff67b438184e5f5600ab5f05fee77c86bd67feba3ef8'[39m,
      v: [33m0[39m,
      r: [32m'0xd82a243e4d03afb3c04eace525f515b21ec7442e9e92910c830fcfeb1cb29f22'[39m,
      s: [32m'0x74c45f072401f90ba0502becebdaf31e7e7f78f6dd6fc40881c117b1bcabd798'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }


### Morph a gene
-  so then we can test whether the bridge would return it to Ethereum with the new information.


```typescript
const genePosition = 5;
```


```typescript
const morphAGeneInPolygon = await polyChildInst.morphGene(lastTokenId.toNumber(), genePosition, {value: utils.parseEther("0.2")});
```


```typescript
morphAGeneInPolygon
```

    {
      type: [33m2[39m,
      chainId: [33m80001[39m,
      nonce: [33m48[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x02b2da4ec4'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0x01e4e2'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0x2d16C6825D2377b2B87D378F359130B17C727367'[39m,
      value: BigNumber { _hex: [32m'0x02c68af0bb140000'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0x56a5c92600000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000005'[39m,
      accessList: [],
      hash: [32m'0x876421cb5fd63f6a3fdd25dd5f796935ff4f1a5742e09ffc6d718e015dad52b8'[39m,
      v: [33m1[39m,
      r: [32m'0x00f3de69f2b3ed78e979ded896af86fc3c139ff3b7f37a5be4d387cf4af255d1'[39m,
      s: [32m'0x1b35765bf960e2937b2b22fce1eed7981bcd641d8fda71bff14ab33f431b26d2'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }


- Check the gene whether it's morphed


```typescript
const morphedGene = await polyChildInst.geneOf(lastTokenId.toNumber());
```


```typescript
morphedGene._hex
```

    0x9f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba44



```typescript
geneOfLastTokenId._hex
```

    0x9f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6d3e37f4644



```typescript
morphedGene._hex === geneOfLastTokenId._hex
```

    [33mfalse[39m


- as we can see, genes differ, so we have morphed it successfully ;)

### Approve PolymorphChildTunnel to manage the NFT


```typescript
const approveTx = await polyChildInst.approve(CHILD_TUNNEL_ADDRESS, lastTokenId.toNumber());
```


```typescript
approveTx
```

    {
      type: [33m2[39m,
      chainId: [33m80001[39m,
      nonce: [33m49[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x04294a5582'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0xbeac'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0x2d16C6825D2377b2B87D378F359130B17C727367'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0x095ea7b3000000000000000000000000d43e3ecce4430de35bb01461db8474cbf3ccd9170000000000000000000000000000000000000000000000000000000000000003'[39m,
      accessList: [],
      hash: [32m'0x6a15c458ee58646a06a6231fe4f6b57a947eb6a4615a6a3713679e663f555e60'[39m,
      v: [33m0[39m,
      r: [32m'0x6b59c6bfd7a06bf5b52660ed972e2f76c71dca92d8a2ef6ec7f5d107078e26c0'[39m,
      s: [32m'0x3a21f81149d7d19747ed6b2718ac814c11018264af431f9f01ba6a42fcf05aad'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }


### MoveThroughWormHole tx


```typescript
const moveThroughWormHoleBackTx = await tunnelChildInst.moveThroughWormhole(lastTokenId.toNumber());
```


```typescript
moveThroughWormHoleBackTx
```

    1:1 - Cannot find name 'moveThroughWormHoleBackTx'.


- copy tx hash


```typescript
const bridgeBackHash = moveThroughWormHoleBackTx.hash;
```

    1:24 - Cannot find name 'moveThroughWormHoleBackTx'.



```typescript
bridgeBackHash
```

    1:1 - Cannot find name 'bridgeBackHash'.


### Generate proof
- Switch the kernel to Python3 in order to execute the next command as tslab does not support it(?).

- Note: it's possible for the transaction to take a while before checkpointed.


```typescript
!node ../scripts/burnProof.js "0x08d051ac476d42b728e1ffa4380c8af9fc36c8ac840cebcb0636e4749e81d6c8"
```

    init called ABIManager { networkName: [32m'testnet'[39m, version: [32m'mumbai'[39m }
    args method [Arguments] { [32m'0'[39m: [32m'getLastChildBlock'[39m }
    sending tx with config [90mundefined[39m
    Is Checkpointed:  [33mtrue[39m
    args method [Arguments] { [32m'0'[39m: [32m'getLastChildBlock'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'currentHeaderBlock'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'359680000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'539520000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'629440000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'674400000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'696880000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'708120000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'713740000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'716550000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'717960000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'718660000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'719010000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'719190000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'719100000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'719050000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'719030000'[39m }
    sending tx with config [90mundefined[39m
    args method [Arguments] { [32m'0'[39m: [32m'headerBlocks'[39m, [32m'1'[39m: [32m'0x2adb86f0'[39m }
    sending tx with config [90mundefined[39m
    0xf90f37842adb86f0b90100c13adae1fb747d5decca3202c5024e3cbb8e68160a2fca91eb2997634695bd60ce9dbd9cf930c681a5efa75a3a62eb09746c8708f92846ea9bc3177bd40c6bdf2565bbdb0e9fbb894ad252bb1a1990de0d2576441beb60d505aca71c27ff88fbb3a7d7ebb0fc8e552fd576b7f98a561c6e20b5395de0da5801987e6ddfedd72a8d7a0352107853deb5d6997057df7c3125d0a9feb28e8fe802cf7265576c54d1e3ca662e33585cc455cdda71123cbe28ccac9fb5c616caaf4b39f9ae2b566a5e9333586d6ca57c47c4885fa75d8a3a19da3891a890ac12365ec22c1a092d0454b58bec69492875a9869c38777a6c30206e09650f2307fcbfb75623ab55672cce840187291784623b442ba0dc4aa166a4d91c204c10468014325c72306b97f2f973cac8ffad10deb454b3d0a057c47be28efa80d1b5875157bc4d3392573f577e3d27c86358d4faef36377fedb9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208fb90855f90852f8b1a0d53ff64da7f3e9922d4df9d070bc6adf20099324e6969b79ab6e7f67f79b2882a044c9b41771d7bf4d369de422cbe97a17f52ff9c551100f3cc062dcf846152b27a0dc4006dc44ac50d5873ad9776c4ea17ed72c4d9ed39f6295295db15d3368ab77a007f752f67b510fe532ed0f8660cbb0e03e4bc34f72268b269d91f1df7fd70a4480808080a017287050d3a9fe69336a98a6837cbe5d051eaf6a12a6720ebff7de3bab4e73bf8080808080808080f90211a0f44380fc79e13ebd734bce4fb2b1c69304ebc309e97661036626e7ef78f5c1b4a0506f829a1c0bf6429aec66698fc98dab3c0a7530afbec99b6008546ec99e38eba0ea6fe3f302fe4141a4b1b2d874089f6305fb7f947ddb9c130a89806f50d6ce5da02bf4e7a7bd1c25f990f4686040f71a22a1c3a0e2515f55900889b96b209746b7a0c9c13f7880b971ba6a882c0f7908536107ce068df61f846c275e05d1825735ffa0f3979f8334c7fda7575856b48bfb74582346346382a025f278008f19ec2af427a0645228303b295734fb3078790a012b497b7bfa7ed98d08c97bea2a736097c2e6a057ad46b22e1c165cee617093d9568003739f30c09ffa7026f31203fbf484543fa04703b98334fbda27243d604af674928da9308f1faf92f088f81c6f7aad1f59bca09cc5064c0f3e635083d4f45e7ae83da317dff3faffa3800f47994692f2fa7360a0661e5bd7e12c7df4898c92b8ad97cd71e0a5c9efe88b2cd210870287537c5bb4a090449e79f90e5831d3a4a5239d927644b1ab67482c8db39b26f845b9c53aee95a077e7097450ef4b253d8701a971a49f0ab0aa147a5b7bfd0faf4d931522bc5b68a058d08a8e9220f913aeeb183bd2ba970a9ca1bca7a12b503eb1a1d07015e4b7aca04695fd44f324977ea30208cb29778da0074b6d0c092873995e10a9f89b9ad18ca04a8784941d02a389cbf2964ecac10c2a0f08110eed7c7ac20155005e17cc0efc80f9058820b9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208f82002903



```typescript
const proof = "0xf90f37842adb86f0b90100c13adae1fb747d5decca3202c5024e3cbb8e68160a2fca91eb2997634695bd60ce9dbd9cf930c681a5efa75a3a62eb09746c8708f92846ea9bc3177bd40c6bdf2565bbdb0e9fbb894ad252bb1a1990de0d2576441beb60d505aca71c27ff88fbb3a7d7ebb0fc8e552fd576b7f98a561c6e20b5395de0da5801987e6ddfedd72a8d7a0352107853deb5d6997057df7c3125d0a9feb28e8fe802cf7265576c54d1e3ca662e33585cc455cdda71123cbe28ccac9fb5c616caaf4b39f9ae2b566a5e9333586d6ca57c47c4885fa75d8a3a19da3891a890ac12365ec22c1a092d0454b58bec69492875a9869c38777a6c30206e09650f2307fcbfb75623ab55672cce840187291784623b442ba0dc4aa166a4d91c204c10468014325c72306b97f2f973cac8ffad10deb454b3d0a057c47be28efa80d1b5875157bc4d3392573f577e3d27c86358d4faef36377fedb9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208fb90855f90852f8b1a0d53ff64da7f3e9922d4df9d070bc6adf20099324e6969b79ab6e7f67f79b2882a044c9b41771d7bf4d369de422cbe97a17f52ff9c551100f3cc062dcf846152b27a0dc4006dc44ac50d5873ad9776c4ea17ed72c4d9ed39f6295295db15d3368ab77a007f752f67b510fe532ed0f8660cbb0e03e4bc34f72268b269d91f1df7fd70a4480808080a017287050d3a9fe69336a98a6837cbe5d051eaf6a12a6720ebff7de3bab4e73bf8080808080808080f90211a0f44380fc79e13ebd734bce4fb2b1c69304ebc309e97661036626e7ef78f5c1b4a0506f829a1c0bf6429aec66698fc98dab3c0a7530afbec99b6008546ec99e38eba0ea6fe3f302fe4141a4b1b2d874089f6305fb7f947ddb9c130a89806f50d6ce5da02bf4e7a7bd1c25f990f4686040f71a22a1c3a0e2515f55900889b96b209746b7a0c9c13f7880b971ba6a882c0f7908536107ce068df61f846c275e05d1825735ffa0f3979f8334c7fda7575856b48bfb74582346346382a025f278008f19ec2af427a0645228303b295734fb3078790a012b497b7bfa7ed98d08c97bea2a736097c2e6a057ad46b22e1c165cee617093d9568003739f30c09ffa7026f31203fbf484543fa04703b98334fbda27243d604af674928da9308f1faf92f088f81c6f7aad1f59bca09cc5064c0f3e635083d4f45e7ae83da317dff3faffa3800f47994692f2fa7360a0661e5bd7e12c7df4898c92b8ad97cd71e0a5c9efe88b2cd210870287537c5bb4a090449e79f90e5831d3a4a5239d927644b1ab67482c8db39b26f845b9c53aee95a077e7097450ef4b253d8701a971a49f0ab0aa147a5b7bfd0faf4d931522bc5b68a058d08a8e9220f913aeeb183bd2ba970a9ca1bca7a12b503eb1a1d07015e4b7aca04695fd44f324977ea30208cb29778da0074b6d0c092873995e10a9f89b9ad18ca04a8784941d02a389cbf2964ecac10c2a0f08110eed7c7ac20155005e17cc0efc80f9058820b9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208f82002903";
```

### Call receiveMessage() with the proof


```typescript
const receiveMessageFromChildTx = await tunnelRootInst.receiveMessage(proof);
```

    ========= NOTICE =========
    Request-Rate Exceeded  (this message will not be repeated)
    
    The default API keys for each service are provided as a highly-throttled,
    community resource for low-traffic projects and early prototyping.
    
    While your application will continue to function, we highly recommended
    signing up for your own API keys to improve performance, increase your
    request rate/limit and enable other perks, such as metrics and advanced APIs.
    
    For more details: https://docs.ethers.io/api-keys/
    ==========================



```typescript
receiveMessageFromChildTx
```

    {
      type: [33m2[39m,
      chainId: [33m5[39m,
      nonce: [33m34[39m,
      maxPriorityFeePerGas: BigNumber { _hex: [32m'0x9502f900'[39m, _isBigNumber: [33mtrue[39m },
      maxFeePerGas: BigNumber { _hex: [32m'0x9502f912'[39m, _isBigNumber: [33mtrue[39m },
      gasPrice: [1mnull[22m,
      gasLimit: BigNumber { _hex: [32m'0x06ebcf'[39m, _isBigNumber: [33mtrue[39m },
      to: [32m'0xE5F5D0a68A215110Fc0803d87D44253Ee5382f6c'[39m,
      value: BigNumber { _hex: [32m'0x00'[39m, _isBigNumber: [33mtrue[39m },
      data: [32m'0xf953cec700000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000f3af90f37842adb86f0b90100c13adae1fb747d5decca3202c5024e3cbb8e68160a2fca91eb2997634695bd60ce9dbd9cf930c681a5efa75a3a62eb09746c8708f92846ea9bc3177bd40c6bdf2565bbdb0e9fbb894ad252bb1a1990de0d2576441beb60d505aca71c27ff88fbb3a7d7ebb0fc8e552fd576b7f98a561c6e20b5395de0da5801987e6ddfedd72a8d7a0352107853deb5d6997057df7c3125d0a9feb28e8fe802cf7265576c54d1e3ca662e33585cc455cdda71123cbe28ccac9fb5c616caaf4b39f9ae2b566a5e9333586d6ca57c47c4885fa75d8a3a19da3891a890ac12365ec22c1a092d0454b58bec69492875a9869c38777a6c30206e09650f2307fcbfb75623ab55672cce840187291784623b442ba0dc4aa166a4d91c204c10468014325c72306b97f2f973cac8ffad10deb454b3d0a057c47be28efa80d1b5875157bc4d3392573f577e3d27c86358d4faef36377fedb9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208fb90855f90852f8b1a0d53ff64da7f3e9922d4df9d070bc6adf20099324e6969b79ab6e7f67f79b2882a044c9b41771d7bf4d369de422cbe97a17f52ff9c551100f3cc062dcf846152b27a0dc4006dc44ac50d5873ad9776c4ea17ed72c4d9ed39f6295295db15d3368ab77a007f752f67b510fe532ed0f8660cbb0e03e4bc34f72268b269d91f1df7fd70a4480808080a017287050d3a9fe69336a98a6837cbe5d051eaf6a12a6720ebff7de3bab4e73bf8080808080808080f90211a0f44380fc79e13ebd734bce4fb2b1c69304ebc309e97661036626e7ef78f5c1b4a0506f829a1c0bf6429aec66698fc98dab3c0a7530afbec99b6008546ec99e38eba0ea6fe3f302fe4141a4b1b2d874089f6305fb7f947ddb9c130a89806f50d6ce5da02bf4e7a7bd1c25f990f4686040f71a22a1c3a0e2515f55900889b96b209746b7a0c9c13f7880b971ba6a882c0f7908536107ce068df61f846c275e05d1825735ffa0f3979f8334c7fda7575856b48bfb74582346346382a025f278008f19ec2af427a0645228303b295734fb3078790a012b497b7bfa7ed98d08c97bea2a736097c2e6a057ad46b22e1c165cee617093d9568003739f30c09ffa7026f31203fbf484543fa04703b98334fbda27243d604af674928da9308f1faf92f088f81c6f7aad1f59bca09cc5064c0f3e635083d4f45e7ae83da317dff3faffa3800f47994692f2fa7360a0661e5bd7e12c7df4898c92b8ad97cd71e0a5c9efe88b2cd210870287537c5bb4a090449e79f90e5831d3a4a5239d927644b1ab67482c8db39b26f845b9c53aee95a077e7097450ef4b253d8701a971a49f0ab0aa147a5b7bfd0faf4d931522bc5b68a058d08a8e9220f913aeeb183bd2ba970a9ca1bca7a12b503eb1a1d07015e4b7aca04695fd44f324977ea30208cb29778da0074b6d0c092873995e10a9f89b9ad18ca04a8784941d02a389cbf2964ecac10c2a0f08110eed7c7ac20155005e17cc0efc80f9058820b9058402f9058001836be005b901000000010000000000000000000000000000000000000000010000000000000000000000000000020000100000000000000000c000020000000000000100200000000000000000000000000008000000808000000000000000000100000000004000000000020000000020200000000800000000000040000080000010000000000000000000000000000000000000000000000000000080000000000000000000220000000000000000000000000010000000000000800800000000000000404000010002000000000401000000000000000000000000000000500040000020000010000000000000000000000000000000000000000000000000000000100000f90475f8db942d16c6825d2377b2b87d378f359130b17c727367f842a08c0bdd7bca83c4e0c810cbecf44bc544a9dc0b9f265664e31ce0ce85f07a052ba00000000000000000000000000000000000000000000000000000000000000003b8809f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba449f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002f89c942d16c6825d2377b2b87d378f359130b17c727367f884a08c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f89c942d16c6825d2377b2b87d378f359130b17c727367f884a0ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a00000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000380f9011994d43e3ecce4430de35bb01461db8474cbf3ccd917e1a08c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036b8e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce69f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba4400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001f9013d940000000000000000000000000000000000001010f884a04dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63a00000000000000000000000000000000000000000000000000000000000001010a00000000000000000000000008fce67537676879bc5a1b86b403400e1614bfce6a0000000000000000000000000be188d6641e8b680743a4815dfa0f6208038960fb8a00000000000000000000000000000000000000000000000000000a04c66a4440000000000000000000000000000000000000000000000000004f104d7f5d7aa4e000000000000000000000000000000000000000000000c0b95a1ddb4b7b8dc8f00000000000000000000000000000000000000000000000004f0648b8f33664e000000000000000000000000000000000000000000000c0b95a27e011e5d208f82002903000000000000'[39m,
      accessList: [],
      hash: [32m'0xcaeffae90f02b37aaca3d676a47f7ef256b4a25b86f1835a6a478a9461a1b344'[39m,
      v: [33m0[39m,
      r: [32m'0x0c3964bf004e33c4dc8daf1fbb2cd720b2248a0a51986c32178d7c569b15948f'[39m,
      s: [32m'0x5353a105f7b73aa911286e5bb7aed61a2fc64ee9f7f6530d76856dfa695a7dba'[39m,
      from: [32m'0x8FcE67537676879Bc5a1B86B403400E1614Bfce6'[39m,
      confirmations: [33m0[39m,
      wait: [36m[Function (anonymous)][39m
    }



```typescript
const newGeneOfLastTokenId = await polyRootInst.geneOf(lastTokenId.toNumber());
```


```typescript
newGeneOfLastTokenId
```

    BigNumber {
      _hex: [32m'0x9f4900cf939efe5ea14b8bbc30a8ba9926a9844e601025374526b6df87baba44'[39m,
      _isBigNumber: [33mtrue[39m
    }



```typescript
morphedGene._hex === newGeneOfLastTokenId._hex
```

    [33mtrue[39m


- Also, ownership of the NFT should now be the user address


```typescript
const ownerOfLastTokenId = await polyRootInst.ownerOf(lastTokenId.toNumber());
```


```typescript
ownerOfLastTokenId
```

    0x8FcE67537676879Bc5a1B86B403400E1614Bfce6


## Conclusion

- Successfully bridged back the morphed NFT with no loss of information about the new gene!
