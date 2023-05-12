//SPDX-License-Identifier: Unlicense
/**
 * Created on 2021-10-04 11:16
 * @summary:
 * @author: phuong
 */
pragma solidity 0.8.4;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

/**
 * @title
 */
contract SideNFTCollection is ERC721Enumerable, Ownable, Pausable {
    using SafeMath for uint256;
    using Strings for uint256;
    using Counters for Counters.Counter;

    address internal sideBridge;
    address internal mainCollection;
    uint256[] internal levelMilestones;

    Counters.Counter internal _collectionIds;

    struct CollectionComponent {
        uint256 helmetTokenId;
        uint256 armorTokenId;
        uint256 swordTokenId;
        uint256 shieldTokenId;
    }

    enum Rarity {
        UNOPENED,
        COPPER,
        SILVER,
        GOLD,
        DIAMOND,
        CRYSTAL,
        UNIQUE
    }

    enum Type {
        UNOPENED,
        HELMET,
        ARMOR,
        SWORD,
        SHIELD,
        UNIQUE
    }

    /*╔══════════════════════════════╗
      ║            EVENTS            ║
      ╚══════════════════════════════╝*/

    event Mint(address indexed account, uint256 collectionId);
    event Burn(address indexed account, uint256 collectionId);

    mapping(uint256 => CollectionComponent) internal _collectionComponents;
    mapping(uint256 => uint256) internal _collectionRarities;
    mapping(address => bool) internal _registeredVaults;
    mapping(uint256 => uint256) internal _initialExperience;
    mapping(uint256 => uint256) internal _undistributedExperience;

    mapping(uint256 => string) internal _uniqueNFTdata;
    mapping(uint256 => bool) internal _uniqueIds;

    /*╔══════════════════════════════╗
      ║           MODIFIER           ║
      ╚══════════════════════════════╝*/

    modifier onlyRegisteredVault() {
        require(
            _registeredVaults[_msgSender()],
            "Sender is not a registered vault"
        );
        _;
    }

    modifier onlyBridgeAdmin() {
        require(
            msg.sender == sideBridge || msg.sender == owner(),
            "Only bridge or owner can mint!"
        );
        _;
    }

    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/
    constructor(
        address _sideBridge,
        address _mainCollection,
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {
        sideBridge = _sideBridge;
        mainCollection = _mainCollection;
        levelMilestones = [
            0,
            1 days,
            2 days,
            4 days,
            8 days,
            16 days,
            32 days,
            64 days,
            128 days,
            256 days
        ];
    }

    // function initialize(
    //     address _sideBridge,
    //     address _mainCollection,
    //     string memory name_,
    //     string memory symbol_
    // ) external initializer {
    //     __Pausable_init();
    //     __Ownable_init();
    //     __ERC721_init(name_, symbol_);

    //     sideBridge = _sideBridge;
    //     mainCollection = _mainCollection;
    //     levelMilestones = [
    //         0,
    //         1 days,
    //         2 days,
    //         4 days,
    //         8 days,
    //         16 days,
    //         32 days,
    //         64 days,
    //         128 days,
    //         256 days
    //     ];
    // }

    /**
     * Pause relaying.
     */

    function pauseContract() external onlyOwner {
        _pause();
    }

    function unpauseContract() external onlyOwner {
        _unpause();
    }

    /*╔══════════════════════════════╗
      ║       ADMIN FUNCTIONS        ║
      ╚══════════════════════════════╝*/

    function updateSideBridge(address _sideBridge) external onlyOwner {
        sideBridge = _sideBridge;
    }

    function updateMainNFTCollection(
        address _mainNFTCollection
    ) external onlyOwner {
        mainCollection = _mainNFTCollection;
    }

    /**
     * @dev Register vault addresses
     * @param _vaultAddress Vault address
     */
    function registerVault(address _vaultAddress) external onlyBridgeAdmin {
        _registeredVaults[_vaultAddress] = true;
    }

    /*╔══════════════════════════════╗
      ║            MINT NFT          ║
      ╚══════════════════════════════╝*/

    /**
     * @dev Mint unique token
     * @param to Destination address
     * @param specialTokenId Special token ID
     */
    function mintUniqueToken(
        address to,
        uint256 specialTokenId,
        string calldata _data
    ) external onlyBridgeAdmin whenNotPaused returns (uint256) {
        _mint(to, specialTokenId);

        _uniqueNFTdata[specialTokenId] = _data;
        _uniqueIds[specialTokenId] = true;
        _collectionRarities[specialTokenId] = uint256(Rarity.UNIQUE);

        emit Mint(to, specialTokenId);

        return specialTokenId;
    }

    function updateLevelMilestones(
        uint256[] calldata newMilestones
    ) external onlyBridgeAdmin {
        levelMilestones = newMilestones;
    }

    function mintNFTCollection(
        address _to,
        uint256 _collectionId
    ) external whenNotPaused onlyBridgeAdmin {
        _mint(_to, _collectionId);
        emit Mint(_to, _collectionId);
    }

    function burnNFTCollection(
        address _from,
        uint256 _collectionId
    ) external onlyBridgeAdmin whenNotPaused {
        _burn(_collectionId);
        emit Burn(_from, _collectionId);
    }

    /**
     * @dev Function for Vaults: Add experience to undistributed store, waiting for distribution
     * @param _collectionId Token ID of collectionId
     * @param _accruedExperience Accrued experience, determined by vault
     */
    function addCollectionExperience(
        uint256 _collectionId,
        uint256 _accruedExperience
    ) external onlyRegisteredVault {
        _undistributedExperience[_collectionId] += _accruedExperience;
    }

    function changeUniqueURL(
        uint256 _tokenId,
        string memory _data
    ) external onlyBridgeAdmin {
        _uniqueNFTdata[_tokenId] = _data;
    }

    mapping(uint256 => uint256) internal uniqueRanks;

    function setUniqueRank(
        uint256 _tokenId,
        uint256 _rank
    ) external onlyBridgeAdmin {
        uniqueRanks[_tokenId] = _rank;
    }

    function setRarities(
        uint256 _collectionId,
        uint256 _rarity
    ) external onlyBridgeAdmin {
        _collectionRarities[_collectionId] = _rarity;
    }

    /*╔══════════════════════════════╗
      ║            GETTERS           ║
      ╚══════════════════════════════╝*/

    function getCollectionURL(
        uint256 _collectionId
    ) external view returns (string memory) {
        return _uniqueNFTdata[_collectionId];
    }

    /**
     * @dev Get collection experience
     * @param _collectionId Token ID of collection
     */
    function getCollectionExperience(
        uint256 _collectionId
    ) external view returns (uint256) {
        return
            _initialExperience[_collectionId] +
            _undistributedExperience[_collectionId];
    }

    /**
     * @dev Get collection level
     * @param _collectionId Token ID of collection
     */
    function getCollectionLevel(
        uint256 _collectionId
    ) external view returns (uint256) {
        uint256 collectiveExperience = _initialExperience[_collectionId] +
            _undistributedExperience[_collectionId];

        if (collectiveExperience < levelMilestones[1]) return 1;
        else if (collectiveExperience < levelMilestones[2]) return 2;
        else if (collectiveExperience < levelMilestones[3]) return 3;
        else if (collectiveExperience < levelMilestones[4]) return 4;
        else if (collectiveExperience < levelMilestones[5]) return 5;
        else if (collectiveExperience < levelMilestones[6]) return 6;
        else if (collectiveExperience < levelMilestones[7]) return 7;
        else if (collectiveExperience < levelMilestones[8]) return 8;
        else if (collectiveExperience < levelMilestones[9]) return 9;
        else return 10;
    }

    /**
     * @dev Get collection rarity
     * @param collectionId Token ID of collection
     */
    function viewCollectionRarity(
        uint256 collectionId
    ) external view returns (uint256) {
        return _collectionRarities[collectionId];
    }

    function getMainNFTCollection() external view returns (address) {
        return mainCollection;
    }

    function getSideBridge() external view returns (address) {
        return sideBridge;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory _tokenURI = _uniqueNFTdata[tokenId];

        string memory base = _baseURI();
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
        return string(abi.encodePacked(base, tokenId.toString()));
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://gateway.ipfs.io/ipfs/";
    }

    function getUniqueRank(uint256 _tokenId) external view returns (uint256) {
        return uniqueRanks[_tokenId];
    }
}
