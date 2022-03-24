const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Polymorph Polygon Integration', () => {
  let tunnelInstance, exposedTunnelInstance, polymorphInstance, wethInstance;
  //Tunnel contrustor arguments
  const goerliFxChild = "0xCf73231F28B7331BBe3124B907840A94851f9f11";

  //Polymorph constructor arguments
  let name = "PolymorphChild";
  let token = "MORPH";
  let baseUri = "";
  let daoAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
  let randomizeGenomePrice = ethers.utils.parseEther("0.01");
  let arweaveAssetsJSON = 'JSON'

  let tokenId = 0;
  let newGene = "54545454";
  let newVirginity = true;
  let newChangesCount = 5;


  before(async () => {
    const PolymorphChildTunnel = await ethers.getContractFactory("PolymorphChildTunnel");
    tunnelInstance = await PolymorphChildTunnel.deploy(goerliFxChild, daoAddress);
    console.log(`tunnel contract deployed to: ${tunnelInstance.address}`);

    const ExposedPolymorphChildTunnel = await ethers.getContractFactory("ExposedPolymorphChildTunnel");
    exposedTunnelInstance = await ExposedPolymorphChildTunnel.deploy(goerliFxChild, daoAddress);
    console.log(`exposed tunnel contract deployed to: ${exposedTunnelInstance.address}`);
    
    const Polymorph = await ethers.getContractFactory("PolymorphChild");
    polymorphInstance = await Polymorph.deploy(name, token, baseUri, daoAddress, defaultGenomeChangePrice, randomizeGenomePrice, arweaveAssetsJSON);
    console.log(`polymorph contract deployed to: ${polymorphInstance.address}`);

    const TestERC20 = await ethers.getContractFactory("TestERC20");
    wethInstance = await TestERC20.deploy();
    console.log(`Test WETH contract deployed to: ${wethInstance.address}`);

    await tunnelInstance.setPolymorphContract(polymorphInstance.address);
    await exposedTunnelInstance.setPolymorphContract(polymorphInstance.address);

    polymorphInstance.whitelistBridgeAddress(exposedTunnelInstance.address, true);

    await polymorphInstance.setMATICWethContract(wethInstance.address);

  });

  beforeEach(async() => {
    tokenId++;

    const [user] = await ethers.getSigners();
    
    const keccak = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256"],
      [tokenId, user.address, newGene, newVirginity, newChangesCount]
    );

    const approveAmount = 3000000000000000000;

    await exposedTunnelInstance.exposedProcessMessageFromRoot(1, user.address, keccak);

    await wethInstance.approve(user.address, polymorphInstance.address, approveAmount);
  })

  it('morphGene should tax WETH Token for morphing a gene', async() => {
    const morphGenePrice = await polymorphInstance.priceForGenomeChange(tokenId);
    const genePos = 5;

    const currentGene = await polymorphInstance.geneOf(tokenId);

    await expect(polymorphInstance.morphGene(tokenId, genePos, {value: morphGenePrice})).to.not.be.reverted;

    const morphedGene = await polymorphInstance.geneOf(tokenId);

    await expect(currentGene).to.not.equal(morphedGene);
  });

  it('randomizeGenome should tax WETH Token for randomizing a gene', async() => {

    const currentGene = await polymorphInstance.geneOf(genePos);

    await expect(polymorphInstance.randomizeGenome(tokenId, {value: randomizeGenomePrice})).to.not.be.reverted;

    const randomizedGenome = await polymorphInstance.geneOf(tokenId);

    await expect(currentGene).to.not.equal(morphedGene);
  });

  it('moveThroughWormhole should revert if polymorph has not been approved for transfer', async() => {
    await expect(tunnelInstance.moveThroughWormhole(tokenId)).to.be.revertedWith("ERC721Burnable: caller is not owner nor approved");
  });

  it('moveThroughWormhole should not revert if polymorph has been approved for transfer', async() => {
    await polymorphInstance.approve(tunnelInstance.address, tokenId);
    await expect(tunnelInstance.moveThroughWormhole(tokenId)).to.not.be.reverted;
  });

  it('moveThroughWormhole should burn polymorph on polygon', async () => {
    await polymorphInstance.approve(tunnelInstance.address, tokenId);
    await tunnelInstance.moveThroughWormhole(tokenId);
    await expect(polymorphInstance.ownerOf(tokenId)).to.be.revertedWith("ERC721: owner query for nonexistent token");
  });

  it('moveThroughWormhole should revert if not called by polymorph owner', async () => {
    const [user, alice] = await ethers.getSigners();
    await expect(tunnelInstance.connect(alice).moveThroughWormhole(tokenId)).revertedWith("Only owner can move polymorph");
  });

  it('processMessageFromRoot should mint and update polymoprh info correctly', async() => {
    const [user] = await ethers.getSigners();
    const baseGenomeChangePrice = await polymorphInstance.baseGenomeChangePrice();

    expect(await polymorphInstance.ownerOf(tokenId)).to.eq(user.address);
    expect(await polymorphInstance.geneOf(tokenId)).to.eq(newGene);
    expect(await polymorphInstance.isNotVirgin(tokenId)).to.eq(newVirginity);

    expect(await polymorphInstance.priceForGenomeChange(tokenId)).eq(baseGenomeChangePrice.mul((2**newChangesCount)));
  });
})