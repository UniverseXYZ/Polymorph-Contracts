// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "./FxBaseChildTunnel.sol";
import "./PolymorphBaseTunnel.sol";

contract PolymorphChildTunnel is FxBaseChildTunnel, PolymorphBaseTunnel {
    constructor(address _fxChild, address payable _daoAddress)
        FxBaseChildTunnel(_fxChild)
        PolymorphBaseTunnel(_daoAddress)
    {}

    modifier onlyOwner(uint256 tokenId) {
        require(
            polymorphContract.ownerOf(tokenId) == msg.sender,
            "Only owner can move polymorph"
        );
        _;
    }

    function _processMessageFromRoot(
        uint256 stateId,
        address sender,
        bytes memory data
    ) internal override {
        (
            uint256 tokenId,
            address ownerAddress,
            uint256 gene,
            bool isVirgin,
            uint256 genomeChanges
        ) = _decodeMessage(data);
        //TODO: Maybe check if person has enough MATIC tokens before that?
        polymorphContract.mintPolymorphWithInfo(tokenId, ownerAddress, gene);
        polymorphContract.wormholeUpdateGene(
            tokenId,
            gene,
            isVirgin,
            genomeChanges
        );
    }

    function moveThroughWormhole(uint256 tokenId)
        public
        override
        onlyOwner(tokenId)
    {
        polymorphContract.burn(tokenId);
        uint256 gene = polymorphContract.geneOf(tokenId);
        bool isNotVirgin = polymorphContract.isNotVirgin(tokenId);
        uint256 genomeChanges = polymorphContract.genomeChanges(tokenId);

        //TODO: Maybe clear gene and genomeChanges
        // It may not be a problem because when we mint on polygon they will be overwritten
        _sendMessageToRoot(
            abi.encode(tokenId, msg.sender, gene, isNotVirgin, genomeChanges)
        );
    }
}
