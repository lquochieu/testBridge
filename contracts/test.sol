// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
import {ISideBridge} from "./SideChain/SideBridge/ISideBridge.sol";

contract Test {

    uint160 public constant offset = uint160(0x1111000000000000000000000000000000001111);

    bytes public message;
    bool public success;
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

    function test(address _mainNFT, address _sideNFT, address _from, address _to, uint256 _tokenId, string memory _tokenURI, bytes calldata _data) external {
         message = abi.encodeWithSelector(
            ISideBridge.finalizeDepositNFT.selector,
            _mainNFT,
            _sideNFT,
            _from,
            _to,
            _tokenId,
            _tokenURI,
            _data
        );
    }

    // function testCall(address target) external {
    //     target.call(mesage);
    // }

    function callMessage(bytes memory mess, address target) external {
        (success, ) = target.call(mess);
    }
}