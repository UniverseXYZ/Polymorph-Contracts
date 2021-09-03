// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

abstract contract DAO {
    address payable public daoAddress;

    constructor(address payable _daoAddress) {
        daoAddress = _daoAddress;
    }

    modifier onlyDAO() {
        require(msg.sender == daoAddress, "Not called from the dao");
        _;
    }
}
