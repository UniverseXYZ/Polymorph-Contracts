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

async function TestTokenDeploy() {
  await printDeployerInfo();

    const testToken = await hre.ethers.getContractFactory("TestERC20");
    const testtoken = await testToken.deploy();

  await testtoken.deployed();

  await hre.tenderly.persistArtifacts({
    name: "TestERC20",
    address: testtoken.address,
  });

  console.log(`TestERC20 address: ${testtoken.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
TestTokenDeploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
