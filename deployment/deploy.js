const etherlime = require('etherlime-lib');
const ethers = require('ethers');
const PolymorphWithGeneChanger = require('../build/PolymorphWithGeneChanger.json');


const deploy = async (network, secret, etherscanApiKey) => {

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, process.env.API_KEY);
	deployer.defaultOverrides = { gasLimit: 4700000, gasPrice: 3000000000, etherscanApiKey };
	const result = await deployer.deployAndVerify("etherscan", PolymorphWithGeneChanger, {}, "Polymorph", "MORPH", "https://polymorphmetadata.uc.r.appspot.com/token/", "0xe42682eEa1DFC432C2fF5a779CD1D9a1e1c7f405", 0, ethers.utils.parseEther("0.01"), ethers.utils.parseEther("0.0777"), 10000, ethers.utils.parseEther("0.01"), 20);

};

module.exports = {
	deploy
};