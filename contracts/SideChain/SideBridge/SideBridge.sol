// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
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
    address internal mainNFTBridge;

    /**
     * @param chainId chainId of MainChain
     * @param collectionRank except for Unique Collections, the others will have rank 1
     * @param collectionURL exccept for Unique Collections, the others don't have URL
     */

    struct NFTCollection {
        uint256 mainChainId;
        uint256 collectionRarity;
        uint256 collectionId;
        uint256 collectionLevel;
        uint256 collectionExperience;
        uint256 collectionRank;
        string collectionURL;
    }

    mapping(uint256 => NFTCollection) internal collections;

    /*╔══════════════════════════════╗
      ║            EVENTS            ║
      ╚══════════════════════════════╝*/

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

    /*╔══════════════════════════════╗
      ║           MODIFIER           ║
      ╚══════════════════════════════╝*/
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

    function initialize(address _SideGate, address _mainNFTBridge)
        public
        initializer
    {
        require(messenger == address(0), "Contract already initialize");

        mainNFTBridge = _mainNFTBridge;

        __CrossDomainEnabled_init(_SideGate);
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

    function updateMainBridge(address _mainNFTBridge) external onlyOwner {
        mainNFTBridge = _mainNFTBridge;
    }

    /*  ╔══════════════════════════════╗
      ║    Deposit NFT Collection      ║
      ╚══════════════════════════════╝ */

    /** The function will call by relayMessage function in SideGate contract
     * onyCrossDomainAccount will check if function was called by relayMessage or not
     * @dev the final step to deposit NFT from MainChain
     * @param _mainNFTCollection address of NFT Collection on MainChain
     * @param _sideNFTCollection address of NFT Collection on SideChain
     * @param _from address of sender from MainChain
     * @param _to address of receiver NFT token
     * @param _nftCollection infor of NFT Collection was deposited on MainChain
     * @param _data data was sent with NFT Colletion on MainChain
     */
    function finalizeDepositNFT(
        address _mainNFTCollection,
        address _sideNFTCollection,
        address _from,
        address _to,
        NFTCollection memory _nftCollection,
        bytes calldata _data
    ) external virtual onlyFromCrossDomainAccount(mainNFTBridge) {
        // )external   {
        require(
            _msgSender() == messenger || _msgSender() == owner(),
            "Not message from CrossDomainMessage"
        );

        // require(tx.origin == _to, "Invalid owner");

        ISideNFTCollection sideNFTCollection = ISideNFTCollection(
            _sideNFTCollection
        );

        if (_mainNFTCollection == sideNFTCollection.getMainNFTCollection()) {
            collections[_nftCollection.collectionId] = _nftCollection;

            _claimNFTCollection(
                _to,
                _sideNFTCollection,
                _nftCollection.collectionId
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
        address _to,
        address _sideNFTCollection,
        uint256 _collectionId
    ) internal {
        ISideNFTCollection sideNFTCollection = ISideNFTCollection(
            _sideNFTCollection
        );

        NFTCollection memory nftCollection = collections[_collectionId];

        if (nftCollection.collectionRarity == Lib_DefaultValues.UNIQUE_RARITY) {
            sideNFTCollection.mintUniqueToken(
                _to,
                nftCollection.collectionId,
                nftCollection.collectionURL
            );
        } else {
            sideNFTCollection.mintNFTCollection(
                _to,
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

        emit ClaimNFTCollectionCompleted(_to, nftCollection);
    }

    /*  ╔══════════════════════════════╗
      ║   Withdraw NFT Collection      ║
      ╚══════════════════════════════╝ */
    /**
     * @dev With NFT Collection from SideChain to MainChain with its collectionId
     */

    function withdrawTo(
        address _sideNFTCollection,
        address _to,
        uint256 _collectionId,
        bytes calldata _data
    ) external virtual onlyEOA nonReentrant whenNotPaused {
        _initiateWithdrawal(
            _sideNFTCollection,
            _msgSender(),
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
            _msgSender() == sideNFTCollection.ownerOf(_collectionId),
            "Only Owner can withdraw NFT"
        );

        require(
            collections[_collectionId].collectionId == _collectionId,
            "NFTCollection is't deposited from the other chain"
        );

        sideNFTCollection.burnNFTCollection(_from, _collectionId);

        delete collections[_collectionId];

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
            _msgSender(),
            _to,
            _collectionId,
            _data
        );
    }

    /*╔══════════════════════════════╗
      ║            GETTERS           ║
      ╚══════════════════════════════╝*/

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
}
