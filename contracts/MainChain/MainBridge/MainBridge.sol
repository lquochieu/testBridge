// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
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
    /**
     * @param chainId chainId of SideChain
     * @param collectionRank except for Unique Collections, the others will have rank 1
     * @param collectionURL exccept for Unique Collections, the others don't have URL
     */

    struct NFTCollection {
        uint256 chainId;
        uint256 collectionRarity;
        uint256 collectionId;
        uint256 collectionLevel;
        uint256 collectionExperience;
        uint256 collectionRank;
        string collectionURL;
    }

    mapping(uint256 => address) internal sideNFTBridges;
    mapping(uint256 => mapping(address => mapping(address => bool)))
        internal supportsNFTCollections;

    /*╔══════════════════════════════╗
      ║            EVENTS            ║
      ╚══════════════════════════════╝*/

    event NFTDepositInitiated(
        address mainNFTCollection,
        address sideNFTCollection,
        address from,
        address to,
        NFTCollection nftCollection,
        uint256 chainId,
        bytes data
    );

    event NFTWithdrawalFinalized(
        address indexed _mainNFTCollection,
        address indexed _sideNFTCollection,
        address indexed _from,
        address _to,
        uint256 _collectionId,
        bytes _data
    );

    /*╔══════════════════════════════╗
      ║           MODIFIER           ║
      ╚══════════════════════════════╝*/
    /**
     * Check msg.sender is contract or user
     */
    modifier onlyEOA() {
        require(
            !AddressUpgradeable.isContract(_msgSender()),
            "Account not EOA"
        );
        _;
    }

    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/

    function initialize(address _MainGate) public initializer {
        require(messenger == address(0), "Contract already initialize");

        __CrossDomainEnabled_init(_MainGate);
        __Context_init_unchained();
        __Ownable_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();
    }

    /**
     * Pause relaying.
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpauseContract() external onlyOwner {
        _unpause();
    }

    /*  ╔══════════════════════════════╗
      ║        ADMIN FUNCTIONS       ║
      ╚══════════════════════════════╝ */

    function updateAdmin(address _newAdmin) external onlyOwner {
        transferOwnership(_newAdmin);
    }

    function setSideNFTBridge(uint256 _chainId, address _sideBridge)
        public
        onlyOwner
    {
        sideNFTBridges[_chainId] = _sideBridge;
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

    /*  ╔══════════════════════════════╗
      ║    Deposit NFT Collection      ║
      ╚══════════════════════════════╝ */

    /**
     * Before depost, please check if contract support for sideChainId
     * and SideChain support for address of SideNFTCollection
     * @dev Deposit NFT Collection to the SideChain
     * @param _sideChainId chainId of network will receive token
     * @param _mainNFTCollection address of NFT Collection on MainChain
     * @param _sideNFTCollection address of NFT Collection on SideChain
     * @param _to address of receiver NFT token on SideChain
     * @param _collectionId id of NFT Collection will deposit
     * @param _data data what want to transfer with token
     */
    function depositNFTBridgeTo(
        uint256 _sideChainId,
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) external virtual onlyEOA nonReentrant whenNotPaused {
        _initialNFTDeposit(
            _mainNFTCollection,
            _sideNFTCollection,
            _msgSender(),
            _to,
            _collectionId,
            _sideChainId,
            _data
        );
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
            _msgSender() == mainNFTCollection.ownerOf(_collectionId),
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
            _msgSender(),
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
            nftCollection,
            _sideChainId,
            _data
        );
    }

    /**
     * @dev initiate information of NFTCollection will deposit in struct NFTCollection
     * @param _mainNFTCollection interface of NFTCollection on this chain
     * @param _collectionId id of NFTCollection
     * @return Information of NFTCollection will deposit
     */

    function _initialNFTCollectionDepositing(
        IMainNFTCollection _mainNFTCollection,
        uint256 _collectionId
    ) internal view returns (NFTCollection memory) {
        NFTCollection memory nftCollection;

        nftCollection.chainId = getChainID();

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
            nftCollection.collectionRank = 0;
            nftCollection.collectionURL = "";
        }

        return nftCollection;
    }

    /*  ╔══════════════════════════════╗
      ║   Withdraw NFT Collection      ║
      ╚══════════════════════════════╝ */

    /** The function will call by relayMessage function in MainGate contract
     * onyCrossDomainAccount will check if function was called by relayMessage or not
     * @dev the final step to withdraw NFT on MainChain
     */

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
            _msgSender() == messenger || _msgSender() == owner(),
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
    ) internal {
        IMainNFTCollection(_mainNFTCollection).transferFrom(
            address(this),
            tx.origin,
            _collectionId
        );
    }

    /*╔══════════════════════════════╗
      ║            GETTERS           ║
      ╚══════════════════════════════╝*/

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

    function getChainID() public view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }
}
