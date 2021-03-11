// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../RewardsPoolBase.sol";
import "./../pool-features/OnlyExitFeature.sol";
import "./../pool-features/StakeLockingFeature.sol";

contract StakeLockingRewardsPoolMock is RewardsPoolBase, OnlyExitFeature, StakeLockingFeature {
	constructor(
        IERC20Detailed _stakingToken,
        uint256 _startBlock,
        uint256 _endBlock,
        address[] memory _rewardsTokens,
        uint256[] memory _rewardPerBlock,
		uint256 _stakeLimit
    ) public RewardsPoolBase(_stakingToken, _startBlock, _endBlock, _rewardsTokens, _rewardPerBlock, _stakeLimit) StakeLock(_endBlock) {
	}

	function withdraw(uint256 _tokenAmount) public override(OnlyExitFeature, RewardsPoolBase) {
		OnlyExitFeature.withdraw(_tokenAmount);
	}

	function claim() public override(OnlyExitFeature, RewardsPoolBase) {
		OnlyExitFeature.claim();
	}

	function exit() public override(StakeLockingFeature, RewardsPoolBase) {
		StakeLockingFeature.exit();
	}
}