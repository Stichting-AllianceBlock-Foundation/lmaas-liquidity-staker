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
    uint256 public startBlock;
    uint256 public lastRewardBlock;
    bool public hasStakingStarted;
    uint256[] public rewardPerStakedToken;

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
        uint256 _startBlock,
        uint256[] memory _rewardPerStakedToken
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
            _startBlock >= _getBlock(),
            "The starting block must be in the future."
        );
        require(
            _tokenRewardPerBlock.length == _rewardsTokens.length,
            "Rewards per block and rewards tokens must be with the same length."
        );
        require(
            _tokenRewardPerBlock.length == _rewardPerStakedToken.length,
            "Rewards per block and rewards per staked tokens must be with the same length."
        );

        stakingToken = _stakingToken;
        tokenRewardPerBlock = _tokenRewardPerBlock;
        startBlock = _startBlock;
        rewardsTokens = _rewardsTokens;
        rewardPerStakedToken = _rewardPerStakedToken;
    }

    function stake(uint256 _tokenAmount) external nonReentrant {
        require(_getBlock() > startBlock, "Staking is not yet started");
        require(_tokenAmount > 0, "Cannot stake 0");

        UserInfo storage user = userInfo[msg.sender];

        // first stake
        if (user.amountStaked == 0) {
            user.firstStakedBlockNumber = _getBlock();
        }
        updateRewardsPerStakedToken();
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

    function updateRewardsPerStakedToken() private {
        if (_getBlock() <= lastRewardBlock) {
            return;
        }

        if (totalStakedAmount == 0) {
            lastRewardBlock = _getBlock();
            return;
        }

        uint256 blocksSinceLastReward = _getBlock().sub(lastRewardBlock);

        for (uint256 i = 0; i < rewardsTokens.length; i++) {
            uint256 reward = blocksSinceLastReward.mul(tokenRewardPerBlock[i]);
            rewardPerStakedToken[i] = rewardPerStakedToken[i].add(
                reward.mul(1e18).div(totalStakedAmount)
            );
        }
        lastRewardBlock = _getBlock();
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

    function _getBlock() internal view virtual returns (uint256) {
        return block.number;
    }
}
