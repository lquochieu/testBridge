// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ISideNFTCore} from "../NFTCore/ISideNFTCore.sol";
import {IMainBridge} from "../../MainChain/MainBridge/IMainBridge.sol";
import {CrossDomainEnabled} from "../../libraries/bridge/CrossDomainEnabled.sol";

contract SideBridge is Ownable, CrossDomainEnabled {
    address public admin;

    address public mainNFTBridge;

    mapping(address => mapping(uint256 => bool)) isTransferNFT;
    mapping(address => mapping(uint256 => uint256)) transferNFT;
    mapping(address => mapping(uint256 => address)) transferOwner;
    mapping(address => mapping(uint256 => uint256)) chainId;
    mapping(uint256 => mapping(uint256 => string)) transactionHash;
    mapping(uint256 => bool) public ownerOf;
    mapping(uint256 => uint256) public NFT;

    event mintCompleted(address account, uint256 tokenId);
    event returnNFTsCompleted(address from, address to, uint256 tokenId);
    event burnNFTsCompleted(uint256 _tokenId);

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

    constructor(address _sideCrossDomainMessenger, address _mainNFTBridge)
        CrossDomainEnabled(_sideCrossDomainMessenger)
    {
        mainNFTBridge = _mainNFTBridge;
        admin = msg.sender;
    }

    function updateAdmin(address newAdmin) external onlyOwner {
        admin = newAdmin;
    }

    function finalizeDepositNFT(
        address _mainNFT,
        address _sideNFT,
        address _from,
        address _to,
        uint256 _tokenId,
        string memory _tokenURI,
        bytes calldata _data
    ) external virtual onlyFromCrossDomainAccount(mainNFTBridge) {

        if (_mainNFT == ISideNFTCore(_sideNFT).mainNFT()) {
            ISideNFTCore(_sideNFT).safeMint(_to, _tokenId, _tokenURI);
            emit DepositFinalized(
                _mainNFT,
                _sideNFT,
                _from,
                _to,
                _tokenId,
                _data
            );
        } else {
            bytes memory message = abi.encodeWithSelector(
                IMainBridge.finalizeNFTWithdrawal.selector,
                _mainNFT,
                _sideNFT,
                _to, // switched the _to and _from here to bounce back the deposit to the sender
                _from,
                _tokenId,
                _data
            );

            sendCrossDomainMessage(mainNFTBridge, 0, message);

            emit DepositFailed(_mainNFT, _sideNFT, _from, _to, _tokenId, _data);
        }
    }

    function withdraw(
        address _sideNFT,
        uint256 _tokenId,
        uint32 _mainGas,
        bytes calldata _data
    ) external virtual {
        _initiateWithdrawal(_sideNFT, msg.sender, msg.sender, _tokenId, _mainGas, _data);
    }

    function withdrawTo(
        address _sideNFT,
        address _to,
        uint256 _tokenId,
        uint32 _mainGas,
        bytes calldata _data
    ) external virtual {
        _initiateWithdrawal(_sideNFT, msg.sender, _to, _tokenId, _mainGas, _data);
    }


    function _initiateWithdrawal(
        address _sideNFT,
        address _from,
        address _to,
        uint256 _tokenId,
        uint32 _mainGas,
        bytes calldata _data
    ) internal {

        require(msg.sender == ISideNFTCore(_sideNFT).ownerOf(_tokenId), "Only Owner can withdraw NFT");
                
        ISideNFTCore(_sideNFT).burnNFT(_tokenId);

        address mainNFT = ISideNFTCore(_sideNFT).mainNFT();
        bytes memory message = abi.encodeWithSelector(
            IMainBridge.finalizeNFTWithdrawal.selector,
            mainNFT,
            _sideNFT,
            _from,
            _to,
            _tokenId,
            _data
        );
        
        sendCrossDomainMessage(mainNFTBridge, _mainGas, message);

        emit WithdrawalInitiated(mainNFT, _sideNFT, msg.sender, _to, _tokenId, _data);
    }
}
