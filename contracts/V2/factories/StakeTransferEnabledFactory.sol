// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../../AbstractPoolsFactory.sol";
import "./../../StakeTransferer.sol";

abstract contract StakeTransferEnabledFactory is AbstractPoolsFactory {
    using SafeMath for uint256;

    event ReceiverEnabled(address transferer, address receiver);

    function enableReceivers(address transferer, address[] memory receivers) public onlyOwner {
        require(transferer != address(0x0), "enableReceivers::Transferer cannot be 0");
        StakeTransferer transfererContract = StakeTransferer(transferer);
        for (uint256 i = 0; i < receivers.length; i++) {
            require(receivers[i] != address(0x0), "enableReceivers::Receiver cannot be 0");
            transfererContract.setReceiverWhitelisted(receivers[i], true);
            emit ReceiverEnabled(transferer, receivers[i]);
        }
    }
}
