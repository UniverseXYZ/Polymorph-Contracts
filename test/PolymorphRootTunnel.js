const { expect } = require("chai");

describe('PolymorphRootTunnel', () => {
  let tunnelInstance, exposedTunnelInstance;
  const goerliCheckpointManager = "0x2890bA17EfE978480615e330ecB65333b880928e";
  const goerliFxRoot = "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA";
  
  // This is hardhat user address
  const daoAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  before(async () => {
    const PolymorphRootTunnel = await ethers.getContractFactory("PolymorphRootTunnel");
    const ExposedPolymorphRootTunnelContract = await ethers.getContractFactory("ExposedPolymorphRootTunnel");
    tunnelInstance = await PolymorphRootTunnel.deploy(goerliCheckpointManager, goerliFxRoot, daoAddress);
    exposedTunnelInstance = await ExposedPolymorphRootTunnelContract.deploy(goerliCheckpointManager, goerliFxRoot, daoAddress);
    console.log(`contract deployed to: ${tunnelInstance.address}`);
    console.log(`exposed contract deployed to: ${exposedTunnelInstance.address}`);
  });

  it('Should decode correct message from child tunnel', async () => {
    let tokenId = 1;
    let ownerAddress = "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA";
    let gene = "65097265087264340901236622123197376521531237462303307797553409679678212137362";
    let isVirgin = true;
    let genomeChanges = 5;

    // This encodes like solidity keccak256
    const keccak = ethers.utils.defaultAbiCoder.encode(
      ["uint256[]", "address", "uint256[]", "bool[]", "uint256[]"],
      [[tokenId], ownerAddress, [gene], [isVirgin], [genomeChanges]]
    );
    const result = await exposedTunnelInstance.decodeMessage(keccak);
    expect(result.tokenIds[0].toNumber()).eq(tokenId);
    expect(result.polymorphAddress).eq(ownerAddress);
    expect(result.genes[0]).eq(gene);
    expect(result.isVirgin[0]).eq(true);
    expect(result.genomeChanges[0].toNumber()).eq(genomeChanges);
  });

  it('_processMessageFromChild should revert if polymorph contract hasn not been set', async() => {
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
    await expect(exposedTunnelInstance.processMessageFromChild(keccak)).revertedWith("Polymorph contract hasn't been set yet");
  });

  it('Dao address should be able to set polymorph contract', async () => {
    const [user, alice] = await ethers.getSigners();
    await expect(tunnelInstance.connect(alice).setPolymorphContract("0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA")).revertedWith("Not called from the dao");
    await expect(tunnelInstance.setPolymorphContract("0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA")).to.not.be.reverted;
  });

  it('Polymorph contract should change', async () => {
    const newPolymorphAddress = "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA";

    await tunnelInstance.setPolymorphContract(newPolymorphAddress);

     expect(await tunnelInstance.polymorphContract()).to.eq(newPolymorphAddress)
  });


})