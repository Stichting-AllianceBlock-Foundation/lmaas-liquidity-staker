// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC20Detailed.sol";
import "./SafeERC20Detailed.sol";
import "./RewardsPoolBase.sol";
import "./LockScheme.sol";


contract LiquidityMiningCampaign is RewardsPoolBase   {
	using SafeMath for uint256;
    using SafeERC20Detailed for IERC20Detailed;

	address[] lockSchemes;
	mapping(address => uint256) userAccruedRewads;

	event StakedAndLocked(address indexed _userAddress, uint256 _tokenAmount, address _lockScheme);
	event ExitedAndUnlocked(address indexed _userAddress, address _lockScheme);
	event BonusTransferred(address indexed _userAddress, uint256[] _bonusAmount);

		constructor(
        IERC20Detailed _stakingToken,
        uint256 _startBlock,
        uint256 _endBlock,
        address[] memory _rewardsTokens,
        uint256[] memory _rewardPerBlock,
		uint256 _stakeLimit,
		address[] _lockSchemes
    ) public RewardsPoolBase(_stakingToken, _startBlock, _endBlock, _rewardsTokens, _rewardPerBlock,_stakeLimit) {

		lockSchemes = _lockSchemes;
	}


	function  stakeAndLock( uint256 _tokenAmount, address _lockScheme) public nonReentrant{
		_stakeAndLock(msg.sender,_tokenAmount, _lockScheme);

	}

	function _stakeAndLock(address _userAddress ,uint256 _tokenAmount, address _lockScheme) internal {
		require(_tokenAmount > 0, "stakeAndLock::Cannot stake 0");
		uint256 rampUpBlock = LockScheme(_lockScheme).rampUpBlock();

		require(rampUpBlock > block.number, "stakeAndLock::The ramp up period has finished");
		UserInfo storage user = userInfo[_userAddress];
	
		userAccruedRewads[_userAddress]	= userAccruedRewads[_userAddress].add(user.tokensOwed);
		for (uint256 index = 0; index < lockSchemes.length; index++) {

			uint256 additionalRewards = calculateProportionalRewards(msg.sender, userAccruedRewads[_userAddress], _lockScheme[i]);
			LockScheme( _lockScheme[i]).updateUserAccruedRewards(_userAddress, additionalRewards);
		}

		stakingToken.safeApprove(_lockScheme, _tokenAmount);
		_stake(_tokenAmount, _userAddress, false);


		lockToScheme(_lockScheme,address(_userAddress), _tokenAmount, user.tokensOwed);


		emit StakedAndLocked( msg.sender, _tokenAmount, _lockScheme);
	}

	function lockToScheme(address _lockScheme, address _userAddress, uint256  _tokenAmount, uint256[] memory _additionalRewards) internal nonReentrant {
		LockScheme(_lockScheme).lock(_userAddress, _tokenAmount, _additionalRewards );
	}

	function exitAndUnlock() public nonReentrant {


		for (uint256 index = 0; index < lockSchemes.length; index++) {
			_exitAndUnlock(msg.sender, lockSchemes[i]);
		}
		
	}

	function _exitAndUnlock(address _userAddress ,address _lockScheme) internal {
			UserInfo storage user = userInfo[msg.sender];

			uint256 finalRewards = user.tokensOwed.sub(userAccruedRewads[_userAddress]);
			for (uint256 index = 0; index < lockSchemes.length; index++) {

				uint256 additionalRewards = calculateProportionalRewards(msg.sender, finalRewards, _lockScheme[i]);
				LockScheme( _lockScheme[i]).updateUserAccruedRewards(_userAddress, additionalRewards);
		}

			updateRewardMultipliers();
        	updateUserAccruedReward(msg.sender);

			LockScheme(_lockScheme).exit(msg.sender, user.tokensOwed);
			claimBonus(_lockScheme, msg.sender);
			_exit(msg.sender);

			emit ExitedAndUnlocked(msg.sender, _lockScheme);
	}

	function migrateToLMC(address _newLmc, address _newLockScheme, address _currentLockScheme, uint256 _tokenAmount) public {

			_exitAndUnlock(msg.sender, _currentLockScheme);
			LiquidityMiningCampaign(_newLmc).stakeAndLock(_tokenAmount,_newLockScheme );
	}


	function exit() public override {
		revert("exit:cannot exit from this contract. Only exit and Unlock.");
	}

	function claim() public override {
		revert("claim:cannot claim from this contract. Only exit and Unlock.");
	}

	function checkBonus(address _lockScheme, address _userAddress) public view returns(uint256[] memory) {
		uint256[] memory userBonuses =  LockScheme(_lockScheme).getUserBonuses(_userAddress);

		return userBonuses;
	}

	function claimBonus(address _lockScheme, address _userAddress) internal {

		uint256[] memory userBonuses = checkBonus(_lockScheme, _userAddress);

		for (uint256 i = 0; i < rewardsTokens.length; i++) {

			IERC20Detailed(rewardsTokens[i]).safeTransfer(address(msg.sender), userBonuses[i]);

			emit BonusTransferred(msg.sender,userBonuses);
		}
	}

	function calculateProportionalRewards(address _userAddress, uint256 _accruedRewards, address _lockScheme) internal returns (uint256) {
			
			uint256 userStakedBalance = LockScheme(_lockScheme).getUserStakedBalance(_userAddress);

			uint256 ratio = userStakedBalance.div(totalStaked);
			return _accruedRewards.mul(ratio);
	}

}