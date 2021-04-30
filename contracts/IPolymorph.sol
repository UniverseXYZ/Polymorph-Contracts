// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";


interface IPolymorph is IERC721 {

    function geneOf(uint256 tokenId) external view returns (uint256 gene);
    function mint() external payable;
    function lastTokenId() external view returns (uint256 tokenId);
    function priceFor(uint256 tokenNumber) external view returns (uint256 price);
    function changeSlope(uint256 newSlope) external virtual;

    
}