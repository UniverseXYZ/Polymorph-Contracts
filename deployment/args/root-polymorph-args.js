const tokenName = "Polymorph";
const tokenSymbol = "MORPH";
const metadataURI =
  "https://us-central1-polymorphmetadata.cloudfunctions.net/images-function-test?id=";
const DAOAddress = "0x7e94e8D8c85960DBDC67E080C3D48D4e0BD423a6";
const royaltyFee = 0;
const geneChangePrice = ethers.utils.parseEther("0.01");
const polymorphPrice = ethers.utils.parseEther("0.0777");
const polymorphsLimit = 10000;
const randomizePrice = ethers.utils.parseEther("0.01");
const bulkBuyLimit = 20;
const arweaveContainer =
  "https://arweave.net/5KDDRA5EE9p-Bw29ryB9Uz6SvMRNMCyXKkOzW_ZT9gA";
const polymorphV1Address = "0x20951C5a7Ad50B9b9bC9202b4E32c9Deb2fD7b51";

module.exports = [
  {
    name: tokenName,
    symbol: tokenSymbol,
    baseURI: metadataURI,
    _daoAddress: DAOAddress,
    _royaltyFee: royaltyFee,
    _baseGenomeChangePrice: geneChangePrice,
    _polymorphPrice: polymorphPrice,
    _maxSupply: polymorphsLimit,
    _randomizeGenomePrice: randomizePrice,
    _bulkBuyLimit: bulkBuyLimit,
    _arweaveAssetsJSON: arweaveContainer,
    _polymorphV1Address: polymorphV1Address,
  },
];
