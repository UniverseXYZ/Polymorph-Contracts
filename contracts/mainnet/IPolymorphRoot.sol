// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IPolymorphRoot is IERC721 {
    function geneOf(uint256 tokenId) external view returns (uint256 gene);

    function mint() external payable;

    function bulkBuy(uint256 amount) external payable;

    function lastTokenId() external view returns (uint256 tokenId);

    function setPolymorphPrice(uint256 newPolymorphPrice) external;

    function setMaxSupply(uint256 maxSupply) external;

    function setBulkBuyLimit(uint256 bulkBuyLimit) external;
}
