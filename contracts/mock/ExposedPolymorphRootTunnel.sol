// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

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
            uint256[] memory tokenIds,
            address polymorphAddress,
            uint256[] memory genes,
            bool[] memory isVirgin,
            uint256[] memory genomeChanges
        )
    {
        return _decodeMessageFromChild(data);
    }

    function processMessageFromChild(bytes memory data) public {
        _processMessageFromChild(data);
    }
}
