/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("@nomiclabs/hardhat-waffle");
 require("@nomiclabs/hardhat-etherscan");
 require('hardhat-contract-sizer');
 require('dotenv').config();
 require("solidity-coverage");

  module.exports = {
   solidity: {
     compilers: [
       {
         version: "0.7.4",
         settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
       },
       {
         version: "0.8.4",
         settings: {
          optimizer: {
            enabled: true,
            runs: 200,
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
       url: `https://eth-goerli.alchemyapi.io/v2/${process.env.GOERLI_ALCHEMY_KEY}`,
       accounts: [process.env.PRIVATE_KEY],
     },
     mumbai: {
       url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_ALCHEMY_KEY}`,
       accounts: [process.env.PRIVATE_KEY],
     },
   },
   etherscan: {
     apiKey: process.env.ETHERSCAN_API_KEY,
   },  
 }