// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {CrossDomainEnabled} from "../../libraries/bridge/CrossDomainEnabled.sol";
import {IMainNFTCollection} from "../../interfaces/MainChain/Tokens/IMainNFTCollection.sol";
import {ISideBridge} from "../../interfaces/SideChain/SideBridge/ISideBridge.sol";
import {Lib_DefaultValues} from "../../libraries/constant/Lib_DefaultValues.sol";

contract MainBridge is Ownable, CrossDomainEnabled, ReentrancyGuard {
    address private sideNFTBridge;
    uint256 private UNIQUE_RARITY = 5;

    mapping(address => mapping(address => mapping(uint256 => bool)))
        public deposits;

    mapping(uint256 => mapping(address => mapping(address => bool)))
        public supportsNFTCollections;
    mapping(address => mapping(uint256 => bool)) public pendingWithdrawOwner;

    struct NFTCollection {
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
        uint256 _sideGas,
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

    event WithdrawNFTCompleted(
        address owner,
        uint256 collectionId
    );

    constructor() CrossDomainEnabled(address(0)) {}

    function initialize(
        address _mainCrossDomainMessenger,
        address _sideNFTBridge
    ) public onlyOwner {
        require(messenger == address(0), "Contract already initialize");
        messenger = _mainCrossDomainMessenger;
        sideNFTBridge = _sideNFTBridge;
    }

    function updateAdmin(address _newAdmin) external onlyOwner {
        transferOwnership(_newAdmin);
    }

    function getSideNFTBridge() external view returns (address) {
        return sideNFTBridge;
    }

    modifier onlyEOA() {
        require(!Address.isContract(msg.sender), "Account not EOA");
        _;
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

    function depositNFTBridge(
        address _mainNFTCollection,
        address _sideNFTCollection,
        uint256 _collectionId,
        uint256 _sideChainId,
        uint256 _sideGas,
        bytes calldata _data
    ) external payable virtual onlyEOA nonReentrant {
        _initialNFTDeposit(
            _mainNFTCollection,
            _sideNFTCollection,
            msg.sender,
            msg.sender,
            _collectionId,
            _sideChainId,
            _sideGas,
            _data
        );
    }

    function depositNFTBridgeTo(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _to,
        uint256 _collectionId,
        uint256 _sideChainId,
        uint256 _sideGas,
        bytes calldata _data
    ) external virtual onlyEOA nonReentrant {
        _initialNFTDeposit(
            _mainNFTCollection,
            _sideNFTCollection,
            msg.sender,
            _to,
            _collectionId,
            _sideChainId,
            _sideGas,
            _data
        );
    }

    function finalizeNFTWithdrawal(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) external onlyFromCrossDomainAccount(sideNFTBridge) {
        // ) external {
        require(
            msg.sender == messenger || msg.sender == owner(),
            "Not message from CrossDomainMessage"
        );

        require(
            deposits[_mainNFTCollection][_sideNFTCollection][_collectionId],
            "NFT is not possessed by MainBridge"
        );

        delete deposits[_mainNFTCollection][_sideNFTCollection][_collectionId];

        pendingWithdrawOwner[_to][_collectionId] = true;

        emit NFTWithdrawalFinalized(
            _mainNFTCollection,
            _sideNFTCollection,
            _from,
            _to,
            _collectionId,
            _data
        );
    }

    function receiveWithdrawNFT(
        address _mainNFTCollection,
        uint256 _collectionId,
        uint256 _fee
    ) public payable nonReentrant {
        require(msg.value == _fee, "Not enough fee");
        require(
            pendingWithdrawOwner[msg.sender][_collectionId],
            "Not in pending owner"
        );
        
        
        
        IMainNFTCollection(_mainNFTCollection).transferFrom(
            address(this),
            msg.sender,
            _collectionId
        );

        delete pendingWithdrawOwner[msg.sender][_collectionId];

        emit WithdrawNFTCompleted(msg.sender, _collectionId);
    }

    function _initialNFTDeposit(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        uint256 _collectionId,
        uint256 _sideChainId,
        uint256 _sideGas,
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
            ),
            "Can't support NFT SideChain"
        );

        require(
            !deposits[_mainNFTCollection][_sideNFTCollection][_collectionId],
            " Token was on the bridge"
        );

        //Transfer NFT to MainBridge

        mainNFTCollection.transferFrom(
            msg.sender,
            address(this),
            _collectionId
        );

        (bool success, ) = owner().call{value: _sideGas}(new bytes(0));

        require(
            success,
            "TransferHelper::safeTransferETH: ETH transfer failed"
        );

        deposits[_mainNFTCollection][_sideNFTCollection][_collectionId] = true;

        NFTCollection memory nftCollection;

        nftCollection.collectionRarity = mainNFTCollection.viewCollectionRarity(
            _collectionId
        );
        nftCollection.collectionId = _collectionId;
        nftCollection.collectionLevel = mainNFTCollection.getCollectionLevel(
            _collectionId
        );
        nftCollection.collectionExperience = mainNFTCollection
            .getCollectionExperience(_collectionId);

        if (nftCollection.collectionRarity == UNIQUE_RARITY) {
            nftCollection.collectionRank = mainNFTCollection.getUniqueRank(
                _collectionId
            );
            nftCollection.collectionURL = mainNFTCollection.getCollectionURL(
                _collectionId
            );
        } else {
            nftCollection.collectionRank = 1;
            nftCollection.collectionURL = "";
        }

        bytes memory message = abi.encodeWithSelector(
            ISideBridge.finalizeDepositNFT.selector,
            _mainNFTCollection,
            _sideNFTCollection,
            _from,
            _to,
            nftCollection,
            _data
        );

        sendCrossDomainMessage(sideNFTBridge, _sideGas, message);

        emit NFTDepositInitiated(
            _mainNFTCollection,
            _sideNFTCollection,
            _from,
            _to,
            _collectionId,
            _sideGas,
            _sideChainId,
            _data
        );
    }
}
