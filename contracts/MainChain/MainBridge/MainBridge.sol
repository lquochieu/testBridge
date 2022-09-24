// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {CrossDomainEnabled} from "../../libraries/bridge/CrossDomainEnabled.sol";
import {IMainNFTCollection} from "../../interfaces/MainChain/Tokens/IMainNFTCollection.sol";
import {ISideBridge} from "../../interfaces/SideChain/SideBridge/ISideBridge.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";

contract MainBridge is
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    CrossDomainEnabled
{
    mapping(uint256 => address) private sideNFTBridges;

    mapping(uint256 => mapping(address => mapping(address => bool)))
        public supportsNFTCollections;

    struct NFTCollection {
        uint256 chainId;
        uint256 collectionRarity;
        uint256 collectionId;
        uint256 collectionLevel;
        uint256 collectionExperience;
        uint256 collectionRank;
        string collectionURL;
    }

    event NFTDepositInitiated(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        uint256 _collectionId,
        uint256 _chainId,
        bytes _data
    );

    event NFTWithdrawalFinalized(
        address indexed _mainNFTCollection,
        address indexed _sideNFTCollection,
        address indexed _from,
        address _to,
        uint256 _collectionId,
        bytes _data
    );

    event ClaimNFTCollectionCompleted(address owner, uint256 collectionId);

    constructor() CrossDomainEnabled(address(0)) {}

    function initialize(address _MainGate) public initializer {
        require(messenger == address(0), "Contract already initialize");
        messenger = _MainGate;

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

        function setSideNFTBridge(uint256 _chainId, address _sideBridge)
        public
        onlyOwner
    {
        sideNFTBridges[_chainId] = _sideBridge;
    }
    
    function updateAdmin(address _newAdmin) external onlyOwner {
        transferOwnership(_newAdmin);
    }

    function getSideNFTBridge(uint256 _sideChainId)
        external
        view
        returns (address)
    {
        return sideNFTBridges[_sideChainId];
    }

    function supportsForNFTCollectionBridge(
        uint256 _chainId,
        address _mainNFTCollection,
        address _sideNFTCollection
    ) public view returns (bool) {
        return
            supportsNFTCollections[_chainId][_mainNFTCollection][
                _sideNFTCollection
            ];
    }

    function setSupportsForNFTCollectionBridge(
        bool isSupport,
        uint256 _chainId,
        address _mainNFTCollection,
        address _sideNFTCollection
    ) public onlyOwner {
        supportsNFTCollections[_chainId][_mainNFTCollection][
            _sideNFTCollection
        ] = isSupport;
    }

    function depositNFTBridgeTo(
        uint256 _sideChainId,
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) external virtual onlyEOA nonReentrant {
        _initialNFTDeposit(
            _mainNFTCollection,
            _sideNFTCollection,
            msg.sender,
            _to,
            _collectionId,
            _sideChainId,
            _data
        );
    }

    function finalizeNFTWithdrawal(
        uint256 _sideChainId,
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) external onlyFromCrossDomainAccount(sideNFTBridges[_sideChainId]) {
        // ) external {

        require(
            msg.sender == messenger || msg.sender == owner(),
            "Not message from CrossDomainMessage"
        );

        require(tx.origin == _to, "Invalid owner");

        require(
            supportsForNFTCollectionBridge(
                _sideChainId,
                _mainNFTCollection,
                _sideNFTCollection
            ),
            "Can't support NFT SideChain"
        );

        _claimNFTCollection(_mainNFTCollection, _collectionId);

        emit NFTWithdrawalFinalized(
            _mainNFTCollection,
            _sideNFTCollection,
            _from,
            _to,
            _collectionId,
            _data
        );
    }

    function _claimNFTCollection(
        address _mainNFTCollection,
        uint256 _collectionId
    ) internal nonReentrant {
        IMainNFTCollection(_mainNFTCollection).transferFrom(
            address(this),
            msg.sender,
            _collectionId
        );

        emit ClaimNFTCollectionCompleted(msg.sender, _collectionId);
    }

    function _initialNFTDeposit(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        uint256 _collectionId,
        uint256 _sideChainId,
        bytes calldata _data
    ) internal {
        IMainNFTCollection mainNFTCollection = IMainNFTCollection(
            _mainNFTCollection
        );

        require(
            msg.sender == mainNFTCollection.ownerOf(_collectionId),
            "Incorect owner"
        );

        require(
            supportsForNFTCollectionBridge(
                _sideChainId,
                _mainNFTCollection,
                _sideNFTCollection
            ) && sideNFTBridges[_sideChainId] != address(0),
            "Can't support NFT SideChain"
        );

        //Transfer NFT to MainBridge

        mainNFTCollection.transferFrom(
            msg.sender,
            address(this),
            _collectionId
        );

        NFTCollection memory nftCollection = _initialNFTCollectionDepositing(
            mainNFTCollection,
            _collectionId
        );

        bytes memory message = abi.encodeWithSelector(
            ISideBridge.finalizeDepositNFT.selector,
            _mainNFTCollection,
            _sideNFTCollection,
            _from,
            _to,
            nftCollection,
            _data
        );

        sendCrossDomainMessage(
            _sideChainId,
            sideNFTBridges[_sideChainId],
            message
        );

        emit NFTDepositInitiated(
            _mainNFTCollection,
            _sideNFTCollection,
            _from,
            _to,
            _collectionId,
            _sideChainId,
            _data
        );
    }

    function _initialNFTCollectionDepositing(
        IMainNFTCollection _mainNFTCollection,
        uint256 _collectionId
    ) internal view returns (NFTCollection memory) {
        NFTCollection memory nftCollection;

        nftCollection.chainId = Lib_DefaultValues.BSC_CHAIN_ID_TESTNET;

        nftCollection.collectionRarity = _mainNFTCollection
            .viewCollectionRarity(_collectionId);
        nftCollection.collectionId = _collectionId;
        nftCollection.collectionLevel = _mainNFTCollection.getCollectionLevel(
            _collectionId
        );
        nftCollection.collectionExperience = _mainNFTCollection
            .getCollectionExperience(_collectionId);

        if (nftCollection.collectionRarity == Lib_DefaultValues.UNIQUE_RARITY) {
            nftCollection.collectionRank = _mainNFTCollection.getUniqueRank(
                _collectionId
            );
            nftCollection.collectionURL = _mainNFTCollection.getCollectionURL(
                _collectionId
            );
        } else {
            nftCollection.collectionRank = 1;
            nftCollection.collectionURL = "";
        }

        return nftCollection;
    }
}
