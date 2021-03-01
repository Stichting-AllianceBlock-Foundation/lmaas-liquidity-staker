// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../interfaces/IERC20Detailed.sol";
import "./../SafeERC20Detailed.sol";
import "./../StakeMigrationer.sol";
import "./../RewardsPoolBase.sol";
import "./../LockScheme.sol";

abstract contract StakeMigrationerFeature is RewardsPoolBase, StakeMigrationer {
	using SafeERC20Detailed for IERC20Detailed;

	address[] lockSchemes;
	mapping(address => uint256) public userAccruedRewads;
	event StakedAndLocked(address indexed _userAddress, uint256 _tokenAmount, address _lockScheme);

	function _stakeAndLock(address _userAddress ,uint256 _tokenAmount, address _lockScheme, bool chargeStaker) virtual override public {
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
		_stake(_tokenAmount, _userAddress, chargeStaker);

		LockScheme(_lockScheme).lock(_userAddress, _tokenAmount);

		emit StakedAndLocked( _userAddress, _tokenAmount, _lockScheme);
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


}