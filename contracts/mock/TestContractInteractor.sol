// // SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.7.0;

// import "../mainnet/IPolymorphWithGeneChanger.sol";

// contract TestContractInteractor {
//     IPolymorphWithGeneChanger public polymorphTestContract;

//     constructor(address _polymorphAddress) {
//         polymorphTestContract = IPolymorphWithGeneChanger(
//             _polymorphAddress
//         );
//     }

//     function triggerGeneChange(uint256 tokenId, uint256 genePosition)
//         public
//         payable
//     {
//         polymorphTestContract.morphGene{value: msg.value}(
//             tokenId,
//             genePosition
//         );
//     }

//     function triggerRandomize(uint256 tokenId) public payable {
//         polymorphTestContract.randomizeGenome{value: msg.value}(tokenId);
//     }
// }
