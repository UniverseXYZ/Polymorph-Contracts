// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

abstract contract Tunnel {
    mapping(address => bool) public whitelistTunnelAddresses;

    modifier onlyTunnel() {
        require(
            whitelistTunnelAddresses[msg.sender],
            "Not called from the tunnel"
        );
        _;
    }
}
