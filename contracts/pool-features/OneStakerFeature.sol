// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../RewardsPoolBase.sol";

abstract contract OneStakerFeature is RewardsPoolBase {
	address public immutable staker;


	constructor(address _staker) public {
		require(_staker != address(0x0), "OSF::C new staker address can't 0x0");
		staker = _staker;
	}


	function onlyStaker(address sender) public view {
		require(msg.sender == staker, "onlyStaker::incorrect staker");
	}

	function stake(uint256 _tokenAmount) public virtual override(RewardsPoolBase)  {
		onlyStaker(msg.sender);
		RewardsPoolBase.stake(_tokenAmount);
	}

}