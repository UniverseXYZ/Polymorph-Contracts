const { expect } = require("chai");

describe('PolymorphRoot', () => {
  let polymorphInstance;

  before(async () => {
    //Polymorph constructor arguments
    let name = "PolymorphWithGeneChanger";
    let token = "MORPH";
    let baseUri = "";
    let polymorphV1Address = "0x75D38741878da8520d1Ae6db298A9BD994A5D241";
    let daoAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
    let premintedTokensCount = 5;
    let polymorphPrice = ethers.utils.parseEther("0.0777");
    let totalSupply = 30;
    let randomizeGenomePrice = ethers.utils.parseEther("0.01");
    let bulkBuyLimit = 20;
    let arweaveAssetsJSON = 'JSON'

    const PolymorphRoot = await ethers.getContractFactory("PolymorphRoot");
    polymorphInstance = await PolymorphRoot.deploy(name, token, baseUri, daoAddress, premintedTokensCount, defaultGenomeChangePrice, polymorphPrice, totalSupply, randomizeGenomePrice, bulkBuyLimit, arweaveAssetsJSON, polymorphV1Address);
    console.log(`Polymorph instance deployed to: ${polymorphInstance.address}`);
  });

  it('wormholeUpdateGene should revert if not called from tunnel', async() => {
    await expect(polymorphInstance.wormholeUpdateGene(1, 12312312312, true, 2)).to.be.revertedWith("Not called from the tunnel");
  });
})