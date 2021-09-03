// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "../polygon/PolymorphChildTunnel.sol";

// Exposes internal functions so they can be called in tests
contract ExposedPolymorphChildTunnel is PolymorphChildTunnel {
    constructor(address _fxChild, address payable _daoAddress)
        PolymorphChildTunnel(_fxChild, _daoAddress)
    {}

    function decodeMessage(bytes memory data)
        public
        pure
        returns (
            uint256 tokenId,
            address polymorphAddress,
            uint256 gene,
            bool isVirgin,
            uint256 genomeChanges
        )
    {
        return _decodeMessage(data);
    }

    function exposedProcessMessageFromRoot(
        uint256 stateId,
        address rootMessageSender,
        bytes calldata data
    ) external {
        _processMessageFromRoot(stateId, rootMessageSender, data);
    }
}
