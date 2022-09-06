// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import { IERC20 } from "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IMainNFTCore is IERC721 {
    function pause() external;

    function unpause() external;

    function safeMint(address _to, string memory _tokenURI)
        external
        returns (uint256);

    function burnNFT(uint256 _tokenId) external;

    function updateAdmin(address _newAdmin) external;

    function tokenURI(uint256 _tokenId) external view returns (string memory);
}
