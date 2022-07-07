const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Polymorph Polygon Integration", () => {
  let tunnelInstance, exposedTunnelInstance, polymorphInstance, wethInstance;
  //Tunnel contrustor arguments
  const goerliFxChild = "0xCf73231F28B7331BBe3124B907840A94851f9f11";

  let polymorphPrice = ethers.utils.parseEther("0.0777");

  // Polymorph constructor arguments
  let name = "PolymorphChild";
  let token = "MORPH";
  let baseUri = "";
  let daoAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
  let randomizeGenomePrice = ethers.utils.parseEther("0.01");
  let arweaveAssetsJSON = "JSON";

  let tokenId = 0;
  let newGene = "54545454";
  let newVirginity = true;
  let newChangesCount = 5;

  const approveAmount = "3000000000000000000";

  before(async () => {
    const PolymorphChildTunnel = await ethers.getContractFactory(
      "PolymorphChildTunnel"
    );
    tunnelInstance = await PolymorphChildTunnel.deploy(
      goerliFxChild,
      daoAddress
    );
    console.log(`tunnel contract deployed to: ${tunnelInstance.address}`);

    const ExposedPolymorphChildTunnel = await ethers.getContractFactory(
      "ExposedPolymorphChildTunnel"
    );
    exposedTunnelInstance = await ExposedPolymorphChildTunnel.deploy(
      goerliFxChild,
      daoAddress
    );
    console.log(
      `exposed tunnel contract deployed to: ${exposedTunnelInstance.address}`
    );

    const [user, alice, bob, satoshi] = await ethers.getSigners();

    const TestERC20 = await ethers.getContractFactory("TestERC20");
    wethInstance = await TestERC20.connect(alice).deploy(); // we want DAO address != who deployed WETH on Polygon
    console.log(`Test WETH contract deployed to: ${wethInstance.address}`);

    const Polymorph = await ethers.getContractFactory("PolymorphChild");
    polymorphInstance = await Polymorph.deploy(
      name,
      token,
      baseUri,
      daoAddress,
      wethInstance.address,
      defaultGenomeChangePrice,
      randomizeGenomePrice,
      arweaveAssetsJSON
    );
    console.log(`polymorph contract deployed to: ${polymorphInstance.address}`);

    const bobMintAmount = "6000000000000000000";
    await wethInstance.connect(alice).mint(bob.address, bobMintAmount);

    await tunnelInstance.setPolymorphContract(polymorphInstance.address);
    await exposedTunnelInstance.setPolymorphContract(polymorphInstance.address);

    polymorphInstance.whitelistBridgeAddress(
      exposedTunnelInstance.address,
      true
    );

    await polymorphInstance.setMaticWETHContract(wethInstance.address);
  });

  beforeEach(async () => {
    tokenId++;

    const [user, alice, bob] = await ethers.getSigners();

    const keccak = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256", "bool", "uint256"],
      [tokenId, bob.address, newGene, newVirginity, newChangesCount]
    );

    const stateId = 1;

    await exposedTunnelInstance.exposedProcessMessageFromRoot(
      stateId,
      user.address,
      keccak
    );

    const daoWETHBalance = await wethInstance.balanceOf(daoAddress);

    await wethInstance.connect(user).burn(daoWETHBalance.toString()); // Burn DAO's WETH  tokens
  });

  it("processMessageFromRoot should mint and update polymoprh info correctly", async () => {
    const [user, alice, bob] = await ethers.getSigners();
    const baseGenomeChangePrice =
      await polymorphInstance.baseGenomeChangePrice();

    expect(await polymorphInstance.ownerOf(tokenId)).to.eq(bob.address);
    expect(await polymorphInstance.geneOf(tokenId)).to.eq(newGene);
    expect(await polymorphInstance.isNotVirgin(tokenId)).to.eq(newVirginity);

    expect(await polymorphInstance.priceForGenomeChange(tokenId)).eq(
      baseGenomeChangePrice.mul(2 ** newChangesCount)
    );
  });

  it("morphGene should revert if user hasn't approved the PolymorphChild contract to spend funds", async () => {
    const [user, alice, bob] = await ethers.getSigners();
    const morphGenePrice = await polymorphInstance.priceForGenomeChange(
      tokenId
    );
    const genePos = 5;
    // connect with bob because he is the NFT owner
    await expect(
      polymorphInstance
        .connect(bob)
        .morphGene(tokenId, genePos, { value: morphGenePrice })
    ).to.be.revertedWith("ERC20: insufficient allowance");
  });

  it("randomizeGenome should revert if user hasn't approved the PolymorphChild contract to spend funds", async () => {
    const [user, alice, bob] = await ethers.getSigners();
    await expect(
      polymorphInstance
        .connect(bob)
        .randomizeGenome(tokenId, { value: randomizeGenomePrice })
    ).to.be.revertedWith("ERC20: insufficient allowance");
  });

  it("randomizeGenome should tax WETH Token and transfer to DAO properly", async () => {
    const [user, alice, bob] = await ethers.getSigners();

    await wethInstance
      .connect(bob)
      .approve(polymorphInstance.address, approveAmount);

    const currentGene = await polymorphInstance.geneOf(tokenId);

    await expect(polymorphInstance.connect(bob).randomizeGenome(tokenId)).to.not
      .be.reverted;

    const randomizedGenome = await polymorphInstance.geneOf(tokenId);

    await expect(currentGene).to.not.equal(randomizedGenome);

    const wethBalanceOfDAO = await wethInstance.balanceOf(daoAddress);

    await expect(wethBalanceOfDAO).to.equal(randomizeGenomePrice);
  });

  it("morphGene should tax WETH Token and transfer to to DAO properly", async () => {
    const [user, alice, bob] = await ethers.getSigners();

    const morphGenePrice = await polymorphInstance.priceForGenomeChange(
      tokenId
    );

    const genePos = 5;

    await wethInstance
      .connect(bob)
      .approve(polymorphInstance.address, approveAmount);

    const currentGene = await polymorphInstance.geneOf(tokenId);

    await expect(polymorphInstance.connect(bob).morphGene(tokenId, genePos)).to
      .not.be.reverted;

    const morphedGene = await polymorphInstance.geneOf(tokenId);

    await expect(currentGene).to.not.equal(morphedGene);

    const wethBalanceOfDAO = await wethInstance.balanceOf(daoAddress);

    await expect(wethBalanceOfDAO).to.equal(morphGenePrice);
  });

  it("randomizeGenome should excess the whole msg.value if any", async () => {
    const [user, alice, bob] = await ethers.getSigners();

    await wethInstance
      .connect(bob)
      .approve(polymorphInstance.address, approveAmount);

    const maticTokens = 3;

    const userBalanceBefore = await bob.getBalance();

    const randomizeTx = await polymorphInstance
      .connect(bob)
      .randomizeGenome(tokenId, { value: maticTokens });

    const txReceipt = await randomizeTx.wait();

    const userBalanceAfter = await bob.getBalance();

    const totalGasSpentForTx = txReceipt.cumulativeGasUsed.mul(
      txReceipt.effectiveGasPrice
    );

    await expect(userBalanceBefore.toString()).to.equal(
      userBalanceAfter.add(totalGasSpentForTx).toString()
    );
  });

  it("morphGene should excess the whole msg.value if any", async () => {
    const [user, alice, bob] = await ethers.getSigners();

    const genePos = 5;

    const maticTokens = 3;

    await wethInstance
      .connect(bob)
      .approve(polymorphInstance.address, approveAmount);

    const userBalanceBefore = await bob.getBalance();

    const morphGeneTx = await polymorphInstance
      .connect(bob)
      .morphGene(tokenId, genePos, { value: maticTokens });

    const txReceipt = await morphGeneTx.wait();

    const userBalanceAfter = await bob.getBalance();

    const totalGasSpentForTx = txReceipt.cumulativeGasUsed.mul(
      txReceipt.effectiveGasPrice
    );

    await expect(userBalanceBefore.toString()).to.equal(
      userBalanceAfter.add(totalGasSpentForTx).toString()
    );
  });

  it("moveThroughWormhole should revert if polymorph has not been approved for transfer", async () => {
    const [user, alice, bob] = await ethers.getSigners();
    await expect(
      tunnelInstance.connect(bob).moveThroughWormhole([tokenId])
    ).to.be.revertedWith("ERC721Burnable: caller is not owner nor approved");
  });

  it("moveThroughWormhole should not revert if polymorph has been approved for transfer", async () => {
    const [user, alice, bob] = await ethers.getSigners();
    await polymorphInstance
      .connect(bob)
      .approve(tunnelInstance.address, tokenId);
    await expect(tunnelInstance.connect(bob).moveThroughWormhole([tokenId])).to
      .not.be.reverted;
  });

  it("moveThroughWormhole should burn polymorph on polygon", async () => {
    const [user, alice, bob] = await ethers.getSigners();
    await polymorphInstance
      .connect(bob)
      .approve(tunnelInstance.address, tokenId);
    await tunnelInstance.connect(bob).moveThroughWormhole([tokenId]);
    await expect(polymorphInstance.ownerOf(tokenId)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
  });

  it("moveThroughWormhole should revert if not called by polymorph owner", async () => {
    const [user, alice] = await ethers.getSigners();
    await expect(
      tunnelInstance.connect(alice).moveThroughWormhole([tokenId])
    ).revertedWith("Msg.sender should be the polymorph owner");
  });

});
