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
  let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
  let royaltyFee = 0;
  let polymorphPrice = ethers.utils.parseEther("0.0777");
  let totalSupply = 10000;
  let randomizeGenomePrice = ethers.utils.parseEther("0.01");
  let bulkBuyLimit = 20;
  let arweaveAssetsJSON = 'JSON'

  let tokenId = 10000;

  before(async () => {
    const [user, dao] = await ethers.getSigners();
    
    const constructorArgs = {
      name: tokenName,
      symbol: token,
      baseURI: baseUri,
      _daoAddress: dao.address,
      _royaltyFee: royaltyFee,
      _baseGenomeChangePrice: defaultGenomeChangePrice,
      _polymorphPrice: polymorphPrice,
      _maxSupply: totalSupply,
      _randomizeGenomePrice: randomizeGenomePrice,
      _bulkBuyLimit: bulkBuyLimit,
      _arweaveAssetsJSON: arweaveAssetsJSON,
      _polymorphV1Address: polymorphV1Address,
    };

    const PolymorphRootTunnel = await ethers.getContractFactory("PolymorphRootTunnel");
    tunnelInstance = await PolymorphRootTunnel.deploy(goerliCheckpointManager, goerliFxRoot, dao.address);
    console.log(`tunnel contract deployed to: ${tunnelInstance.address}`);

    const ExposedPolymorphRootTunnel = await ethers.getContractFactory("ExposedPolymorphRootTunnel");
    exposedTunnelInstance = await ExposedPolymorphRootTunnel.deploy(goerliCheckpointManager, goerliFxRoot, dao.address);
    console.log(`exposed tunnel contract deployed to: ${exposedTunnelInstance.address}`);
    
    const Polymorph = await ethers.getContractFactory("PolymorphRoot");
    polymorphInstance = await Polymorph.deploy(constructorArgs);
    console.log(`polymorph contract deployed to: ${polymorphInstance.address}`);

    const daoVotedSupply = 10500;

		await polymorphInstance.connect(dao).setMaxSupply(daoVotedSupply);

    await tunnelInstance.connect(dao).setPolymorphContract(polymorphInstance.address);
    await exposedTunnelInstance.connect(dao).setPolymorphContract(polymorphInstance.address);

    polymorphInstance.connect(dao).whitelistBridgeAddress(exposedTunnelInstance.address, true);

    await polymorphInstance.bulkBuy(bulkBuyLimit, {value: polymorphPrice.mul(bulkBuyLimit)});

  });

  it('moveThroughWormhole should revert if polymorph(s) have not been approved for transfer', async() => {

    await expect(exposedTunnelInstance.moveThroughWormhole([tokenId, tokenId + 1, tokenId + 2]), "").to.be.reverted;
  });

  it('moveThroughWormhole should revert when not called from polymorph owner', async() => {  
    const [user, alice] = await ethers.getSigners();

    await polymorphInstance.setApprovalForAll(exposedTunnelInstance.address, true);

    await expect(exposedTunnelInstance.connect(alice).moveThroughWormhole([tokenId + 1, tokenId + 2, tokenId + 3]), "").revertedWith("Msg.sender should be the polymorph owner");
  });

  it('moveThroughWormhole should not revert if polymorph(s) have been approved for transfer', async() => {

    await polymorphInstance.setApprovalForAll(exposedTunnelInstance.address, true);

    await expect(exposedTunnelInstance.moveThroughWormhole([tokenId + 1, tokenId + 2, tokenId + 3]), "").to.not.be.reverted;
  });

  it('Should take polymorph(s) from owner and lock it in bridge', async () => {
    const [user] = await ethers.getSigners();
    console.log(`My address: ${user.address}`);


    //Assert owner after minting
    let polymorphOwner = await polymorphInstance.ownerOf(tokenId + 4);
    expect(polymorphOwner).eq(user.address);

    //Approve transfering of nft
    await polymorphInstance.setApprovalForAll(exposedTunnelInstance.address, true);

    await exposedTunnelInstance.moveThroughWormhole([tokenId + 4, tokenId + 5, tokenId + 6]);

    //Assert owner after moving thourgh wormhole
    polymorphOwner = await polymorphInstance.ownerOf(tokenId + 4);
    expect(polymorphOwner).eq(exposedTunnelInstance.address);
  });

  it('Should revert after trying to operate with locked Token(s)', async () => {
    const [user] = await ethers.getSigners();
    console.log(`My address: ${user.address}`);

    // Assert owner after minting
    let polymorphOwner = await polymorphInstance.ownerOf(tokenId + 7);
    expect(polymorphOwner).eq(user.address);

    // Approve transfering of nft
    await polymorphInstance.setApprovalForAll(exposedTunnelInstance.address, true);

    await exposedTunnelInstance.moveThroughWormhole([tokenId + 7, tokenId + 8, tokenId + 9, tokenId + 10]);

    // Assert owner after moving through wormhole
    polymorphOwner = await polymorphInstance.ownerOf(tokenId + 7);
    expect(polymorphOwner).eq(exposedTunnelInstance.address);

    const genePos = 5;
    const morphPrice = await polymorphInstance.priceForGenomeChange(tokenId + 7);

    await expect(polymorphInstance.morphGene(tokenId, genePos, {value: morphPrice})).to.be.reverted;

    await expect(polymorphInstance.randomizeGenome(tokenId, {value: randomizeGenomePrice})).to.be.reverted;
  });

  it('Should return ownership of polymorph(s)', async() => {
    const [user] = await ethers.getSigners();
    console.log(`My address: ${user.address}`);

    //Approve transfering of nft
    await polymorphInstance.setApprovalForAll(exposedTunnelInstance.address, true);

    await exposedTunnelInstance.moveThroughWormhole([tokenId + 11, tokenId + 12, tokenId + 13, tokenId + 14]);

    polymorphOwner = await polymorphInstance.ownerOf(tokenId + 11);
    expect(polymorphOwner).eq(exposedTunnelInstance.address);

    const keccak11 = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256", "uint256"],
      [tokenId + 11, user.address, "1231231312312312312312113", false, 2, 1]
    );

    await exposedTunnelInstance.processMessageFromChild(keccak11);
    polymorphOwner = await polymorphInstance.ownerOf(tokenId + 11);
    expect(polymorphOwner).eq(user.address);

    // 12

    polymorphOwner12 = await polymorphInstance.ownerOf(tokenId + 12);
    expect(polymorphOwner12).eq(exposedTunnelInstance.address);

    const keccak12 = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256", "uint256"],
      [tokenId + 12, user.address, "1231231312312312312312113", false, 2, 1]
    );

    await exposedTunnelInstance.processMessageFromChild(keccak12);
    polymorphOwner12 = await polymorphInstance.ownerOf(tokenId + 12);
    expect(polymorphOwner12).eq(user.address);

    // 13

    polymorphOwner13 = await polymorphInstance.ownerOf(tokenId + 13);
    expect(polymorphOwner13).eq(exposedTunnelInstance.address);

    const keccak13 = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256", "uint256"],
      [tokenId + 13, user.address, "1231231312312312312312113", false, 2, 1]
    );

    await exposedTunnelInstance.processMessageFromChild(keccak13);
    polymorphOwner13 = await polymorphInstance.ownerOf(tokenId + 13);
    expect(polymorphOwner13).eq(user.address);

    // 14

    polymorphOwner14 = await polymorphInstance.ownerOf(tokenId + 14);
    expect(polymorphOwner14).eq(exposedTunnelInstance.address);

    const keccak14 = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256", "uint256"],
      [tokenId + 14, user.address, "1231231312312312312312113", false, 2, 1]
    );

    await exposedTunnelInstance.processMessageFromChild(keccak14);
    polymorphOwner14 = await polymorphInstance.ownerOf(tokenId + 14);
    expect(polymorphOwner14).eq(user.address);



  });

  it('Should update polymoprh(s) info correctly', async() => {
    const [user] = await ethers.getSigners();
    console.log(`My address: ${user.address}`);
  
    // await polymorphInstance.bulkBuy(bulkBuyLimit, {value: polymorphPrice.mul(bulkBuyLimit)});

    const newGene = "1231231312312312312312113";
    const newVirginity = false;
    const newChangesCount = 3;

    //Approve transfering of nft
    await polymorphInstance.setApprovalForAll(exposedTunnelInstance.address, true);

    await exposedTunnelInstance.moveThroughWormhole([tokenId + 15, tokenId + 16]);

    const keccak15 = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256"],
      [tokenId + 15, user.address, newGene, newVirginity, newChangesCount]
    );

    const keccak16 = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256"],
      [tokenId + 16, user.address, newGene, newVirginity, newChangesCount]
    );

    await exposedTunnelInstance.processMessageFromChild(keccak15);
    
    expect(await polymorphInstance.geneOf(tokenId + 15)).eq(newGene);
    expect(await polymorphInstance.isNotVirgin(tokenId + 15)).eq(newVirginity);

    const baseGenomeChangePrice15 = await polymorphInstance.baseGenomeChangePrice();
    expect(await polymorphInstance.priceForGenomeChange(tokenId + 15)).eq(baseGenomeChangePrice15.mul((2**newChangesCount)));

    await exposedTunnelInstance.processMessageFromChild(keccak16);

    expect(await polymorphInstance.geneOf(tokenId + 16)).eq(newGene);
    expect(await polymorphInstance.isNotVirgin(tokenId + 16)).eq(newVirginity);

    const baseGenomeChangePrice16 = await polymorphInstance.baseGenomeChangePrice();
    expect(await polymorphInstance.priceForGenomeChange(tokenId + 16)).eq(baseGenomeChangePrice16.mul((2**newChangesCount)));
  });

})