// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

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

    function _processMessageFromChild(bytes memory data) internal override {
        require(
            address(polymorphContract) != address(0),
            "Polymorph contract hasn't been set yet"
        );
        (
            uint256[] memory tokenIds,
            address ownerAddress,
            uint256[] memory genes,
            bool[] memory isNotVirgin,
            uint256[] memory genomeChanges
        ) = _decodeMessageFromChild(data);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            polymorphContract.transferFrom(
                address(this),
                ownerAddress,
                tokenIds[i]
            );

            polymorphContract.wormholeUpdateGene(
                tokenIds[i],
                genes[i],
                isNotVirgin[i],
                genomeChanges[i]
            );
        }
    }

    function moveThroughWormhole(uint256[] calldata _tokenIds) public override {
        require(
            _tokenIds.length <= 20,
            "Trying to bulk bridge more than 20 polymorphs"
        );
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            require(
                polymorphContract.ownerOf(_tokenIds[i]) == msg.sender,
                "Msg.sender should be the polymorph owner"
            );
            polymorphContract.transferFrom(
                msg.sender,
                address(this),
                _tokenIds[i]
            );

            _sendMessageToChild(
                abi.encode(
                    _tokenIds[i],
                    msg.sender,
                    polymorphContract.geneOf(_tokenIds[i]),
                    polymorphContract.isNotVirgin(_tokenIds[i]),
                    polymorphContract.genomeChanges(_tokenIds[i])
                )
            );
        }
    }

    function setPolymorphContract(address payable contractAddress)
        public
        onlyDAO
    {
        polymorphContract = PolymorphRoot(contractAddress);
    }
}
