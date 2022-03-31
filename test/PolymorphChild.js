const { expect } = require("chai");

describe('PolymorphChild', () => {
  let polymorphInstance;

  before(async () => {
    const [user, dao, alice, bob] = await ethers.getSigners();
    //Polymorph constructor arguments
    let name = "PolymorphWithGeneChanger";
    let token = "MORPH";
    let baseUri = "";
    let daoAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
    let randomizeGenomePrice = ethers.utils.parseEther("0.01");
    let arweaveAssetsJSON = 'JSON';

    const TestERC20 = await ethers.getContractFactory("TestERC20");
    wethInstance = await TestERC20.deploy(); // we want DAO address != who deployed WETH on Polygon
    console.log(`Test WETH contract deployed to: ${wethInstance.address}`);

    const PolymorphChild = await ethers.getContractFactory("PolymorphChild");
    polymorphInstance = await PolymorphChild.deploy(name, token, baseUri, daoAddress, wethInstance.address, defaultGenomeChangePrice, randomizeGenomePrice, arweaveAssetsJSON);
    console.log(`Polymorph instance deployed to: ${polymorphInstance.address}`);

  });

  it('wormholeUpdateGene should revert if not called from tunnel', async() => {
    await expect(polymorphInstance.wormholeUpdateGene(1, 12312312312, true, 2)).to.be.revertedWith("Not called from the tunnel");
  });

  it("mintPolymorphWithInfo should revert if not called from tunnel", async() => {
    await expect(polymorphInstance.mintPolymorphWithInfo(1, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 41241412)).to.be.revertedWith("Not called from the tunnel");
  })
  it("minting should be disabled", async() => {
    await expect(polymorphInstance.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")).revertedWith("Minting is disabled on side chains");
  })

  it("should accept ERC20 as payment method", async() => {
    
  })


});