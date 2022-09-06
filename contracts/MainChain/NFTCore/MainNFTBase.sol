// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import  "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract MainNFTBase is
    ERC721,
    ERC721URIStorage,
    Pausable,
    Ownable,
    ERC721Burnable
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    address public admin;
    address public admin2;

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {
        admin = msg.sender;
        admin2 = admin;
    }

    function updateAdmin(address _newAdmin) external {
        require(msg.sender == admin, "only admin can update new admin");
        admin = _newAdmin;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address _to, string memory _tokenURI)
        public
        returns (uint256)
    {
        require(msg.sender == admin || msg.sender == admin2, "only Admin");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        return tokenId;
    }

    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _tokenId
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(_from, _to, _tokenId);
    }

    function _burn(uint256 _tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(_tokenId);
    }

    function burnNFT(uint256 _tokenId) external {
        require(msg.sender == admin || msg.sender == admin2, "only Admin");
        _burn(_tokenId);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(_tokenId);
    }
}
