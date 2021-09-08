const { expect } = require("chai");

describe('PolymorphChildTunnel', () => {
  let tunnelInstance, exposedTunnelInstance;
  const goerliFxChild = "0xCf73231F28B7331BBe3124B907840A94851f9f11";
  
  // This is hardhat user address
  const daoAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  before(async () => {
    const PolymorphRootTunnel = await ethers.getContractFactory("PolymorphChildTunnel");
    const ExposedPolymorphRootTunnelContract = await ethers.getContractFactory("ExposedPolymorphChildTunnel");
    tunnelInstance = await PolymorphRootTunnel.deploy(goerliFxChild, daoAddress);
    exposedTunnelInstance = await ExposedPolymorphRootTunnelContract.deploy(goerliFxChild, daoAddress);
    console.log(`contract deployed to: ${tunnelInstance.address}`);
    console.log(`exposed contract deployed to: ${exposedTunnelInstance.address}`);
  });

  it('Should decode correct message from root tunnel', async () => {
    let tokenId = 1;
    let ownerAddress = "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA";
    let gene = "65097265087264340901236622123197376521531237462303307797553409679678212137362";
    let isVirgin = true;
    let genomeChanges = 5;
    let genomeChangeCost = 7;

    // This encodes like solidity keccak256
    const keccak = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256", "uint256"],
      [tokenId, ownerAddress, gene, isVirgin, genomeChanges, genomeChangeCost]
    );
    const result = await exposedTunnelInstance.decodeMessage(keccak);
    expect(result.tokenId.toNumber()).eq(tokenId);
    expect(result.polymorphAddress).eq(ownerAddress);
    expect(result.gene).eq(gene);
    expect(result.isVirgin).eq(true);
    expect(result.genomeChanges.toNumber()).eq(genomeChanges);
  });

  it('Dao address should be able to set polymorph contract', async () => {
    await expect(tunnelInstance.setPolymorphContract("0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA")).to.not.be.reverted;
  });

  it('Polymorph contract should change', async () => {
    const newPolymorphAddress = "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA";

    await tunnelInstance.setPolymorphContract(newPolymorphAddress);

     expect(await tunnelInstance.polymorphContract()).to.eq(newPolymorphAddress)
  })

  it('Address that is not dao should not be able to set polymorph contract', async () => {
    const [user, alice] = await ethers.getSigners();
    await expect(exposedTunnelInstance.connect(alice).setPolymorphContract("0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA")).to.be.revertedWith("Not called from the dao");
  });
})