const etherlime = require('etherlime-lib');
const ethers = require('ethers');
const PolymorphWithGeneChanger = require('../build/PolymorphWithGeneChanger.json');


const deploy = async (network, secret) => {
	const daoAddress = '0xe42682eEa1DFC432C2fF5a779CD1D9a1e1c7f405';
	const premintTokensCount = 5;

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, 'a40d4e5ac8764045953d6aa546c1e34d');
	deployer.defaultOverrides = { etherscanApiKey: 'S65RSJX5XENUKBUETUTXU8X131VF1R8C2I' };
	const result = await deployer.deployAndVerify("etherscan", PolymorphWithGeneChanger, {}, "Polymorph", "MORPH", "http://www.kekdao.com/", daoAddress, premintTokensCount, ethers.utils.parseEther("0.01"));
};

module.exports = {
	deploy
};