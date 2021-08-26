// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function printDeployerInfo() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

}

async function rootTunnelDeploy() {
  await printDeployerInfo();

  const goerliCheckpoint = "0x2890bA17EfE978480615e330ecB65333b880928e";
  const goerliFxRoot = "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA";
  //TODO: My wallet address. Change this when we have real dao address
  const daoAddress = "0x75D38741878da8520d1Ae6db298A9BD994A5D241";

  const RootTunnel = await hre.ethers.getContractFactory("PolymorphRootTunnel");
  const rootTunnel = await RootTunnel.deploy(goerliCheckpoint, goerliFxRoot, daoAddress);

  await rootTunnel.deployed();
  console.log(`Root tunnel address: ${rootTunnel.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
rootTunnelDeploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
