// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import { IERC20 } from "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import {IMainBridge} from "./IMainBridge.sol";
import {CrossDomainEnabled} from "../../libraries/bridge/CrossDomainEnabled.sol";
import {IMainNFTCore} from "../NFTCore/IMainNFTCore.sol";
import {ISideBridge} from "../../SideChain/SideBridge/ISideBridge.sol";

contract MainBridge is Ownable, CrossDomainEnabled {
    address public admin;
    address public sideNFTBridge;

    mapping(address => mapping(address => mapping(uint256 => bool)))
        public deposits;

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

    constructor() CrossDomainEnabled(address(0)) {
        admin = msg.sender;
    }

    function initialize(address _mainMessenger, address _sideNFTBridge)
        public
        onlyOwner
    {
        require(messenger == address(0), "Contract already initialize");
        messenger = _mainMessenger;
        sideNFTBridge = _sideNFTBridge;
    }

    function updateAdmin(address _newAdmin) external onlyOwner {
        transferOwnership(_newAdmin);
        admin = _newAdmin;
    }

    modifier onlyEOA() {
        require(!Address.isContract(msg.sender), "Account not EOA");
        _;
    }

    function depositNFTBridge(
        address _mainNFT,
        address _sideNFT,
        uint256 _tokenId,
        uint32 _gas,
        bytes calldata _data
    ) external virtual onlyEOA {
        _initialNFTDeposit(
            _mainNFT,
            _sideNFT,
            msg.sender,
            msg.sender,
            _tokenId,
            _gas,
            _data
        );
    }

    function depositNFTBridgeTo(
        address _mainNFT,
        address _sideNFT,
        address _to,
        uint256 _tokenId,
        uint32 _gas,
        bytes calldata _data
    ) external virtual {
        _initialNFTDeposit(
            _mainNFT,
            _sideNFT,
            msg.sender,
            _to,
            _tokenId,
            _gas,
            _data
        );
    }

    function finalizeNFTWithdrawal(
        address _mainNFT,
        address _sideNFT,
        address _from,
        address _to,
        uint256 _tokenId,
        bytes calldata _data
    ) external onlyFromCrossDomainAccount(sideNFTBridge) {
    // ) external {
        require(
            msg.sender == messenger || msg.sender == admin,
            "Not message from CrossDomainMessage"
        );

        require(
            deposits[_mainNFT][_sideNFT][_tokenId],
            "NFT is not in the MainBridge"
        );

        IMainNFTCore(_mainNFT).transferFrom(address(this), _to, _tokenId);

        delete deposits[_mainNFT][_sideNFT][_tokenId];

        emit NFTWithdrawalFinalized(
            _mainNFT,
            _sideNFT,
            _from,
            _to,
            _tokenId,
            _data
        );
    }

    function _initialNFTDeposit(
        address _mainNFT,
        address _sideNFT,
        address _from,
        address _to,
        uint256 _tokenId,
        uint32 _sideGas,
        bytes calldata _data
    ) internal {
        require(
            msg.sender == IMainNFTCore(_mainNFT).ownerOf(_tokenId),
            "Incorect owner"
        );
        
        require(
            !deposits[_mainNFT][_sideNFT][_tokenId],
            " Token was on the bridge"
        );

        //Transfer NFT to MainBridge

        IMainNFTCore(_mainNFT).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );

        deposits[_mainNFT][_sideNFT][_tokenId] = true;

        string memory tokenURI = IMainNFTCore(_mainNFT).tokenURI(_tokenId);

        bytes memory message = abi.encodeWithSelector(
            ISideBridge.finalizeDepositNFT.selector,
            _mainNFT,
            _sideNFT,
            _from,
            _to,
            _tokenId,
            tokenURI,
            _data
        );

        sendCrossDomainMessage(sideNFTBridge, _sideGas, message);

        deposits[_mainNFT][_sideNFT][_tokenId] = true;

        emit NFTDepositInitiated(
            _mainNFT,
            _sideNFT,
            _from,
            _to,
            _tokenId,
            _data
        );
    }

}
