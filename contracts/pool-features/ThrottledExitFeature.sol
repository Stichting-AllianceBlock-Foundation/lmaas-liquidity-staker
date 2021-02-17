// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../RewardsPoolBase.sol";
import "./StakeLockingFeature.sol";
import "./../interfaces/IERC20Detailed.sol";
import "./../SafeERC20Detailed.sol";


abstract contract ThrottledExitFeature is StakeLockingFeature {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	uint256 public nextAvailableExitBlock;
	uint256 public nextAvailableRoundExitVolume;
	uint256 public throttleRoundBlocks;
	uint256 public throttleRoundCap;

	struct ExitInfo {
        uint256 exitBlock;
        uint256 exitStake;
        uint256[] rewards;
    }

	mapping(address => ExitInfo) public exitInfo;

	event ExitRequested(address user, uint256 exitBlock);
	event ExitCompleted(address user, uint256 stake);

	function setThrottleParams(uint256 _throttleRoundBlocks, uint256 _throttleRoundCap) internal {
		require(_throttleRoundBlocks > 0, "setThrottle::throttle rould must be more than 0");
		require(_throttleRoundCap > 0, "setThrottle::throttle rould cap must be more than 0");
		require(throttleRoundBlocks == 0 && throttleRoundCap == 0, "setThrottle::throttle parameters were already set");
		throttleRoundBlocks = _throttleRoundBlocks;
		throttleRoundCap = _throttleRoundCap;
		nextAvailableExitBlock = endBlock.add(throttleRoundBlocks);
	}

	function exit() virtual public override onlyUnlocked nonReentrant {
		UserInfo storage user = userInfo[msg.sender];

		updateRewardMultipliers(); // Update the accumulated multipliers for everyone

        if (user.amountStaked == 0) {
            return;
        }

        updateUserAccruedReward(msg.sender); // Update the accrued reward for this specific user

		initialiseExitInfo(msg.sender);

		ExitInfo storage info = exitInfo[msg.sender];
		info.exitBlock = getAvailableExitTime(user.amountStaked);

		info.exitStake = info.exitStake.add(user.amountStaked);
		totalStaked = totalStaked.sub(user.amountStaked);
		user.amountStaked = 0;

		for (uint256 i = 0; i < rewardsTokens.length; i++) {
			info.rewards[i] = info.rewards[i].add(user.tokensOwed[i]);
			user.tokensOwed[i] = 0;
			user.rewardDebt[i] = 0;
        }

		emit ExitRequested(msg.sender, info.exitBlock);
	}

	function completeExit() virtual public onlyUnlocked nonReentrant {
		ExitInfo storage info = exitInfo[msg.sender];
		require(_getBlock() > info.exitBlock, "completeExit::Trying to exit too early");

		stakingToken.safeTransfer(address(msg.sender), info.exitStake);
		

		for (uint256 i = 0; i < rewardsTokens.length; i++) {
			IERC20Detailed(rewardsTokens[i]).safeTransfer(msg.sender, info.rewards[i]);
			info.rewards[i] = 0;
        }

		emit ExitCompleted(msg.sender, info.exitStake);
		info.exitStake = 0;

	}

	function getAvailableExitTime(uint256 exitAmount) internal returns(uint256 exitBlock) {
		if(block.number > nextAvailableExitBlock) { // We've passed the next available block and need to readjust
			uint i = nextAvailableExitBlock; // Using i instead of nextAvailableExitBlock to avoid SSTORE
			while(i < block.number) { // Find the next future round
				i = i.add(throttleRoundBlocks);
			}
			nextAvailableExitBlock = i;
			nextAvailableRoundExitVolume = exitAmount; // Reset volume
			return i;
		} else { // We are still before the next available block
			nextAvailableRoundExitVolume = nextAvailableRoundExitVolume.add(exitAmount); // Add volume
		}

		exitBlock = nextAvailableExitBlock;

		if (nextAvailableRoundExitVolume >= throttleRoundCap) { // If cap reached
			nextAvailableExitBlock = nextAvailableExitBlock.add(throttleRoundBlocks); // update next exit block
			nextAvailableRoundExitVolume = 0; // Reset volume
		}
	}

	function getPendingReward(uint256 tokenIndex) public view returns(uint256) {
		ExitInfo storage info = exitInfo[msg.sender];
		return info.rewards[tokenIndex];
	}

	function initialiseExitInfo(address _userAddress) private {
		ExitInfo storage info = exitInfo[_userAddress];

        if (info.rewards.length == rewardsTokens.length) {
            // Already initialised
            return;
        }

        for (uint256 i = info.rewards.length; i < rewardsTokens.length; i++) {
            info.rewards.push(0);
        }
	}

	

}