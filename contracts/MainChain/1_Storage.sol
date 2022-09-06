// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;
import "./MainBridge/IMainBridge.sol";

contract Storage {

    uint160 public constant offset = uint160(0x1111000000000000000000000000000000001111);

    bytes public mesage;
    bool public ok;
    function applyL1ToL2Alias(address l1Address) public pure returns (address l2Address) {
        unchecked {
            l2Address = address(uint160(l1Address) + offset);
        }
    }

    /// @notice Utility function that converts the msg.sender viewed in the L2 to the
    /// address in the L1 that submitted a tx to the inbox
    /// @param l2Address L2 address as viewed in msg.sender
    /// @return l1Address the address in the L1 that triggered the tx to L2
    function undoL1ToL2Alias(address l2Address) public pure returns (address l1Address) {
        unchecked {
            l1Address = address(uint160(l2Address) - offset);
        }
    }

    function test(
        address _mainNFT,
        address _sideNFT,
        address _from,
        address _to,
        uint256 _tokenId,
        bytes calldata _data
    ) external {
        mesage = abi.encodeWithSelector(
            IMainBridge.finalizeNFTWithdrawal.selector,
            _mainNFT,
            _sideNFT,
            _from,
            _to,
            _tokenId,
            _data
        );
    }

    function testCall(address target) external {
        (bool success, ) = target.call(mesage);
        ok = success;
    }
}