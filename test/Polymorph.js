const etherlime = require('etherlime-lib');
const ethers = require('ethers');
const Polymorph = require('../build/Polymorph.json');


describe('Polymorph', () => {
    let kekDAO = accounts[2];
    let aliceAccount = accounts[3];
    let bobsAccount = accounts[4];
    let deployer;
    let polymorphInstance;

    before(async () => {
        const kekAddress = await kekDAO.signer.getAddress();
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        polymorphInstance = await deployer.deploy(Polymorph, {}, "Polymorph", "POLY", "http://www.kekdao.com/", kekAddress);
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



});