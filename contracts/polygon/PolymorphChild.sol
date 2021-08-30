// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../ERC721PresetMinterPauserAutoId.sol";
import "../PolymorphGeneGenerator.sol";
import "./IPolymorphChild.sol";

contract PolymorphChild is
    IPolymorphChild,
    ERC721PresetMinterPauserAutoId,
    ReentrancyGuard
{
    using PolymorphGeneGenerator for PolymorphGeneGenerator.Gene;
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    PolymorphGeneGenerator.Gene internal geneGenerator;

    address payable public daoAddress;
    string public arweaveAssetsJSON;

    uint256 public totalBurnedV1;

    event TokenMorphed(
        uint256 indexed tokenId,
        uint256 oldGene,
        uint256 newGene,
        uint256 price,
        PolymorphChild.PolymorphEventType eventType
    );
    event TokenMinted(uint256 indexed tokenId, uint256 newGene);
    event TokenBurnedAndMinted(
        uint256 indexed oldTokenId,
        uint256 indexed newTokenId,
        uint256 gene
    );
    event BaseURIChanged(string baseURI);
    event ArweaveAssetsJSONChanged(string arweaveAssetsJSON);

    enum PolymorphEventType {
        MINT,
        MORPH,
        TRANSFER
    }

    // Optional mapping for token URIs
    mapping(uint256 => uint256) internal _genes;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address payable _daoAddress,
        string memory _arweaveAssetsJSON
    ) ERC721PresetMinterPauserAutoId(name, symbol, baseURI) {
        daoAddress = _daoAddress;
        arweaveAssetsJSON = _arweaveAssetsJSON;
        geneGenerator.random();
    }

    modifier onlyDAO() {
        require(_msgSender() == daoAddress, "Not called from the dao");
        _;
    }

    function geneOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (uint256 gene)
    {
        return _genes[tokenId];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721PresetMinterPauserAutoId) {
        ERC721PresetMinterPauserAutoId._beforeTokenTransfer(from, to, tokenId);
        emit TokenMorphed(
            tokenId,
            _genes[tokenId],
            _genes[tokenId],
            0,
            PolymorphEventType.TRANSFER
        );
    }

    function lastTokenId() public view override returns (uint256 tokenId) {
        return _tokenIdTracker.current();
    }

    function mint(address to)
        public
        pure
        override(ERC721PresetMinterPauserAutoId)
    {
        revert("Minting is disabled on side chains");
    }

    function setBaseURI(string memory _baseURI) public virtual onlyDAO {
        _setBaseURI(_baseURI);

        emit BaseURIChanged(_baseURI);
    }

    function setArweaveAssetsJSON(string memory _arweaveAssetsJSON)
        public
        virtual
        onlyDAO
    {
        arweaveAssetsJSON = _arweaveAssetsJSON;

        emit ArweaveAssetsJSONChanged(_arweaveAssetsJSON);
    }
}
