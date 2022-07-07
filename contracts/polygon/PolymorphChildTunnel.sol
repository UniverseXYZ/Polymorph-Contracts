// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "../tunnel/FxBaseChildTunnel.sol";
import "../base/PolymorphTunnel.sol";
import "../polygon/PolymorphChild.sol";

contract PolymorphChildTunnel is FxBaseChildTunnel, PolymorphTunnel {
    constructor(address _fxChild, address payable _daoAddress)
        FxBaseChildTunnel(_fxChild)
        PolymorphTunnel(_daoAddress)
    {}

    PolymorphChild public polymorphContract;
    uint256 public latestStateId;
    address public latestRootMessageSender;
    bytes public latestData;

    function _processMessageFromRoot(
        uint256 stateId,
        address sender,
        bytes memory data
    ) internal override {
        latestStateId = stateId;
        latestRootMessageSender = sender;
        latestData = data;

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

    function moveThroughWormhole(uint256[] calldata _tokenIds)
        external
        override
    {
        require(
            _tokenIds.length <= 20,
            "Trying to bulk bridge more than 20 polymorphs"
        );
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            require(polymorphContract.ownerOf(_tokenIds[i]) == msg.sender, "Msg.sender should be the polymorph owner");
            uint256 gene = polymorphContract.geneOf(_tokenIds[i]);
            bool isNotVirgin = polymorphContract.isNotVirgin(_tokenIds[i]);
            uint256 genomeChanges = polymorphContract.genomeChanges(_tokenIds[i]);
            polymorphContract.burn(_tokenIds[i]);

            //TODO: Maybe clear gene and genomeChanges
            // It may not be a problem because when we mint on polygon they will be overwritten
            _sendMessageToRoot(
                abi.encode(
                    _tokenIds[i],
                    msg.sender,
                    gene,
                    isNotVirgin,
                    genomeChanges
                )
            );
        }
    }

    function setPolymorphContract(address payable contractAddress)
        public
        onlyDAO
    {
        polymorphContract = PolymorphChild(contractAddress);
    }
}
