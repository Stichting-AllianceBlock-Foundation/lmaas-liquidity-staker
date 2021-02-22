// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "./../interfaces/IRewardsPoolBase.sol";
import "./../interfaces/IERC20Detailed.sol";
import "./../SafeERC20Detailed.sol";
import "./../StakeLock.sol";
import "./../ThrottledExit.sol";

// Based on ideas here: https://github.com/harvest-finance/harvest/blob/7a455967e40e980d4cfb2115bd000fbd6b201cc1/contracts/AutoStake.sol

contract AutoStake is ReentrancyGuard, StakeLock, ThrottledExit {
	using SafeMath for uint256;
	using SafeERC20Detailed for IERC20Detailed;

	IRewardsPoolBase public rewardPool;
	IERC20Detailed public stakingToken;
	address public factory;
	uint256 public unit = 1e18;
	uint256 public valuePerShare = unit;
	uint256 public totalShares = 0;
	uint256 public totalValue = 0;
	uint256 public exitStake = 0;
	mapping(address => uint256) public share;

	event Staked(address indexed user, uint256 amount, uint256 sharesIssued, uint256 oldShareVaule, uint256 newShareValue, uint256 balanceOf);

	constructor(address token, uint256 _throttleRoundBlocks, uint256 _throttleRoundCap, uint256 stakeEnd) public {
		factory = msg.sender;
		stakingToken = IERC20Detailed(token);
		setLockEnd(stakeEnd);
		setThrottleParams(_throttleRoundBlocks, _throttleRoundCap, stakeEnd);
	}

	function setPool(address pool) public {
		require(address(rewardPool) == address(0x0), "Reward pool already set");
		rewardPool = IRewardsPoolBase(pool);
	}

	modifier onlyFactory() {
        require(
            msg.sender == factory,
            "Caller is not the Factory contract"
        );
        _;
    }

	function refreshAutoStake() external {
		exitRewardPool();
		updateValuePerShare();
		restakeIntoRewardPool();
	}

	function stake(uint256 amount) public virtual {
		_stake(amount, msg.sender, true);
	}

	function _stake(uint256 amount, address staker, bool chargeStaker) internal nonReentrant {
		exitRewardPool();
		updateValuePerShare();

		// now we can issue shares
		stakingToken.safeTransferFrom(chargeStaker ? staker : msg.sender, address(this), amount);
		uint256 sharesToIssue = amount.mul(unit).div(valuePerShare);
		totalShares = totalShares.add(sharesToIssue);
		share[staker] = share[staker].add(sharesToIssue);

		uint256 oldValuePerShare = valuePerShare;

		// Rate needs to be updated here, otherwise the valuePerShare would be incorrect.
		updateValuePerShare();

		emit Staked(staker, amount, sharesToIssue, oldValuePerShare, valuePerShare, balanceOf(staker));

		restakeIntoRewardPool();
	}

	function exit() public virtual onlyUnlocked nonReentrant {
		exitRewardPool();
		updateValuePerShare();


		uint256 userStake = balanceOf(msg.sender);
		if(userStake == 0) {
			return;
		}

		// now we can transfer funds and burn shares

		initiateExit(userStake, new address[](0), new uint256[](0));

		totalShares = totalShares.sub(share[msg.sender]);
		share[msg.sender] = 0;
		exitStake = exitStake.add(userStake);

		updateValuePerShare();
	}

	function completeExit() virtual public onlyUnlocked nonReentrant {
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
			stakingToken.safeApprove(address(rewardPool), 0);
			stakingToken.safeApprove(address(rewardPool), stakingToken.balanceOf(address(this)));
			rewardPool.stake(stakingToken.balanceOf(address(this)));
		}
	}

}