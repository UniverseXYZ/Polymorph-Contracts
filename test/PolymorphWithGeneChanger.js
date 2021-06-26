const etherlime = require('etherlime-lib');
const ethers = require('ethers');
const PolymorphWithGeneChanger = require('../build/PolymorphWithGeneChanger.json');
const TestContractInteractor = require('../build/TestContractInteractor.json');


describe('PolymorphWithGeneChanger', () => {
    let DAO = accounts[2];
    let aliceAccount = accounts[3];
    let bobsAccount = accounts[4];
    let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
    let deployer;
    let polymorphInstance;
    let premintedTokensCount = 5;
    let polymorphPrice = ethers.utils.parseEther("0.0777");
    let totalSupply = 30;
    let randomizeGenomePrice = ethers.utils.parseEther("0.01");
    let bulkBuyLimit = 20;
    let arweaveAssetsJSON = 'JSON'

    before(async () => {
        const kekAddress = await DAO.signer.getAddress();

        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        polymorphInstance = await deployer.deploy(PolymorphWithGeneChanger, {}, "PolymorphWithGeneChanger", "POLY", "http://www.kekdao.com/", kekAddress, premintedTokensCount, defaultGenomeChangePrice, polymorphPrice, totalSupply, randomizeGenomePrice, bulkBuyLimit, arweaveAssetsJSON);
    });

    it('should be valid address', async () => {
        assert.isAddress(polymorphInstance.contractAddress, "The contract was not deployed");
    })

    it(`should premint ${premintedTokensCount} tokens`, async () => {
        const lastToken = await polymorphInstance.lastTokenId();
        const ownerOfTheFirstToken = await polymorphInstance.ownerOf(1);
        const aliceAddress = await aliceAccount.signer.getAddress();

        assert(aliceAddress === ownerOfTheFirstToken, "The preminted tokens where not given to the owner");
        assert(lastToken.eq(premintedTokensCount), "The preminted tokens count is not accurate");

        const geneOfLastToken = await polymorphInstance.geneOf(lastToken);
        assert(geneOfLastToken != 0, "Gene hasn't been set");
    })

    it(`should bulkBuy`, async () => {
        const cost = await polymorphInstance.polymorphPrice();

        await polymorphInstance.bulkBuy(20, { value: cost.mul(20) });
        const lastTokenId = await polymorphInstance.lastTokenId();

        assert(lastTokenId.eq(premintedTokensCount + 20));
    }).timeout(15000);

    it('should mint nft with random gene', async () => {
        const kekBalanceBefore = await DAO.signer.getBalance();

        const cost1 = await polymorphInstance.polymorphPrice();
        const cost2 = await polymorphInstance.polymorphPrice();
        await polymorphInstance.mint({ value: cost1 })
        await polymorphInstance.mint({ value: cost2 })

        const kekBalanceAfter = await DAO.signer.getBalance();

        const geneA = await polymorphInstance.geneOf(premintedTokensCount + 1);
        const geneB = await polymorphInstance.geneOf(premintedTokensCount + 2);

        assert(!geneA.eq(geneB), "The two genes ended up the same");

        assert(kekBalanceAfter.eq(kekBalanceBefore.add(cost1.add(cost2))), "The dao did not receive correct amount");
    })

    it('should not change the gene on transfer', async () => {
        const aliceAddress = await aliceAccount.signer.getAddress();
        const bobsAddress = await bobsAccount.signer.getAddress();

        const geneBefore = await polymorphInstance.geneOf(3);
        await polymorphInstance.transferFrom(aliceAddress, bobsAddress, 3);
        const geneAfter = await polymorphInstance.geneOf(3);

        assert(geneBefore.eq(geneAfter), "The two genes ended up the same");
    })

    it.skip('total eth math calculator', async () => {

        let totalETH = ethers.utils.bigNumberify("0");
        for (let index = 1; index <= 1000; index++) {
            const res = await polymorphInstance.priceFor(index);
            totalETH = totalETH.add(res);
        }
    })

    it(`should not mint more than totalSupply: ${totalSupply}`, async () => {
        const cost = await polymorphInstance.polymorphPrice();
        for (let i = 0; i < 3; i++) {
            await polymorphInstance.mint({ value: cost });
        }
        assert.revert(polymorphInstance.mint({ value: cost }));
    })


    it('should evolve gene', async () => {

        // const replaceGene = 0;
        // const ten = ethers.utils.bigNumberify("10");
        // const b = ethers.utils.bigNumberify("72276263847007942631470079687998596012416139150462437158110180045872227663685");
        // console.log(b.toString());
        // let mod = 0;
        // if (replaceGene > 0) {
        //     mod = b.mod(ten.pow(replaceGene * 2))
        // }
        // console.log(mod.toString());
        // let div = b.div(ten.pow((replaceGene + 1) * 2)).mul(ten.pow((replaceGene + 1) * 2));
        // console.log(div.toString());
        // const newGene = ethers.utils.bigNumberify("69");
        // const insert = newGene.mul(ten.pow(replaceGene * 2));
        // const res = div.add(insert).add(mod);
        // console.log(res.toString());

        const kekBalanceBefore = await DAO.signer.getBalance();

        const geneBefore = await polymorphInstance.geneOf(2);

        let price = await polymorphInstance.priceForGenomeChange(2);
        assert(price.eq(defaultGenomeChangePrice), "The price was not the default");

        await polymorphInstance.morphGene(2, 1, { value: price });
        const geneAfter = await polymorphInstance.geneOf(2);
        const kekBalanceAfter = await DAO.signer.getBalance();
        assert(!geneBefore.eq(geneAfter), "The gene did not change");
        assert(kekBalanceBefore.eq(kekBalanceAfter.sub(price)), "The price was not paid");


        price = await polymorphInstance.priceForGenomeChange(2);
        assert(price.eq(defaultGenomeChangePrice.mul(2)), "The price was not correct");

        await assert.revertWith(polymorphInstance.morphGene(2, 0, { value: price }));
        const geneAfter2 = await polymorphInstance.geneOf(2);
        const kekBalanceAfter2 = await DAO.signer.getBalance();
        assert(geneAfter2.eq(geneAfter), "The gene did change");
        assert(kekBalanceAfter.eq(kekBalanceAfter2), "The price was paid");

        price = await polymorphInstance.priceForGenomeChange(2);
        assert(price.eq(defaultGenomeChangePrice.mul(2)), "The price was not correct");

        await polymorphInstance.morphGene(2, 37, { value: price, gasLimit: 100000 });
        const geneAfter3 = await polymorphInstance.geneOf(2);
        assert(!geneAfter2.eq(geneAfter3), "The gene did not change");

        price = await polymorphInstance.priceForGenomeChange(2);
        assert(price.eq(defaultGenomeChangePrice.mul(4)), "The price was not correct");

        await polymorphInstance.randomizeGenome(2, { value: price });
        const geneAfterReset = await polymorphInstance.geneOf(2);
        assert(!geneAfterReset.eq(geneAfter3), "The gene did not change");

        price = await polymorphInstance.priceForGenomeChange(2);
        assert(price.eq(defaultGenomeChangePrice), "The price was not the default");
    })

    it('should not morph from a contract interactor', async () => {

        const kekBalanceBefore = await DAO.signer.getBalance();

        const geneBefore = await polymorphInstance.geneOf(2);

        await polymorphInstance.randomizeGenome(2, { value: randomizeGenomePrice })

        const geneAfter = await polymorphInstance.geneOf(2);

        assert(!geneBefore.eq(geneAfter), "Genes did not change for EOW interaction");

        const contractInteractor = await deployer.deploy(TestContractInteractor, {}, polymorphInstance.contractAddress)

        const aliceAddress = await aliceAccount.signer.getAddress();

        await polymorphInstance.transferFrom(aliceAddress, contractInteractor.contractAddress, 2);

        await assert.revertWith(contractInteractor.triggerRandomize(2, { value: randomizeGenomePrice }), "Caller cannot be a contract");
        await assert.revertWith(contractInteractor.triggerGeneChange(2, 2, { value: randomizeGenomePrice }), "Caller cannot be a contract");

    })

    it('should change polymorph price', async () => {

        const oldPolymorphPrice = ethers.utils.parseEther("0.0777");
        const newPolymorphPrice = ethers.utils.parseEther("0.0877");

        const polymorphPriceBefore = await polymorphInstance.polymorphPrice();
        assert(polymorphPriceBefore.eq(oldPolymorphPrice), "The polymorph price was not 0.0777 in the beginning");

        await polymorphInstance.from(DAO).setPolymorphPrice(newPolymorphPrice);

        const polymorphPriceAfter = await polymorphInstance.polymorphPrice();
        assert(polymorphPriceAfter.eq(newPolymorphPrice), "The polymorph price did not change");

        await assert.revertWith(polymorphInstance.setPolymorphPrice(newPolymorphPrice), "Not called from the dao");
    })

    it('should change max supply', async () => {

        const oldMaxSupply = 30;
        const newMaxSupply = 10000;

        const totalSupplyBefore = await polymorphInstance.maxSupply();
        assert(totalSupplyBefore.eq(oldMaxSupply), "The max supply was not 10 in the beginning");

        await polymorphInstance.from(DAO).setMaxSupply(newMaxSupply);

        const totalSupplyAfter = await polymorphInstance.maxSupply();
        assert(totalSupplyAfter.eq(newMaxSupply), "The max supply did not change");

        await assert.revertWith(polymorphInstance.setMaxSupply(newMaxSupply), "Not called from the dao");
    })

    it('should change randomizeGenomePrice', async () => {

        const oldRandomizeGenomePrice = ethers.utils.parseEther("0.01");
        const newRandomizeGenomePrice = ethers.utils.parseEther("0.1");

        const randomizeGenomePriceBefore = await polymorphInstance.randomizeGenomePrice();
        assert(randomizeGenomePriceBefore.eq(oldRandomizeGenomePrice), "The randomize genome was not 10 in the beginning");

        await polymorphInstance.from(DAO).changeRandomizeGenomePrice(newRandomizeGenomePrice);

        const randomizeGenomePriceAfter = await polymorphInstance.randomizeGenomePrice();
        assert(randomizeGenomePriceAfter.eq(newRandomizeGenomePrice), "The randomize genome price did not change");

        await assert.revertWith(polymorphInstance.changeRandomizeGenomePrice(newRandomizeGenomePrice), "Not called from the dao");
    })

    it('should change bulk buy limit', async () => {

        const oldBaseURI = "http://www.kekdao.com/";
        const newBaseURI = "http://www.universe.xyz/";

        const baseURIBefore = await polymorphInstance.baseURI();
        assert(baseURIBefore === oldBaseURI, "The base URI was not http://www.kekdao.com/ in the beginning");

        await polymorphInstance.from(DAO).setBaseURI("http://www.universe.xyz/");

        const baseURIAfter = await polymorphInstance.baseURI();
        assert(baseURIAfter === newBaseURI, "The baseURI did not change");

        await assert.revertWith(polymorphInstance.setBaseURI(newBaseURI), "Not called from the dao");
    })

    it('should change baseURI', async () => {

        const oldBulkBuyLimit = 20;
        const newBulkBuyLimit = 30;

        const bulkBuyLimitBefore = await polymorphInstance.bulkBuyLimit();
        assert(bulkBuyLimitBefore.eq(oldBulkBuyLimit), "The bulk buy limiu was not 20 in the beginning");

        await polymorphInstance.from(DAO).setBulkBuyLimit(newBulkBuyLimit);

        const bulkBuyLimitAfter = await polymorphInstance.bulkBuyLimit();
        assert(bulkBuyLimitAfter.eq(newBulkBuyLimit), "The bulk buy limit did not change");

        await assert.revertWith(polymorphInstance.setBulkBuyLimit(newBulkBuyLimit), "Not called from the dao");
    })

});