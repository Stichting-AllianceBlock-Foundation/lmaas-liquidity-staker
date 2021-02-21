// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./interfaces/IERC20Detailed.sol";
import "./SafeERC20Detailed.sol";
import "./PercentageCalculator.sol";

contract LockScheme {
    uint256 public lockBlock; // The period of lock for this contract
    uint256 public rampUpBlock; // The period since the beginning of the lock that additions can be considered the same position.Might be 0 for the 0% lock periods
    address public stakingToken;
    uint256 public bonusPercent; // saved in thousands = ex 3% = 3000
    address public lmcContract; // The address of the lmc contract

    mapping(address=>uint256) balances; // IOU Balance for this lock contract
    mapping(address=>uint256) accruedReward; // Reward accrued by an address from previous additions
    mapping(address=>uint256) lockStartBlock;
    mapping(address=>uint256) userBonuses; // Stores the bonus for each user


    event Lock(address indexed _userAddress, uint256 _amountLocked, uint256 _additionalReward);
    event Exit(address indexed _userAddress, uint256 _userBonus);
    // onlyLmc() // Ensures a function can only be triggered by the LMC contract

    modifier onlyLmc() {
          require(
            msg.sender == lmcContract,
            "Caller is not the LMC contract"
        );
        _;
    }

    constructor(
        uint256 _lockBlock,
        uint256 _rampUpBlock,
        uint256 _bonusPercent,
        address _lmcContract
    ) {
        lockBlock = _lockBlock;
        rampUpBlock = _rampUpBlock;
        bonusPercent = _bonusPercent;
        lmcContract = _lmcContract;
    }

    function lock(address _userAddress, uint256 _amountToLock, uint256, _additionalAccruedRewards) public onlyLmc {
        require(block.number < rampUpBlock, "LockScheme::The ramp up period has finished");


        IERC20Detailed(stakingToken).transferFrom(lmcContract, address(this), _amountToLock);

        lockStartBlock[_userAddress] = block.number;
        balances[_userAddress] = balances[_userAddress].add(_amountToLock);
        accruedReward[_userAddress] = accruedReward[_userAddress].add(_amountToLock);

        emit Lock(_userAddress, _amountToLock, _additionalAccruedRewards);
    }

    function exit(address _userAddres,uint256 _additionalAccruedReward) public onlyLmc {
        require(block.number > lockBlock, "Lock:Scheme:: The lock period hasn't ended");

        uint256 bonus = PercentageCalculator(_additionalAccruedReward,bonusPercent);
        userBonuses[_userAddres] = bonus;
        balances[_userAddress] = 0;
        accruedReward[_userAddress] = 0;

        emit Exit(_userAddres, bonus);
    }
}
