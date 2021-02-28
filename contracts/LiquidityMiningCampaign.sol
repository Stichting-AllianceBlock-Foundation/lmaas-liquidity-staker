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


contract LiquidityMiningCampaign is StakeTransferer, OnlyExitFeature {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	address[] lockSchemes;
	address rewarsToken;
	mapping(address => uint256) public userAccruedRewads;

	event StakedAndLocked(address indexed _userAddress, uint256 _tokenAmount, address _lockScheme);
	event ExitedAndUnlocked(address indexed _userAddress, address _lockScheme);
	event BonusTransferred(address indexed _userAddress, uint256 _bonusAmount);

		constructor(
		IERC20Detailed _stakingToken,
		uint256 _startBlock,
		uint256 _endBlock,
		address[] memory _rewardsTokens,
		uint256[] memory _rewardPerBlock,
		uint256 _stakeLimit
	) public RewardsPoolBase(_stakingToken, _startBlock, _endBlock, _rewardsTokens, _rewardPerBlock,_stakeLimit) {

		rewarsToken = _rewardsTokens[0];
	}

	function  stakeAndLock( uint256 _tokenAmount, address _lockScheme) external{
		_stakeAndLock(msg.sender,_tokenAmount, _lockScheme);

	}

	function _stakeAndLock(address _userAddress ,uint256 _tokenAmount, address _lockScheme) internal {
		require(_tokenAmount > 0, "stakeAndLock::Cannot stake 0");

		UserInfo storage user = userInfo[_userAddress];

		uint256 userRewards = 0;

		updateRewardMultipliers();
		updateUserAccruedReward(_userAddress);

		if(user.tokensOwed.length > 0) {
			userRewards = user.tokensOwed[0];
		}
	
		
		for (uint256 i = 0; i < lockSchemes.length; i++) {

			uint256 additionalRewards = calculateProportionalRewards(_userAddress, userRewards.sub(userAccruedRewads[_userAddress]), lockSchemes[i]);
			LockScheme(lockSchemes[i]).updateUserAccruedRewards(_userAddress, additionalRewards);
		}
		userAccruedRewads[_userAddress]	= userRewards;
		_stake(_tokenAmount, _userAddress, false);

		lockToScheme(_lockScheme,_userAddress, _tokenAmount);

		emit StakedAndLocked( _userAddress, _tokenAmount, _lockScheme);
	}

	function lockToScheme(address _lockScheme, address _userAddress, uint256  _tokenAmount) internal nonReentrant {
		LockScheme(_lockScheme).lock(_userAddress, _tokenAmount );
	}

	function exitAndUnlock() public nonReentrant {
			_exitAndUnlock(msg.sender);
	}

	function _exitAndUnlock(address _userAddress) internal {
			UserInfo storage user = userInfo[_userAddress];
			
			
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
				IERC20Detailed(rewarsToken).safeTransfer(address(msg.sender), bonus);
				
			}
			_exit(_userAddress);

			// emit ExitedAndUnlocked(_userAddress);
	}


	function setReceiverWhitelisted(address receiver, bool whitelisted) override(StakeTransferer) onlyFactory public {
		StakeTransferer.setReceiverWhitelisted(receiver, whitelisted);
	}

	/** @dev exits the current campaign and trasnfers the stake to another whitelisted campaign
		@param transferTo address of the receiver to transfer the stake to
	 */
	function exitAndTransfer(address transferTo, address _lockScheme) virtual public onlyWhitelistedReceiver(transferTo) nonReentrant {
		UserInfo storage user = userInfo[msg.sender];
		
		updateRewardMultipliers(); // Update the accumulated multipliers for everyone

		if (user.amountStaked == 0) {
			return;
		}

		updateUserAccruedReward(msg.sender); // Update the accrued reward for this specific user

		uint256 bonus = LockScheme(_lockScheme).exit(msg.sender);
		IERC20Detailed(rewarsToken).safeTransfer(address(msg.sender), bonus);
		_claim(msg.sender);
		stakingToken.safeApprove(transferTo, user.amountStaked);

		StakeReceiver(transferTo).delegateStake(msg.sender, user.amountStaked);

		totalStaked = totalStaked.sub(user.amountStaked);
		user.amountStaked = 0;

		for (uint256 i = 0; i < rewardsTokens.length; i++) {
			user.tokensOwed[i] = 0;
			user.rewardDebt[i] = 0;
		}
	}

	// function exitAndStake(address, _stakePool) public nonReentrant {

	// 		_exitAndStake(msg.sender, _stakePool);
	// }

	// function _exitAndStake(address _userAddress,address _stakePool) public onlyWhitelistedReceiver(_stakePool) nonReentrant{
			
	// 	UserInfo storage user = userInfo[_userAddress];
		
	// 	if (user.amountStaked == 0) {
	// 		return;
	// 	}

	// 	updateRewardMultipliers();
	// 	updateUserAccruedReward(_userAddress);
	// 		//todo check how to secure that 0 is the albt
	// 		uint256 finalRewards = user.tokensOwed[0].sub(userAccruedRewads[_userAddress]);
	// 		uint256 userBonus;
	// 		for (uint256 i = 0; i < lockSchemes.length; i++) {

	// 			uint256 additionalRewards = calculateProportionalRewards(_userAddress, finalRewards, lockSchemes[i]);
	// 			if(additionalRewards > 0) {

	// 			LockScheme(lockSchemes[i]).updateUserAccruedRewards(_userAddress, additionalRewards);
	// 			}
	// 			userBonus = userBonus.add(LockScheme(lockSchemes[i]).getUserBonus(_userAddress));
	// 		}

	// 	LockScheme(_lockScheme).exit(_userAddress);

	// 	uint256 amountToStake = user.tokensOwed[0].add(userBonus);
	// 	_exit(_userAddress);

	// 	stakingToken.safeApprove(_stakePool, amountToStake);

	// 	StakeReceiver(_stakePool).delegateStake(msg.sender, amountToStake);
	// }


	function exit() public override {
		revert("exit:cannot exit from this contract. Only exit and Unlock.");
	}

	// function stake() public override {
	// 	revert("stake:cannot stake from this contract. Only stake and lock.");
	// }

	function checkBonus(address _lockScheme, address _userAddress) public view returns(uint256 ) {
		uint256 userBonus =  LockScheme(_lockScheme).getUserBonus(_userAddress);

		return userBonus;
	}

	function calculateProportionalRewards(address _userAddress, uint256 _accruedRewards, address _lockScheme) internal returns (uint256) {
			
			uint256 userLockedStake = LockScheme(_lockScheme).getUserLockedStake(_userAddress);

			if(totalStaked > 0) {
				return _accruedRewards.mul(userLockedStake).div(totalStaked);
			}
			return 0;
			
	}

	function setLockSchemes(address[] memory _lockSchemes) public {
		lockSchemes = _lockSchemes;
	}

}