// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC721PresetMinterPauserAutoId.sol";
import "./PolymorphGeneGenerator.sol";
import "./IPolymorph.sol";
import "./BMath.sol";


contract Polymorph is IPolymorph, ERC721PresetMinterPauserAutoId, BMath, ReentrancyGuard {
    using PolymorphGeneGenerator for PolymorphGeneGenerator.Gene;
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    PolymorphGeneGenerator.Gene internal geneGenerator;

    address payable public daoAddress;
    mapping(address => bool) public whitelistAddresses;

    event TokenMorphed(uint256 indexed tokenId, uint256 oldGene, uint256 newGene);
    event MarketplaceTransfer(uint256 indexed tokenId, address fromAddress, address toAddress);
    event SlopeChanged(uint256 newSlope);

     // Optional mapping for token URIs
    mapping (uint256 => uint256) internal _genes;

    constructor(string memory name, string memory symbol, string memory baseURI, address payable _daoAddress, address[] memory _whitelistAddresses, uint premintedTokensCount) ERC721PresetMinterPauserAutoId(name, symbol, baseURI) public {
        daoAddress = _daoAddress;
        geneGenerator.random();

        _setWhitelistAddresses(_whitelistAddresses);
        _preMint(premintedTokensCount);
    }

    function _preMint(uint256 amountToMint) internal { 
        for (uint i = 0; i < amountToMint; i++) {
            _tokenIdTracker.increment();
            _mint(_msgSender(), _tokenIdTracker.current()); 
        }
    }

    function _setWhitelistAddresses(address[] memory _whitelistAddresses) internal onlyDAO { 
        for (uint i = 0; i < _whitelistAddresses.length; i++) {
            whitelistAddresses[_whitelistAddresses[i]] = true;
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
        if(whitelistAddresses[from] == true || whitelistAddresses[to] == true) {
            ERC721PresetMinterPauserAutoId._beforeTokenTransfer(from, to, tokenId);
            emit MarketplaceTransfer(tokenId, from, to);
        } else {
            uint256 oldGene = _genes[tokenId];
            _genes[tokenId] = geneGenerator.random();
            ERC721PresetMinterPauserAutoId._beforeTokenTransfer(from, to, tokenId);
            emit TokenMorphed(tokenId, oldGene, _genes[tokenId]);
        }
    }

    function mint() public override payable nonReentrant {
        _tokenIdTracker.increment();
        uint256 price = calcPolymorphPrice(_tokenIdTracker.current());
        daoAddress.transfer(price);
        _msgSender().transfer(msg.value.sub(price)); // Return excess
        _mint(_msgSender(), _tokenIdTracker.current());
    }

    function lastTokenId() public override view returns (uint256 tokenId) {
        return _tokenIdTracker.current();
    }

    function priceFor(uint256 tokenNumber) public override view returns (uint256 price) {
        return calcPolymorphPrice(tokenNumber);
    }

    function mint(address to) public override(ERC721PresetMinterPauserAutoId) pure {
        revert("Should not use this one");
    }

    function changeSlope(uint256 newSlope) public override virtual onlyDAO {
        require(newSlope > 0, "The new slope should be more than 0");
        buySlope = newSlope;
        emit SlopeChanged(newSlope);
    }


    function updateWhitelistAddress(address _whitelistAddress, bool privilege) public onlyDAO { 
        whitelistAddresses[_whitelistAddress] = privilege;
    }

    receive() external payable {
        mint();
    }
    
}