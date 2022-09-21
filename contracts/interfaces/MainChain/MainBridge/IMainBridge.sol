// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import { IERC20 } from "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/IERC20.sol";

interface IMainBridge {
    
    function updateAdmin(address _newAdmin) external;

    function updateMainBridgeAdmin(address _newAdmin) external;

    function sideNFTBridge() external returns (address);

    function depositNFTBridge(
        address _mainNFTCollection,
        address _sideNFTCollection,
        uint256 _collectionId,
        uint256 _sideChainId,
        bytes calldata _data
    ) external payable;

    function depositNFTBridgeTo(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _to,
        uint256 _collectionId,
        uint256 _sideChainId,
        bytes calldata _data
    ) external payable;


    function finalizeNFTWithdrawal(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) external;
}
