// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./RewardsPoolBase.sol";

contract NoWithdrawRewardsPool is RewardsPoolBase {

	constructor(
        IERC20Detailed _stakingToken,
        uint256 _startBlock,
        uint256 _endBlock,
        address[] memory _rewardsTokens,
        uint256[] memory _rewardPerBlock
    ) public RewardsPoolBase(_stakingToken, _startBlock, _endBlock, _rewardsTokens, _rewardPerBlock) {
	}

	function withdraw(uint256 _tokenAmount) public override virtual {
		revert("NoWithdrawRewardsPool::cannot withdraw from this contract. Only exit.");
	}

	function claim() public override virtual {
		revert("NoWithdrawRewardsPool::cannot claim from this contract. Only exit.");
	}

}