// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../RewardsPoolBase.sol";
import "./StakeLockingFeature.sol";
import "./../interfaces/IERC20Detailed.sol";
import "./../SafeERC20Detailed.sol";
import "./../ThrottledExit.sol";


abstract contract ThrottledExitFeature is StakeLockingFeature, ThrottledExit {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	function exit() virtual public override onlyUnlocked nonReentrant {
		UserInfo storage user = userInfo[msg.sender];

		updateRewardMultipliers(); // Update the accumulated multipliers for everyone

        if (user.amountStaked == 0) {
            return;
        }

        updateUserAccruedReward(msg.sender); // Update the accrued reward for this specific user

		initiateExit(user.amountStaked, rewardsTokens.length, user.tokensOwed);

		totalStaked = totalStaked.sub(user.amountStaked);
		user.amountStaked = 0;

		for (uint256 i = 0; i < rewardsTokens.length; i++) {
			user.tokensOwed[i] = 0;
			user.rewardDebt[i] = 0;
        }
	}

	function completeExit() virtual public onlyUnlocked nonReentrant {
		finalizeExit(address(stakingToken), rewardsTokens);
	}

}