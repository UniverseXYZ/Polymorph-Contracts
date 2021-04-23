const etherlime = require('etherlime-lib');
const Polymorph = require('../build/Polymorph.json');


describe('Polymorph', () => {
    let aliceAccount = accounts[3];
    let bobsAccount = accounts[4];
    let deployer;
    let polymorphInstance;

    before(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        polymorphInstance = await deployer.deploy(Polymorph, {}, "Polymorph", "POLY", "http://www.kekdao.com/");
    });

    it('should be valid address', async () => {
        assert.isAddress(polymorphInstance.contractAddress, "The contract was not deployed");
    })

    it('should mint nft with random gene', async () => {
        const aliceAddress = await aliceAccount.signer.getAddress();
        await polymorphInstance.mint(aliceAddress);
        await polymorphInstance.mint(aliceAddress);

        const geneA = await polymorphInstance.geneOf(0);
        const geneB = await polymorphInstance.geneOf(1);

        assert(!geneA.eq(geneB), "The two genes ended up the same");
    })

    it('should change the gene on transfer', async () => {

        const aliceAddress = await aliceAccount.signer.getAddress();
        const bobsAddress = await bobsAccount.signer.getAddress();

        const geneBefore = await polymorphInstance.geneOf(0);
        await polymorphInstance.transferFrom(aliceAddress, bobsAddress, 0);
        const geneAfter = await polymorphInstance.geneOf(0);

        console.log(geneBefore.toString());
        console.log(geneAfter.toString());

        assert(!geneBefore.eq(geneAfter), "The two genes ended up the same");
    })



});