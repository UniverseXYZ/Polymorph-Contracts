// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;
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
        return _decodeMessageFromRoot(data);
    }

    function exposedProcessMessageFromRoot(
        uint256 stateId,
        address rootMessageSender,
        bytes calldata data
    ) external {
        _processMessageFromRoot(stateId, rootMessageSender, data);
    }
}
