// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../autostake-features/StakeTransfererAutoStake.sol";
import "./../autostake-features/StakeReceiverAutoStake.sol";
import "./../autostake-features/LimitedAutoStake.sol";

contract CompoundingRewardsPoolStaker is LimitedAutoStake, StakeTransfererAutoStake, StakeReceiverAutoStake {
	constructor(address token, uint256 _throttleRoundBlocks, uint256 _throttleRoundCap, uint256 stakeEnd, uint _stakeLimit) public LimitedAutoStake(token, _throttleRoundBlocks, _throttleRoundCap, stakeEnd, _stakeLimit) {
	}

	function stake(uint256 amount) public virtual override(AutoStake, LimitedAutoStake) {
		LimitedAutoStake.stake(amount);
	}

	function delegateStake(address staker, uint256 amount) onlyUnderStakeLimit(staker, amount) virtual override(StakeReceiverAutoStake) public {
		StakeReceiverAutoStake.delegateStake(staker, amount);
	}
}