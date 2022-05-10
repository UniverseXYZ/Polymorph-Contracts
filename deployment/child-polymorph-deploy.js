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

async function PolymorphDeploy() {
  await printDeployerInfo();

  const tokenName = "Polymorph";
  const tokenSymbol = "MORPH";
  const metadataURI =
    "https://us-central1-polymorphmetadata.cloudfunctions.net/images-function?id=";
  const DAOAddress = "0x8FcE67537676879Bc5a1B86B403400E1614Bfce6";
  const maticWETHAddress = "0x4Fb90bc32709d73A5E745B56708C84A6Ad7Ab5C9";
  const geneChangePrice = ethers.utils.parseEther("0.01");
  const randomizePrice = ethers.utils.parseEther("0.01");
  const arweaveContainer =
    "https://arweave.net/5KDDRA5EE9p-Bw29ryB9Uz6SvMRNMCyXKkOzW_ZT9gA";

  const Polymorph = await hre.ethers.getContractFactory("PolymorphChild");
  const polymorph = await Polymorph.deploy(
    tokenName,
    tokenSymbol,
    metadataURI,
    DAOAddress,
    maticWETHAddress,
    geneChangePrice,
    randomizePrice,
    arweaveContainer
  );

  await polymorph.deployed();

  await hre.tenderly.persistArtifacts({
    name: "PolymorphChild",
    address: polymorph.address,
  });
  console.log(`Polymorph address: ${polymorph.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
PolymorphDeploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
