// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../base/PolymorphWithGeneChanger.sol";
import "./IPolymorphChild.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PolymorphChild is IPolymorphChild, PolymorphWithGeneChanger {
    using PolymorphGeneGenerator for PolymorphGeneGenerator.Gene;

    IERC20 public maticWETH;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address payable _daoAddress,
        uint256 _baseGenomeChangePrice,
        uint256 _randomizeGenomePrice,
        string memory _arweaveAssetsJSON
    )
        PolymorphWithGeneChanger(
            name,
            symbol,
            baseURI,
            _daoAddress,
            _baseGenomeChangePrice,
            _randomizeGenomePrice,
            _arweaveAssetsJSON
        )
    {
        daoAddress = _daoAddress;
        arweaveAssetsJSON = _arweaveAssetsJSON;
        geneGenerator.random();
    }

    function mint(address to)
        public
        pure
        override(ERC721PresetMinterPauserAutoId)
    {
        revert("Minting is disabled on side chains");
    }

    function mintPolymorphWithInfo(
        uint256 tokenId,
        address ownerAddress,
        uint256 gene
    ) public override nonReentrant onlyTunnel {
        _mint(ownerAddress, tokenId);
        emit TokenMinted(tokenId, gene);
    }

    function setMaticWETHContract(address _maticWETHAddress) public onlyDAO {
        maticWETH = IERC20(_maticWETHAddress);
    }

    function morphGene(uint256 tokenId, uint256 genePosition)
        public
        payable
        virtual
        override
        nonReentrant
    {
        require(genePosition > 0, "Base character not morphable");
        _beforeGenomeChange(tokenId);
        uint256 price = priceForGenomeChange(tokenId);

        maticWETH.transferFrom(msg.sender, daoAddress, price);

        if (msg.value > 0) {
            (bool returnExcessStatus, ) = _msgSender().call{
                value: msg.value
            }("");
            require(returnExcessStatus, "Failed to return excess.");
        }

        uint256 oldGene = _genes[tokenId];
        uint256 newTrait = geneGenerator.random() % 100;
        _genes[tokenId] = replaceGene(oldGene, newTrait, genePosition);
        _genomeChanges[tokenId]++;
        isNotVirgin[tokenId] = true;
        emit TokenMorphed(
            tokenId,
            oldGene,
            _genes[tokenId],
            price,
            PolymorphEventType.MORPH
        );
    }

    function randomizeGenome(uint256 tokenId)
        public
        payable
        virtual
        override
        nonReentrant
    {
        _beforeGenomeChange(tokenId);

        maticWETH.transferFrom(msg.sender, daoAddress, randomizeGenomePrice);

        if (msg.value > 0) {
            (bool returnExcessStatus, ) = _msgSender().call{
                value: msg.value
            }("");
            require(returnExcessStatus, "Failed to return excess.");
        }

        uint256 oldGene = _genes[tokenId];
        _genes[tokenId] = geneGenerator.random();
        _genomeChanges[tokenId] = 0;
        isNotVirgin[tokenId] = true;
        emit TokenMorphed(
            tokenId,
            oldGene,
            _genes[tokenId],
            randomizeGenomePrice,
            PolymorphEventType.MORPH
        );
    }
}