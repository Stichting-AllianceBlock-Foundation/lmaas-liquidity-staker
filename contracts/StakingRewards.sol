// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;

import "openzeppelin-solidity-2.3.0/contracts/math/Math.sol";
import "openzeppelin-solidity-2.3.0/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-2.3.0/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity-2.3.0/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity-2.3.0/contracts/utils/ReentrancyGuard.sol";

// Inheritance
import "./interfaces/IStakingRewards.sol";
import "./RewardsDistributionRecipient.sol";

contract StakingRewards is
    IStakingRewards,
    RewardsDistributionRecipient,
    ReentrancyGuard
{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    // staking
    IERC20 public stakingToken;
    uint256 private _totalStakesAmount;
    mapping(address => uint256) private _balances;

    // reward
    struct RewardInfo {
        uint256 rewardRate;
        uint256 latestRewardPerTokenSaved;
        uint256 periodFinish;
        uint256 lastUpdateTime;
        uint256 rewardDuration;

        // user rewards
        mapping(address => uint256) userRewardPerTokenRecorded;
        mapping(address => uint256) rewards;
    }

    mapping(address => RewardInfo) public rewardsTokensMap; // structure for fast access to token's data
    address[] public rewardsTokensArr; // structure to iterate over

    function getRewardsTokensCount()
        external
        view
        returns (uint)
    {
        return rewardsTokensArr.length;
    }

    function getUserRewardPerTokenRecorded(address rewardToken, address user)
        external
        view
        returns (uint256)
    {
        return rewardsTokensMap[rewardToken].userRewardPerTokenRecorded[user];
    }

    function getUserReward(address rewardToken, address user)
        external
        view
        returns (uint256)
    {
        return rewardsTokensMap[rewardToken].rewards[user];
    }

    /* ========== CONSTRUCTOR ========== */

    /** @dev Function called once on deployment time
    * @param _rewardsTokens The addresses of the tokens the rewards will be paid in
    * @param _stakingToken The address of the token being staked
    * @param _rewardsDuration Rewards duration in seconds
     */
    constructor(
        address[] memory _rewardsTokens,
        address _stakingToken,
        uint256 _rewardsDuration
    ) public {
        for (uint i = 0; i < _rewardsTokens.length; i++) {
            rewardsTokensMap[_rewardsTokens[i]] = RewardInfo(0, 0, 0, 0, _rewardsDuration);
        }
        rewardsTokensArr = _rewardsTokens;
        stakingToken = IERC20(_stakingToken);

        rewardsDistributor = msg.sender;
    }

    /* ========== VIEWS ========== */

    function totalSupply() external view returns (uint256) {
        return _totalStakesAmount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /** @dev Calculates the last time reward could be paid up until this moment for specific reward token.
     * @param rewardToken The reward token for which calculations will be made for
     */
    function lastTimeRewardApplicable(address rewardToken) public view returns (uint256) {
        return Math.min(block.timestamp, rewardsTokensMap[rewardToken].periodFinish);
    }

    /** @dev Calculates how many rewards tokens you should get per 1 staked token until last applicable time (in most cases it is now) for specific token
     * @param rewardToken The reward token for which calculations will be made for
     */
    function rewardPerToken(address rewardToken) public view returns (uint256) {
        RewardInfo storage ri = rewardsTokensMap[rewardToken];

        if (_totalStakesAmount == 0) {
            return ri.latestRewardPerTokenSaved;
        }

        uint256 timeSinceLastSave = lastTimeRewardApplicable(rewardToken).sub(
            ri.lastUpdateTime
        );

        uint256 rewardPerTokenSinceLastSave = timeSinceLastSave
            .mul(ri.rewardRate)
            // TODO -> discuss
            .mul(1e18 /* 10 ** IERC20(stakingToken).decimals() */)
            .div(_totalStakesAmount);

        return ri.latestRewardPerTokenSaved.add(rewardPerTokenSinceLastSave);
    }

    /** @dev Calculates how much rewards a user has earned.
     * @param account The user for whom calculations will be done
     * @param rewardToken The reward token for which calculations will be made for
     */
    function earned(address account, address rewardToken) public view returns (uint256) {
        RewardInfo storage ri = rewardsTokensMap[rewardToken];

        uint256 userRewardPerTokenSinceRecorded = rewardPerToken(rewardToken).sub(
            ri.userRewardPerTokenRecorded[account]
        );

        uint256 newReward = _balances[account]
            .mul(userRewardPerTokenSinceRecorded)
            // TODO -> discuss
            .div(1e18 /* 10 ** IERC20(stakingToken).decimals() */);

        return ri.rewards[account].add(newReward);
    }

    /** @dev Calculates the rewards for this distribution.
     * @param rewardToken The reward token for which calculations will be made for
     */
    function getRewardForDuration(address rewardToken) external view returns (uint256) {
        RewardInfo storage ri = rewardsTokensMap[rewardToken];
        return ri.rewardRate.mul(ri.rewardDuration);
    }

    /** @dev Calculates the finish period extension based on the new reward amount added
     * @param rewardAmount The additional reward amount
     */
    function getPeriodsToExtend(address rewardToken, uint256 rewardAmount)
        public
        view
        returns (uint256 periodToExtend)
    {
        require(rewardAmount != 0, "Rewards should be greater than zero");

        RewardInfo storage ri = rewardsTokensMap[rewardToken];
        require(ri.rewardRate != 0, "Staking is not yet started");

        periodToExtend = rewardAmount.div(ri.rewardRate);
    }

    /** @dev Checks if staking period has been started.
     */
    function hasPeriodStarted()
        external
        view
        returns (bool)
    {
        for (uint i = 0; i < rewardsTokensArr.length; i++) {
            if (rewardsTokensMap[rewardsTokensArr[i]].periodFinish != 0) {
                return true;
            }
        }

        return false;
    }

    /** @dev Checks if staking period for every reward token has expired.
     * Returns false if atleast one reward token has not yet finished
     */
    function hasPeriodFinished()
        public
        view
        returns (bool)
    {
        for (uint i = 0; i < rewardsTokensArr.length; i++) {
            // on first token for which the period has not expired, returns false.
            if (block.timestamp < rewardsTokensMap[rewardsTokensArr[i]].periodFinish) {
                return false;
            }
        }

        return true;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /** @dev Providing LP tokens to stake, start calculating rewards for user.
     * @param amount The amount to be staked
     */
    function stake(uint256 amount)
        external
        nonReentrant
        updateReward(msg.sender)
    {
        require(amount != 0, "Cannot stake 0");
        _totalStakesAmount = _totalStakesAmount.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /** @dev Withdrawing/removing the staked tokens back to the user's wallet
     * @param amount The amount to be withdrawn
     */
    function withdraw(uint256 amount)
        public
        nonReentrant
        updateReward(msg.sender)
    {
        require(amount != 0, "Cannot withdraw 0");
        _totalStakesAmount = _totalStakesAmount.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /** @dev Claiming earned rewards up to now
     */
    function getReward()
        public
        nonReentrant
        updateReward(msg.sender)
    {
        uint256 tokenArrLength = rewardsTokensArr.length;
        for (uint i = 0; i < tokenArrLength; i++) {
            address token = rewardsTokensArr[i];
            RewardInfo storage ri = rewardsTokensMap[token];

            uint256 reward = ri.rewards[msg.sender];
            if (reward != 0) {
                ri.rewards[msg.sender] = 0;
                IERC20(token).safeTransfer(msg.sender, reward);
                emit RewardPaid(msg.sender, token, reward);
            }
        }
    }

    /** @dev Withdrawing the stake and claiming the rewards for the user
     */
    function exit() external {
        withdraw(_balances[msg.sender]);
        getReward();
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /** @dev Makes the needed calculations and starts the staking/rewarding.
     * @param _rewardsAmounts Array of all the reward amounts for each token.
     */
    function start(uint256[] calldata _rewardsAmounts)
        external
        onlyRewardsDistributor
        updateReward(address(0))
    {
        for (uint i = 0; i < rewardsTokensArr.length; i++) {
            address token = rewardsTokensArr[i];
            RewardInfo storage ri = rewardsTokensMap[token];

            ri.rewardRate = _rewardsAmounts[i].div(ri.rewardDuration);
            // Ensure the provided reward amount is not more than the balance in the contract.
            // This keeps the reward rate in the right range, preventing overflows due to
            // very high values of rewardRate in the earned and rewardsPerToken functions;
            // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
            uint256 balance = IERC20(token).balanceOf(address(this));
            require(
                ri.rewardRate <= balance.div(ri.rewardDuration),
                "Provided reward too high"
            );

            ri.lastUpdateTime = block.timestamp;
            ri.periodFinish = block.timestamp.add(ri.rewardDuration);
        }

        emit RewardAdded(rewardsTokensArr, _rewardsAmounts);
    }

    /** @dev Add's more rewards and updates the duration of the rewards distribution.
     * @param rewardToken The token in which the additional reward amount will be distributed. Must be already known token.
     * @param rewardAmount The additional reward amount
     */
    function addRewards(address rewardToken, uint256 rewardAmount)
        external
        updateReward(address(0))
        onlyRewardsDistributor
    {
        uint256 periodToExtend = getPeriodsToExtend(rewardToken, rewardAmount);
        IERC20(rewardToken).safeTransferFrom(msg.sender, address(this), rewardAmount);

        RewardInfo storage ri = rewardsTokensMap[rewardToken];
        ri.periodFinish = ri.periodFinish.add(periodToExtend);
        ri.rewardDuration = ri.rewardDuration.add(periodToExtend);

        emit RewardExtended(rewardToken, rewardAmount, block.timestamp, periodToExtend);
    }

    /* ========== MODIFIERS ========== */

    /** @dev Modifier that re-calculates the rewards per user on user action.
     */
    modifier updateReward(address account) {
        for (uint i = 0; i < rewardsTokensArr.length; i++) {
            address token = rewardsTokensArr[i];
            RewardInfo storage ri = rewardsTokensMap[token];

            ri.latestRewardPerTokenSaved = rewardPerToken(token); // Calculate the reward until now
            ri.lastUpdateTime = lastTimeRewardApplicable(token); // Update the last update time to now (or end date) for future calculations

            if (account != address(0)) {
                ri.rewards[account] = earned(account, token);
                ri.userRewardPerTokenRecorded[account] = ri.latestRewardPerTokenSaved;
            }
        }
        _;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(address[] token, uint256[] reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, address indexed rewardToken, uint256 rewardAmount);
    event RewardExtended(
        address indexed rewardToken,
        uint256 rewardAmount,
        uint256 date,
        uint256 periodToExtend
    );
}
