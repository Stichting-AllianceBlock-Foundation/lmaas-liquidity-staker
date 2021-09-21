// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./AutoStake.sol";

contract LimitedAutoStake is AutoStake {
	using SafeMath for uint256;

	uint256 public immutable stakeLimit;

	constructor(address token, uint256 _throttleRoundBlocks, uint256 _throttleRoundCap, uint256 stakeEnd, uint256 _stakeLimit, uint256 _contractStakeLimit) public AutoStake(token, _throttleRoundBlocks, _throttleRoundCap, stakeEnd, _contractStakeLimit) {
		require(_stakeLimit != 0 , "LAS:Err01");
		stakeLimit = _stakeLimit;
	}

	function onlyUnderStakeLimit(address staker, uint256 newStake) internal {
		uint256 currentStake = AutoStake.userStakedAmount[staker];
		require(currentStake.add(newStake) <= stakeLimit, "LAS:Errr02");
	}

	function stake(uint256 amount) public virtual override(AutoStake)  {
		onlyUnderStakeLimit(msg.sender, amount);
		AutoStake.stake(amount);
	}

}