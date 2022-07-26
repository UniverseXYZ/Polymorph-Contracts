const { POSClient, use } = require("@maticnetwork/maticjs");
const { Web3ClientPlugin } = require("@maticnetwork/maticjs-ethers");
const { Wallet, providers } = require("ethers");
require("dotenv").config({path:'../.env'});

use(Web3ClientPlugin);

// DON'T TOUCH
const EVENT_SIGNATURE =
  "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036";

const TX_HASH_PARAM = process.argv.slice(2)[0];

async function generateProof() {
  const posClient = new POSClient();

  const parentProvider = new providers.JsonRpcProvider(
    `https://goerli.infura.io/v3/e19f0faf4c34413da3ff6f806910dace`
  );

  console.log("Parent: ", parentProvider)
  
  const childProvider = new providers.JsonRpcProvider(
    `https://polygon-mumbai.g.alchemy.com/v2/vJeprvW21K9qAMvlYrqkbtiHUoVQA1Ts`
  );

  await posClient.init({
    log: true,
    network: "testnet", // 'testnet' or 'mainnet'
    version: "mumbai", // 'mumbai' or 'v1'
    child: {
      provider: new Wallet(`${process.env.PRIVATE_KEY}`, childProvider),
    },
    parent: {
      provider: new Wallet(`${process.env.PRIVATE_KEY}`, parentProvider),
    },
  });

  // It's good to first check whether the txHash is checkpointed 
  const isCheckPointed = await posClient.isCheckPointed(TX_HASH_PARAM);
  console.log("Is Checkpointed: ", isCheckPointed);


  if(isCheckPointed) {
    const proof = await posClient.exitUtil.buildPayloadForExit(
      TX_HASH_PARAM,
      EVENT_SIGNATURE,
      false
    );
    console.log(proof);
  }
}

generateProof().catch((err) => console.error(err));
