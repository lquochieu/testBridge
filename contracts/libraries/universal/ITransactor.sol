// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISignatureChecker {

    function setSigners(address _signer, bool _isSigner) external;

    function executeSignature(
        address _target,
        bytes memory _data,
        bytes memory _signature,
        uint256 _deadline,
        uint256 _gas
    ) external view returns (address);
}
