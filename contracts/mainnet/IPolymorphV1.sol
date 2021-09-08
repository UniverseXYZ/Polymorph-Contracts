// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IPolymorphV1 is IERC721 {
    function geneOf(uint256 tokenId) external view returns (uint256 gene);

    function burn(uint256 tokenId) external;
}
