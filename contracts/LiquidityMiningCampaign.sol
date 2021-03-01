// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC20Detailed.sol";
import "./SafeERC20Detailed.sol";
import "./RewardsPoolBase.sol";
import "./LockScheme.sol";
import "./StakeTransferer.sol";
import "./StakeReceiver.sol";
import "./pool-features/OnlyExitFeature.sol";


contract LiquidityMiningCampaign is StakeTransferer, OnlyExitFeature  {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	address rewardToken;
	address[] lockSchemes;
	mapping(address => uint256) public userAccruedRewads;

	event StakedAndLocked(address indexed _userAddress, uint256 _tokenAmount, address _lockScheme);
	event ExitedAndUnlocked(address indexed _userAddress);
	event BonusTransferred(address indexed _userAddress, uint256 _bonusAmount);

		constructor(
		IERC20Detailed _stakingToken,
		uint256 _startBlock,
		uint256 _endBlock,
		address[] memory _rewardsTokens,
		uint256[] memory _rewardPerBlock,
		uint256 _stakeLimit
	) public RewardsPoolBase(_stakingToken, _startBlock, _endBlock, _rewardsTokens, _rewardPerBlock,_stakeLimit) {

		rewardToken = _rewardsTokens[0];
	}

	function stakeAndLock( uint256 _tokenAmount, address _lockScheme) external{
		_stakeAndLock(msg.sender,_tokenAmount, _lockScheme);

	}

	/** @dev Stakes LP tokens to the campaing and lockes them to a specific lockScheme contract to earn bonuses
	@param _userAddress the address of the staker
	@param _tokenAmount the amount to be staked
	@param _lockScheme the address of the lock scheme 
	 */
	function _stakeAndLock(address _userAddress ,uint256 _tokenAmount, address _lockScheme) internal {
		require(_userAddress != address(0x0), "_stakeAndLock::Invalid staker");
		require(_tokenAmount > 0, "stakeAndLock::Cannot stake 0");

		UserInfo storage user = userInfo[_userAddress];

		uint256 userRewards = 0;

		updateRewardMultipliers();
		updateUserAccruedReward(_userAddress);

		userRewards = user.tokensOwed[0];

		for (uint256 i = 0; i < lockSchemes.length; i++) {

			uint256 additionalRewards = calculateProportionalRewards(_userAddress, userRewards.sub(userAccruedRewads[_userAddress]), lockSchemes[i]);
			LockScheme(lockSchemes[i]).updateUserAccruedRewards(_userAddress, additionalRewards);
		}
		userAccruedRewads[_userAddress]	= userRewards;
		_stake(_tokenAmount, _userAddress, true);

		LockScheme(_lockScheme).lock(_userAddress, _tokenAmount);

		emit StakedAndLocked( _userAddress, _tokenAmount, _lockScheme);
	}

	function exitAndUnlock() public nonReentrant {
			_exitAndUnlock(msg.sender);
	}

	/** @dev Exits the current campaing and claims the bonuses
	@param _userAddress the address of the staker
	 */
	function _exitAndUnlock(address _userAddress) internal {
			UserInfo storage user = userInfo[_userAddress];

			if (user.amountStaked == 0) {
				return;
			}

			updateRewardMultipliers();
			updateUserAccruedReward(_userAddress);
			//todo check how to secure that 0 is the albt
			uint256 finalRewards = user.tokensOwed[0].sub(userAccruedRewads[_userAddress]);
		
			for (uint256 i = 0; i < lockSchemes.length; i++) {

				uint256 additionalRewards = calculateProportionalRewards(_userAddress, finalRewards, lockSchemes[i]);
				if(additionalRewards > 0) {

				LockScheme(lockSchemes[i]).updateUserAccruedRewards(_userAddress, additionalRewards);
				}

				uint256 bonus = LockScheme(lockSchemes[i]).exit(_userAddress);
				IERC20Detailed(rewardToken).safeTransfer(_userAddress, bonus);
				
			}
			_exit(_userAddress);
			userAccruedRewads[_userAddress] = 0;

			emit ExitedAndUnlocked(_userAddress);
	}


	function setReceiverWhitelisted(address receiver, bool whitelisted) override(StakeTransferer) onlyFactory public {
		StakeTransferer.setReceiverWhitelisted(receiver, whitelisted);
	}

	function exitAndStake(address _stakePool) public  {

			_exitAndStake(msg.sender, _stakePool);
	}

	/** @dev Exits the current campaing, claims the bonus and stake all rewards to ALBT staking contract
	@param _userAddress the address of the staker
	@param _stakePool the address of the pool where the tokens will be staked
	 */
	function _exitAndStake(address _userAddress,address _stakePool) internal onlyWhitelistedReceiver(_stakePool) {
			
		UserInfo storage user = userInfo[_userAddress];
		
		if (user.amountStaked == 0) {
			return;
		}

		updateRewardMultipliers();
		updateUserAccruedReward(_userAddress);
			//todo check how to secure that 0 is the albt
			uint256 finalRewards = user.tokensOwed[0].sub(userAccruedRewads[_userAddress]);
			uint256 userBonus;
			uint256 amountToStake;
			for (uint256 i = 0; i < lockSchemes.length; i++) {

				uint256 additionalRewards = calculateProportionalRewards(_userAddress, finalRewards, lockSchemes[i]);
				if(additionalRewards > 0) {

				LockScheme(lockSchemes[i]).updateUserAccruedRewards(_userAddress, additionalRewards);
				}
				userBonus = LockScheme(lockSchemes[i]).exit(_userAddress);
				amountToStake = amountToStake.add(userBonus);
			}

		 amountToStake = amountToStake.add(user.tokensOwed[0]);
		_withdraw(user.amountStaked, _userAddress);
		user.tokensOwed[0] = 0;
		_claim(_userAddress);

		IERC20Detailed(rewardToken).safeApprove(_stakePool, amountToStake);
		StakeReceiver(_stakePool).delegateStake(_userAddress, amountToStake);
		userAccruedRewads[_userAddress] = 0;
	}

	/** @dev Function calculating the proportional rewards between all lock schemes where the user has locked tokens
	@param _userAddress the address of the staker
	@param _accruedRewards all unAccruedRewards that needs to be split
	@param _lockScheme the address of the lock scheme
	 */
	function calculateProportionalRewards(address _userAddress, uint256 _accruedRewards, address _lockScheme) internal view returns (uint256) {
			
		uint256 userLockedStake = LockScheme(_lockScheme).getUserLockedStake(_userAddress);

		if(totalStaked > 0) {
			return _accruedRewards.mul(userLockedStake).div(totalStaked);
		}
		return 0;
			
	}

	
	function exit() public override {
		_exitAndUnlock(msg.sender);
	}

	/** @dev Sets all schemes that are part of the current LMC
	@param _lockSchemes the address of the staker
	 */
	function setLockSchemes(address[] memory _lockSchemes) public {
		lockSchemes = _lockSchemes;
	}

}