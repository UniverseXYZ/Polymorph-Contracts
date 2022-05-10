const tokenName = "Polymorph";
const tokenSymbol = "MORPH";
const metadataURI =
  "https://us-central1-polymorphmetadata.cloudfunctions.net/images-function?id=";
const DAOAddress = "0x8FcE67537676879Bc5a1B86B403400E1614Bfce6";
const premint = 0;
const geneChangePrice = ethers.utils.parseEther("0.01");
const polymorphPrice = ethers.utils.parseEther("0.0777");
const polymorphsLimit = 10000;
const randomizePrice = ethers.utils.parseEther("0.01");
const bulkBuyLimit = 20;
const arweaveContainer =
  "https://arweave.net/5KDDRA5EE9p-Bw29ryB9Uz6SvMRNMCyXKkOzW_ZT9gA";
const polymorphV1Address = "0x665E3AD58e232cc8944C613D5e20c3A5C70A10ea";

module.exports = [
  {
    name: tokenName,
    symbol: tokenSymbol,
    baseURI: metadataURI,
    _daoAddress: DAOAddress,
    premintedTokensCount: premint,
    _baseGenomeChangePrice: geneChangePrice,
    _polymorphPrice: polymorphPrice,
    _maxSupply: polymorphsLimit,
    _randomizeGenomePrice: randomizePrice,
    _bulkBuyLimit: bulkBuyLimit,
    _arweaveAssetsJSON: arweaveContainer,
    _polymorphV1Address: polymorphV1Address,
  },
];
