// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import { IERC20 } from "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/IERC20.sol";

interface IMainBridge {

    function pause() external;

    function setSideNFTBridge(uint256 _chainId, address _sideBridge) external;

    function updateAdmin(address _newAdmin) external;

    function getSideNFTBridge(uint256 _sideChainId)
        external
        view
        returns (address);

    function supportsForNFTCollectionBridge(
        uint256 _chainId,
        address _mainNFTCollection,
        address _sideNFTCollection
    ) external view returns (bool);

    function setSupportsForNFTCollectionBridge(
        bool isSupport,
        uint256 _chainId,
        address _mainNFTCollection,
        address _sideNFTCollection
    ) external;

        function depositNFTBridgeTo(
        uint256 _sideChainId,
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) external;

    function finalizeNFTWithdrawal(
        uint256 _sideChainId,
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) external;

}
