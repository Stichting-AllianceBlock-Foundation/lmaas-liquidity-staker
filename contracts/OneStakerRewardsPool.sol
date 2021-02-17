pragma solidity 0.6.12;

import "./RewardsPoolBase.sol";

contract OneStakerRewardsPool is RewardsPoolBase {
	address public staker;

	constructor(
        IERC20Detailed _stakingToken,
        uint256 _startBlock,
        uint256 _endBlock,
        address[] memory _rewardsTokens,
        uint256[] memory _rewardPerBlock,
		address _staker
    ) public RewardsPoolBase(_stakingToken, _startBlock, _endBlock, _rewardsTokens, _rewardPerBlock) {
		staker = _staker;
	}

	modifier onlyStaker() {
		require(msg.sender == staker, "onlyStaker::incorrect staker");
		_;
	}

	function stake(uint256 _tokenAmount) public override onlyStaker {
		super.stake(_tokenAmount);
	}

}