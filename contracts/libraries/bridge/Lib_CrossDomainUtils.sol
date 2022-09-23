// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


library Lib_CrossDomainUtils {

    function encodeXDomainCallData(
        address _target,
        address _sender,
        bytes memory _message,
        uint256 _messageNonce
    ) internal pure returns (bytes memory) {
        return
            abi.encodeWithSignature(
                "relayMessage(address,address,bytes,uint256)",
                _target,
                _sender,
                _message,
                _messageNonce
            );
    }
}
