// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../SafeERC20Detailed.sol";
import "./../interfaces/IERC20Detailed.sol";
import "./../RewardsPoolBase.sol";
import "./../TreasuryOperated.sol";

abstract contract TreasuryOperatedFeature is RewardsPoolBase, TreasuryOperated {

	address public externalRewardToken;

	function setExternalRewardToken(address _externalRewardToken) internal {
		require(externalRewardToken == address(0x0), "External reward token already set");
		require(_externalRewardToken != address(0x0), "External reward token should not be 0");
		externalRewardToken = _externalRewardToken;
	}

	function withdrawStake(uint256 amount) virtual override(TreasuryOperated) public onlyTreasury {
		stakingToken.safeTransfer(treasury, amount);
		TreasuryOperated.withdrawStake(amount);
	}

	function notifyExternalReward(uint256 reward) virtual public onlyTreasury {
		TreasuryOperated.notifyExternalReward(externalRewardToken, reward);
	}

	function claimExternalRewards(uint256 exitReward, uint256 totalExitReward) virtual internal {
		uint256 totalExternalReward = externalRewards[externalRewardToken];
		uint256 externalReward = exitReward.mul(totalExternalReward).div(totalExitReward);
		externalRewards[externalRewardToken] = externalRewards[externalRewardToken].sub(externalReward);
		IERC20Detailed(externalRewardToken).safeTransfer(msg.sender, externalReward);
		TreasuryOperated.claimExternalRewards();
	}

}