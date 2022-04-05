pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";


contract TestERC20 is ERC20PresetMinterPauser {
    uint constant _initial_supply = 21000000000000000000; // 21*10^18 wei

    constructor() ERC20PresetMinterPauser("TestToken", "TT") public {
        _mint(msg.sender, _initial_supply);
    }
}