// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "../tunnel/FxBaseRootTunnel.sol";
import "../base/PolymorphTunnel.sol";
import "./PolymorphRoot.sol";

contract PolymorphRootTunnel is FxBaseRootTunnel, PolymorphTunnel {
    constructor(
        address _checkpointManager,
        address _fxRoot,
        address payable _daoAddress
    )
        FxBaseRootTunnel(_checkpointManager, _fxRoot)
        PolymorphTunnel(_daoAddress)
    {}

    PolymorphRoot public polymorphContract;

    modifier onlyOwner(uint256 tokenId) {
        require(
            polymorphContract.ownerOf(tokenId) == msg.sender,
            "Only owner can move polymorph"
        );
        _;
    }

    function _processMessageFromChild(bytes memory data) internal override {
        require(
            address(polymorphContract) != address(0),
            "Polymorph contract hasn't been set yet"
        );
        (
            uint256 tokenId,
            address ownerAddress,
            uint256 gene,
            bool isNotVirgin,
            uint256 genomeChanges
        ) = _decodeMessage(data);

        polymorphContract.transferFrom(address(this), ownerAddress, tokenId);

        polymorphContract.wormholeUpdateGene(
            tokenId,
            gene,
            isNotVirgin,
            genomeChanges
        );
    }

    function moveThroughWormhole(uint256 tokenId)
        public
        override
        onlyOwner(tokenId)
    {
        polymorphContract.transferFrom(msg.sender, address(this), tokenId);

        _sendMessageToChild(
            abi.encode(
                tokenId,
                msg.sender,
                polymorphContract.geneOf(tokenId),
                polymorphContract.isNotVirgin(tokenId),
                polymorphContract.genomeChanges(tokenId)
            )
        );
    }

    function setPolymorphContract(address payable contractAddress)
        public
        onlyDAO
    {
        polymorphContract = PolymorphRoot(contractAddress);
    }
}
