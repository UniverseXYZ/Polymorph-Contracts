const tokenName = "Polymorph";
const tokenSymbol = "MORPH";
const metadataURI =
  "https://us-central1-polymorphmetadata.cloudfunctions.net/images-function?id=";
const DAOAddress = "0x8FcE67537676879Bc5a1B86B403400E1614Bfce6";
const premint = 0;
const geneChangePrice = ethers.utils.parseEther("0.001");
const polymorphPrice = ethers.utils.parseEther("0.00777");
const polymorphsLimit = 10000;
const randomizePrice = ethers.utils.parseEther("0.001");
const bulkBuyLimit = 20;
const arweaveContainer =
  "https://arweave.net/5KDDRA5EE9p-Bw29ryB9Uz6SvMRNMCyXKkOzW_ZT9gA";
const polymorphV1Address = "0xF3641531e55DB83A39a6d505DfDecA614812F7a0";

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
