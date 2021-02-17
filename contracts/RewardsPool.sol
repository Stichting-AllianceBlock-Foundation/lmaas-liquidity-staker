// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";

import "./interfaces/IRewardsPool.sol";
import "./interfaces/IERC20Detailed.sol";
import "./SafeERC20Detailed.sol";
import "./RewardsDistributionRecipient.sol";

contract RewardsPool is
    IRewardsPool,
    RewardsDistributionRecipient,
    ReentrancyGuard
{
    using SafeMath for uint256;
    using SafeERC20Detailed for IERC20Detailed;

    /* ========== STATE VARIABLES ========== */

    // staking
    IERC20Detailed public stakingToken;
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
    uint256[] public rewardsAmountsArr;

    /* ========== EVENTS ========== */

    event RewardAdded(address[] token, uint256[] reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(
        address indexed user,
        address indexed rewardToken,
        uint256 rewardAmount
    );
    event RewardExtended(
        address indexed rewardToken,
        uint256 rewardAmount,
        uint256 date,
        uint256 periodToExtend
    );
    event WithdrawLPRewards(
        uint256 indexed rewardsAmount,
        address indexed recipient
    );

    /* ========== CONSTRUCTOR ========== */

    /** @dev Function called once on deployment time
     * @param _rewardsTokens The addresses of the tokens the rewards will be paid in
     * @param _rewardsAmounts The reward amounts for each reward token
     * @param _stakingToken The address of the token being staked
     * @param _rewardsDuration Rewards duration in seconds
     */
    constructor(
        address[] memory _rewardsTokens,
        uint256[] memory _rewardsAmounts,
        address _stakingToken,
        uint256 _rewardsDuration
    ) public {
        for (uint256 i = 0; i < _rewardsTokens.length; i++) {
            rewardsTokensMap[_rewardsTokens[i]] = RewardInfo(
                0,
                0,
                0,
                0,
                _rewardsDuration
            );
        }
        rewardsTokensArr = _rewardsTokens;
        rewardsAmountsArr = _rewardsAmounts;
        stakingToken = IERC20Detailed(_stakingToken);

        rewardsDistributor = msg.sender;
    }

    /* ========== MODIFIERS ========== */

    /** @dev Modifier that re-calculates the rewards per user on user action.
     */
    modifier updateReward(address account) {
        for (uint256 i = 0; i < rewardsTokensArr.length; i++) {
            address token = rewardsTokensArr[i];
            RewardInfo storage ri = rewardsTokensMap[token];

            ri.latestRewardPerTokenSaved = rewardPerToken(token); // Calculate the reward until now
            ri.lastUpdateTime = lastTimeRewardApplicable(token); // Update the last update time to now (or end date) for future calculations

            if (account != address(0)) {
                ri.rewards[account] = earned(account, token);
                ri.userRewardPerTokenRecorded[account] = ri
                    .latestRewardPerTokenSaved;
            }
        }
        _;
    }

    /* ========== FUNCTIONS ========== */

    /** @dev Return the length of Rewards tokens array.
     */
    function getRewardsTokensCount() external view returns (uint256) {
        return rewardsTokensArr.length;
    }

    /** @dev Returns reward per token for a specific user and specific reward token.
     * @param rewardToken The reward token
     * @param rewardToken The address of user
     */
    function getUserRewardPerTokenRecorded(address rewardToken, address user)
        external
        view
        returns (uint256)
    {
        return rewardsTokensMap[rewardToken].userRewardPerTokenRecorded[user];
    }

    /** @dev Returns reward for a specific user and specific reward token.
     * @param rewardToken The reward token
     * @param rewardToken The address of user
     */
    function getUserReward(address rewardToken, address user)
        external
        view
        returns (uint256)
    {
        return rewardsTokensMap[rewardToken].rewards[user];
    }

    /** @dev Returns the total amount of stakes.
     */
    function totalStakesAmount() external view override returns (uint256) {
        return _totalStakesAmount;
    }

    /** @dev Returns the balance of specific user.
     */
    function balanceOf(address account)
        external
        view
        override
        returns (uint256)
    {
        return _balances[account];
    }

    /** @dev Calculates the rewards for this distribution.
     * @param rewardToken The reward token for which calculations will be made for
     */
    function getRewardForDuration(address rewardToken)
        external
        view
        override
        returns (uint256)
    {
        RewardInfo storage ri = rewardsTokensMap[rewardToken];
        return ri.rewardRate.mul(ri.rewardDuration);
    }

    /** @dev Checks if staking period has been started.
     */
    function hasPeriodStarted() external view returns (bool) {
        for (uint256 i = 0; i < rewardsTokensArr.length; i++) {
            if (rewardsTokensMap[rewardsTokensArr[i]].periodFinish != 0) {
                return true;
            }
        }

        return false;
    }

    /** @dev Providing LP tokens to stake, start calculating rewards for user.
     * @param amount The amount to be staked
     */
    function stake(uint256 amount)
        external
        override
        nonReentrant
        updateReward(msg.sender)
    {
        require(amount != 0, "Cannot stake 0");
        _totalStakesAmount = _totalStakesAmount.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /** @dev Withdrawing the stake and claiming the rewards for the user
     */
    function exit() external override {
        withdraw(_balances[msg.sender]);
        getReward();
    }

    /** @dev Makes the needed calculations and starts the staking/rewarding.
     */
    function start()
        external
        override
        onlyRewardsDistributor
        updateReward(address(0))
    {
        for (uint256 i = 0; i < rewardsTokensArr.length; i++) {
            address token = rewardsTokensArr[i];
            RewardInfo storage ri = rewardsTokensMap[token];

            ri.rewardRate = rewardsAmountsArr[i].div(ri.rewardDuration);
            // Ensure the provided reward amount is not more than the balance in the contract.
            // This keeps the reward rate in the right range, preventing overflows due to
            // very high values of rewardRate in the earned and rewardsPerToken functions;
            // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
            uint256 balance = IERC20Detailed(token).balanceOf(address(this));
            require(
                ri.rewardRate <= balance.div(ri.rewardDuration),
                "Provided reward too high"
            );

            ri.lastUpdateTime = block.timestamp;
            ri.periodFinish = block.timestamp.add(ri.rewardDuration);
        }

        emit RewardAdded(rewardsTokensArr, rewardsAmountsArr);
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
        IERC20Detailed(rewardToken).safeTransferFrom(
            msg.sender,
            address(this),
            rewardAmount
        );

        RewardInfo storage ri = rewardsTokensMap[rewardToken];
        ri.periodFinish = ri.periodFinish.add(periodToExtend);
        ri.rewardDuration = ri.rewardDuration.add(periodToExtend);

        emit RewardExtended(
            rewardToken,
            rewardAmount,
            block.timestamp,
            periodToExtend
        );
    }

    /** @dev Calculates the last time reward could be paid up until this moment for specific reward token.
     * @param rewardToken The reward token for which calculations will be made for
     */
    function lastTimeRewardApplicable(address rewardToken)
        public
        view
        override
        returns (uint256)
    {
        return
            Math.min(
                block.timestamp,
                rewardsTokensMap[rewardToken].periodFinish
            );
    }

    /** @dev Calculates how many rewards tokens you should get per 1 staked token until last applicable time (in most cases it is now) for specific token
     * @param rewardToken The reward token for which calculations will be made for
     */
    function rewardPerToken(address rewardToken)
        public
        view
        override
        returns (uint256)
    {
        RewardInfo storage ri = rewardsTokensMap[rewardToken];

        if (_totalStakesAmount == 0) {
            return ri.latestRewardPerTokenSaved;
        }

        uint256 timeSinceLastSave =
            lastTimeRewardApplicable(rewardToken).sub(ri.lastUpdateTime);

        uint256 rewardPerTokenSinceLastSave =
            timeSinceLastSave
                .mul(ri.rewardRate)
                .mul(
                10**uint256(IERC20Detailed(address(stakingToken)).decimals())
            )
                .div(_totalStakesAmount);

        return ri.latestRewardPerTokenSaved.add(rewardPerTokenSinceLastSave);
    }

    /** @dev Calculates how much rewards a user has earned.
     * @param account The user for whom calculations will be done
     * @param rewardToken The reward token for which calculations will be made for
     */
    function earned(address account, address rewardToken)
        public
        view
        override
        returns (uint256)
    {
        RewardInfo storage ri = rewardsTokensMap[rewardToken];

        uint256 userRewardPerTokenSinceRecorded =
            rewardPerToken(rewardToken).sub(
                ri.userRewardPerTokenRecorded[account]
            );

        uint256 newReward =
            _balances[account].mul(userRewardPerTokenSinceRecorded).div(
                10**uint256(IERC20Detailed(address(stakingToken)).decimals())
            );

        return ri.rewards[account].add(newReward);
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

    /** @dev Checks if staking period for every reward token has expired.
     * Returns false if atleast one reward token has not yet finished
     */
    function hasPeriodFinished() public view returns (bool) {
        for (uint256 i = 0; i < rewardsTokensArr.length; i++) {
            // on first token for which the period has not expired, returns false.
            if (
                block.timestamp <
                rewardsTokensMap[rewardsTokensArr[i]].periodFinish
            ) {
                return false;
            }
        }

        return true;
    }

    /** @dev Withdrawing/removing the staked tokens back to the user's wallet
     * @param amount The amount to be withdrawn
     */
    function withdraw(uint256 amount)
        public
        override
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
    function getReward() public override nonReentrant updateReward(msg.sender) {
        uint256 tokenArrLength = rewardsTokensArr.length;
        for (uint256 i = 0; i < tokenArrLength; i++) {
            address token = rewardsTokensArr[i];
            RewardInfo storage ri = rewardsTokensMap[token];

            uint256 reward = ri.rewards[msg.sender];
            if (reward != 0) {
                ri.rewards[msg.sender] = 0;
                IERC20Detailed(token).safeTransfer(msg.sender, reward);
                emit RewardPaid(msg.sender, token, reward);
            }
        }
    }

    /** @dev Withdrawing rewards acumulated from different pools for providing liquidity
     * @param recipient The address to whom the rewards will be trasferred
     * @param lpTokenContract The address of the rewards contract
     */
    function withdrawLPRewards(address recipient, address lpTokenContract)
        public
        nonReentrant
        onlyRewardsDistributor
    {
        uint256 currentReward =
            IERC20Detailed(lpTokenContract).balanceOf(address(this));
        require(currentReward > 0, "There are no rewards from liquidity pools");

        for (uint256 i = 0; i < rewardsTokensArr.length; i++) {
            require(
                lpTokenContract != rewardsTokensArr[i],
                "Cannot withdraw from token rewards"
            );
        }
        IERC20Detailed(lpTokenContract).safeTransfer(recipient, currentReward);
        emit WithdrawLPRewards(currentReward, recipient);
    }

    /** @dev Withdrawing rewards before the campaign has started. This method can be used if tokens were accidentally transferred to the contract. The tokens will be returned to the factory contract.
     */
    function withdrawRewards() public nonReentrant onlyRewardsDistributor {
        bool hasPeriodStartedCheck = this.hasPeriodStarted();
        require(
            hasPeriodStartedCheck != true,
            "The Rewards Campaign has started"
        );

        for (uint256 i = 0; i < rewardsTokensArr.length; i++) {
            uint256 rewardsAmount =
                IERC20Detailed(rewardsTokensArr[i]).balanceOf(address(this));
            IERC20Detailed(rewardsTokensArr[i]).safeTransfer(
                rewardsDistributor,
                rewardsAmount
            );
        }
    }
}
