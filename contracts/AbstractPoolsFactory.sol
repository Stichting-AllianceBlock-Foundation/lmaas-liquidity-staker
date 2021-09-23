// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./interfaces/IRewardsPoolBase.sol";
import "./SafeERC20Detailed.sol";
import "./interfaces/IERC20Detailed.sol";

abstract contract AbstractPoolsFactory {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	/** @dev all rewards pools
	 */
	address[] public rewardsPools;
	address public owner;
	address internal pendingOwner;

	event OwnershipTransferProposed(address indexed _oldOwner, address indexed _newOwner);
	event OwnershipTransferred(address indexed _newOwner);
	event RewardsWithdrawn(address rewardsToken, uint256 amount);

	constructor() public {
		owner = msg.sender;
	}

	function onlyOwner(address messageSender) public view { 
		require(messageSender == owner, "APF:Err01");
	}

	function transferOwnership(address newOwner) public {
		onlyOwner(msg.sender);
		require(newOwner != address(0x0), "APF:Err02");
		pendingOwner = newOwner;
		emit OwnershipTransferProposed(msg.sender, owner);
	}

	function acceptOwnership() public {
		require(msg.sender == pendingOwner, "APR:Err03");

		owner = pendingOwner;
		emit OwnershipTransferred(owner);
	}

	/** @dev Returns the total number of rewards pools.
	 */
	function getRewardsPoolNumber() public view returns (uint256) {
		return rewardsPools.length;
	}

	/** @dev Triggers the withdrawal of LP rewards from the rewards pool contract to the given recipient address
	 * @param rewardsPoolAddress The address of the token being staked
	 * @param recipient The address to whom the rewards will be trasferred
	 * @param lpTokenContract The address of the rewards contract
	 */
	function withdrawLPRewards(
		address rewardsPoolAddress,
		address recipient,
		address lpTokenContract
	) external  {
		onlyOwner(msg.sender);
		require(
			rewardsPoolAddress != address(0),
			"APF:Err04"
		);
		IRewardsPoolBase pool = IRewardsPoolBase(rewardsPoolAddress);
		pool.withdrawLPRewards(recipient, lpTokenContract);
	}

	/** @dev Function to withdraw any rewards leftover, mainly from extend with lower rate.
	 * @param _rewardsToken The address of the rewards to be withdrawn.
	 */
	function withdrawRewardsLeftovers(address _rewardsToken) external  {
		onlyOwner(msg.sender);
		uint256 contractBalance = IERC20Detailed(_rewardsToken).balanceOf(address(this));
		IERC20Detailed(_rewardsToken).safeTransfer(msg.sender,contractBalance );

		emit RewardsWithdrawn(_rewardsToken,contractBalance);
	}
}
