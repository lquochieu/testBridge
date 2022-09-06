// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title iOVM_L2ToL1MessagePasser
 */
interface IOVM_SideToMessagePasser {
    /**********
     * Events *
     **********/

    event SideToMainMessage(uint256 _nonce, address _sender, bytes _data);

    /********************
     * Public Functions *
     ********************/

    function passMessageToMainChain(bytes calldata _message) external;
}
