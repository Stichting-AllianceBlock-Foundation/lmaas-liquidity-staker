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


	event BonusTransferred(address indexed _userAddress, uint256[] _bonusAmount);

		constructor(
        IERC20Detailed _stakingToken,
        uint256 _startBlock,
        uint256 _endBlock,
        address[] memory _rewardsTokens,
        uint256[] memory _rewardPerBlock,
		uint256 _stakeLimit
    ) public RewardsPoolBase(_stakingToken, _startBlock, _endBlock, _rewardsTokens, _rewardPerBlock,_stakeLimit) {

	}


	function stakeAndLock(uint256 _tokenAmount, address _lockScheme) public {
		require(_tokenAmount > 0, "stakeAndLock::Cannot stake 0");
		uint256 rampUpBlock = LockScheme(_lockScheme).rampUpBlock();

		require(rampUpBlock > block.number, "stakeAndLock::The ramp up period has finished");
		UserInfo storage user = userInfo[msg.sender];
		stakingToken.safeApprove(_lockScheme, _tokenAmount);
		_stake(_tokenAmount, msg.sender, false);
		lockToScheme(_lockScheme,address(msg.sender), _tokenAmount, user.tokensOwed);
	}

	function lockToScheme(address _lockScheme, address _userAddress, uint256  _tokenAmount, uint256[] memory _additionalRewards) internal nonReentrant {
		LockScheme(_lockScheme).lock(_userAddress, _tokenAmount, _additionalRewards );
	}


	function exitAndUnlock(address _lockScheme) public nonReentrant {
			UserInfo storage user = userInfo[msg.sender];
			
			updateRewardMultipliers();
        	updateUserAccruedReward(msg.sender);

			LockScheme(_lockScheme).exit(msg.sender, user.tokensOwed);
			claimBonus(_lockScheme, msg.sender);
			_exit(msg.sender);
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

}