// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../../interfaces/IERC20Detailed.sol";
import "./../../SafeERC20Detailed.sol";
import "./../CompoundingRewardsPool.sol";
import "./../CompoundingRewardsPoolStaker.sol";
import "./StakeTransferEnabledFactory.sol";

contract CompoundingRewardsPoolFactory is AbstractPoolsFactory, StakeTransferEnabledFactory {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	event RewardsPoolDeployed(
		address indexed autostakerAddress,
		address indexed rewardsPoolAddress,
		address indexed stakingToken
	);

	/* ========== Permissioned FUNCTIONS ========== */

	function deploy(
		address _stakingToken,
		uint256 _startBlock,
		uint256 _endBlock,
		uint256 _rewardPerBlock,
		uint256 _stakeLimit, 
		uint256 _throttleRoundBlocks, 
		uint256 _throttleRoundCap
	) external onlyOwner {
		require(
			_stakingToken != address(0),
			"CompoundingRewardsPoolFactory::deploy: Staking token address can't be zero address"
		);

		require(
			_rewardPerBlock != 0,
			"CompoundingRewardsPoolFactory::deploy: Reward per block must be more than 0"
		);

		require(
			_stakeLimit != 0,
			"CompoundingRewardsPoolFactory::deploy: Stake limit must be more than 0"
		);

		require(
			_throttleRoundBlocks != 0,
			"CompoundingRewardsPoolFactory::deploy: Throttle round blocks must be more than 0"
		);

		require(
			_throttleRoundCap != 0,
			"CompoundingRewardsPoolFactory::deploy: Throttle round cap must be more than 0"
		);

		CompoundingRewardsPoolStaker autoStaker = new CompoundingRewardsPoolStaker(
			_stakingToken,
			_throttleRoundBlocks,
			_throttleRoundCap,
			_endBlock,
			_stakeLimit
		);

		address[] memory rewardTokens = new address[](1);
		rewardTokens[0] = _stakingToken;

		uint256[] memory rewardsPerBlock = new uint256[](1);
		rewardsPerBlock[0] = _rewardPerBlock;

		CompoundingRewardsPool rewardsPool = new CompoundingRewardsPool(
				IERC20Detailed(_stakingToken),
				_startBlock,
				_endBlock,
				rewardTokens,
				rewardsPerBlock,
				uint256(-1),
				address(autoStaker)
			);

		autoStaker.setPool(address(rewardsPool));

		uint256 rewardsAmount = calculateRewardsAmount(_startBlock, _endBlock, _rewardPerBlock);
		IERC20Detailed(_stakingToken).safeTransfer(address(rewardsPool), rewardsAmount);

		rewardsPools.push(address(autoStaker));

		emit RewardsPoolDeployed(address(autoStaker), address(rewardsPool), _stakingToken);
	}

	// TODO Whitelisting

}
