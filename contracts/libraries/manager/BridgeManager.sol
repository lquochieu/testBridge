// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BridgeManager is Initializable, OwnableUpgradeable {
    IERC20 internal trava;

    // receiver bridge fee address
    address internal botAddress;
    uint256 internal bridgeFee;

    // address of admin to use admin functions
    mapping(address => bool) internal admin;

    function __BridgeManager_init(
        address _botAddress,
        address _travaAddress,
        uint256 _bridgeFee
    ) internal onlyInitializing {

        admin[msg.sender] = true;

        botAddress = _botAddress;
        trava = IERC20(_travaAddress);
        bridgeFee = _bridgeFee;

        __Ownable_init_unchained();
    }

    modifier onlyAdmin() {
        require(admin[msg.sender], "UNAUTHORIZED");
        _;
    }

    modifier onlyEnoughBridgeFee() {
        require(
            trava.balanceOf(msg.sender) >= bridgeFee,
            "NOt enough bridge fee"
        );
        _;
    }

    function _collectBridgeFee() internal {
        if (bridgeFee != 0) {
            trava.transferFrom(msg.sender, botAddress, bridgeFee);
        }
    }

    /*
    ╔══════════════════════════════╗
    ║    ADMIN FUNCTION            ║
    ╚══════════════════════════════╝*/

    function setBridgeFee(uint256 _bridgeFee) external onlyAdmin {
        bridgeFee = _bridgeFee;
    }

    function setbotAddress(address _botAddress) external onlyAdmin {
        botAddress = _botAddress;
    }

    // set trava address
    function setTravaAddress(address _travaAddress) external onlyAdmin {
        trava = IERC20(_travaAddress);
    }

    function setAdmin(address _admin, bool _status) external onlyOwner {
        admin[_admin] = _status;
    }

    /*╔══════════════════════════════╗
    ║            GETTERS           ║
    ╚══════════════════════════════╝*/

    function getBridgeFee() public view returns(uint256) {
        return bridgeFee;
    }

    function getBotAddress() public view returns(address) {
        return botAddress;
    }
}
