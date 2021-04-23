// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./PolymorphGeneGenerator.sol";


interface IPolymorph is IERC721 {

    function geneOf(uint256 tokenId) external view returns (uint256 gene);
    
}