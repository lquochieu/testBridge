//SPDX-License-Identifier: Unlicense
/**
 * Created on 2021-10-04 11:16
 * @summary:
 * @author: phuong
 */
pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol";

interface IMainNFTCollection is IERC721EnumerableUpgradeable {
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

    function getUniqueRank(uint256 _tokenId) external view returns (uint256);

    function getCollectionURL(uint256 _collectionId)
        external
        view
        returns (string memory);
}
