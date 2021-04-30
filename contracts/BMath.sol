// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "./BNum.sol";

contract BMath is BNum {

    uint public buySlope = 1500;

	/*******************************************************
    //                                                    //
    //       /   x   \     /  (1.01 ^ (x/2)) - 1   \      //
    // y  = | ------- | + | ----------------------- |     //
    //       \ 1000  /     \        buySlope       /      //
    *******************************************************/

	function calcPolymorphPrice(
        uint x
    )
        internal view
        returns (uint price)
    {

		uint xB = x * BONE;
		uint a = xB / 1000;
		uint b1 = BONE + BONE/100;
		uint b2 = xB/2;
		uint b3 = bpow(b1, b2);
		uint b4 = b3-BONE;
		uint b = b4/buySlope;

        price = a + b;
        return price;
    }
}