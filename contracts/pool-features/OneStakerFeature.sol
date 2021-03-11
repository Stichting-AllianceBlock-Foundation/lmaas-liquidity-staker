// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../RewardsPoolBase.sol";

abstract contract OneStakerFeature is RewardsPoolBase {
	address public immutable staker;


	constructor(address _staker) public {
		require(_staker != address(0x0), "OneStakerFeature::setSconstructortaker new staker address can't be zero address");
		staker = _staker;
	}

	modifier onlyStaker() {
		require(msg.sender == staker, "onlyStaker::incorrect staker");
		_;
	}

	function stake(uint256 _tokenAmount) public virtual override(RewardsPoolBase) onlyStaker {
		RewardsPoolBase.stake(_tokenAmount);
	}

}