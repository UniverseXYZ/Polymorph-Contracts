const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC721Consumable", async () => {
	let owner; 
    let approved;
    let operator;
    let consumer;
	let snapshotId;
    let bulkBuyCount;
	let tokenID = 10000;
    
    let name = "ConsumablePolymorph";
    let token = "POLY";
    let baseUri = "http://www.kekdao.com/";
    let premintedTokensCount = 0;
    let totalSupply = 10000;
    let bulkBuyLimit = 20;
    let polymorphPrice = ethers.utils.parseEther("0.0777");
    let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
    let randomizeGenomePrice = ethers.utils.parseEther("0.02");
    let arweaveAssetsJSON = "JSON";
    let polymorphV1Address = "0x75D38741878da8520d1Ae6db298A9BD994A5D241";


	before(async () => {
		const signers = await ethers.getSigners();
		owner = signers[0];
		approved = signers[1];
		operator = signers[2];
		consumer = signers[3];
		other = signers[4];

        constructorArgs = {
            name: name,
            symbol: token,
            baseURI: baseUri,
            _daoAddress: approved.address,
            premintedTokensCount: premintedTokensCount,
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

		const daoVotedSupply = 10100;

		await polymorphInstance.connect(approved).setMaxSupply(daoVotedSupply);

        bulkBuyCount = 10;
        const cost = await polymorphInstance.polymorphPrice();
        await polymorphInstance.bulkBuy(bulkBuyCount, { value: cost.mul(bulkBuyCount) });
	})

	beforeEach(async function () {
        tokenID++;
		snapshotId = await ethers.provider.send('evm_snapshot', []);
	});

	afterEach(async function () {
		await ethers.provider.send('evm_revert', [snapshotId]);
	});

	it('should successfully change consumer', async () => {
		// when:
		await polymorphInstance.changeConsumer(consumer.address, tokenID);
		// then:
		expect(await polymorphInstance.consumerOf(tokenID)).to.equal(consumer.address);
	});

	it('should emit event with args', async () => {
		// when:
		const tx = await polymorphInstance.changeConsumer(consumer.address, tokenID);

		// then:
		await expect(tx)
			.to.emit(polymorphInstance, 'ConsumerChanged')
			.withArgs(owner.address, consumer.address, tokenID);
	});

	it('should successfully change consumer when caller is approved', async () => {
		// given:
		await polymorphInstance.approve(approved.address, tokenID);
		// when:
		const tx = await polymorphInstance.connect(approved).changeConsumer(consumer.address, tokenID);

		// then:
		await expect(tx)
			.to.emit(polymorphInstance, 'ConsumerChanged')
			.withArgs(owner.address, consumer.address, tokenID);
		// and:
		expect(await polymorphInstance.consumerOf(tokenID)).to.equal(consumer.address);
	});

	it('should successfully change consumer when caller is operator', async () => {
		// given:
		await polymorphInstance.setApprovalForAll(operator.address, true);
		// when:
		const tx = await polymorphInstance.connect(operator).changeConsumer(consumer.address, tokenID);

		// then:
		await expect(tx)
			.to.emit(polymorphInstance, 'ConsumerChanged')
			.withArgs(owner.address, consumer.address, tokenID);
		// and:
		expect(await polymorphInstance.consumerOf(tokenID)).to.equal(consumer.address);
	});

	it('should revert when caller is not owner, not approved', async () => {
		const expectedRevertMessage = 'ERC721Consumable: changeConsumer caller is not owner nor approved';
		await expect(polymorphInstance.connect(other).changeConsumer(consumer.address, tokenID))
			.to.be.revertedWith(expectedRevertMessage);
	});

	it('should revert when caller is approved for the token', async () => {
		// given:
		await polymorphInstance.changeConsumer(consumer.address, tokenID);
		// then:
		const expectedRevertMessage = 'ERC721Consumable: changeConsumer caller is not owner nor approved';
		await expect(polymorphInstance.connect(consumer).changeConsumer(consumer.address, tokenID))
			.to.be.revertedWith(expectedRevertMessage);
	});

	it('should revert when tokenID is nonexistent', async () => {
		const invalidTokenID = bulkBuyCount + 1;
		const expectedRevertMessage = 'ERC721: owner query for nonexistent token';
		await expect(polymorphInstance.changeConsumer(consumer.address, invalidTokenID))
			.to.be.revertedWith(expectedRevertMessage);
	});

	it('should revert when calling consumerOf with nonexistent tokenID', async () => {
		const invalidTokenID = bulkBuyCount + 1;
		const expectedRevertMessage = 'ERC721Consumable: consumer query for nonexistent token';
		await expect(polymorphInstance.consumerOf(invalidTokenID))
			.to.be.revertedWith(expectedRevertMessage);
	});

	it('should clear consumer on transfer', async () => {
		await polymorphInstance.changeConsumer(consumer.address, tokenID);
		await expect(polymorphInstance.transferFrom(owner.address, other.address, tokenID))
			.to.emit(polymorphInstance, 'ConsumerChanged')
				.withArgs(owner.address, ethers.constants.AddressZero, tokenID);
	})

	it('should emit ConsumerChanged on mint', async () => {
        const bulkBuyCount = 1;
        const cost = await polymorphInstance.polymorphPrice();
		await expect(polymorphInstance.bulkBuy(bulkBuyCount, { value: cost.mul(bulkBuyCount) }))
			.to.emit(polymorphInstance, 'ConsumerChanged')
				.withArgs(ethers.constants.AddressZero, ethers.constants.AddressZero, tokenID + 1);
	})

	it('should not be able to transfer from consumer', async () => {
        const transferFromTokenId = 10005; // should be one of the approved tokens
		const expectedRevertMessage = 'ERC721: transfer caller is not owner nor approved';
		await polymorphInstance.changeConsumer(consumer.address, transferFromTokenId);
		await expect(polymorphInstance.connect(consumer).transferFrom(owner.address, other.address, transferFromTokenId))
			.to.revertedWith(expectedRevertMessage)
	})
});