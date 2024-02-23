// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./../../interfaces/IERC20Detailed.sol";
import "./../../SafeERC20Detailed.sol";
import "./../CompoundingRewardsPool.sol";
import "./../CompoundingRewardsPoolStaker.sol";
import "./StakeTransferEnabledFactory.sol";
import "./../libraries/Calculator.sol";

contract CompoundingRewardsPoolFactory is AbstractPoolsFactory, StakeTransferEnabledFactory {
	using SafeERC20Detailed for IERC20Detailed;

	address public immutable externalRewardToken;
	uint256 public constant MAX_INT = 115792089237316195423570985008687907853269984665640564039457584007913129639935;

	constructor(address _externalRewardToken) public {
	
        require(
            _externalRewardToken != address(0),
            "CRPF:: Err01"
        );
		externalRewardToken = _externalRewardToken;
	}

	/* ========== Permissioned FUNCTIONS ========== */
	function deploy(
		address _stakingToken,
		uint256 _startBlock,
		uint256 _endBlock,
		uint256 _rewardPerBlock,
		uint256 _stakeLimit, 
		uint256 _throttleRoundBlocks, 
		uint256 _throttleRoundCap,
		uint256 _contractStakeLimit,
		uint256 _initialAmountToTransfer
	) external  {
		onlyOwner(msg.sender);
		require(
			_stakingToken != address(0),
			"CRPF::Err02"
		);

		require(
			_rewardPerBlock != 0,
			"CRPF::Err03"
		);

		require(
			_stakeLimit != 0,
			"CRPF::Err04"
		);

		require(
			_throttleRoundBlocks != 0,
			"CRPF::Err05"
		);

		require(
			_throttleRoundCap != 0,
			"CRPF::Err06"
		);

		CompoundingRewardsPoolStaker autoStaker = new CompoundingRewardsPoolStaker(
			_stakingToken,
			_throttleRoundBlocks,
			_throttleRoundCap,
			_endBlock,
			_stakeLimit,
			_contractStakeLimit
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
				address(autoStaker),
				externalRewardToken,
				MAX_INT,
				_initialAmountToTransfer
			);

		autoStaker.setPool(address(rewardsPool));

		IERC20Detailed(_stakingToken).safeTransfer(address(rewardsPool), _initialAmountToTransfer);

		rewardsPools.push(address(autoStaker));

	}
}
