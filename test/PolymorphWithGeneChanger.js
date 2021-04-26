const etherlime = require('etherlime-lib');
const ethers = require('ethers');
const PolymorphWithGeneChanger = require('../build/PolymorphWithGeneChanger.json');


describe('PolymorphWithGeneChanger', () => {
    let kekDAO = accounts[2];
    let aliceAccount = accounts[3];
    let bobsAccount = accounts[4];
    let defaultGenomeChangePrice = ethers.utils.parseEther("0.01");
    let deployer;
    let polymorphInstance;

    before(async () => {
        const kekAddress = await kekDAO.signer.getAddress();
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        polymorphInstance = await deployer.deploy(PolymorphWithGeneChanger, {}, "PolymorphWithGeneChanger", "POLY", "http://www.kekdao.com/", kekAddress, defaultGenomeChangePrice);
    });

    it('should be valid address', async () => {
        assert.isAddress(polymorphInstance.contractAddress, "The contract was not deployed");
    })

    it('should mint nft with random gene', async () => {
        const kekBalanceBefore = await kekDAO.signer.getBalance();

        const cost1 = await polymorphInstance.priceFor(1);
        await polymorphInstance.mint({ value: cost1 })

        const cost2 = await polymorphInstance.priceFor(2);
        await polymorphInstance.mint({ value: cost2.mul(2) });

        const kekBalanceAfter = await kekDAO.signer.getBalance();

        const geneA = await polymorphInstance.geneOf(1);
        const geneB = await polymorphInstance.geneOf(2);

        assert(!geneA.eq(geneB), "The two genes ended up the same");

        assert(kekBalanceAfter.eq(kekBalanceBefore.add(cost1.add(cost2))), "The dao did not receive correct amount");
    })

    it('should change the gene on transfer', async () => {

        const aliceAddress = await aliceAccount.signer.getAddress();
        const bobsAddress = await bobsAccount.signer.getAddress();

        const geneBefore = await polymorphInstance.geneOf(1);
        await polymorphInstance.transferFrom(aliceAddress, bobsAddress, 1);
        const geneAfter = await polymorphInstance.geneOf(1);

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

        const kekBalanceBefore = await kekDAO.signer.getBalance();

        const geneBefore = await polymorphInstance.geneOf(2);

        let price = await polymorphInstance.priceForGenomeChange(2);
        assert(price.eq(defaultGenomeChangePrice), "The price was not the default");

        await polymorphInstance.morphGene(2, 1, { value: price });
        const geneAfter = await polymorphInstance.geneOf(2);
        const kekBalanceAfter = await kekDAO.signer.getBalance();
        assert(!geneBefore.eq(geneAfter), "The gene did not change");
        assert(kekBalanceBefore.eq(kekBalanceAfter.sub(price)), "The price was not paid");


        price = await polymorphInstance.priceForGenomeChange(2);
        assert(price.eq(defaultGenomeChangePrice.mul(2)), "The price was not correct");

        await polymorphInstance.morphGene(2, 0, { value: price });
        const geneAfter2 = await polymorphInstance.geneOf(2);
        const kekBalanceAfter2 = await kekDAO.signer.getBalance();
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

});