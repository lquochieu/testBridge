// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ISideNFTCollection} from "../../interfaces/SideChain/Tokens/ISideNFTCollection.sol";
import {IMainBridge} from "../../interfaces/MainChain/MainBridge/IMainBridge.sol";
import {CrossDomainEnabled} from "../../libraries/bridge/CrossDomainEnabled.sol";
import {IAggregatorV3} from "../../libraries/Oracle/IAggregatorV3.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";

contract SideBridge is Ownable, CrossDomainEnabled {
    address private admin;
    address private mainNFTBridge;
    uint256 private UNIQUE_RARITY = 5;
    IAggregatorV3 aggregatorV3;

    struct NFTCollection {
        uint256 collectionRarity;
        uint256 collectionId;
        uint256 collectionLevel;
        uint256 collectionExperience;
        uint256 collectionRank;
        string collectionURL;
    }

    mapping(address => mapping(uint256 => bool)) isTransferNFT;
    mapping(address => mapping(uint256 => uint256)) transferNFT;
    mapping(address => mapping(uint256 => address)) transferOwner;
    mapping(address => mapping(uint256 => uint256)) chainId;
    mapping(uint256 => mapping(uint256 => string)) transactionHash;
    mapping(uint256 => bool) public ownerOf;
    mapping(uint256 => uint256) public NFT;

    event mintCompleted(address account, uint256 tokenId);
    event returnNFTsCompleted(address from, address to, uint256 tokenId);
    event burnNFTsCompleted(uint256 _collectionId);

    event DepositFinalized(
        address indexed _l1Token,
        address indexed _l2Token,
        address indexed _from,
        address _to,
        NFTCollection _nftCollection,
        bytes _data
    );

    event DepositFailed(
        address indexed _l1Token,
        address indexed _l2Token,
        address indexed _from,
        address _to,
        uint256 _collectionId,
        bytes _data
    );

    event WithdrawalInitiated(
        address indexed _l1Token,
        address indexed _l2Token,
        address indexed _from,
        address _to,
        uint256 _collectionId,
        bytes _data
    );

    constructor(
        address _sideCrossDomainMessenger,
        address _mainNFTCollecionBridge
    ) CrossDomainEnabled(_sideCrossDomainMessenger) {
        mainNFTBridge = _mainNFTCollecionBridge;
        admin = msg.sender;
    }

    function updateAdmin(address newAdmin) external onlyOwner {
        admin = newAdmin;
    }

    function getAdminBridge() external view returns (address) {
        return admin;
    }

    function getMainNFTBridge() external view returns (address) {
        return mainNFTBridge;
    }

    function finalizeDepositNFT(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        NFTCollection memory _nftCollection,
        bytes calldata _data
    ) external virtual onlyFromCrossDomainAccount(mainNFTBridge) {
        ISideNFTCollection sideNFTCollection = ISideNFTCollection(
            _sideNFTCollection
        );
        if (_mainNFTCollection == sideNFTCollection.getMainNFTCollection()) {
            if (_nftCollection.collectionRarity == UNIQUE_RARITY) {
                sideNFTCollection.mintUniqueToken(
                    _to,
                    _nftCollection.collectionId,
                    _nftCollection.collectionURL
                );
            } else {
                sideNFTCollection.mintNFTCollection(
                    _to,
                    _nftCollection.collectionId
                );
                sideNFTCollection.setUniqueRank(
                    _nftCollection.collectionId,
                    _nftCollection.collectionRank
                );
            }

            sideNFTCollection.addCollectionExperience(
                _nftCollection.collectionId,
                _nftCollection.collectionExperience
            );
            sideNFTCollection.setRarities(
                _nftCollection.collectionId,
                _nftCollection.collectionRarity
            );

            emit DepositFinalized(
                _mainNFTCollection,
                _sideNFTCollection,
                _from,
                _to,
                _nftCollection,
                _data
            );
        } else {
            bytes memory message = abi.encodeWithSelector(
                IMainBridge.finalizeNFTWithdrawal.selector,
                _mainNFTCollection,
                _sideNFTCollection,
                _to, // switched the _to and _from here to bounce back the deposit to the sender
                _from,
                _nftCollection.collectionId,
                _data
            );

            sendCrossDomainMessage(mainNFTBridge, 0, message);

            emit DepositFailed(
                _mainNFTCollection,
                _sideNFTCollection,
                _from,
                _to,
                _nftCollection.collectionId,
                _data
            );
        }
    }

    function withdraw(
        address _sideNFTCollection,
        uint256 _collectionId,
        bytes calldata _data
    ) external payable virtual {
        _initiateWithdrawal(
            _sideNFTCollection,
            msg.sender,
            msg.sender,
            _collectionId,
            msg.value,
            _data
        );
    }

    function withdrawTo(
        address _sideNFTCollection,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) external payable virtual {
        _initiateWithdrawal(
            _sideNFTCollection,
            msg.sender,
            _to,
            _collectionId,
            msg.value,
            _data
        );
    }

    function _initiateWithdrawal(
        address _sideNFTCollection,
        address _from,
        address _to,
        uint256 _collectionId,
        uint256 _mainGas,
        bytes calldata _data
    ) internal {
        ISideNFTCollection sideNFTCollection = ISideNFTCollection(
            _sideNFTCollection
        );

        require(
            msg.sender == sideNFTCollection.ownerOf(_collectionId),
            "Only Owner can withdraw NFT"
        );

        require(
            _mainGas >=
                aggregatorV3.getSideGasTransaction(
                    Lib_DefaultValues.ETH_AggregatorV3,
                    Lib_DefaultValues.BNB_AggregatorV3
                ) &&
                _mainGas <=
                aggregatorV3.getMaxSideGasTransaction(
                    Lib_DefaultValues.ETH_AggregatorV3,
                    Lib_DefaultValues.BNB_AggregatorV3
                ),
            "Transaction gas limit error"
        );

        sideNFTCollection.burnNFTCollection(_from, _collectionId);

        address mainNFTCollecion = sideNFTCollection.getMainNFTCollection();

        bytes memory message = abi.encodeWithSelector(
            IMainBridge.finalizeNFTWithdrawal.selector,
            mainNFTCollecion,
            _sideNFTCollection,
            _from,
            _to,
            _collectionId,
            _data
        );

        sendCrossDomainMessage(mainNFTBridge, _mainGas, message);

        emit WithdrawalInitiated(
            mainNFTCollecion,
            _sideNFTCollection,
            msg.sender,
            _to,
            _collectionId,
            _data
        );
    }
}
