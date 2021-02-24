// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC20Detailed.sol";
import "./SafeERC20Detailed.sol";
import "./RewardsPoolBase.sol";
import "./LockScheme.sol";
import "./StakeTransferer";
import "./../StakeReceiver.sol";


contract LiquidityMiningCampaign is RewardsPoolBase, StakeTransferer {
	using SafeMath for uint256;
    using SafeERC20Detailed for IERC20Detailed;

	address[] lockSchemes;
	address rewarsToken;
	mapping(address => uint256) userAccruedRewads;

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
		require(!LockScheme(_lockScheme).hasUserRampUpEnded(_userAddress), "stakeAndLock::The ramp up period has finished");

		UserInfo storage user = userInfo[_userAddress];

		uint256 userRewards = 0;

		if(user.tokensOwed.length > 0) {
			userRewards = user.tokensOwed[0];
		}
	
		userAccruedRewads[_userAddress]	= userAccruedRewads[_userAddress].add(userRewards);
		for (uint256 i = 0; i < lockSchemes.length; i++) {

			uint256 additionalRewards = calculateProportionalRewards(_userAddress, userAccruedRewads[_userAddress], lockSchemes[i]);
			LockScheme(lockSchemes[i]).updateUserAccruedRewards(_userAddress, additionalRewards);
		}

		stakingToken.safeApprove(_lockScheme, _tokenAmount);
		_stake(_tokenAmount, _userAddress, false);

		lockToScheme(_lockScheme,address(_userAddress), _tokenAmount, userRewards);

		emit StakedAndLocked( _userAddress, _tokenAmount, _lockScheme);
	}

	function lockToScheme(address _lockScheme, address _userAddress, uint256  _tokenAmount, uint256 _additionalRewards) internal nonReentrant {
		LockScheme(_lockScheme).lock(_userAddress, _tokenAmount, _additionalRewards );
	}

	function exitAndUnlock() public nonReentrant {


		for (uint256 i = 0; i < lockSchemes.length; i++) {
			_exitAndUnlock(msg.sender, lockSchemes[i]);
		}
		
	}

	function _exitAndUnlock(address _userAddress ,address _lockScheme) internal {
			UserInfo storage user = userInfo[_userAddress];
			
			
			updateRewardMultipliers();
        	updateUserAccruedReward(_userAddress);
			//todo check how to secure that 0 is the albt
			uint256 finalRewards = user.tokensOwed[0].sub(userAccruedRewads[_userAddress]);
		
			for (uint256 i = 0; i < lockSchemes.length; i++) {

				uint256 additionalRewards = calculateProportionalRewards(_userAddress, finalRewards, lockSchemes[i]);
				if(additionalRewards > 0) {

				LockScheme( lockSchemes[i]).updateUserAccruedRewards(_userAddress, additionalRewards);
				}
		}

			LockScheme(_lockScheme).exit(_userAddress);
			claimBonus(_lockScheme, _userAddress);
			_exit(_userAddress);

			emit ExitedAndUnlocked(_userAddress, _lockScheme);
	}


	function setReceiverWhitelisted(address receiver, bool whitelisted) override(StakeTransferer) onlyFactory public {
		StakeTransferer.setReceiverWhitelisted(receiver, whitelisted);
	}

	/** @dev exits the current campaign and trasnfers the stake to another whitelisted campaign
		@param transferTo address of the receiver to transfer the stake to
	 */
	function exitAndTransfer(address transferTo) virtual public override onlyWhitelistedReceiver(transferTo) nonReentrant {
		UserInfo storage user = userInfo[msg.sender];
		
		updateRewardMultipliers(); // Update the accumulated multipliers for everyone

		if (user.amountStaked == 0) {
			return;
		}

		updateUserAccruedReward(msg.sender); // Update the accrued reward for this specific user

		LockScheme(_lockScheme).exit(_userAddress);
		claimBonus(_lockScheme, _userAddress);
		_claim(_userAddress);
		stakingToken.safeApprove(transferTo, user.amountStaked);

		StakeReceiver(transferTo).delegateStake(msg.sender, user.amountStaked);

		totalStaked = totalStaked.sub(user.amountStaked);
		user.amountStaked = 0;

		for (uint256 i = 0; i < rewardsTokens.length; i++) {
			user.tokensOwed[i] = 0;
			user.rewardDebt[i] = 0;
		}
	}

	
	function exitAndStake(address _stakePool) public onlyWhitelistedReceiver(transferTo) nonReentrant{
			
		UserInfo storage user = userInfo[msg.sender];
		
		updateRewardMultipliers(); // Update the accumulated multipliers for everyone

		if (user.amountStaked == 0) {
			return;
		}

		updateUserAccruedReward(msg.sender); // Update the accrued reward for this specific user
		
		updateRewardMultipliers();
        updateUserAccruedReward(_userAddress);
			//todo check how to secure that 0 is the albt
			uint256 finalRewards = user.tokensOwed[0].sub(userAccruedRewads[_userAddress]);
			uint256 userBonus ;
			for (uint256 i = 0; i < lockSchemes.length; i++) {

				uint256 additionalRewards = calculateProportionalRewards(_userAddress, finalRewards, lockSchemes[i]);
				if(additionalRewards > 0) {

				LockScheme(lockSchemes[i]).updateUserAccruedRewards(_userAddress, additionalRewards);
				}
				userBonus = userBonuse.add(LockScheme(lockSchemes[i]).getUserBonus(_userAddress));
			}

		LockScheme(_lockScheme).exit(_userAddress);

		uint256 amountToStake = getUserAccumulatedReward(_userAddress, 0).add(userBonus);
		_exit(_userAddress);

		stakingToken.safeApprove(transferTo, amountToStake);

		StakeReceiver(transferTo).delegateStake(_userAddress, amountToStake);

	}


	function exit() public override {
		revert("exit:cannot exit from this contract. Only exit and Unlock.");
	}

	function claim() public override {
		revert("claim:cannot claim from this contract. Only exit and Unlock.");
	}

	function checkBonus(address _lockScheme, address _userAddress) public view returns(uint256 ) {
		uint256 userBonus =  LockScheme(_lockScheme).getUserBonus(_userAddress);

		return userBonus;
	}

	function claimBonus(address _lockScheme, address _userAddress) internal {

		uint256 userBonus = checkBonus(_lockScheme, _userAddress);

		IERC20Detailed(rewarsToken).safeTransfer(address(msg.sender), userBonus);

		emit BonusTransferred(msg.sender, userBonus);
	
	}

	function calculateProportionalRewards(address _userAddress, uint256 _accruedRewards, address _lockScheme) internal returns (uint256) {
			
			uint256 userStakedBalance = LockScheme(_lockScheme).getUserStakedBalance(_userAddress);

			if(totalStaked > 0) {
				uint256 ratio = userStakedBalance.div(totalStaked);
				return _accruedRewards.mul(ratio);
			}
			return 0;
			
	}

	function setLockSchemes(address[] memory _lockSchemes) public {
		lockSchemes = _lockSchemes;
	}

}