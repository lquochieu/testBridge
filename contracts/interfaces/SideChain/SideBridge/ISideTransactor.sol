// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISignatureChecker {

    function pause() external;
    
    function setSigners(address _signer, bool _isSigner) external;

    function claimNFTCollection(
        uint256 _chainId,
        address _target,
        address _sender,
        bytes memory _data,
        uint256 _nonce,
        uint256 _deadline,
        bytes memory _signature
    ) external;

    function getChainID() external view returns (uint256);
    
}
