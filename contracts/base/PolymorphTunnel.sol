// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;
import "./IPolymorphsTunnel.sol";
import "../modifiers/DAOControlled.sol";

abstract contract PolymorphTunnel is DAOControlled, IPolymorphsTunnel {
    constructor(address payable _daoAddress) DAOControlled(_daoAddress) {}

    function _decodeMessage(bytes memory data)
        internal
        pure
        returns (
            uint256 tokenId,
            address ownerAddress,
            uint256 gene,
            bool isNotVirgin,
            uint256 genomeChanges
        )
    {
        return abi.decode(data, (uint256, address, uint256, bool, uint256));
    }
}
