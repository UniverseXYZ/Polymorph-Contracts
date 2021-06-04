const etherlime = require('etherlime-lib');
const ethers = require('ethers');
const PolymorphWithGeneChanger = require('../build/PolymorphWithGeneChanger.json');


describe('PolymorphWithGeneChanger', () => {
    let DAO = accounts[2];
    let aliceAccount = accounts[3];
    let bobsAccount = accounts[4];
    let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
    let deployer;
    let polymorphInstance;
    const premitedTokensCount = 10;

    before(async () => {
        const kekAddress = await DAO.signer.getAddress();
        const whitelistAddresses = [kekAddress];
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        polymorphInstance = await deployer.deploy(PolymorphWithGeneChanger, {}, "PolymorphWithGeneChanger", "POLY", "http://www.kekdao.com/", kekAddress, whitelistAddresses, premitedTokensCount, defaultGenomeChangePrice);
    });

    it('should be valid address', async () => {
        assert.isAddress(polymorphInstance.contractAddress, "The contract was not deployed");
    })

    it(`should premint ${premitedTokensCount} tokens`, async () => {
        const lastToken = await polymorphInstance.lastTokenId();
        const ownerOfTheFirstToken = await polymorphInstance.ownerOf(1);
        const aliceAddress = await aliceAccount.signer.getAddress();

        assert(aliceAddress === ownerOfTheFirstToken, "The preminted tokens where not given to the owner");
        assert(lastToken.eq(premitedTokensCount), "The preminted tokens count is not accurate");
    })

    it('should transfer token to the marketplace and keep the same genes', async () => {
        const marketplaceAddress = await DAO.signer.getAddress();
        const aliceAddress = await aliceAccount.signer.getAddress();

        const geneBeforeTransactionToMarketplace = await polymorphInstance.geneOf(1);
        await polymorphInstance.transferFrom(aliceAddress, marketplaceAddress, 1);
        const geneAfterTransactionToMarketplace = await polymorphInstance.geneOf(1);
        assert(geneBeforeTransactionToMarketplace.eq(geneAfterTransactionToMarketplace), "The genes morphed when sending transaction TO marketplace");


        const ownerOfTheSentToken = await polymorphInstance.ownerOf(1);    
        assert(ownerOfTheSentToken === marketplaceAddress, "The token was not transfered to the receiver.");

    })

    it('should transfer token from the marketplace and keep the same genes', async () => {
        const marketplaceAddress = await DAO.signer.getAddress();
        const aliceAddress = await aliceAccount.signer.getAddress();

        await polymorphInstance.from(marketplaceAddress).setApprovalForAll(aliceAddress, true)

        const ownerOfTheSentToken = await polymorphInstance.ownerOf(1);    
        assert(marketplaceAddress === ownerOfTheSentToken, "The marketplace is not the owner of the token.");


        const geneBeforeTransactionFromMarketplace = await polymorphInstance.geneOf(1);
        await polymorphInstance.transferFrom(marketplaceAddress, aliceAddress, 1);
        const geneAfterTransactionFromMarketplace = await polymorphInstance.geneOf(1);

        assert(geneBeforeTransactionFromMarketplace.eq(geneAfterTransactionFromMarketplace), "The genes morphed when sending transaction FROM marketplace");
    })

    it('should mint nft with random gene', async () => {
        const kekBalanceBefore = await DAO.signer.getBalance();

        const cost1 = await polymorphInstance.priceFor(premitedTokensCount + 1);
        await polymorphInstance.mint({ value: cost1 })

        const cost2 = await polymorphInstance.priceFor(premitedTokensCount + 2);
        await polymorphInstance.mint({ value: cost2.mul(premitedTokensCount + 2) });

        const kekBalanceAfter = await DAO.signer.getBalance();

        const geneA = await polymorphInstance.geneOf(premitedTokensCount + 1);
        const geneB = await polymorphInstance.geneOf(premitedTokensCount + 2);

        assert(!geneA.eq(geneB), "The two genes ended up the same");

        assert(kekBalanceAfter.eq(kekBalanceBefore.add(cost1.add(cost2))), "The dao did not receive correct amount");
    })

    it('should change the gene on transfer', async () => {
        const aliceAddress = await aliceAccount.signer.getAddress();
        const bobsAddress = await bobsAccount.signer.getAddress();

        const geneBefore = await polymorphInstance.geneOf(3);
        await polymorphInstance.transferFrom(aliceAddress, bobsAddress, 3);
        const geneAfter = await polymorphInstance.geneOf(3);

        assert(!geneBefore.eq(geneAfter), "The two genes ended up the same");
    })

    it.skip('total eth math calculator', async () => {

        let totalETH = ethers.utils.bigNumberify("0");
        for (let index = 1; index <= 1000; index++) {
            const res = await polymorphInstance.priceFor(index);
            totalETH = totalETH.add(res);
        }
    })

    it('should increase the price for minting', async () => {

        for (let index = 1; index <= 1000; index += 100) {
            const a = await polymorphInstance.priceFor(index);
            const b = await polymorphInstance.priceFor(index + 100);
            assert(b.gt(a), "Next morphs were not more expensive");

        }
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

        await polymorphInstance.morphGene(2, 0, { value: price });
        const geneAfter2 = await polymorphInstance.geneOf(2);
        const kekBalanceAfter2 = await DAO.signer.getBalance();
        assert(!geneAfter2.eq(geneAfter), "The gene did not change");
        assert(kekBalanceAfter.eq(kekBalanceAfter2.sub(price)), "The price was not paid");

        price = await polymorphInstance.priceForGenomeChange(2);
        assert(price.eq(defaultGenomeChangePrice.mul(4)), "The price was not correct");

        await polymorphInstance.morphGene(2, 37, { value: price, gasLimit: 100000 });
        const geneAfter3 = await polymorphInstance.geneOf(2);
        assert(!geneAfter2.eq(geneAfter3), "The gene did not change");

        price = await polymorphInstance.priceForGenomeChange(2);
        assert(price.eq(defaultGenomeChangePrice.mul(8)), "The price was not correct");

        await polymorphInstance.randomizeGenome(2, { value: price });
        const geneAfterReset = await polymorphInstance.geneOf(2);
        assert(!geneAfterReset.eq(geneAfter3), "The gene did not change");

        price = await polymorphInstance.priceForGenomeChange(2);
        assert(price.eq(defaultGenomeChangePrice), "The price was not the default");
    })

    it('should change buy slope', async () => {

        const oldSlope = 1500;
        const newSlope = 2500;

        const buySlopeBefore = await polymorphInstance.buySlope();
        assert(buySlopeBefore.eq(oldSlope), "The buyslope was not 1500 in the beginning");

        await polymorphInstance.from(DAO).changeSlope(newSlope);

        const buySlopeAfter = await polymorphInstance.buySlope();
        assert(buySlopeAfter.eq(newSlope), "The buyslope did not change");

        await assert.revertWith(polymorphInstance.changeSlope(3500), "Not called from the dao");
    })
});