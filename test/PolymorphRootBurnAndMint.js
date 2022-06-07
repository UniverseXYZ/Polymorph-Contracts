const { expect } = require("chai");

describe("PolymorphRootBurnAndMint", () => {
  let DAO;
  let aliceAccount;
  let bobsAccount;
  let deployer;
  let polymorphInstance;

  let name = "PolymorphWithGeneChanger";
  let token = "POLY";
  let baseUri = "http://www.kekdao.com/";
  let premintedTokensCount = 0;
  let royaltyFee = 0;
  let totalSupply = 10000;
  let bulkBuyLimit = 20;
  let polymorphPrice = ethers.utils.parseEther("0.0777");
  let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
  let randomizeGenomePrice = ethers.utils.parseEther("0.02");
  let arweaveAssetsJSON = "JSON";
  let polymorphV1Address = "0x75D38741878da8520d1Ae6db298A9BD994A5D241";

  let constructorArgs;
  let constructorArgsV2;

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
      premintedTokensCount: premintedTokensCount,
      _baseGenomeChangePrice: defaultGenomeChangePrice,
      _polymorphPrice: polymorphPrice,
      _maxSupply: totalSupply,
      _randomizeGenomePrice: randomizeGenomePrice,
      _bulkBuyLimit: bulkBuyLimit,
      _arweaveAssetsJSON: arweaveAssetsJSON,
      _polymorphV1Address: polymorphV1Address,
    };

    constructorArgsV2 = {
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
    polymorphInstance = await PolymorphRoot.deploy(constructorArgsV2);

    console.log(`Polymorph instance deployed to: ${polymorphInstance.address}`);
  });

  it("burnAndMintNewPolymorph increments contract total burned counter", async () => {
    const PolymorphRoot = await ethers.getContractFactory("PolymorphRoot");

    const PolymorphV1 = await ethers.getContractFactory("PolymorphV1");

    const accounts = await ethers.getSigners();
    const deployerAddr = accounts[0].address;

    v1Instance = await PolymorphV1.deploy(constructorArgs);

    constructorArgsV2["_polymorphV1Address"] = v1Instance.address;

    v2Instance = await PolymorphRoot.deploy(constructorArgsV2);
    const bulkBuyCount = 5;

    await v1Instance.bulkBuy(bulkBuyCount, {
      value: polymorphPrice.mul(bulkBuyCount),
    });

    const burnCount = await v2Instance.burnCount(deployerAddr);

    const tokensToBurn = [1, 3, 5];
    const tokensToBurnArrLen = 3;

    tokensToBurn.forEach(async (burnTokenId) => {
      await v1Instance.approve(v2Instance.address, burnTokenId);
    });
 
    await v2Instance.burnAndMintNewPolymorph(tokensToBurn);

    const burnCountNew = await v2Instance.burnCount(deployerAddr);

    await expect(+burnCount + tokensToBurnArrLen).eq(burnCountNew);
  });

  it("burnAndMintNewPolymorph preserves the newly minted polymorphs he same id and genome", async () => {
    const PolymorphRoot = await ethers.getContractFactory("PolymorphRoot");

    const PolymorphV1 = await ethers.getContractFactory("PolymorphV1");

    v1Instance = await PolymorphV1.deploy(constructorArgs);

    constructorArgsV2["_polymorphV1Address"] = v1Instance.address;

    v2Instance = await PolymorphRoot.deploy(constructorArgsV2);

    const bulkBuyCount = 5;

    await v1Instance.bulkBuy(bulkBuyCount, {
      value: polymorphPrice.mul(bulkBuyCount),
    });

    const tokensToBurn = [1, 3, 5];

    tokensToBurn.forEach(async (burnTokenId) => {
      await v1Instance.approve(v2Instance.address, burnTokenId);
    });

    const geneOfFirstBefore = await v1Instance.geneOf(1);
    const geneOfSecondBefore = await v1Instance.geneOf(3);
    const geneOfThirdBefore = await v1Instance.geneOf(5);

    await v2Instance.burnAndMintNewPolymorph(tokensToBurn);

    const newGeneOfFirst = await v2Instance.geneOf(1);
    const newGeneOfSecond = await v2Instance.geneOf(3);
    const newGeneOfThird = await v2Instance.geneOf(5);

    await expect(geneOfFirstBefore).eq(newGeneOfFirst);
    await expect(geneOfSecondBefore).eq(newGeneOfSecond);
    await expect(geneOfThirdBefore).eq(newGeneOfThird);
  });
});