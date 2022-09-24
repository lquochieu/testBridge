// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ISideNFTCollection} from "../../interfaces/SideChain/Tokens/ISideNFTCollection.sol";
import {IMainBridge} from "../../interfaces/MainChain/MainBridge/IMainBridge.sol";
import {CrossDomainEnabled} from "../../libraries/bridge/CrossDomainEnabled.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";

contract SideBridge is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    CrossDomainEnabled
{
    address private mainNFTBridge;

    struct NFTCollection {
        uint256 mainChainId;
        uint256 collectionRarity;
        uint256 collectionId;
        uint256 collectionLevel;
        uint256 collectionExperience;
        uint256 collectionRank;
        string collectionURL;
    }

    mapping(uint256 => NFTCollection) private collections;

    event DepositFinalized(
        address indexed mainNFTCollection,
        address indexed sideNFTCollection,
        address indexed _from,
        address _to,
        NFTCollection _nftCollection,
        bytes _data
    );

    event DepositFailed(
        address indexed mainNFTCollection,
        address indexed sideNFTCollection,
        address indexed _from,
        address _to,
        NFTCollection _nftCollection,
        bytes _data
    );

    event ClaimNFTCollectionCompleted(
        address owner,
        NFTCollection nftCollection
    );

    event WithdrawalInitiated(
        address indexed mainNFTCollection,
        address indexed sideNFTCollection,
        address indexed _from,
        address _to,
        uint256 _collectionId,
        bytes _data
    );

    constructor() CrossDomainEnabled(address(0)) {}

    function initialize(address _SideGate, address _mainNFTBridge)
        public
        initializer
    {
        require(messenger == address(0), "Contract already initialize");
        messenger = _SideGate;
        mainNFTBridge = _mainNFTBridge;

        // Initialize upgradable OZ contracts
        __Context_init_unchained(); // Context is a dependency for both Ownable and Pausable
        __Ownable_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();
    }

    modifier onlyEOA() {
        require(!Address.isContract(msg.sender), "Account not EOA");
        _;
    }
    
    /**
     * Pause relaying.
     */
    function pause() external onlyOwner {
        _pause();
    }

    function updateAdmin(address _newAdmin) external onlyOwner {
        transferOwnership(_newAdmin);
    }

    function getMainNFTBridge() external view returns (address) {
        return mainNFTBridge;
    }

    function getCollection(uint256 _collectionId)
        external
        view
        returns (NFTCollection memory)
    {
        return collections[_collectionId];
    }

    function finalizeDepositNFT(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        NFTCollection memory _nftCollection,
        bytes calldata _data
    ) external virtual onlyFromCrossDomainAccount(mainNFTBridge) {
        require(
            msg.sender == messenger || msg.sender == owner(),
            "Not message from CrossDomainMessage"
        );

        require(tx.origin == _to, "Invalid owner");

        ISideNFTCollection sideNFTCollection = ISideNFTCollection(
            _sideNFTCollection
        );
        if (_mainNFTCollection == sideNFTCollection.getMainNFTCollection()) {
            collections[_nftCollection.collectionId] = _nftCollection;
            
            _claimNFTCollection(_sideNFTCollection, _nftCollection.collectionId);
            
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

            sendCrossDomainMessage(
                _nftCollection.mainChainId,
                mainNFTBridge,
                message
            );

            emit DepositFailed(
                _mainNFTCollection,
                _sideNFTCollection,
                _from,
                _to,
                _nftCollection,
                _data
            );
        }
    }

    function _claimNFTCollection(
        address _sideNFTCollection,
        uint256 _collectionId
    ) internal nonReentrant {

        ISideNFTCollection sideNFTCollection = ISideNFTCollection(
            _sideNFTCollection
        );

        NFTCollection memory nftCollection = collections[_collectionId];

        if (nftCollection.collectionRarity == Lib_DefaultValues.UNIQUE_RARITY) {
            sideNFTCollection.mintUniqueToken(
                msg.sender,
                nftCollection.collectionId,
                nftCollection.collectionURL
            );
        } else {
            sideNFTCollection.mintNFTCollection(
                msg.sender,
                nftCollection.collectionId
            );
            sideNFTCollection.setUniqueRank(
                nftCollection.collectionId,
                nftCollection.collectionRank
            );
        }

        sideNFTCollection.addCollectionExperience(
            nftCollection.collectionId,
            nftCollection.collectionExperience
        );
        sideNFTCollection.setRarities(
            nftCollection.collectionId,
            nftCollection.collectionRarity
        );

        emit ClaimNFTCollectionCompleted(msg.sender, nftCollection);
    }

    function withdrawTo(
        address _sideNFTCollection,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) external virtual onlyEOA nonReentrant {
        _initiateWithdrawal(
            _sideNFTCollection,
            msg.sender,
            _to,
            _collectionId,
            _data
        );
    }

    function _initiateWithdrawal(
        address _sideNFTCollection,
        address _from,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) internal {
        ISideNFTCollection sideNFTCollection = ISideNFTCollection(
            _sideNFTCollection
        );

        require(
            msg.sender == sideNFTCollection.ownerOf(_collectionId),
            "Only Owner can withdraw NFT"
        );

        sideNFTCollection.burnNFTCollection(_from, _collectionId);

        address mainNFTCollecion = sideNFTCollection.getMainNFTCollection();

        bytes memory message = abi.encodeWithSelector(
            IMainBridge.finalizeNFTWithdrawal.selector,
            Lib_DefaultValues.GOERLI_CHAIN_ID_TESTNET,
            mainNFTCollecion,
            _sideNFTCollection,
            _from,
            _to,
            _collectionId,
            _data
        );

        sendCrossDomainMessage(
            Lib_DefaultValues.BSC_CHAIN_ID_TESTNET,
            mainNFTBridge,
            message
        );

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
