// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "./IPolymorphRoot.sol";
import "../base/Polymorph.sol";
import "../base/PolymorphWithGeneChanger.sol";

contract PolymorphRoot is PolymorphWithGeneChanger, IPolymorphRoot {
    using PolymorphGeneGenerator for PolymorphGeneGenerator.Gene;
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    uint256 public polymorphPrice;
    uint256 public maxSupply;
    uint256 public bulkBuyLimit;

    Polymorph public polymorphV1Contract;
    uint256 public totalBurnedV1;

    event PolymorphPriceChanged(uint256 newPolymorphPrice);
    event MaxSupplyChanged(uint256 newMaxSupply);
    event BulkBuyLimitChanged(uint256 newBulkBuyLimit);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address payable _daoAddress,
        uint256 premintedTokensCount,
        uint256 _baseGenomeChangePrice,
        uint256 _polymorphPrice,
        uint256 _maxSupply,
        uint256 _randomizeGenomePrice,
        uint256 _bulkBuyLimit,
        string memory _arweaveAssetsJSON,
        address _polymorphV1Address
    )
        PolymorphWithGeneChanger(
            name,
            symbol,
            baseURI,
            _daoAddress,
            _baseGenomeChangePrice,
            _randomizeGenomePrice,
            _arweaveAssetsJSON
        )
    {
        polymorphPrice = _polymorphPrice;
        maxSupply = _maxSupply;
        bulkBuyLimit = _bulkBuyLimit;
        arweaveAssetsJSON = _arweaveAssetsJSON;
        polymorphV1Contract = Polymorph(_polymorphV1Address);
        geneGenerator.random();

        _preMint(premintedTokensCount);
    }

    function _preMint(uint256 amountToMint) internal {
        for (uint256 i = 0; i < amountToMint; i++) {
            _tokenIdTracker.increment();
            uint256 tokenId = _tokenIdTracker.current();
            _genes[tokenId] = geneGenerator.random();
            _mint(_msgSender(), tokenId);
        }
    }

    function mint() public payable override nonReentrant {
        require(_tokenIdTracker.current() < maxSupply, "Total supply reached");

        _tokenIdTracker.increment();

        uint256 tokenId = _tokenIdTracker.current();
        _genes[tokenId] = geneGenerator.random();

        (bool transferToDaoStatus, ) = daoAddress.call{value: polymorphPrice}(
            ""
        );
        require(
            transferToDaoStatus,
            "Address: unable to send value, recipient may have reverted"
        );

        uint256 excessAmount = msg.value.sub(polymorphPrice);
        if (excessAmount > 0) {
            (bool returnExcessStatus, ) = _msgSender().call{
                value: excessAmount
            }("");
            require(returnExcessStatus, "Failed to return excess.");
        }

        _mint(_msgSender(), tokenId);

        emit TokenMinted(tokenId, _genes[tokenId]);
        emit TokenMorphed(
            tokenId,
            0,
            _genes[tokenId],
            polymorphPrice,
            PolymorphEventType.MINT
        );
    }

    function burnAndMintNewPolymorph(uint256 tokenId) external nonReentrant {
        require(_msgSender() == polymorphV1Contract.ownerOf(tokenId));

        uint256 geneToTransfer = polymorphV1Contract.geneOf(tokenId);
        polymorphV1Contract.burn(tokenId);

        totalBurnedV1 = totalBurnedV1.add(1);
        maxSupply = maxSupply.add(totalBurnedV1);
        _tokenIdTracker.increment();

        uint256 newTokenId = _tokenIdTracker.current();
        _genes[newTokenId] = geneToTransfer;

        _mint(_msgSender(), newTokenId);

        emit TokenMinted(newTokenId, _genes[newTokenId]);
        emit TokenBurnedAndMinted(tokenId, newTokenId, _genes[newTokenId]);
    }

    function bulkBuy(uint256 amount) public payable override nonReentrant {
        require(
            amount <= bulkBuyLimit,
            "Cannot bulk buy more than the preset limit"
        );
        require(
            _tokenIdTracker.current().add(amount) <= maxSupply,
            "Total supply reached"
        );

        (bool transferToDaoStatus, ) = daoAddress.call{
            value: polymorphPrice.mul(amount)
        }("");
        require(
            transferToDaoStatus,
            "Address: unable to send value, recipient may have reverted"
        );

        uint256 excessAmount = msg.value.sub(polymorphPrice.mul(amount));
        if (excessAmount > 0) {
            (bool returnExcessStatus, ) = _msgSender().call{
                value: excessAmount
            }("");
            require(returnExcessStatus, "Failed to return excess.");
        }

        for (uint256 i = 0; i < amount; i++) {
            _tokenIdTracker.increment();

            uint256 tokenId = _tokenIdTracker.current();
            _genes[tokenId] = geneGenerator.random();
            _mint(_msgSender(), tokenId);

            emit TokenMinted(tokenId, _genes[tokenId]);
            emit TokenMorphed(
                tokenId,
                0,
                _genes[tokenId],
                polymorphPrice,
                PolymorphEventType.MINT
            );
        }
    }

    function mint(address to)
        public
        pure
        override(ERC721PresetMinterPauserAutoId)
    {
        revert("Should not use this one");
    }

    function setPolymorphPrice(uint256 newPolymorphPrice)
        public
        virtual
        override
        onlyDAO
    {
        polymorphPrice = newPolymorphPrice;

        emit PolymorphPriceChanged(newPolymorphPrice);
    }

    function setMaxSupply(uint256 _maxSupply) public virtual override onlyDAO {
        maxSupply = _maxSupply;

        emit MaxSupplyChanged(maxSupply);
    }

    function setBulkBuyLimit(uint256 _bulkBuyLimit)
        public
        virtual
        override
        onlyDAO
    {
        bulkBuyLimit = _bulkBuyLimit;

        emit BulkBuyLimitChanged(_bulkBuyLimit);
    }

    receive() external payable {
        mint();
    }
}
