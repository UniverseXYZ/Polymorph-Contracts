// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "../base/PolymorphWithGeneChanger.sol";
import "./IPolymorphChild.sol";

contract PolymorphChild is IPolymorphChild, PolymorphWithGeneChanger {
    using PolymorphGeneGenerator for PolymorphGeneGenerator.Gene;

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
}
