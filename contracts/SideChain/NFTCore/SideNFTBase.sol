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

contract SideNFTBase is
    ERC721,
    ERC721URIStorage,
    Pausable,
    Ownable,
    ERC721Burnable
{

    address public admin;
    address public sideBridge;
    address public mainNFT;

    constructor(string memory _name, string memory _symbol, address _sideBridge, address _mainNFT)
        ERC721(_name, _symbol)
    {
        admin = msg.sender;
        sideBridge = _sideBridge;
        mainNFT = _mainNFT;
    }

    function updateSideBridge(address _sideBridge) external {
        require(msg.sender == admin, "only admin can update new admin");
        admin = _sideBridge;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address _to, uint256 _tokenId, string memory _tokenURI)
        public
    {
        require(msg.sender == admin || msg.sender == sideBridge, "only Admin");
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
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
        require(msg.sender == admin || msg.sender == sideBridge, "only Admin can burn");
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
