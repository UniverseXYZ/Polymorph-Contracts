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

  const tokenName = "PolymorphChild";
  const tokenSymbol = "iMORPH";
  const metadataURI =
    "https://us-central1-polymorphmetadata.cloudfunctions.net/images-function-test?id=";
  const DAOAddress = "0x7e94e8D8c85960DBDC67E080C3D48D4e0BD423a6";
  const maticWETHAddress = "0xBEd0609af43a0cbAe586255e8e39c93398f54CDA";
  const geneChangePrice = ethers.utils.parseEther("0.001");
  const randomizePrice = ethers.utils.parseEther("0.001");
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
