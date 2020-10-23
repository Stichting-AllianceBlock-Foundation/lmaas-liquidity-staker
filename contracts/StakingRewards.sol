// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

import "openzeppelin-solidity-2.3.0/contracts/math/Math.sol";
import "openzeppelin-solidity-2.3.0/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-2.3.0/contracts/token/ERC20/ERC20Detailed.sol";
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
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    // reward
    struct RewardInfo {
        IERC20 tokenInstance;
        uint256 rewardRate;
        uint256 latestRewardPerTokenSaved;
        uint256 periodFinish;
        uint256 lastUpdateTime;

        // user rewards
        mapping(address => uint256) userRewardPerTokenRecorded;
        mapping(address => uint256) rewards;
    }

    mapping(address => RewardInfo) public rewardsTokensMap; // structure for fast access to token's data
    address[] public rewardsTokensArr; // structure to iterate over

    function getRewardsTokensCount()
        public
        view
        returns (uint)
    {
        return rewardsTokensArr.length;
    }

    function getUserRewardPerTokenRecorded(address rewardToken, address user)
        public
        view
        returns (uint256)
    {
        return rewardsTokensMap[rewardToken].userRewardPerTokenRecorded[user];
    }

    function getUserReward(address rewardToken, address user)
        public
        view
        returns (uint256)
    {
        return rewardsTokensMap[rewardToken].rewards[user];
    }

    // timings
    // uint256 public periodFinish;
    uint256 public rewardsDuration;
    // uint256 public lastUpdateTime;

    /* ========== CONSTRUCTOR ========== */

    /** @dev Function called once on deployment time
    * @param _rewardsDistribution The address of the factory that have deployed the contract and will have permissions for some of the functions
    * @param _rewardsTokens The addresses of the tokens the rewards will be paid in
    * @param _stakingToken The address of the token being staked
    * @param _rewardsDuration Rewards duration in seconds
     */
    constructor(
        address _rewardsDistribution,
        address[] memory _rewardsTokens,
        address _stakingToken,
        uint256 _rewardsDuration
    ) public {
        for (uint i = 0; i < _rewardsTokens.length; i++) {
            rewardsTokensMap[_rewardsTokens[i]] = RewardInfo(IERC20(_rewardsTokens[i]), 0, 0, 0, 0);
        }
        rewardsTokensArr = _rewardsTokens;

        stakingToken = IERC20(_stakingToken);
        rewardsDistribution = _rewardsDistribution;
        rewardsDuration = _rewardsDuration;
    }

    /* ========== VIEWS ========== */

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
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
        if (_totalSupply == 0) {
            return rewardsTokensMap[rewardToken].latestRewardPerTokenSaved;
        }

        uint256 timeSinceLastSave = lastTimeRewardApplicable(rewardToken).sub(
            rewardsTokensMap[rewardToken].lastUpdateTime
        );

        uint256 rewardPerTokenSinceLastSave = timeSinceLastSave
            .mul(rewardsTokensMap[rewardToken].rewardRate)
            .mul(1e18)
            .div(_totalSupply);

        return rewardsTokensMap[rewardToken].latestRewardPerTokenSaved.add(rewardPerTokenSinceLastSave);
    }

    /** @dev Calculates how much rewards a user has earned.
     * @param account The user for whom calculations will be done
     * @param rewardToken The reward token for which calculations will be made for
     */
    function earned(address account, address rewardToken) public view returns (uint256) {
        uint256 userRewardPerTokenSinceRecorded = rewardPerToken(rewardToken).sub(
             rewardsTokensMap[rewardToken].userRewardPerTokenRecorded[account]
        );

        uint256 newReward = _balances[account]
            .mul(userRewardPerTokenSinceRecorded)
            .div(1e18);

        return  rewardsTokensMap[rewardToken].rewards[account].add(newReward);
    }

    /** @dev Calculates the rewards for this distribution.
     * @param rewardToken The reward token for which calculations will be made for
     */
    function getRewardForDuration(address rewardToken) external view returns (uint256) {
        return rewardsTokensMap[rewardToken].rewardRate.mul(rewardsDuration);
    }

    /** @dev Calculates the finish period extension based on the new reward amount added
     * @param rewardAmount The additional reward amount
     */
    function getPeriodsToExtend(address rewardToken, uint256 rewardAmount)
        public
        view
        returns (uint256 periodsToExtend)
    {
        require(rewardAmount > 0, "Rewards should be greater than zero");
        require(rewardsTokensMap[rewardToken].rewardRate > 0, "Staking is not yet started");

        uint256 periodToExtend = rewardAmount.div(rewardsTokensMap[rewardToken].rewardRate);
        return periodToExtend;
    }

    /** @dev Checks if staking period has been started.
     */
    function hasPeriodStarted()
        public
        view
        returns (bool)
    {
        for (uint i = 0; i < rewardsTokensArr.length; i++) {
            if (0 < rewardsTokensMap[rewardsTokensArr[i]].periodFinish) {
                return true;
            }
        }

        return false;
    }

    /** @dev Checks if staking period for every reward token has expired.
     * Returns true if atleast one reward token has not yet finished
     */
    function hasPeriodFinished()
        public
        view
        returns (bool)
    {
        for (uint i = 0; i < rewardsTokensArr.length; i++) {
            // on first token which period has not been expired return false
            if (block.timestamp >= rewardsTokensMap[rewardsTokensArr[i]].periodFinish) {
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
        require(amount > 0, "Cannot stake 0");
        _totalSupply = _totalSupply.add(amount);
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
        require(amount > 0, "Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
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
        for (uint i = 0; i < rewardsTokensArr.length; i++) {
            uint256 reward = rewardsTokensMap[rewardsTokensArr[i]].rewards[msg.sender];
            if (reward > 0) {
                rewardsTokensMap[rewardsTokensArr[i]].rewards[msg.sender] = 0;
                rewardsTokensMap[rewardsTokensArr[i]].tokenInstance.safeTransfer(msg.sender, reward);
                emit RewardPaid(msg.sender, rewardsTokensArr[i], reward);
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

    /** @dev Makes the needed calculations and starts the starking/rewarding.
     * @param _rewardsTokens Array of all reward tokens.
     * @param _rewardsAmounts Array of all the reward amounts for each token.
     */
    function start(address[] calldata _rewardsTokens, uint256[] calldata _rewardsAmounts)
        external
        onlyRewardsDistribution
        updateReward(address(0))
    {
        require(
            !hasPeriodStarted(),
            "Rewards staking have already been started"
        );

        for (uint i = 0; i < _rewardsTokens.length; i++) {
            // TODO: chech ri validity
            RewardInfo storage ri = rewardsTokensMap[_rewardsTokens[i]];
            ri.rewardRate = _rewardsAmounts[i].div(rewardsDuration);

            // Ensure the provided reward amount is not more than the balance in the contract.
            // This keeps the reward rate in the right range, preventing overflows due to
            // very high values of rewardRate in the earned and rewardsPerToken functions;
            // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
            uint256 balance = ri.tokenInstance.balanceOf(address(this));
            require(
                ri.rewardRate <= balance.div(rewardsDuration),
                "Provided reward too high"
            );

            ri.lastUpdateTime = block.timestamp;
            ri.periodFinish = block.timestamp.add(rewardsDuration);
        }


        emit RewardAdded(_rewardsTokens, _rewardsAmounts);
    }

    /** @dev Add's more rewards and updates the duration of the rewards distribution.
     * @param rewardToken The token in which the additional reward amount will be destributed. Must be already known token.
     * @param rewardAmount The additional reward amount
     */
    function addRewards(address rewardToken, uint256 rewardAmount)
        external
        updateReward(address(0))
        onlyRewardsDistribution
    {
        // TODO: look into periodFinish
        uint256 periodToExtend = getPeriodsToExtend(rewardToken, rewardAmount);
        IERC20(rewardToken).transferFrom(msg.sender, address(this), rewardAmount);
        rewardsTokensMap[rewardToken].periodFinish = rewardsTokensMap[rewardToken].periodFinish.add(periodToExtend);
        rewardsDuration = rewardsDuration.add(periodToExtend);

        emit RewardExtended(rewardToken, rewardAmount, now, periodToExtend);
    }

    /* ========== MODIFIERS ========== */

    /** @dev Modifier that re-calculates the rewards per user on user action.
     */
    modifier updateReward(address account) {
        // TODO: account != address(0) -> move to require
        for (uint i = 0; i < rewardsTokensArr.length; i++) {
            address token = rewardsTokensArr[i];
            // TODO: chech ri validity
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
