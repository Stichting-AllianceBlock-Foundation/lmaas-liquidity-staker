// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

library Calculator {
	using SafeMath for uint256;

	function calculateRewardsAmount(
		uint256 _startBlock,
		uint256 _endBlock,
		uint256 _rewardPerBlock
	) public pure returns (uint256) {
		require(
			_rewardPerBlock > 0,
			"CL:Err01"
		);

		uint256 rewardsPeriod = _endBlock.sub(_startBlock);

		return _rewardPerBlock.mul(rewardsPeriod);
	}
}