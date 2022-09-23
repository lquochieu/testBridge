// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import {ISideNFTCollection} from "../../interfaces/SideChain/Tokens/ISideNFTCollection.sol";
import {IMainBridge} from "../../interfaces/MainChain/MainBridge/IMainBridge.sol";
import {CrossDomainEnabled} from "../../libraries/bridge/CrossDomainEnabled.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";

contract SideBridge is Ownable, CrossDomainEnabled, ReentrancyGuard {
    address private mainNFTBridge;
    uint256 private UNIQUE_RARITY = 5;

    struct NFTCollection {
        uint256 collectionRarity;
        uint256 collectionId;
        uint256 collectionLevel;
        uint256 collectionExperience;
        uint256 collectionRank;
        string collectionURL;
    }

    struct ProofWithdraw {
        bytes proof;
        bytes32 root;
        bytes32 nullifierHash;
    }

    mapping(address => mapping(uint256 => bool)) public pendingDepositOwner;
    mapping(uint256 => NFTCollection) public collections;

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
        uint256 _collectionId,
        bytes _data
    );

    event ReceiveNFTCompleted(address owner, NFTCollection nftCollection);

    event WithdrawalInitiated(
        address indexed mainNFTCollection,
        address indexed sideNFTCollection,
        address indexed _from,
        address _to,
        uint256 _collectionId,
        bytes _data
    );

    constructor() CrossDomainEnabled(address(0)) {}

    function initialize(
        address _sideCrossDomainMessenger,
        address _mainNFTBridge
    ) public onlyOwner {
        require(messenger == address(0), "Contract already initialize");
        messenger = _sideCrossDomainMessenger;
        mainNFTBridge = _mainNFTBridge;
    }

    function updateAdmin(address _newAdmin) external onlyOwner {
        transferOwnership(_newAdmin);
    }

    function getMainNFTBridge() external view returns (address) {
        return mainNFTBridge;
    }

    modifier onlyEOA() {
        require(!Address.isContract(msg.sender), "Account not EOA");
        _;
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

        ISideNFTCollection sideNFTCollection = ISideNFTCollection(
            _sideNFTCollection
        );
        if (_mainNFTCollection == sideNFTCollection.getMainNFTCollection()) {
            pendingDepositOwner[_to][_nftCollection.collectionId] = true;
            collections[_nftCollection.collectionId] = _nftCollection;

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

    function receiveDepositNFT(
        address _sideNFTCollection,
        uint256 _collectionId,
        uint256 _fee
    ) public payable nonReentrant {
        require(msg.value == _fee, "Not enough fee");
        require(
            pendingDepositOwner[msg.sender][_collectionId],
            "Not in pending owner"
        );

        ISideNFTCollection sideNFTCollection = ISideNFTCollection(
            _sideNFTCollection
        );

        NFTCollection memory nftCollection = collections[_collectionId];

        if (nftCollection.collectionRarity == UNIQUE_RARITY) {
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

        delete pendingDepositOwner[msg.sender][_collectionId];
        
        emit ReceiveNFTCompleted(msg.sender, nftCollection);
    }

    function withdraw(
        address _sideNFTCollection,
        uint256 _collectionId,
        uint256 _mainGas,
        bytes calldata _data
    ) external virtual onlyEOA nonReentrant {
        _initiateWithdrawal(
            _sideNFTCollection,
            msg.sender,
            msg.sender,
            _collectionId,
            _mainGas,
            _data
        );
    }

    function withdrawTo(
        address _sideNFTCollection,
        address _to,
        uint256 _collectionId,
        uint256 _mainGas,
        bytes calldata _data
    ) external virtual onlyEOA nonReentrant {
        _initiateWithdrawal(
            _sideNFTCollection,
            msg.sender,
            _to,
            _collectionId,
            _mainGas,
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
