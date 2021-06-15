// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./PolymorphGeneGenerator.sol";
import "./Polymorph.sol";
import "./IPolymorphWithGeneChanger.sol";


contract PolymorphWithGeneChanger is IPolymorphWithGeneChanger, Polymorph {
    using PolymorphGeneGenerator for PolymorphGeneGenerator.Gene;
    using SafeMath for uint256;

    mapping(uint256 => uint256) internal _genomeChanges;
    uint256 public baseGenomeChangePrice;

    event BaseGenomeChangePriceChanged(uint256 newGenomeChange);

    constructor(string memory name, string memory symbol, string memory baseURI, address payable _daoAddress, uint premintedTokensCount, uint256 _baseGenomeChangePrice) Polymorph(name, symbol, baseURI, _daoAddress, premintedTokensCount) {
        baseGenomeChangePrice = _baseGenomeChangePrice;
    }

    function changeBaseGenomeChangePrice(uint256 newGenomeChangePrice)  public override virtual onlyDAO {
        baseGenomeChangePrice = newGenomeChangePrice;
        emit BaseGenomeChangePriceChanged(newGenomeChangePrice);
    }

    function morphGene(uint256 tokenId, uint256 genePosition) public payable virtual override nonReentrant {
        _beforeGenomeChange(tokenId);
        uint256 price = priceForGenomeChange(tokenId);
        
        if(price > 0) {
            (bool transferToDaoStatus, ) = daoAddress.call{value:price}("");
            require(transferToDaoStatus, "Transfer failed.");

            (bool returnExcessStatus, ) = _msgSender().call{value:msg.value.sub(price)}(""); // Return excess
            require(returnExcessStatus, "Failed to return excess.");
        }

        uint256 oldGene = _genes[tokenId];
        uint256 newTrait = geneGenerator.random()%100;
        _genes[tokenId] = replaceGene(_genes[tokenId], newTrait, genePosition);
        _genomeChanges[tokenId]++;
        emit TokenMorphed(tokenId, oldGene, _genes[tokenId]);
    }

    function replaceGene(uint256 genome, uint256 replacement, uint256 genePosition) internal virtual pure returns(uint256 newGene) {
        require(genePosition < 38, "Bad gene position");
        uint256 mod = 0;
        if (genePosition > 0) {
            mod = genome.mod(10**(genePosition * 2)); // Each gene is 2 digits long
        }
        uint256 div = genome.div(10 ** ((genePosition + 1) * 2)).mul(10 ** ((genePosition + 1) * 2));
        uint256 insert = replacement * (10 ** (genePosition * 2));
        newGene = div.add(insert).add(mod);
        return newGene;
    }

    function randomizeGenome(uint256 tokenId) public payable override virtual nonReentrant {
        _beforeGenomeChange(tokenId);
        uint256 price = priceForGenomeChange(tokenId);

        if(price > 0) {
            (bool transferToDaoStatus, ) = daoAddress.call{value:price}("");
            require(transferToDaoStatus, "Transfer failed.");

            (bool returnExcessStatus, ) = _msgSender().call{value:msg.value.sub(price)}(""); // Return excess
            require(returnExcessStatus, "Failed to return excess.");
        }
        
        uint256 oldGene = _genes[tokenId];
        _genes[tokenId] = geneGenerator.random();
        _genomeChanges[tokenId] = 0;
        emit TokenMorphed(tokenId, oldGene, _genes[tokenId]);
    }

    function priceForGenomeChange(uint256 tokenId) public override virtual view returns(uint256 price) {
        uint256 pastChanges = _genomeChanges[tokenId];
        require(pastChanges < 255, 'pastChanges is too big and will cause overflow.');

        price = baseGenomeChangePrice;
        
        for(uint256 i = 0; i < pastChanges; i++) {
            price.add(price);
        }

        return baseGenomeChangePrice.mul(1 << pastChanges);
    }

    function _beforeGenomeChange(uint256 tokenId) internal virtual {
        require(ownerOf(tokenId) == _msgSender(), "PolymorphWithGeneChanger: cannot change genome of token that is not own");
    }
    
}