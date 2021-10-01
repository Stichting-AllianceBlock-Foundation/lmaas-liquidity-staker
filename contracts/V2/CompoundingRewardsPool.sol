// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../RewardsPoolBase.sol";
import "./../pool-features/OneStakerFeature.sol";

contract CompoundingRewardsPool is RewardsPoolBase, OneStakerFeature {

	uint256 public MAX_INT = uint256(-1);
	constructor(
		IERC20Detailed _stakingToken,
		address[] memory _rewardsTokens,
		address _staker,
		uint256 _startBlock,
		uint256 _endBlock,
		uint256[] memory _rewardPerBlock,
		uint256 _virtualBlockTime
	) public RewardsPoolBase(_stakingToken, _startBlock, _endBlock, _rewardsTokens, _rewardPerBlock, MAX_INT, MAX_INT, _virtualBlockTime) OneStakerFeature(_staker) {
	}

	function stake(uint256 _tokenAmount) public override(RewardsPoolBase, OneStakerFeature) {
		OneStakerFeature.stake(_tokenAmount);
	}
}