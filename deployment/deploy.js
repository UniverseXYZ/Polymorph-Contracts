const etherlime = require('etherlime-lib');
const ethers = require('ethers');
const PolymorphWithGeneChanger = require('../build/PolymorphWithGeneChanger.json');


const deploy = async (network, secret, etherscanApiKey) => {

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, process.env.API_KEY);
	const gasPrice = 32000000000
	const gasLimit = 4700000

	const tokenName = "Polymorph";
	const tokenSymbol = "MORPH";
	const metadataURI = "https://us-central1-polymorphmetadata.cloudfunctions.net/images-function?id="
	const DAOAddress = "0xa8047C2a86D5A188B0e15C3C10E2bc144cB272C2"
	const premint = 0
	const geneChangePrice = ethers.utils.parseEther("0.01");
	const polymorphPrice = ethers.utils.parseEther("0.0777");
	const polymorphsLimit = 10000
	const randomizePrice = ethers.utils.parseEther("0.01");
	const bulkBuyLimit = 20
	const arweaveContainer = "https://arweave.net/Xhx9MHp-zmtlOwaM9nSz8DTqnpUSdEAzlpn_lwyjeMg";

	deployer.defaultOverrides = { gasLimit, gasPrice };
	const result = await deployer.deploy(
		PolymorphWithGeneChanger,
		{},
		tokenName,
		tokenSymbol,
		metadataURI,
		DAOAddress,
		premint,
		geneChangePrice,
		polymorphPrice,
		polymorphsLimit,
		randomizePrice,
		bulkBuyLimit,
		arweaveContainer);

};

module.exports = {
	deploy
};
