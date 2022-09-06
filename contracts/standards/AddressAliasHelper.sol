// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

library AddressAliasHelper {
    uint160 constant offset = uint160(0x0000000000000000000000000000000000000000);
    function applyL1ToL2Alias(address l1Address) internal pure returns (address l2Address) {
        unchecked {
            l2Address = address(uint160(l1Address) + offset);
        }
    }
    
    function undoL1ToL2Alias(address l2Address) internal pure returns (address l1Address) {
        unchecked {
            l1Address = address(uint160(l2Address) - offset);
        }
    }
}
