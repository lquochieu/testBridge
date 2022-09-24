// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISignatureChecker {

    function setSigners(address _signer, bool _isSigner) external;

    function claimNFTCollection(
        address _target,
        bytes memory _data,
        uint256 _messageNonce,
        uint256 _deadline,
        bytes memory _signature
    ) external returns (bool);

}
