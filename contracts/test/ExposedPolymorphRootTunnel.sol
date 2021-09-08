// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "../mainnet/PolymorphRootTunnel.sol";

// Exposes internal functions so they can be called in tests
contract ExposedPolymorphRootTunnel is PolymorphRootTunnel {
    constructor(
        address _checkpointManager,
        address _fxRoot,
        address payable _daoAddress
    ) PolymorphRootTunnel(_checkpointManager, _fxRoot, _daoAddress) {}

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

    function processMessageFromChild(bytes memory data) public {
        _processMessageFromChild(data);
    }
}
