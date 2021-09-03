// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;
import "./IPolymorph.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../base/ERC721PresetMinterPauserAutoId.sol";
import "../lib/PolymorphGeneGenerator.sol";
import "../modifiers/DAO.sol";

abstract contract Polymorph is
    IPolymorph,
    ERC721PresetMinterPauserAutoId,
    ReentrancyGuard,
    DAO
{
    using Counters for Counters.Counter;
    using PolymorphGeneGenerator for PolymorphGeneGenerator.Gene;

    PolymorphGeneGenerator.Gene internal geneGenerator;
    mapping(uint256 => uint256) internal _genes;
    string public arweaveAssetsJSON;

    event TokenMorphed(
        uint256 indexed tokenId,
        uint256 oldGene,
        uint256 newGene,
        uint256 price,
        PolymorphEventType eventType
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

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address payable _daoAddress,
        string memory _arweaveAssetsJSON
    ) DAO(_daoAddress) ERC721PresetMinterPauserAutoId(name, symbol, baseURI) {
        arweaveAssetsJSON = _arweaveAssetsJSON;
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

    function lastTokenId() public view override returns (uint256 tokenId) {
        return _tokenIdTracker.current();
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

    function setBaseURI(string memory _baseURI)
        public
        virtual
        override
        onlyDAO
    {
        _setBaseURI(_baseURI);

        emit BaseURIChanged(_baseURI);
    }

    function setArweaveAssetsJSON(string memory _arweaveAssetsJSON)
        public
        virtual
        override
        onlyDAO
    {
        arweaveAssetsJSON = _arweaveAssetsJSON;

        emit ArweaveAssetsJSONChanged(_arweaveAssetsJSON);
    }
}
