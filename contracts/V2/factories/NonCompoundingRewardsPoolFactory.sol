// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../../interfaces/IERC20Detailed.sol";
import "./../../SafeERC20Detailed.sol";
import "./../NonCompoundingRewardsPool.sol";
import "./StakeTransferEnabledFactory.sol";
import "./../libraries/Calculator.sol";

contract NonCompoundingRewardsPoolFactory is AbstractPoolsFactory, StakeTransferEnabledFactory {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	address public immutable treasury;
	address public immutable externalRewardToken;

	constructor(address _treasury, address _externalRewardToken) public {
		require(
			_treasury != address(0),
			"NonCompoundingRewardsPoolFactory:: Treasury address can't be zero address"
		);

		require(
			_externalRewardToken != address(0),
			"NonCompoundingRewardsPoolFactory:: External reward address can't be zero address"
		);
		treasury = _treasury;
		externalRewardToken = _externalRewardToken;
	}

	event RewardsPoolDeployed(
		address indexed rewardsPoolAddress,
		address indexed stakingToken
	);

	/* ========== Permissioned FUNCTIONS ========== */

	/** @dev Deploy a reward pool base contract for the staking token, with the given parameters.
	 * @param _stakingToken The address of the token being staked
	 * @param _startBlock The start block of the rewards pool
	 * @param _endBlock The end block of the rewards pool
	 * @param _rewardsTokens The addresses of the tokens the rewards will be paid in
	 * @param _rewardPerBlock Rewards per block
	 * @param _stakeLimit The stake limit per user
	 */
	function deploy(
		address _stakingToken,
		uint256 _startBlock,
		uint256 _endBlock,
		address[] calldata _rewardsTokens,
		uint256[] calldata _rewardPerBlock,
		uint256 _stakeLimit,
		uint256 _throttleRoundBlocks,
		uint256 _throttleRoundCap,
		uint256 _contractStakeLimit
	) external  {
		onlyOwner(msg.sender);
		require(
			_stakingToken != address(0),
			"NonCompoundingRewardsPoolFactory::deploy: Staking token address can't be zero address"
		);
		require(
			_rewardsTokens.length != 0,
			"NonCompoundingRewardsPoolFactory::deploy: RewardsTokens array could not be empty"
		);
		require(
			_rewardsTokens.length == _rewardPerBlock.length,
			"NonCompoundingRewardsPoolFactory::deploy: RewardsTokens and RewardPerBlock should have a matching sizes"
		);

		require(
			_stakeLimit != 0,
			"NonCompoundingRewardsPoolFactory::deploy: Stake limit must be more than 0"
		);

		require(
			_throttleRoundBlocks != 0,
			"NonCompoundingRewardsPoolFactory::deploy: Throttle round blocks must be more than 0"
		);

		require(
			_throttleRoundCap != 0,
			"NonCompoundingRewardsPoolFactory::deploy: Throttle round cap must be more than 0"
		);

		address rewardPool =
			address(
				new NonCompoundingRewardsPool(
					IERC20Detailed(_stakingToken),
					_startBlock,
					_endBlock,
					_rewardsTokens,
					_rewardPerBlock,
					_stakeLimit, 
					_throttleRoundBlocks,
					_throttleRoundCap,
					treasury,
					externalRewardToken,
					_contractStakeLimit
				)
			);

		for (uint256 i = 0; i < _rewardsTokens.length; i++) {

			require(
				_rewardsTokens[i] != address(0),
				"NonCompoundingRewardsPoolFactory::deploy: Reward token address could not be invalid"
			);
			require(
				_rewardPerBlock[i] != 0,
				"NonCompoundingRewardsPoolFactory::deploy: Reward per block must be greater than zero"
			);

			uint256 rewardsAmount =
				Calculator.calculateRewardsAmount(
					_startBlock,
					_endBlock,
					_rewardPerBlock[i]
				);
			IERC20Detailed(_rewardsTokens[i]).safeTransfer(
				rewardPool,
				rewardsAmount
			);
		}
		rewardsPools.push(rewardPool);

		emit RewardsPoolDeployed(rewardPool, _stakingToken);
	}

}
