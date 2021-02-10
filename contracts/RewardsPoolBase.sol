// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC20Detailed.sol";
import "./SafeERC20Detailed.sol";

contract RewardsPoolBase is ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20Detailed for IERC20Detailed;

    uint256 public totalStakedAmount;
    uint256[] public tokenRewardPerBlock;
    address[] public rewardsTokens;
    IERC20Detailed public stakingToken;
    uint256 public startTimestamp;
    bool public hasStakingStarted;

    struct UserInfo {
        uint256 firstStakedBlockNumber;
        uint256 amountStaked; // How many tokens the user has staked.
        uint256 rewardDebt; //
        uint256 tokensOwed; // How many tokens the contract owes to the user.
    }

    mapping(address => UserInfo) public userInfo;

    event Staked(address indexed user, uint256 amount);

    constructor(
        IERC20Detailed _stakingToken,
        uint256[] memory _tokenRewardPerBlock,
        address[] memory _rewardsTokens,
        uint256 _startTimestamp
    ) public {
        require(
            address(_stakingToken) != address(0),
            "Invalid staking token address"
        );
        require(
            _tokenRewardPerBlock.length > 0,
            "Token rewards are not provided"
        );
        require(_rewardsTokens.length > 0, "Rewards tokens are not provided");
        require(
            _startTimestamp >= _getBlockTimestamp(),
            "The starting block must be in the future."
        );

        stakingToken = _stakingToken;
        tokenRewardPerBlock = _tokenRewardPerBlock;
        startTimestamp = _startTimestamp;
        rewardsTokens = _rewardsTokens;
    }

    function stake(uint256 _tokenAmount) external nonReentrant {
        require(_getBlockTimestamp() > startTimestamp, "Staking is not yet started");
        require(_tokenAmount > 0, "Cannot stake 0");

        UserInfo storage user = userInfo[msg.sender];

        // first stake
        if (user.amountStaked == 0) {
            user.firstStakedBlockNumber = _getBlockTimestamp();
        }

        _updateUserReward(msg.sender);

        user.amountStaked = user.amountStaked.add(_tokenAmount);
        totalStakedAmount = totalStakedAmount.add(_tokenAmount);
        stakingToken.safeTransferFrom(
            address(msg.sender),
            address(this),
            _tokenAmount
        );

        user.rewardDebt = user.amountStaked;
        emit Staked(msg.sender, _tokenAmount);
    }

    function getUserStakedAmount(address _userAddress) external view returns(uint256) {
        return userInfo[_userAddress].amountStaked;
    }

     function getUserRewardDept(address _userAddress) external view returns(uint256) {
        return userInfo[_userAddress].rewardDebt;
    }

    function _updateUserReward(address _userAddress) internal {
        UserInfo storage user = userInfo[_userAddress];

        if (user.amountStaked > 0) {
            uint256 pending = user.amountStaked.sub(user.rewardDebt);
            if (pending > 0) {
                user.tokensOwed = pending;
                user.rewardDebt = user.amountStaked;
            }
        }
    }

    function _getBlockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
