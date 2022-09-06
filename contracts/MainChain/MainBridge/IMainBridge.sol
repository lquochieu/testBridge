// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import { IERC20 } from "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/IERC20.sol";

interface IMainBridge {
    
    event NFTDepositInitiated(
        address _mainNFT,
        address _sideNFT,
        address _from,
        address _to,
        uint256 _tokenId,
        bytes _data
    );

    event NFTWithdrawalFinalized(
        address indexed _mainNFT,
        address indexed _sideNFT,
        address indexed _from,
        address _to,
        uint256 _tokenId,
        bytes _data
    );
    
    function updateAdmin(address _newAdmin) external;

    function updateMainBridgeAdmin(address _newAdmin) external;

    function sideNFTBridge() external returns (address);

    function depositNFTBridge(
        address _mainNFT,
        address _sideNFT,
        uint256 _tokenId,
        bytes calldata data
    ) external;

    function depositNFTBridgeTo(
        address _mainNFT,
        address _sideNFT,
        address _to,
        uint256 _tokenId,
        bytes calldata data
    ) external;


    function finalizeNFTWithdrawal(
        address _mainNFT,
        address _sideNFT,
        address _from,
        address _to,
        uint256 _tokenId,
        bytes calldata _data
    ) external;
}
