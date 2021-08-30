// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "./IPolymorphRoot.sol";

interface IPolymorphWithGeneChangerRoot is IPolymorphRoot {
    function morphGene(uint256 tokenId, uint256 genePosition) external payable;

    function randomizeGenome(uint256 tokenId) external payable;

    function priceForGenomeChange(uint256 tokenId)
        external
        view
        returns (uint256 price);

    function changeBaseGenomeChangePrice(uint256 newGenomeChangePrice) external;

    function changeRandomizeGenomePrice(uint256 newRandomizeGenomePrice)
        external;
}
