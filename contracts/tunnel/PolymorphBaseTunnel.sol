// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;
import "../PolymorphWithGeneChanger.sol";

abstract contract PolymorphBaseTunnel {
    address payable public daoAddress;
    PolymorphWithGeneChanger internal polymorphContract;

    constructor(address payable _daoAddress) {
        daoAddress = _daoAddress;
    }

    modifier onlyDAO() {
        require(msg.sender == daoAddress, "Not called from the dao");
        _;
    }

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

    function setPolymorphContract(address payable contractAddress)
        public
        onlyDAO
    {
        polymorphContract = PolymorphWithGeneChanger(contractAddress);
    }

    function moveThroughWormhole(uint256 tokenId) public virtual;
}
