// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./interfaces/IERC20Detailed.sol";
import "./SafeERC20Detailed.sol";
import "./PercentageCalculator.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";

contract LockScheme is ReentrancyGuard {

    using SafeMath for uint256;
    using SafeERC20Detailed for IERC20Detailed;

    uint256 public lockEndBlock; // The period of lock for this contract
    uint256 public rampUpPeriod; // The period since the beginning of the lock that additions can be considered the same position.Might be 0 for the 0% lock periods
    uint256 public bonusPercent; // saved in thousands = ex 3% = 3000
    address public lmcContract; // The address of the lmc contract
    uint256 public forfeitedBonuses;

    struct UserInfo {
        uint256 balance; // IOU Balance for this lock contract
        uint256 accruedReward; // Reward accrued by an address from previous additions
        uint256 userBonus; // Stores the bonus for a user.
        uint256 lockInitialStakeBlock;
    }

    mapping(address => UserInfo) public userInfo;

    event Lock(address indexed _userAddress, uint256 _amountLocked, uint256 _additionalReward);
    event Exit(address indexed _userAddress, uint256 _userBonus);

    modifier onlyLmc() {
          require(
            msg.sender == lmcContract,
            "onlyLmc::Caller is not the LMC contract"
        );
        _;
    }

    constructor(
        uint256 _lockEndBlock,
        uint256 _rampUpPeriod,
        uint256 _bonusPercent,
        address _lmcContract
    ) public {
        lockEndBlock = _lockEndBlock;
        rampUpPeriod = _rampUpPeriod;
        bonusPercent = _bonusPercent;
        lmcContract = _lmcContract;
    }

    function lock(address _userAddress, uint256 _amountToLock) public onlyLmc {

        UserInfo storage user = userInfo[_userAddress];
        uint256 userLockStartBlock = user.lockInitialStakeBlock + rampUpPeriod;


        require(userLockStartBlock > block.number , "lock::The ramp up period has finished");

        if(user.lockInitialStakeBlock == 0) {
            user.lockInitialStakeBlock = block.number;
        }

        user.balance = user.balance.add(_amountToLock);

        emit Lock(_userAddress, _amountToLock, user.accruedReward);
    }

    function exit(address _userAddress) public onlyLmc {

        UserInfo storage user = userInfo[_userAddress];
        if(user.balance == 0) {
            return;
         
        }
        uint256 bonus = PercentageCalculator.div(user.accruedReward,bonusPercent);
         
        if (block.number >= lockEndBlock) {
             user.userBonus = bonus;
         } 

        if (block.number < lockEndBlock) {
            forfeitedBonuses = forfeitedBonuses.add(bonus);
         }

        user.accruedReward = 0;
        user.balance = 0;
    
        emit Exit(_userAddress, user.userBonus);
    }
        

    function updateUserAccruedRewards(address _userAddress, uint256 _rewards) public nonReentrant onlyLmc {
        UserInfo storage user = userInfo[_userAddress];
        if(user.balance > 0) {
        user.accruedReward = user.accruedReward.add(_rewards);
        }
    }

    function getUserBonus(address _userAddress) public view returns( uint256 ) {
        UserInfo storage user = userInfo[_userAddress];
        return user.userBonus;
    }

    function getUserAccruedReward(address _userAddress) public view returns( uint256 ) {
        UserInfo storage user = userInfo[_userAddress];
        return user.accruedReward;
    }

    function getUserLockedStake(address _userAddress) public view returns(uint256) {
        UserInfo storage user = userInfo[_userAddress];
        return user.balance;
    }

    function hasUserRampUpEnded(address _userAddress) public view returns(bool) {
        UserInfo storage user = userInfo[_userAddress];
        uint256 userLockStartBlock = user.lockInitialStakeBlock + rampUpPeriod;
        return userLockStartBlock < block.number;
    }
}
