const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");

describe('Polymorph Mainnet Integration', () => {
  let tunnelInstance, exposedTunnelInstance, polymorphInstance;
  //Tunnel contrustor arguments
  const goerliCheckpointManager = "0x2890bA17EfE978480615e330ecB65333b880928e";
  const goerliFxRoot = "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA";

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


  before(async () => {
    const PolymorphRootTunnel = await ethers.getContractFactory("PolymorphRootTunnel");
    tunnelInstance = await PolymorphRootTunnel.deploy(goerliCheckpointManager, goerliFxRoot, daoAddress);
    console.log(`tunnel contract deployed to: ${tunnelInstance.address}`);

    const ExposedPolymorphRootTunnel = await ethers.getContractFactory("ExposedPolymorphRootTunnel");
    exposedTunnelInstance = await ExposedPolymorphRootTunnel.deploy(goerliCheckpointManager, goerliFxRoot, daoAddress);
    console.log(`exposed tunnel contract deployed to: ${exposedTunnelInstance.address}`);
    
    const Polymorph = await ethers.getContractFactory("PolymorphWithGeneChanger");
    polymorphInstance = await Polymorph.deploy(name, token, baseUri, daoAddress, premintedTokensCount, defaultGenomeChangePrice, polymorphPrice, totalSupply, randomizeGenomePrice, bulkBuyLimit, arweaveAssetsJSON, polymorphV1Address, exposedTunnelInstance.address);
    console.log(`polymorph contract deployed to: ${polymorphInstance.address}`);

    await tunnelInstance.setPolymorphContract(polymorphInstance.address);
    await exposedTunnelInstance.setPolymorphContract(polymorphInstance.address);
  });

  it('Should take polymorph from owner and lock it in bridge', async () => {
    const [user] = await ethers.getSigners();
    const tokenId = 2;

    console.log(`My address: ${user.address}`);

    const price = await polymorphInstance.polymorphPrice();
    console.log(`Price: ${price}`);

    await polymorphInstance.bulkBuy(tokenId, {value: price.mul(tokenId)});

    //Assert owner after minting
    let polymorphOwner = await polymorphInstance.ownerOf(tokenId);
    expect(polymorphOwner).eq(user.address);

    //Approve transfering of nft
    await polymorphInstance.approve(exposedTunnelInstance.address, tokenId);

    const gene = await polymorphInstance.geneOf(tokenId);
    const isNotVirgin = await polymorphInstance.isNotVirgin(tokenId);
    const genomeChanges = await polymorphInstance.genomeChanges(tokenId);

    await exposedTunnelInstance.moveThroughWormhole(tokenId, gene, isNotVirgin, genomeChanges);

    //Assert owner after moving thourgh wormhole
    polymorphOwner = await polymorphInstance.ownerOf(tokenId);
    expect(polymorphOwner).eq(exposedTunnelInstance.address);
  });

  it('Should return ownership of polymorph', async() => {
    const [user] = await ethers.getSigners();
    const tokenId = 3;

    console.log(`My address: ${user.address}`);

    const price = await polymorphInstance.polymorphPrice();

    await polymorphInstance.bulkBuy(tokenId, {value: price.mul(tokenId)});

    //Approve transfering of nft
    await polymorphInstance.approve(exposedTunnelInstance.address, tokenId);

    const gene = await polymorphInstance.geneOf(tokenId);
    const isNotVirgin = await polymorphInstance.isNotVirgin(tokenId);
    const genomeChanges = await polymorphInstance.genomeChanges(tokenId);

    await exposedTunnelInstance.moveThroughWormhole(tokenId, gene, isNotVirgin, genomeChanges);

    polymorphOwner = await polymorphInstance.ownerOf(tokenId);
    expect(polymorphOwner).eq(exposedTunnelInstance.address);

    const keccak = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256", "uint256"],
      [tokenId, user.address, "1231231312312312312312113", false, 2, 1]
    );

    await exposedTunnelInstance.processMessageFromChild(keccak);
    polymorphOwner = await polymorphInstance.ownerOf(tokenId);
    expect(polymorphOwner).eq(user.address);
  });

  it('Should update polymoprh info correctly', async() => {
    const [user] = await ethers.getSigners();
    const tokenId = 5;
    const newGene = "1231231312312312312312113";
    const newVirginity = false;
    const newChangesCount = 3;
    console.log(`My address: ${user.address}`);

    const price = await polymorphInstance.polymorphPrice();
    
    await polymorphInstance.bulkBuy(tokenId, {value: price.mul(tokenId)});

    //Approve transfering of nft
    await polymorphInstance.approve(exposedTunnelInstance.address, tokenId);

    const gene = await polymorphInstance.geneOf(tokenId);
    const isNotVirgin = await polymorphInstance.isNotVirgin(tokenId);
    const genomeChanges = await polymorphInstance.genomeChanges(tokenId);

    await exposedTunnelInstance.moveThroughWormhole(tokenId, gene, isNotVirgin, genomeChanges);

    const keccak = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256"],
      [tokenId, user.address, newGene, newVirginity, newChangesCount]
    );

    await exposedTunnelInstance.processMessageFromChild(keccak);
    
    expect(await polymorphInstance.geneOf(tokenId)).eq(newGene);
    expect(await polymorphInstance.isNotVirgin(tokenId)).eq(newVirginity);

    const baseGenomeChangePrice = await polymorphInstance.baseGenomeChangePrice();
    expect(await polymorphInstance.priceForGenomeChange(tokenId)).eq(baseGenomeChangePrice.mul((2**newChangesCount)));
  });
})