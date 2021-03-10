// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./SafeERC20Detailed.sol";
import "./interfaces/IERC20Detailed.sol";

abstract contract TreasuryOperated {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	mapping(address => uint256) public externalRewards;
	address public immutable treasury;

	event StakeWithdrawn(uint256 amount);
	event ExternalRewardsAdded(address indexed from ,address token, uint256 reward);
	event ExternalRewardsClaimed(address receiver);

	modifier onlyTreasury() {
		require(msg.sender == treasury, "onlyTreasury::Not called by the treasury");
		_;
	}

	constructor(address _treasury) public {
		require(_treasury != address(0x0), "setTreasury::Treasury cannot be 0");
		treasury = _treasury;
	}

	function withdrawStake(uint256 amount) virtual public onlyTreasury {
		emit StakeWithdrawn(amount);
	}

	function notifyExternalReward(address token, uint256 reward) virtual internal {
		IERC20Detailed(token).safeTransferFrom(msg.sender, address(this), reward);
		externalRewards[token] = externalRewards[token].add(reward);
		emit ExternalRewardsAdded(msg.sender, token, reward);
	}

	function claimExternalRewards() virtual internal {
		emit ExternalRewardsClaimed(msg.sender);
	}

}