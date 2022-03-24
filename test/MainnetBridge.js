const { expect } = require("chai");

describe('Polymorph Mainnet Integration', () => {
  let tunnelInstance, exposedTunnelInstance, polymorphInstance;
  //Tunnel contrustor arguments
  const goerliCheckpointManager = "0x2890bA17EfE978480615e330ecB65333b880928e";
  const goerliFxRoot = "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA";

  //Polymorph constructor arguments
  let tokenName = "PolymorphWithGeneChanger";
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

  const constructorArgs = {
    name: tokenName,
    symbol: token,
    baseURI: baseUri,
    _daoAddress: daoAddress,
    premintedTokensCount: premintedTokensCount,
    _baseGenomeChangePrice: defaultGenomeChangePrice,
    _polymorphPrice: polymorphPrice,
    _maxSupply: totalSupply,
    _randomizeGenomePrice: randomizeGenomePrice,
    _bulkBuyLimit: bulkBuyLimit,
    _arweaveAssetsJSON: arweaveAssetsJSON,
    _polymorphV1Address: polymorphV1Address,
  };

  before(async () => {
    const PolymorphRootTunnel = await ethers.getContractFactory("PolymorphRootTunnel");
    tunnelInstance = await PolymorphRootTunnel.deploy(goerliCheckpointManager, goerliFxRoot, daoAddress);
    console.log(`tunnel contract deployed to: ${tunnelInstance.address}`);

    const ExposedPolymorphRootTunnel = await ethers.getContractFactory("ExposedPolymorphRootTunnel");
    exposedTunnelInstance = await ExposedPolymorphRootTunnel.deploy(goerliCheckpointManager, goerliFxRoot, daoAddress);
    console.log(`exposed tunnel contract deployed to: ${exposedTunnelInstance.address}`);
    
    const Polymorph = await ethers.getContractFactory("PolymorphRoot");
    polymorphInstance = await Polymorph.deploy(constructorArgs);
    console.log(`polymorph contract deployed to: ${polymorphInstance.address}`);

    await tunnelInstance.setPolymorphContract(polymorphInstance.address);
    await exposedTunnelInstance.setPolymorphContract(polymorphInstance.address);

    polymorphInstance.whitelistBridgeAddress(exposedTunnelInstance.address, true);
  });

  it('moveThroughWormhole should revert if polymorph has not been approved for transfer', async() => {
    const tokenId = 1;  
    
    await polymorphInstance.bulkBuy(tokenId, {value: polymorphPrice.mul(tokenId)});

    await expect(exposedTunnelInstance.moveThroughWormhole(tokenId), "").to.be.reverted;
  });

  it('moveThroughWormhole should revert when not called from polymorph owner', async() => {
    const tokenId = 1;  
    const [user, alice] = await ethers.getSigners();

    await polymorphInstance.bulkBuy(tokenId, {value: polymorphPrice.mul(tokenId)});

    await polymorphInstance.approve(exposedTunnelInstance.address, tokenId);

    await expect(exposedTunnelInstance.connect(alice).moveThroughWormhole(tokenId), "").revertedWith("Only owner can move polymorph");
  });

  it('moveThroughWormhole should not revert if polymorph has been approved for transfer', async() => {
    const tokenId = 2;  

    await polymorphInstance.bulkBuy(tokenId, {value: polymorphPrice.mul(tokenId)});

    await polymorphInstance.approve(exposedTunnelInstance.address, tokenId);

    await expect(exposedTunnelInstance.moveThroughWormhole(tokenId), "").to.not.be.reverted;
  });

  it('Should take polymorph from owner and lock it in bridge', async () => {
    const tokenId = 3;
    const [user] = await ethers.getSigners();
    console.log(`My address: ${user.address}`);
  
    await polymorphInstance.bulkBuy(tokenId, {value: polymorphPrice.mul(tokenId)});

    //Assert owner after minting
    let polymorphOwner = await polymorphInstance.ownerOf(tokenId);
    expect(polymorphOwner).eq(user.address);

    //Approve transfering of nft
    await polymorphInstance.approve(exposedTunnelInstance.address, tokenId);

    await exposedTunnelInstance.moveThroughWormhole(tokenId);

    //Assert owner after moving thourgh wormhole
    polymorphOwner = await polymorphInstance.ownerOf(tokenId);
    expect(polymorphOwner).eq(exposedTunnelInstance.address);
  });

  it('Should revert after trying to operate with a locked Token', async () => {
    const tokenId = 3;
    const [user] = await ethers.getSigners();
    console.log(`My address: ${user.address}`);
  
    await polymorphInstance.bulkBuy(tokenId, {value: polymorphPrice.mul(tokenId)});

    //Assert owner after minting
    let polymorphOwner = await polymorphInstance.ownerOf(tokenId);
    expect(polymorphOwner).eq(user.address);

    //Approve transfering of nft
    await polymorphInstance.approve(exposedTunnelInstance.address, tokenId);

    await exposedTunnelInstance.moveThroughWormhole(tokenId);

    //Assert owner after moving thourgh wormhole
    polymorphOwner = await polymorphInstance.ownerOf(tokenId);
    expect(polymorphOwner).eq(exposedTunnelInstance.address);

    const genePos = 5;
    const morphPrice = await polymorphInstance.priceForGenomeChange(tokenId);

    await expect(polymorphInstance.morphGene(tokenId, genePos, {value: morphPrice})).to.be.reverted;

    await expect(polymorphInstance.randomizeGenome(tokenId, {value: randomizeGenomePrice})).to.be.reverted;
  });

  it('Should return ownership of polymorph', async() => {
    const tokenId = 4;
    const [user] = await ethers.getSigners();
    console.log(`My address: ${user.address}`);
    
    await polymorphInstance.bulkBuy(tokenId, {value: polymorphPrice.mul(tokenId)});

    //Approve transfering of nft
    await polymorphInstance.approve(exposedTunnelInstance.address, tokenId);

    await exposedTunnelInstance.moveThroughWormhole(tokenId);

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
    const tokenId = 5;
    const [user] = await ethers.getSigners();
    console.log(`My address: ${user.address}`);
  
    await polymorphInstance.bulkBuy(tokenId, {value: polymorphPrice.mul(tokenId)});

    const newGene = "1231231312312312312312113";
    const newVirginity = false;
    const newChangesCount = 3;

    //Approve transfering of nft
    await polymorphInstance.approve(exposedTunnelInstance.address, tokenId);

    await exposedTunnelInstance.moveThroughWormhole(tokenId);

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