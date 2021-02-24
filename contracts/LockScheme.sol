// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./interfaces/IERC20Detailed.sol";
import "./SafeERC20Detailed.sol";
import "./PercentageCalculator.sol";

contract LockScheme {

    using SafeMath for uint256;
    using SafeERC20Detailed for IERC20Detailed;

    // uint256 public lockBlock; // The period of lock for this contract
    uint256 public rampUpPeriod; // The period since the beginning of the lock that additions can be considered the same position.Might be 0 for the 0% lock periods
    address public stakingToken;
    uint256 public bonusPercent; // saved in thousands = ex 3% = 3000
    address public lmcContract; // The address of the lmc contract
    uint256 public forfeitedBonuses;

    struct UserInfo {
        uint256 balance; // IOU Balance for this lock contract
        uint256 accruedReward; // Reward accrued by an address from previous additions
        uint256 userBonuses; // Stores the bonus for a user.
        uint256 lockInitialStakeBlock;
    }

    mapping(address => UserInfo) public userInfo;

    event Lock(address indexed _userAddress, uint256 _amountLocked, uint256[] _additionalReward);
    event Exit(address indexed _userAddress, uint256[] _userBonus);

    modifier onlyLmc() {
          require(
            msg.sender == lmcContract,
            "onlyLmc::Caller is not the LMC contract"
        );
        _;
    }

    constructor(
        uint256 _lockBlock,
        uint256 _rampUpBlock,
        uint256 _bonusPercent,
        address _lmcContract,
        address _stakingToken
    ) public {
        lockBlock = _lockBlock;
        rampUpBlock = _rampUpBlock;
        bonusPercent = _bonusPercent;
        lmcContract = _lmcContract;
        stakingToken = _stakingToken;
    }

    function lock(address _userAddress, uint256 _amountToLock, uint256[] memory _additionalAccruedRewards) public onlyLmc {

        UserInfo storage user = userInfo[_userAddress];
        uint256 userLockStartBlock = user.lockInitialStakeBlock + rampUpPeriod;


        require(userLockStartBlock > block.number , "lock::The ramp up period has finished");

        if(user.lockInitialStakeBlock == 0) {
            user.lockInitialStakeBlock = block.number;
        }

        IERC20Detailed(stakingToken).safeTransferFrom(lmcContract, address(this), _amountToLock);

        user.balance = user.balance.add(_amountToLock);
        user.accruedReward = _additionalAccruedRewards;

        emit Lock(_userAddress, _amountToLock, user.accruedReward);
    }

    function exit(address _userAddress, uint256[] memory _additionalAccruedReward) public onlyLmc {

        UserInfo storage user = userInfo[_userAddress];
        if(user.balance > 0) {
        
            uint256 bonus = PercentageCalculator.div(user.accruedReward,bonusPercent);
        
            if (block.number >= lockBlock) {
                user.userBonuses = bonus;
            } 

            if (block.number < lockBlock) {
                forfeitedBonuses = forfeitedBonuses.add(bonus);
            }

             user.accruedReward = 0;
        }
        uint256 userBalance = user.balance;
        user.balance = 0;
       
        IERC20Detailed(stakingToken).safeTransfer(lmcContract, userBalance);

        emit Exit(_userAddress, user.userBonuses);
       }
    }

    function updateUserAccruedRewards(address _userAddress, uint256 _rewards) public onlyLmc {
        UserInfo storage user = userInfo[_userAddress];
        if(user.balance > 0) {
         user.accruedReward.add(_rewards);
        }
    }

    function getUserBonuses(address _userAddress) public view returns( uint256[] memory) {
        UserInfo storage user = userInfo[_userAddress];
        return user.userBonuses;
    }

    function getUserAccruedReward(address _userAddress) public view returns( uint256[] memory) {
        UserInfo storage user = userInfo[_userAddress];
        return user.accruedReward;
    }

    function getUserStakedBalance(address _userAddress) public view returns(uint256) {
        UserInfo storage user = userInfo[_userAddress];
        return user.balance;
    }
}
