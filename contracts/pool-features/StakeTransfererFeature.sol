// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../interfaces/IERC20Detailed.sol";
import "./../SafeERC20Detailed.sol";
import "./OnlyExitFeature.sol";
import "./../StakeTransferer.sol";
import "./../StakeReceiver.sol";

abstract contract StakeTransfererFeature is OnlyExitFeature, StakeTransferer {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	mapping(address => bool) public receiversWhitelist;

	function setReceiverWhitelisted(address receiver, bool whitelisted) public onlyFactory {
		receiversWhitelist[receiver] = whitelisted;
	}

	/** @dev exits the current campaign and trasnfers the stake to another whitelisted campaign
		@param transferTo address of the receiver to transfer the stake to
	 */
	function exitAndTransfer(address transferTo) virtual public override nonReentrant {
		require(receiversWhitelist[transferTo], "exitAndTransfer::receiver is not whitelisted");
		UserInfo storage user = userInfo[msg.sender];
		
		updateRewardMultipliers(); // Update the accumulated multipliers for everyone

		if (user.amountStaked == 0) {
			return;
		}

		updateUserAccruedReward(msg.sender); // Update the accrued reward for this specific user

		_claim(msg.sender);

		stakingToken.safeApprove(transferTo, user.amountStaked);

		StakeReceiver(transferTo).delegateStake(msg.sender, user.amountStaked);

		totalStaked = totalStaked.sub(user.amountStaked);
		user.amountStaked = 0;

		for (uint256 i = 0; i < rewardsTokens.length; i++) {
			user.tokensOwed[i] = 0;
			user.rewardDebt[i] = 0;
		}
	}

}