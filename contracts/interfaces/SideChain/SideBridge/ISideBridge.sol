// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import { IERC20 } from "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/IERC20.sol";

interface ISideBridge {

    struct NFTCollection {
        uint256 collectionRarity;
        uint256 collectionId;
        uint256 collectionLevel;
        uint256 collectionExperience;
        uint256 collectionRank;
        string collectionURL;
    }

    function updateAdmin(address _newAdmin) external;

    function getAdminBridge() external view returns(address);

    function mainNFTBridge() external returns (address);

    function getMainNFTBridge() external view returns(address);

    function finalizeDepositNFT(
        address _mainNFTCollection,
        address _sideNFTCollectionCollection,
        address _from,
        address _to,
        NFTCollection memory _nftCollection,
        bytes calldata _data
    ) external;

    function withdraw(
        address _sideNFTCollection,
        uint256 _tokenId,
        uint32 _mainGas,
        bytes calldata _data
    ) external;

    function withdrawTo(
        address _sideNFTCollection,
        address _to,
        uint256 _tokenId,
        uint32 _mainGas,
        bytes calldata _data
    ) external;
}
