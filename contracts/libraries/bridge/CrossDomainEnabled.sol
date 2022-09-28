// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./ICrossDomainMessenger.sol";

contract CrossDomainEnabled is Initializable {
    address public messenger;

    function __CrossDomainEnabled_init(address _messenger) internal onlyInitializing {
        messenger = _messenger;
    }

    modifier onlyFromCrossDomainAccount(address _sourceDomainAccount) {
        require(
            msg.sender == address(getCrossDomainMessenger()),
            "OVM_XCHAIN: messenger contract unauthenticated"
        );

        require(
            getCrossDomainMessenger().xDomainMessageSender() ==
                _sourceDomainAccount,
            "OVM_XCHAIN: wrong sender of cross-domain message"
        );

        _;
    }

    function getCrossDomainMessenger()
        internal
        virtual
        returns (ICrossDomainMessenger)
    {
        return ICrossDomainMessenger(messenger);
    }

    function sendCrossDomainMessage(
        uint256 _chainId,
        address _crossDomainTarget,
        bytes memory _message
    ) internal {
        getCrossDomainMessenger().sendMessage(
            _chainId,
            _crossDomainTarget,
            _message
        );
    }
}
