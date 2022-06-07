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
  const royaltyFee = 0;
  const geneChangePrice = ethers.utils.parseEther("0.01");
  const polymorphPrice = ethers.utils.parseEther("0.0777");
  const polymorphsLimit = 10000;
  const randomizePrice = ethers.utils.parseEther("0.01");
  const bulkBuyLimit = 20;
  const arweaveContainer =
    "https://arweave.net/5KDDRA5EE9p-Bw29ryB9Uz6SvMRNMCyXKkOzW_ZT9gA";
  const polymorphV1Address = "0x665E3AD58e232cc8944C613D5e20c3A5C70A10ea";

  const constructorArgs = {
    name: tokenName,
    symbol: tokenSymbol,
    baseURI: metadataURI,
    _daoAddress: DAOAddress,
    _royaltyFee: royaltyFee,
    _baseGenomeChangePrice: geneChangePrice,
    _polymorphPrice: polymorphPrice,
    _maxSupply: polymorphsLimit,
    _randomizeGenomePrice: randomizePrice,
    _bulkBuyLimit: bulkBuyLimit,
    _arweaveAssetsJSON: arweaveContainer,
    _polymorphV1Address: polymorphV1Address,
  };

  const Polymorph = await hre.ethers.getContractFactory("PolymorphRoot");
  const polymorph = await Polymorph.deploy(constructorArgs);

  await polymorph.deployed();

  await hre.tenderly.persistArtifacts({
    name: "PolymorphRoot",
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
