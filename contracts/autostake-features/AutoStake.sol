// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./../interfaces/IRewardsPoolBase.sol";
import "./../interfaces/IERC20Detailed.sol";
import "./../SafeERC20Detailed.sol";
import "./../StakeLock.sol";
import "./../ThrottledExit.sol";

// Based on ideas here: https://github.com/harvest-finance/harvest/blob/7a455967e40e980d4cfb2115bd000fbd6b201cc1/contracts/AutoStake.sol

contract AutoStake is ReentrancyGuard, StakeLock, ThrottledExit, Ownable {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	IRewardsPoolBase public rewardPool;
	IERC20Detailed public immutable stakingToken;
	address public immutable factory;
	uint256 public constant unit = 1e18;
	uint256 public valuePerShare = unit;
	uint256 public totalShares; 
	uint256 public totalValue;
	uint256 public exitStake;
	uint256 public contractStakeLimit;
	uint256 public totalAmountStaked;
	mapping(address => uint256) public share;
	mapping(address => uint256) public userStakedAmount;

	event Staked(address indexed user, uint256 amount, uint256 sharesIssued, uint256 oldShareVaule, uint256 newShareValue, uint256 balanceOf);

	constructor(address token, uint256 _throttleRoundBlocks, uint256 _throttleRoundCap, uint256 stakeEnd, uint256 _contractStakeLimit) StakeLock(stakeEnd) public {
		factory = msg.sender;
		stakingToken = IERC20Detailed(token);
		contractStakeLimit = _contractStakeLimit;
		setThrottleParams(_throttleRoundBlocks, _throttleRoundCap, stakeEnd);
	}

	function setPool(address pool) public onlyOwner {
		require(address(rewardPool) == address(0x0), "AS:Err01");
		rewardPool = IRewardsPoolBase(pool);
	}


	function onlyFactory(address sender) public view {
		require(
			msg.sender == factory,
			"AS:Err02"
		);
	}

	function onlyUnderContractStakeLimit(uint256 _stakeAmount) public {
		require(totalAmountStaked.add(_stakeAmount) <= contractStakeLimit, "AS:Err03");
	}

	function refreshAutoStake() external {
		exitRewardPool();
		updateValuePerShare();
		restakeIntoRewardPool();
	}

	function stake(uint256 amount)  public virtual {
		onlyUnderContractStakeLimit(amount);
		_stake(amount, msg.sender, true);
	}

	function _stake(uint256 amount, address staker, bool chargeStaker) internal nonReentrant {
		exitRewardPool();
		updateValuePerShare();

		// now we can issue shares
		stakingToken.safeTransferFrom(chargeStaker ? staker : msg.sender, address(this), amount);
		userStakedAmount[staker] = userStakedAmount[staker].add(amount);
		totalAmountStaked = totalAmountStaked.add(amount);
		uint256 sharesToIssue = amount.mul(unit).div(valuePerShare);
		totalShares = totalShares.add(sharesToIssue);
		share[staker] = share[staker].add(sharesToIssue);

		uint256 oldValuePerShare = valuePerShare;

		// Rate needs to be updated here, otherwise the valuePerShare would be incorrect.
		updateValuePerShare();

		emit Staked(staker, amount, sharesToIssue, oldValuePerShare, valuePerShare, balanceOf(staker));

		restakeIntoRewardPool();
	}

	function exit() public virtual nonReentrant {
		onlyUnlocked();
		exitRewardPool();
		updateValuePerShare();


		uint256 userStake = balanceOf(msg.sender);

		if(userStake == 0) {
			return;
		}

		// now we can transfer funds and burn shares
		initiateExit(userStake, 0, new uint256[](0));

		totalShares = totalShares.sub(share[msg.sender]);
		totalAmountStaked = totalAmountStaked.sub(userStakedAmount[msg.sender]);
		share[msg.sender] = 0;
		userStakedAmount[msg.sender] = 0;
		exitStake = exitStake.add(userStake);

		updateValuePerShare();
	}

	function completeExit() virtual public  nonReentrant {
		onlyUnlocked();
		ExitInfo storage info = exitInfo[msg.sender];
		exitStake = exitStake.sub(info.exitStake);

		finalizeExit(address(stakingToken), new address[](0));

		updateValuePerShare();
	}

	function balanceOf(address who) public view returns(uint256) {
		return valuePerShare.mul(share[who]).div(unit);
	}

	function updateValuePerShare() internal {
		if (totalShares == 0) {
			totalValue = 0;
			valuePerShare = unit;
			return;
		}
		totalValue = stakingToken.balanceOf(address(this)).sub(exitStake);
		valuePerShare = totalValue.mul(unit).div(totalShares);
	}

	function exitRewardPool() internal {
		if(rewardPool.balanceOf(address(this)) != 0){
			// exit and do accounting first
			rewardPool.exit();
		}
	}

	function restakeIntoRewardPool() internal {
		if(stakingToken.balanceOf(address(this)) != 0){
			// stake back to the pool

			uint256 balanceToRestake = stakingToken.balanceOf(address(this)).sub(exitStake);

			stakingToken.safeApprove(address(rewardPool), 0);
			stakingToken.safeApprove(address(rewardPool), balanceToRestake);
			rewardPool.stake(balanceToRestake);
		}
	}

	function getUserAccumulatedRewards(address who) public view returns(uint256) {

		uint256 balance = balanceOf(who);
		if (userStakedAmount[who] > balance ) {
			return 0;
		}
		return balance.sub(userStakedAmount[who]);
	}

}