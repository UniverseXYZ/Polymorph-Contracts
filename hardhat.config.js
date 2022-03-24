/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("@nomiclabs/hardhat-waffle");
 require("@nomiclabs/hardhat-etherscan");
 require('hardhat-contract-sizer');
 require('dotenv').config();
 require("solidity-coverage");
 require("@tenderly/hardhat-tenderly");

  module.exports = {
   solidity: {
     compilers: [
       {
         version: "0.8.4",
         settings: {
          optimizer: { 
            enabled: true,
            runs: 200
          }
        }  
       },
     ],
   },
   contractSizer: {
     alphaSort: true,
     runOnCompile: true,
     disambiguatePaths: false,
   },
   networks: {
     hardhat: {
       gas: 15000000,
       blockGasLimit: 15000000,
       allowUnlimitedContractSize: true,
       timeout: 1800000,
       accounts: {
         count: 100,
       },
       forking: {
         url: `https://eth-goerli.alchemyapi.io/v2/${process.env.GOERLI_ALCHEMY_KEY}`,
         blockNumber: 5381730
       }  
     },
     goerli: {
       url: `https://goerli.infura.io/v3/${process.env.GOERLI_INFURA_KEY}`,
       accounts: [process.env.PRIVATE_KEY],
     },
     rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    mumbai: {
       url: "https://polygon-mumbai.g.alchemy.com/v2/vJeprvW21K9qAMvlYrqkbtiHUoVQA1Ts",
       accounts: [process.env.PRIVATE_KEY],
     },
   },
   etherscan: {
    apiKey: {
      rinkeby: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY
    }
   }
 }