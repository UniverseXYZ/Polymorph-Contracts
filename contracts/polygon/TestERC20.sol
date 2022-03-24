pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    uint constant _initial_supply = 21000000000000000000; // 21ETH (21*10^18 wei)

    constructor() ERC20("TestToken", "TT") public {
        _mint(msg.sender, _initial_supply);
    }
}