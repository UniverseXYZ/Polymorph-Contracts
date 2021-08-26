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

async function childTunnelDeploy() {
  await printDeployerInfo();

  const mumbaiFxChild = "0xCf73231F28B7331BBe3124B907840A94851f9f11";
  //TODO: My wallet address. Change this when we have real dao address
  const daoAddress = "0x6FB3946CCc1a4b04FE49ce3e591C15f496C73881";

  const ChildTunnel = await hre.ethers.getContractFactory("PolymorphChildTunnel");
  const childTunnel = await ChildTunnel.deploy(mumbaiFxChild, daoAddress);

  await childTunnel.deployed();

  console.log(`Child tunnel address: ${childTunnel.address}`);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
childTunnelDeploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
