// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../interfaces/IERC20Detailed.sol";
import "./../SafeERC20Detailed.sol";
import "./AutoStake.sol";
import "./../StakeTransferer.sol";
import "./../StakeReceiver.sol";

abstract contract StakeTransfererAutoStake is AutoStake, StakeTransferer  {
	using SafeMath for uint256;

	function setReceiverWhitelisted(address receiver, bool whitelisted) override(StakeTransferer) onlyFactory public {
		StakeTransferer.setReceiverWhitelisted(receiver, whitelisted);
	}

	/** @dev exits the current campaign and trasnfers the stake to another whitelisted campaign
		@param transferTo address of the receiver to transfer the stake to
	 */
	function exitAndTransfer(address transferTo) virtual public override onlyWhitelistedReceiver(transferTo) onlyUnlocked nonReentrant {
		exitRewardPool();
		updateValuePerShare();

		uint256 userStake = balanceOf(msg.sender);
		if(userStake == 0) {
			return;
		}

		totalShares = totalShares.sub(share[msg.sender]);
		share[msg.sender] = 0;

		stakingToken.safeApprove(transferTo, userStake);

		StakeReceiver(transferTo).delegateStake(msg.sender, userStake);

		updateValuePerShare();
	}
}