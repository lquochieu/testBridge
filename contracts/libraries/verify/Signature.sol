// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

/**
 * @title Signature
 * @notice library Signature will verify the signature when user want to claim NFT Collection
 */
library Signature {
    function verifySignature(bytes32 message, bytes memory sig)
        internal
        pure
        returns (address)
    {
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", message)
        );
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(sig);

        return ecrecover(messageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }
}