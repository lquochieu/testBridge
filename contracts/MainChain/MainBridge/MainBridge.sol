// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import { IERC20 } from "OpenZeppelin/openzeppelin-contracts@4.0.0/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import {CrossDomainEnabled} from "../../libraries/bridge/CrossDomainEnabled.sol";
import {IMainNFTCollection} from "../../interfaces/MainChain/Tokens/IMainNFTCollection.sol";
import {ISideBridge} from "../../interfaces/SideChain/SideBridge/ISideBridge.sol";

contract MainBridge is Ownable, CrossDomainEnabled {
    address public admin;
    address public sideBridge;
    uint256 internal UNIQUE_RARITY = 5;

    mapping(address => mapping(address => mapping(uint256 => bool)))
        public deposits;

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

    constructor() CrossDomainEnabled(address(0)) {
        admin = msg.sender;
    }

    function initialize(address _mainMessenger, address _sideBridge)
        public
        onlyOwner
    {
        require(messenger == address(0), "Contract already initialize");
        messenger = _mainMessenger;
        sideBridge = _sideBridge;
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
        address _mainNFTCollection,
        address _sideNFTCollection,
        uint256 _collectionId,
        uint32 _gas,
        bytes calldata _data
    ) external virtual onlyEOA {
        _initialNFTDeposit(
            _mainNFTCollection,
            _sideNFTCollection,
            msg.sender,
            msg.sender,
            _collectionId,
            _gas,
            _data
        );
    }

    function depositNFTBridgeTo(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _to,
        uint256 _collectionId,
        uint32 _gas,
        bytes calldata _data
    ) external virtual {
        _initialNFTDeposit(
            _mainNFTCollection,
            _sideNFTCollection,
            msg.sender,
            _to,
            _collectionId,
            _gas,
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
    ) external onlyFromCrossDomainAccount(sideBridge) {
        // ) external {
        require(
            msg.sender == messenger || msg.sender == admin,
            "Not message from CrossDomainMessage"
        );

        require(
            deposits[_mainNFTCollection][_sideNFTCollection][_collectionId],
            "NFT is not in the MainBridge"
        );

        IMainNFTCollection(_mainNFTCollection).transferFrom(
            address(this),
            _to,
            _collectionId
        );

        delete deposits[_mainNFTCollection][_sideNFTCollection][_collectionId];

        emit NFTWithdrawalFinalized(
            _mainNFTCollection,
            _sideNFTCollection,
            _from,
            _to,
            _collectionId,
            _data
        );
    }

    function _initialNFTDeposit(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        uint256 _collectionId,
        uint32 _sideGas,
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
            !deposits[_mainNFTCollection][_sideNFTCollection][_collectionId],
            " Token was on the bridge"
        );

        //Transfer NFT to MainBridge

        mainNFTCollection.transferFrom(
            msg.sender,
            address(this),
            _collectionId
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
            nftCollection.collectionRank = mainNFTCollection.getUniqueRank(_collectionId);
            nftCollection.collectionURL = mainNFTCollection.getCollectionURL(_collectionId);
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

        sendCrossDomainMessage(sideBridge, _sideGas, message);

        emit NFTDepositInitiated(
            _mainNFTCollection,
            _sideNFTCollection,
            _from,
            _to,
            _collectionId,
            _data
        );
    }
}
