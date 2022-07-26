// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

interface IPolymorphsTunnel {
    function moveThroughWormhole(uint256[] calldata _tokenIds) external;
}
