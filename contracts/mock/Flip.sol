// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../mainnet/PolymorphRoot.sol";

contract Flip {
    PolymorphRoot polymorph;

    constructor(
        uint256 tokenId,
        uint256 genePosition,
        uint256 geneVariation,
        uint256 geneWanted,
        address payable receiver
    ) payable {
        polymorph.morphGene{value: address(this).balance}(
            tokenId,
            genePosition
        );

        require(
            ((polymorph.geneOf(tokenId) / 10**(genePosition * 2)) / 100) %
                geneVariation ==
                geneWanted
        );

        polymorph.safeTransferFrom(address(this), receiver, tokenId);
        selfdestruct(receiver);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
