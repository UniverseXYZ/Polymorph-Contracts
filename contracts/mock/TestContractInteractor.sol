// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../mainnet/PolymorphRoot.sol";

contract TestContractInteractor {
    PolymorphRoot public polymorphTestContract;

    constructor(address payable _polymorphAddress) {
        polymorphTestContract = PolymorphRoot(_polymorphAddress);
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

    function triggerMint() public payable {
        polymorphTestContract.mint{value: msg.value}();
    }

    function triggerBulkBuy(uint256 amount) public payable {
        polymorphTestContract.bulkBuy{value: msg.value}(amount);
    }
}
