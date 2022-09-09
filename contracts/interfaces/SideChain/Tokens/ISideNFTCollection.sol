//SPDX-License-Identifier: Unlicense
/**
 * Created on 2021-10-04 11:16
 * @summary:
 * @author: phuong
 */
pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol";

interface ISideNFTCollection is IERC721EnumerableUpgradeable {
    
    function mintUniqueToken(
        address to,
        uint256 specialTokenId,
        string calldata _data
    ) external;

    function mintNFTCollection(address _to, uint256 _collectionId) external;

    function burnNFTCollection(address _from, uint256 _collectionId) external;

    function viewCollectionRarity(uint256 collectionId)
        external
        view
        returns (uint8);

    function addCollectionExperience(
        uint256 collectionId,
        uint256 accruedExperience
    ) external;

    function getCollectionExperience(uint256 collectionId)
        external
        view
        returns (uint256);

    function getCollectionLevel(uint256 collectionId)
        external
        view
        returns (uint256);
    
    function getMainNFTCollection() external view returns (address);

    function getSideBridge() external view returns (address);

    function setUniqueRank(uint256 _tokenId, uint256 _rank) external;

    function getUniqueRank(uint256 _tokenId) external view returns (uint256);

    function setRarities(uint256 _collectionId, uint256 _rarity) external;

    function getCollectionURL(uint256 _collectionId)
        external
        view
        returns (string memory);

    function updateLevelMilestones(uint256[] calldata newMilestones) external;
}
