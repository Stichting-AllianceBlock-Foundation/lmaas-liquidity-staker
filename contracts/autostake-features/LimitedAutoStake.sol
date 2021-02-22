// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./AutoStake.sol";

contract LimitedAutoStake is AutoStake {
	using SafeMath for uint256;

	uint256 public stakeLimit;

	constructor(address token, uint256 _throttleRoundBlocks, uint256 _throttleRoundCap, uint256 stakeEnd, uint _stakeLimit) public AutoStake(token, _throttleRoundBlocks, _throttleRoundCap, stakeEnd) {
		require(_stakeLimit > 0 , "LimitedAutoStake:constructor::stake limit should not be 0");
		stakeLimit = _stakeLimit;
	}

	modifier onlyUnderStakeLimit(address staker, uint256 newStake) {
        uint256 currentStake = balanceOf(staker);
		require(currentStake.add(newStake) <= stakeLimit, "onlyUnderStakeLimit::Stake limit reached");
		_;
	}

	function stake(uint256 amount) public virtual override(AutoStake) onlyUnderStakeLimit(msg.sender, amount) {
		AutoStake.stake(amount);
	}

}