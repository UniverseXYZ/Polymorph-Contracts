// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "../mainnet/IPolymorphWithGeneChangerRoot.sol";

contract TestContractInteractor {
    IPolymorphWithGeneChangerRoot public polymorphTestContract;

    constructor(address _polymorphAddress) {
        polymorphTestContract = IPolymorphWithGeneChangerRoot(
            _polymorphAddress
        );
    }

    function triggerGeneChange(uint256 tokenId, uint256 genePosition)
        public
        payable
    {
        polymorphTestContract.morphGene{value: msg.value}(
            tokenId,
            genePosition
        );
    }

    function triggerRandomize(uint256 tokenId) public payable {
        polymorphTestContract.randomizeGenome{value: msg.value}(tokenId);
    }
}
