// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../RewardsPoolBase.sol";
import "./../pool-features/OneStakerFeature.sol";

contract OneStakerRewardsPoolMock is RewardsPoolBase, OneStakerFeature {
	constructor(
        IERC20Detailed _stakingToken,
        uint256 _startBlock,
        uint256 _endBlock,
        address[] memory _rewardsTokens,
        uint256[] memory _rewardPerBlock,
		uint256 _stakeLimit,
		address _staker
    ) public RewardsPoolBase(_stakingToken, _startBlock, _endBlock, _rewardsTokens, _rewardPerBlock, _stakeLimit) {
		setStaker(_staker);
	}

	function stake(uint256 _tokenAmount) public override(RewardsPoolBase, OneStakerFeature) {
		OneStakerFeature.stake(_tokenAmount);
	}
}