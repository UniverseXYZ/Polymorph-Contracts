// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC721PresetMinterPauserAutoId.sol";
import "./PolymorphGeneGenerator.sol";
import "./IPolymorph.sol";


contract Polymorph is IPolymorph, ERC721PresetMinterPauserAutoId, ReentrancyGuard {
    using PolymorphGeneGenerator for PolymorphGeneGenerator.Gene;
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    PolymorphGeneGenerator.Gene internal geneGenerator;

    address payable public daoAddress;
    uint256 public polymorphPrice;
    uint256 private _totalSupply;
    uint256 public bulkBuyLimit;

    event TokenMorphed(uint256 indexed tokenId, uint256 oldGene, uint256 newGene, uint256 price, Polymorph.PolymorphEventType eventType);
    event TokenMinted(uint256 indexed tokenId, uint256 newGene);
    event PolymorphPriceChanged(uint256 newPolymorphPrice);
    event TotalSupplyChanged(uint256 newTotalSupply);
    event BulkBuyLimitChanged(uint256 newBulkBuyLimit);

    enum PolymorphEventType { MINT, MORPH, TRANSFER }

     // Optional mapping for token URIs
    mapping (uint256 => uint256) internal _genes;

    constructor(string memory name, string memory symbol, string memory baseURI, address payable _daoAddress, uint premintedTokensCount, uint256 _polymorphPrice, uint256 totalSupply, uint256 _bulkBuyLimit) ERC721PresetMinterPauserAutoId(name, symbol, baseURI) public {
        daoAddress = _daoAddress;
        polymorphPrice = _polymorphPrice;
        _totalSupply = totalSupply;
        bulkBuyLimit = _bulkBuyLimit;
        geneGenerator.random();

        _preMint(premintedTokensCount);
    }

    function _preMint(uint256 amountToMint) internal { 
        for (uint i = 0; i < amountToMint; i++) {
            _tokenIdTracker.increment();
            uint256 tokenId = _tokenIdTracker.current();
            _genes[tokenId] = geneGenerator.random();
            _mint(_msgSender(), tokenId); 
        }
    }

    modifier onlyDAO() {
        require(msg.sender == daoAddress, "Not called from the dao");
        _;
    }

    function geneOf(uint256 tokenId) public view virtual override returns (uint256 gene) {
        return _genes[tokenId];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721PresetMinterPauserAutoId) {
        ERC721PresetMinterPauserAutoId._beforeTokenTransfer(from, to, tokenId);
        emit TokenMorphed(tokenId, _genes[tokenId], _genes[tokenId], 0, PolymorphEventType.TRANSFER);
    }

    function mint() public override payable nonReentrant {
        require(_tokenIdTracker.current() < _totalSupply, "Total supply reached");

        _tokenIdTracker.increment();

        uint256 tokenId = _tokenIdTracker.current();
        _genes[tokenId] = geneGenerator.random();
        
        (bool transferToDaoStatus, ) = daoAddress.call{value:polymorphPrice}("");
        require(transferToDaoStatus, "Address: unable to send value, recipient may have reverted");

        uint256 excessAmount = msg.value.sub(polymorphPrice);
        if (excessAmount > 0) {
            (bool returnExcessStatus, ) = _msgSender().call{value: excessAmount}("");
            require(returnExcessStatus, "Failed to return excess.");
        }
        
        _mint(_msgSender(), tokenId);

        emit TokenMinted(tokenId, _genes[tokenId]);
        emit TokenMorphed(tokenId, 0, _genes[tokenId], polymorphPrice, PolymorphEventType.MINT);
    }

    function bulkBuy(uint256 amount) public override payable nonReentrant {
        require(amount <= bulkBuyLimit, "Cannot bulk buy more than the preset limit");
        require(_tokenIdTracker.current().add(amount) <= _totalSupply, "Total supply reached");
        
        (bool transferToDaoStatus, ) = daoAddress.call{value:polymorphPrice.mul(amount)}("");
        require(transferToDaoStatus, "Address: unable to send value, recipient may have reverted");

        uint256 excessAmount = msg.value.sub(polymorphPrice.mul(amount));
        if (excessAmount > 0) {
            (bool returnExcessStatus, ) = _msgSender().call{value: excessAmount}("");
            require(returnExcessStatus, "Failed to return excess.");
        }

        for (uint256 i = 0; i < amount; i++) {
            _tokenIdTracker.increment();
            
            uint256 tokenId = _tokenIdTracker.current();
            _genes[tokenId] = geneGenerator.random();
            _mint(_msgSender(), tokenId);
            
            emit TokenMinted(tokenId, _genes[tokenId]);
            emit TokenMorphed(tokenId, 0, _genes[tokenId], polymorphPrice, PolymorphEventType.MINT); 
        }
        
    }

    function lastTokenId() public override view returns (uint256 tokenId) {
        return _tokenIdTracker.current();
    }

    function mint(address to) public override(ERC721PresetMinterPauserAutoId) {
        revert("Should not use this one");
    }

    function setPolymorphPrice(uint256 newPolymorphPrice) public override virtual onlyDAO {
        polymorphPrice = newPolymorphPrice;

        emit PolymorphPriceChanged(newPolymorphPrice);
    }

    function setTotalSupply(uint256 totalSupply) public override virtual onlyDAO {
        _totalSupply = totalSupply;

        emit TotalSupplyChanged(totalSupply);
    }

    function setBulkBuyLimit(uint256 _bulkBuyLimit) public override virtual onlyDAO {
        bulkBuyLimit = _bulkBuyLimit;

        emit BulkBuyLimitChanged(_bulkBuyLimit);
    }

    function totalSupply() public override view returns (uint256) {
        return _totalSupply;
    }

    receive() external payable {
        mint();
    }
    
}