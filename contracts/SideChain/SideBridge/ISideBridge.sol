// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
// import { IERC20 } from "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/IERC20.sol";

interface ISideBridge {
    event DepositFinalized(
        address indexed _l1Token,
        address indexed _l2Token,
        address indexed _from,
        address _to,
        uint256 _amount,
        bytes _data
    );

    event DepositFailed(
        address indexed _l1Token,
        address indexed _l2Token,
        address indexed _from,
        address _to,
        uint256 _amount,
        bytes _data
    );

    event WithdrawalInitiated(
        address indexed _l1Token,
        address indexed _l2Token,
        address indexed _from,
        address _to,
        uint256 _amount,
        bytes _data
    );

    function updateAdmin(address _newAdmin) external;

    function updateMainBridgeAdmin(address _newAdmin) external;

    function mainNFTBridge() external returns (address);

    function finalizeDepositNFT(
        address _mainNFT,
        address _sideNFT,
        address _from,
        address _to,
        uint256 _tokenId,
        string memory _tokenURI,
        bytes calldata _data
    ) external;

    function withdraw(
        address _sideNFT,
        uint256 _tokenId,
        uint32 _mainGas,
        bytes calldata _data
    ) external;

    function withdrawTo(
        address _sideNFT,
        address _to,
        uint256 _tokenId,
        uint32 _mainGas,
        bytes calldata _data
    ) external;
    
}
