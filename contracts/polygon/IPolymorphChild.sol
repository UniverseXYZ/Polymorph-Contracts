// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IPolymorphChild is IERC721 {
    function mintPolymorphWithInfo(
        uint256 tokenId,
        address ownerAddress,
        uint256 gene
    ) external;

    function setMaticWETHContract(address maticWETHAddress) external;
}
