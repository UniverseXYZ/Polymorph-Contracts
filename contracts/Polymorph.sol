// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/presets/ERC721PresetMinterPauserAutoId.sol";
import "./PolymorphGeneGenerator.sol";
import "./IPolymorph.sol";


contract Polymorph is IPolymorph, ERC721PresetMinterPauserAutoId {
    using PolymorphGeneGenerator for PolymorphGeneGenerator.Gene;

    PolymorphGeneGenerator.Gene private geneGenerator;

     // Optional mapping for token URIs
    mapping (uint256 => uint256) private _genes;

    constructor(string memory name, string memory symbol, string memory baseURI) ERC721PresetMinterPauserAutoId(name, symbol, baseURI) public {
        geneGenerator.random();
    }

    function geneOf(uint256 tokenId) public view virtual override returns (uint256 gene) {
        return _genes[tokenId];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721PresetMinterPauserAutoId) {
        _genes[tokenId] = geneGenerator.random();
        ERC721PresetMinterPauserAutoId._beforeTokenTransfer(from, to, tokenId);
    }


    
}