const { expect } = require("chai");

describe("PolymorphRootOld", () => {
  let DAO;
  let aliceAccount;
  let bobsAccount;
  let deployer;
  let polymorphInstance;

  let name = "PolymorphWithGeneChanger";
  let token = "POLY";
  let baseUri = "http://www.kekdao.com/";
  let royaltyFee = 100;
  let totalSupply = 10000;
  let bulkBuyLimit = 20;
  let polymorphPrice = ethers.utils.parseEther("0.0777");
  let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
  let randomizeGenomePrice = ethers.utils.parseEther("0.02");
  let arweaveAssetsJSON = "JSON";
  let polymorphV1Address = "0x75D38741878da8520d1Ae6db298A9BD994A5D241";

  const startTokenId = 10000;

  const daoVotedSupply = 10500;

  let constructorArgs;

  before(async () => {
    const [user, dao, alice, bob] = await ethers.getSigners();

    DAO = dao;
    aliceAccount = alice;
    bobsAccount = bob;
    deployer = user;

    constructorArgs = {
      name: name,
      symbol: token,
      baseURI: baseUri,
      _daoAddress: DAO.address,
      _royaltyFee: royaltyFee,
      _baseGenomeChangePrice: defaultGenomeChangePrice,
      _polymorphPrice: polymorphPrice,
      _maxSupply: totalSupply,
      _randomizeGenomePrice: randomizeGenomePrice,
      _bulkBuyLimit: bulkBuyLimit,
      _arweaveAssetsJSON: arweaveAssetsJSON,
      _polymorphV1Address: polymorphV1Address,
    };

    const PolymorphRoot = await ethers.getContractFactory("PolymorphRoot");
    polymorphInstance = await PolymorphRoot.deploy(constructorArgs);

    console.log(`Polymorph instance deployed to: ${polymorphInstance.address}`);

    await polymorphInstance.connect(dao).setMaxSupply(daoVotedSupply);
  });

  it(`first token id should be ${startTokenId + 1}`, async () => {
    const [user, dao] = await ethers.getSigners();

    const PolymorphRootNoPremint = await ethers.getContractFactory(
      "PolymorphRoot"
    );

    polymorphInstanceNoPremint = await PolymorphRootNoPremint.deploy(
      constructorArgs
    );

    await polymorphInstanceNoPremint.connect(dao).setMaxSupply(daoVotedSupply);

    await polymorphInstanceNoPremint["mint()"]({ value: polymorphPrice });

    const lastToken = await polymorphInstanceNoPremint.lastTokenId();

    expect(lastToken).eq(startTokenId + 1);
  });

  it(`mint(address) should be disabled`, async () => {
    await expect(
      polymorphInstance["mint(address)"](deployer.address)
    ).revertedWith("Should not use this one");
  });

  it(`should bulkBuy`, async () => {
    const cost = await polymorphInstance.polymorphPrice();
    const bulkBuyCount = 2;
    await polymorphInstance.bulkBuy(bulkBuyCount, { value: cost.mul(20) });
    const lastTokenId = await polymorphInstance.lastTokenId();

    expect(lastTokenId - startTokenId).eq(bulkBuyCount);
  });

  it(`should have owner`, async () => {
    const ownerAddress = await polymorphInstance.owner()
    expect(ownerAddress).eq(deployer.address);
  });

  it(`should transfer ownership`, async () => {
    const initialOwnerAddress = await polymorphInstance.owner();
    expect(initialOwnerAddress).eq(deployer.address);

    await polymorphInstance.transferOwnership(DAO.address);

    const newOwnerAddress = await polymorphInstance.owner();
    expect(newOwnerAddress).eq(DAO.address);
  });

  it(`should have ERC2981 Default Royalties`, async () => {
    const royaltyInfo = await polymorphInstance.royaltyInfo(1, 10000);

    expect(royaltyInfo[0]).eq(DAO.address);
    expect(royaltyInfo[1]).eq(royaltyFee);
  });

  it(`only DAO should update ERC2981 Default Royalties`, async () => {
    const royaltyInfo = await polymorphInstance.royaltyInfo(1, 10000);

    expect(royaltyInfo[0]).eq(DAO.address);
    expect(royaltyInfo[1]).eq(royaltyFee);

    await expect(
      polymorphInstance.setDefaultRoyalty(deployer.address, 200)
    ).revertedWith("Not called from the dao");

    await expect(
      polymorphInstance.connect(DAO).setDefaultRoyalty(deployer.address, 200)
    ).to.be.emit(polymorphInstance, "DefaultRoyaltyChanged");

    const newRoyaltyInfo = await polymorphInstance.royaltyInfo(1, 10000);

    expect(newRoyaltyInfo[0]).eq(deployer.address);
    expect(newRoyaltyInfo[1]).eq(200);
  });

  it(`transfer calls mint functionality`, async () => {
    const lastTokenId = await polymorphInstance.lastTokenId();
    await deployer.sendTransaction({
      to: polymorphInstance.address,
      value: ethers.utils.parseEther("1"),
    });
    const lastTokenIdAfter = await polymorphInstance.lastTokenId();
    await expect(lastTokenId.add(1)).eq(lastTokenIdAfter);
    const owner = await polymorphInstance.ownerOf(lastTokenIdAfter);

    await expect(owner).eq(deployer.address);
  });

  it("should mint nft with random gene", async () => {
    const kekBalanceBefore = await DAO.getBalance();

    const cost = await polymorphInstance.polymorphPrice();
    await polymorphInstance["mint()"]({ value: cost });
    await polymorphInstance["mint()"]({ value: cost });

    const kekBalanceAfter = await DAO.getBalance();

    const geneA = await polymorphInstance.geneOf(startTokenId + 1);
    const geneB = await polymorphInstance.geneOf(startTokenId + 2);

    expect(geneA).not.eq(geneB, "The two genes ended up the same");

    expect(kekBalanceAfter).eq(
      kekBalanceBefore.add(cost.mul(2)),
      "The dao did not receive correct amount"
    );
  });

  it("should not change the gene on transfer", async () => {
    const bobsAddress = await bobsAccount.address;

    const geneBefore = await polymorphInstance.geneOf(startTokenId + 3);
    await polymorphInstance.transferFrom(
      deployer.address,
      bobsAddress,
      startTokenId + 3
    );
    const geneAfter = await polymorphInstance.geneOf(startTokenId + 3);

    expect(geneBefore).eq(geneAfter, "The two genes ended up the same");
  });

  it("should evolve gene", async () => {
    const tokenIdForMorphing = startTokenId + 2;
    const kekBalanceBefore = await DAO.getBalance();

    const geneBefore = await polymorphInstance.geneOf(tokenIdForMorphing);

    let price = await polymorphInstance.priceForGenomeChange(
      tokenIdForMorphing
    );
    expect(price).eq(defaultGenomeChangePrice, "The price was not the default");

    await expect(
      await polymorphInstance.morphGene(tokenIdForMorphing, 1, { value: price })
    ).to.changeEtherBalance(deployer, price.mul(-1));

    const geneAfter = await polymorphInstance.geneOf(tokenIdForMorphing);
    expect(geneBefore).not.eq(geneAfter, "The gene did not change");

    price = await polymorphInstance.priceForGenomeChange(tokenIdForMorphing);
    expect(price).eq(
      defaultGenomeChangePrice.mul(2),
      "The price was not correct"
    );

    const kekBalanceAfter = await DAO.getBalance();
    await expect(
      polymorphInstance.morphGene(tokenIdForMorphing, 0, { value: price })
    ).to.be.reverted;
    const geneAfter2 = await polymorphInstance.geneOf(tokenIdForMorphing);
    const kekBalanceAfter2 = await DAO.getBalance();
    expect(geneAfter2).eq(geneAfter, "The gene did change");
    expect(kekBalanceAfter).eq(kekBalanceAfter2, "The price was paid");

    price = await polymorphInstance.priceForGenomeChange(tokenIdForMorphing);
    expect(price).eq(
      defaultGenomeChangePrice.mul(2),
      "The price was not correct"
    );

    await polymorphInstance.morphGene(tokenIdForMorphing, 10, {
      value: price,
      gasLimit: 100000,
    });
    const geneAfter3 = await polymorphInstance.geneOf(tokenIdForMorphing);
    expect(geneAfter2).not.eq(geneAfter3, "The gene did not change");

    price = await polymorphInstance.priceForGenomeChange(tokenIdForMorphing);
    expect(price).eq(
      defaultGenomeChangePrice.mul(4),
      "The price was not correct"
    );

    await polymorphInstance.randomizeGenome(startTokenId + 2, { value: price });
    const geneAfterReset = await polymorphInstance.geneOf(tokenIdForMorphing);
    expect(geneAfterReset).not.eq(geneAfter3, "The gene did not change");

    price = await polymorphInstance.priceForGenomeChange(tokenIdForMorphing);
    expect(price).eq(defaultGenomeChangePrice, "The price was not the default");
  });

  it("should not morph from a contract interactor", async () => {
    const tokenIdForRandomize = startTokenId + 2;
    const geneBefore = await polymorphInstance.geneOf(tokenIdForRandomize);

    await polymorphInstance.randomizeGenome(tokenIdForRandomize, {
      value: randomizeGenomePrice,
    });

    const geneAfter = await polymorphInstance.geneOf(tokenIdForRandomize);

    expect(geneBefore).not.eq(
      geneAfter,
      "Genes did not change for EOW interaction"
    );
    const TestContractInteractor = await ethers.getContractFactory(
      "TestContractInteractor"
    );
    const contractInteractor = await TestContractInteractor.deploy(
      polymorphInstance.address
    );
    await polymorphInstance.transferFrom(
      deployer.address,
      contractInteractor.address,
      tokenIdForRandomize
    );

    await expect(
      contractInteractor.triggerRandomize(tokenIdForRandomize, {
        value: randomizeGenomePrice,
      })
    ).to.be.revertedWith("Caller cannot be a contract");
    await expect(
      contractInteractor.triggerGeneChange(tokenIdForRandomize, 2, {
        value: randomizeGenomePrice,
      })
    ).to.be.revertedWith("Caller cannot be a contract");
  });

  it("should not morph polymorph that is not yours", async () => {
    const cost = await polymorphInstance.polymorphPrice();

    await polymorphInstance["mint()"]({ value: cost });
    const tokenId = await polymorphInstance.lastTokenId();

    await expect(
      polymorphInstance.connect(aliceAccount).randomizeGenome(tokenId)
    ).revertedWith(
      "PolymorphWithGeneChanger: cannot change genome of token that is not own"
    );
    await expect(
      polymorphInstance.connect(aliceAccount).morphGene(tokenId, 2)
    ).revertedWith(
      "PolymorphWithGeneChanger: cannot change genome of token that is not own"
    );
  });

  it("should not morph  base character", async () => {
    const cost = await polymorphInstance.polymorphPrice();

    await polymorphInstance["mint()"]({ value: cost });

    const tokenId = await polymorphInstance.lastTokenId();

    const morphCost = await polymorphInstance.priceForGenomeChange(tokenId);

    await expect(
      polymorphInstance.morphGene(tokenId, 0, { value: morphCost })
    ).revertedWith("Base character not morphable");
  });

  it("should not randomize the base character", async () => {
    const cost = await polymorphInstance.polymorphPrice();

    await polymorphInstance["mint()"]({ value: cost });

    const tokenId = await polymorphInstance.lastTokenId();

    const baseChar = await polymorphInstance.geneOf(tokenId);

    const scrambleCost = await polymorphInstance.randomizeGenomePrice();

    await polymorphInstance.randomizeGenome(tokenId, { value: scrambleCost });

    const baseCharAfterRandomization = await polymorphInstance.geneOf(tokenId);

    await expect(baseChar.mod(100)).eq(baseCharAfterRandomization.mod(100));
  });

  it("genome should be the same length after randomization", async () => { // May fail sometimes. See the Note in README##Genome
    const cost = await polymorphInstance.polymorphPrice();

    await polymorphInstance.bulkBuy(20, { value: cost.mul(20) });

    const tokenId = await polymorphInstance.lastTokenId();

    const scrambleCost = await polymorphInstance.randomizeGenomePrice();

    const geneOfToken = (await polymorphInstance.geneOf(tokenId)).toString();

    await polymorphInstance.randomizeGenome(tokenId, { value: scrambleCost });

    const geneOfTokenAfterRandomization = (
      await polymorphInstance.geneOf(tokenId)
    ).toString();

    await expect(geneOfToken.length).eq(geneOfTokenAfterRandomization.length);
  });

  it("should not morph gene when DAO does not have receive or fallback function", async () => {
    const TestContractInteractor = await ethers.getContractFactory(
      "TestContractInteractor"
    );
    const contractInteractor = await TestContractInteractor.deploy(
      polymorphInstance.address
    );

    const MockedPolymorphRoot = await ethers.getContractFactory(
      "PolymorphRoot"
    );
    const mockedPolymorphInstance = await MockedPolymorphRoot.deploy({
      name: name,
      symbol: token,
      baseURI: baseUri,
      _daoAddress: contractInteractor.address,
      _royaltyFee: royaltyFee,
      _baseGenomeChangePrice: defaultGenomeChangePrice,
      _polymorphPrice: polymorphPrice,
      _maxSupply: daoVotedSupply,
      _randomizeGenomePrice: randomizeGenomePrice,
      _bulkBuyLimit: bulkBuyLimit,
      _arweaveAssetsJSON: arweaveAssetsJSON,
      _polymorphV1Address: polymorphV1Address,
    });

    const cost = await mockedPolymorphInstance.polymorphPrice();
    await expect(
      mockedPolymorphInstance.morphGene(startTokenId, 2)
    ).revertedWith(
      "ERC721: owner query for nonexistent token"
    );
  });

  it("should revert if invalid gene position is passed", async () => {
    const cost = await polymorphInstance.polymorphPrice();

    await polymorphInstance["mint()"]({ value: cost });

    const tokenId = await polymorphInstance.lastTokenId();

    const morphCost = await polymorphInstance.priceForGenomeChange(tokenId);

    await expect(polymorphInstance.morphGene(tokenId, 37, { value: morphCost }))
      .to.not.reverted;
    await expect(
      polymorphInstance.morphGene(tokenId, 38, { value: morphCost.mul(2) })
    ).revertedWith("Bad gene position");
  });

  it("should not mint when DAO does not have receive or fallback function", async () => {
    const TestContractInteractor = await ethers.getContractFactory(
      "TestContractInteractor"
    );
    const contractInteractor = await TestContractInteractor.deploy(
      polymorphInstance.address
    );

    const MockedPolymorphRoot = await ethers.getContractFactory(
      "PolymorphRoot"
    );

    const mockedPolymorphInstance = await MockedPolymorphRoot.deploy({
      name: name,
      symbol: token,
      baseURI: baseUri,
      _daoAddress: contractInteractor.address,
      _royaltyFee: royaltyFee,
      _baseGenomeChangePrice: defaultGenomeChangePrice,
      _polymorphPrice: polymorphPrice,
      _maxSupply: daoVotedSupply,
      _randomizeGenomePrice: randomizeGenomePrice,
      _bulkBuyLimit: bulkBuyLimit,
      _arweaveAssetsJSON: arweaveAssetsJSON,
      _polymorphV1Address: polymorphV1Address,
    });

    const cost = await mockedPolymorphInstance.polymorphPrice();
    await expect(
      mockedPolymorphInstance["mint()"]({ value: cost })
    ).revertedWith(
      "Address: unable to send value, recipient may have reverted"
    );
  });

  it("should not randomize gene when DAO does not have receive or fallback function", async () => {
    const TestContractInteractor = await ethers.getContractFactory(
      "TestContractInteractor"
    );
    const contractInteractor = await TestContractInteractor.deploy(
      polymorphInstance.address
    );

    const MockedPolymorphRoot = await ethers.getContractFactory(
      "PolymorphRoot"
    );
    const mockedPolymorphInstance = await MockedPolymorphRoot.deploy({
      name: name,
      symbol: token,
      baseURI: baseUri,
      _daoAddress: contractInteractor.address,
      _royaltyFee: royaltyFee,
      _baseGenomeChangePrice: defaultGenomeChangePrice,
      _polymorphPrice: polymorphPrice,
      _maxSupply: daoVotedSupply,
      _randomizeGenomePrice: randomizeGenomePrice,
      _bulkBuyLimit: bulkBuyLimit,
      _arweaveAssetsJSON: arweaveAssetsJSON,
      _polymorphV1Address: polymorphV1Address,
    });

    const cost = await mockedPolymorphInstance.polymorphPrice();
    await expect(
      mockedPolymorphInstance.randomizeGenome(
        startTokenId
      )
    ).revertedWith(
      "ERC721: owner query for nonexistent token"
    );
  });

  // TODO: Write cases for require functions in bulk buy
  it("should not bulk buy when DAO does not have receive or fallback function", async () => {
    const TestContractInteractor = await ethers.getContractFactory(
      "TestContractInteractor"
    );
    const contractInteractor = await TestContractInteractor.deploy(
      polymorphInstance.address
    );

    const MockedPolymorphRoot = await ethers.getContractFactory(
      "PolymorphRoot"
    );
    const mockedPolymorphInstance = await MockedPolymorphRoot.deploy({
      name: name,
      symbol: token,
      baseURI: baseUri,
      _daoAddress: contractInteractor.address,
      _royaltyFee: royaltyFee,
      _baseGenomeChangePrice: defaultGenomeChangePrice,
      _polymorphPrice: polymorphPrice,
      _maxSupply: daoVotedSupply,
      _randomizeGenomePrice: randomizeGenomePrice,
      _bulkBuyLimit: bulkBuyLimit,
      _arweaveAssetsJSON: arweaveAssetsJSON,
      _polymorphV1Address: polymorphV1Address,
    });

    const cost = await mockedPolymorphInstance.polymorphPrice();
    await expect(
      mockedPolymorphInstance.bulkBuy(2, { value: cost.mul(3) })
    ).revertedWith(
      "Address: unable to send value, recipient may have reverted"
    );
  });

  it("should change bulk buy limit", async () => {
    const newBulkBuyLimit = 30;

    const bulkBuyLimitBefore = await polymorphInstance.bulkBuyLimit();
    expect(bulkBuyLimitBefore).eq(
      bulkBuyLimit,
      `The bulk buy limiu was not ${bulkBuyLimit} in the beginning`
    );

    await polymorphInstance.connect(DAO).setBulkBuyLimit(newBulkBuyLimit);

    const bulkBuyLimitAfter = await polymorphInstance.bulkBuyLimit();
    expect(bulkBuyLimitAfter).eq(
      newBulkBuyLimit,
      "The bulk buy limit did not change"
    );

    await expect(
      polymorphInstance.setBulkBuyLimit(newBulkBuyLimit)
    ).revertedWith("Not called from the dao");
  });

  // it('should not morph genome when msg.sender can not receive excess eth amount back', async () => {
  //   const TestContractInteractor = await ethers.getContractFactory("TestContractInteractor");
  //   const contractInteractor = await TestContractInteractor.deploy(polymorphInstance.address)

  //   const cost = await polymorphInstance.polymorphPrice();
  //   await expect(contractInteractor.triggerRandomize(premintedTokensCount, {value: cost.mul(2)})).revertedWith("Failed to return excess");
  // });

  // it('should not randomize genome when msg.sender can not receive excess eth amount back', async () => {
  //   const TestContractInteractor = await ethers.getContractFactory("TestContractInteractor");
  //   const contractInteractor = await TestContractInteractor.deploy(polymorphInstance.address)

  //   const cost = await polymorphInstance.polymorphPrice();
  //   await expect(contractInteractor.triggerGeneChange(premintedTokensCount, 5, {value: cost.mul(2)})).revertedWith("Failed to return excess");
  // });

  // it('should not morph when msg.sender can not receive excess eth amount back', async () => {
  //   const TestContractInteractor = await ethers.getContractFactory("TestContractInteractor");
  //   const contractInteractor = await TestContractInteractor.deploy(polymorphInstance.address);

  //   const cost = await polymorphInstance.polymorphPrice();

  //   await polymorphInstance['mint()']({value: cost});
  //   const tokenId = await polymorphInstance.lastTokenId();

  //   await polymorphInstance.transferFrom(deployer.address, contractInteractor.address, tokenId);

  //   const genomeChangeCost = await polymorphInstance.priceForGenomeChange(tokenId);

  //   await expect(contractInteractor.triggerGeneChange(tokenId, 2, {value: genomeChangeCost.mul(2)})).revertedWith("Failed to return excess");
  // });

  it("should change polymorph price", async () => {
    const newPolymorphPrice = ethers.utils.parseEther("0.0877");

    const polymorphPriceBefore = await polymorphInstance.polymorphPrice();
    expect(polymorphPriceBefore).eq(
      polymorphPrice,
      `The polymorph price was not ${polymorphPrice} in the beginning`
    );

    await polymorphInstance.connect(DAO).setPolymorphPrice(newPolymorphPrice);

    const polymorphPriceAfter = await polymorphInstance.polymorphPrice();
    expect(polymorphPriceAfter).eq(
      newPolymorphPrice,
      "The polymorph price did not change"
    );

    await expect(
      polymorphInstance.setPolymorphPrice(newPolymorphPrice)
    ).to.revertedWith("Not called from the dao");
  });

  it("should change max supply", async () => {
    const newMaxSupply = 11000;

    const totalSupplyBefore = await polymorphInstance.maxSupply();
    expect(totalSupplyBefore).eq(
      daoVotedSupply, // Note that there's a setMaxSupply() in Before hook, because of the burnAndMint nature of the v2 Polymorphs
      `The max supply was not ${daoVotedSupply} in the beginning`
    );

    await polymorphInstance.connect(DAO).setMaxSupply(newMaxSupply);

    const totalSupplyAfter = await polymorphInstance.maxSupply();
    expect(totalSupplyAfter).eq(newMaxSupply, "The max supply did not change");

    await expect(polymorphInstance.setMaxSupply(newMaxSupply)).revertedWith(
      "Not called from the dao"
    );
  });

  it("should change randomizeGenomePrice", async () => {
    const newRandomizeGenomePrice = ethers.utils.parseEther("0.1");

    const randomizeGenomePriceBefore =
      await polymorphInstance.randomizeGenomePrice();
    expect(randomizeGenomePriceBefore).eq(
      randomizeGenomePrice,
      `The randomize genome was not ${randomizeGenomePrice} in the beginning`
    );

    await polymorphInstance
      .connect(DAO)
      .changeRandomizeGenomePrice(newRandomizeGenomePrice);

    const randomizeGenomePriceAfter =
      await polymorphInstance.randomizeGenomePrice();
    expect(randomizeGenomePriceAfter).eq(
      newRandomizeGenomePrice,
      "The randomize genome price did not change"
    );

    await expect(
      polymorphInstance.changeRandomizeGenomePrice(newRandomizeGenomePrice)
    ).revertedWith("Not called from the dao");
  });

  it("should change baseGenomeChangePrice", async () => {
    const newChangeGenomePrice = ethers.utils.parseEther("0.1");

    const changeGenomePriceBefore =
      await polymorphInstance.baseGenomeChangePrice();
    expect(changeGenomePriceBefore).eq(
      defaultGenomeChangePrice,
      `The change genome was not ${defaultGenomeChangePrice} in the beginning`
    );

    await polymorphInstance
      .connect(DAO)
      .changeBaseGenomeChangePrice(newChangeGenomePrice);

    const changeGenomePriceAfter =
      await polymorphInstance.baseGenomeChangePrice();
    expect(changeGenomePriceAfter).eq(
      newChangeGenomePrice,
      "The change genome price did not change"
    );

    await expect(
      polymorphInstance.changeBaseGenomeChangePrice(newChangeGenomePrice)
    ).revertedWith("Not called from the dao");
  });

  it("should not bulk buy more than the limit", async () => {
    const cost = await polymorphInstance.polymorphPrice();
    const limit = await polymorphInstance.bulkBuyLimit();

    await expect(polymorphInstance.bulkBuy(limit + 1), {
      value: cost.mul(limit + 1),
    }).revertedWith("Cannot bulk buy more than the preset limit");
  });

  it("should change baseURI", async () => {
    const newBaseURI = "https://universe.xyz.com/";
    const baseURIBefore = await polymorphInstance.baseURI();
    expect(baseURIBefore).eq(
      baseUri,
      `The base URI was not ${baseUri} in the beginning`
    );

    await polymorphInstance.connect(DAO).setBaseURI(newBaseURI);

    const baseURIAfter = await polymorphInstance.baseURI();
    expect(baseURIAfter).eq(newBaseURI, "The baseURI did not change");

    await expect(polymorphInstance.setBaseURI(newBaseURI)).revertedWith(
      "Not called from the dao"
    );
  });

  it("should change arweave assets", async () => {
    const newArweave = "new arweave json";

    const arweaveBefore = await polymorphInstance.arweaveAssetsJSON();
    expect(arweaveBefore).eq(
      arweaveAssetsJSON,
      "Arweave isn't the same as when it was deployed"
    );

    await polymorphInstance.connect(DAO).setArweaveAssetsJSON(newArweave);

    const arweaveAfter = await polymorphInstance.arweaveAssetsJSON();
    expect(arweaveAfter).eq(newArweave, "The bulk buy limit did not change");

    await expect(
      polymorphInstance.setArweaveAssetsJSON(newArweave)
    ).revertedWith("Not called from the dao");
  });

  it("wormholeUpdateGene should revert if not called from tunnel", async () => {
    await expect(
      polymorphInstance.wormholeUpdateGene(1, 12312312312, true, 2)
    ).to.be.revertedWith("Not called from the tunnel");
  });

  it(`should not mint more than totalSupply`, async () => {
    const cost = await polymorphInstance.polymorphPrice();
    const lastTokenId = await polymorphInstance.lastTokenId();
    const totalSupply = await polymorphInstance.maxSupply();
    for (let i = 0; i < totalSupply - lastTokenId; i++) {
      await polymorphInstance["mint()"]({ value: cost });
    }
    await expect(polymorphInstance["mint()"]({ value: cost })).revertedWith(
      "Total supply reached"
    );
  });

  it(`should not bulk buy more than totalSupply`, async () => {
    const cost = await polymorphInstance.polymorphPrice();
    const lastTokenId = await polymorphInstance.lastTokenId();
    const totalSupply = await polymorphInstance.maxSupply();
    for (let i = 0; i < totalSupply - lastTokenId; i++) {
      await polymorphInstance["mint()"]({ value: cost });
    }
    await expect(polymorphInstance.bulkBuy(2, { value: cost })).revertedWith(
      "Total supply reached"
    );
  });
});
