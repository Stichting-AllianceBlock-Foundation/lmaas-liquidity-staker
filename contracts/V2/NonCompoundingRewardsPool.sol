// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../RewardsPoolBase.sol";
import "./../pool-features/OnlyExitFeature.sol";
import "./../pool-features/ThrottledExitFeature.sol";
import "./../pool-features/StakeTransfererFeature.sol";
import "./../pool-features/StakeReceiverFeature.sol";
import "./../pool-features/TreasuryOperatedFeature.sol";

contract NonCompoundingRewardsPool is RewardsPoolBase, OnlyExitFeature, ThrottledExitFeature, StakeTransfererFeature, StakeReceiverFeature, TreasuryOperatedFeature {
	constructor(
		IERC20Detailed _stakingToken,
		uint256 _startBlock,
		uint256 _endBlock,
		address[] memory _rewardsTokens,
		uint256[] memory _rewardPerBlock,
		uint256 _stakeLimit,
		uint256 _throttleRoundBlocks,
		uint256 _throttleRoundCap,
		address _treasury,
		address _externalRewardToken
	) public RewardsPoolBase(_stakingToken, _startBlock, _endBlock, _rewardsTokens, _rewardPerBlock, _stakeLimit) TreasuryOperatedFeature(_externalRewardToken, _treasury) StakeLock(_endBlock) {
		setThrottleParams(_throttleRoundBlocks, _throttleRoundCap, _endBlock);
	}

	function withdraw(uint256 _tokenAmount) public override(OnlyExitFeature, RewardsPoolBase) {
		OnlyExitFeature.withdraw(_tokenAmount);
	}

	function claim() public override(OnlyExitFeature, RewardsPoolBase) {
		OnlyExitFeature.claim();
	}

	function exit() public override(ThrottledExitFeature, RewardsPoolBase) {
		ThrottledExitFeature.exit();
	}

	function completeExit() virtual override(ThrottledExitFeature) public {
		ExitInfo storage info = exitInfo[msg.sender];
		uint256 exitReward = info.rewards[0];
		uint256 balanceOfRewardToken = IERC20Detailed(rewardsTokens[0]).balanceOf(address(this));
		claimExternalRewards(exitReward, balanceOfRewardToken);
		ThrottledExitFeature.completeExit();
	}
}