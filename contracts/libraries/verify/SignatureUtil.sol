// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;


library SignatureUtil {

    function splitSignature(bytes memory _signature)
        internal
        pure
        returns (
            uint8,
            bytes32,
            bytes32
        )
    {
        require(_signature.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(_signature, 32))
            // second 32 bytes
            s := mload(add(_signature, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(_signature, 96)))
        }

        return (v, r, s);
    }

}
