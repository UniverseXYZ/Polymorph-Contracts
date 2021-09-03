// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IPolymorphV1 is IERC721 {
    function burn(uint256 tokenId) external;
}
