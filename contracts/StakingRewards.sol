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

    IERC20 public rewardsToken;
    IERC20 public stakingToken;
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public rewardsDuration = 60 days;
    uint256 public lastUpdateTime;
    uint256 public latestRewardPerTokenSaved;

    mapping(address => uint256) public userRewardPerTokenRecorded;
    mapping(address => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    /* ========== CONSTRUCTOR ========== */
    /** @dev Function called once on deployment time
    * @param _rewardsDistribution The address of the factory that have deployed the contract and will have permissions for some of the functions
    * @param _rewardsToken The address of the token the rewards will be paid in
    * @param _stakingToken The address of the token being staked
     */
    constructor(
        address _rewardsDistribution,
        address _rewardsToken,
        address _stakingToken
    ) public {
        rewardsToken = IERC20(_rewardsToken);
        stakingToken = IERC20(_stakingToken);
        rewardsDistribution = _rewardsDistribution;
    }

    /* ========== VIEWS ========== */

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    /** @dev Calculates the last time reward could be paid up until this moment.
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    /** @dev Calculates how many rewards tokens you should get per 1 staked token until last applicable time (in most cases it is now).
     */
    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return latestRewardPerTokenSaved;
        }

        uint256 timeSinceLastSave = lastTimeRewardApplicable().sub(
            lastUpdateTime
        );
        uint256 rewardPerTokenSinceLastSave = timeSinceLastSave
            .mul(rewardRate)
            .mul(1e18)
            .div(_totalSupply);
        return latestRewardPerTokenSaved.add(rewardPerTokenSinceLastSave);
    }

    /** @dev Calculates how much rewards a user has earned.
     */
    function earned(address account) public view returns (uint256) {
        uint256 userRewardPerTokenSinceRecorded = rewardPerToken().sub(
            userRewardPerTokenRecorded[account]
        );
        uint256 newReward = _balances[account]
            .mul(userRewardPerTokenSinceRecorded)
            .div(1e18);
        return rewards[account].add(newReward);
    }
     /** @dev Calculates the rewards for this distribution.
     */
    function getRewardForDuration() external view returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    /** @dev Calculates the finish period extension based on the new reward amount added
     * @param rewardAmount The additional reward amount
     */
    function getPeriodsToExtend(uint256 rewardAmount)
        public
        view
        returns (uint256 periodsToExtend)
    {
        require(rewardAmount > 0, "Rewards should be greater than zero");
        require(rewardRate > 0, "Staking is not yet started");

        uint256 periodToExtend = rewardAmount.div(rewardRate);
        return periodToExtend;
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
    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
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
     * @param reward The total amount of reward that would be distributed.
     */
    function start(uint256 reward)
        external
        onlyRewardsDistribution
        updateReward(address(0))
    {
        require(
            block.timestamp >= periodFinish,
            "Rewards staking have already been started"
        );
        rewardRate = reward.div(rewardsDuration);

        // Ensure the provided reward amount is not more than the balance in the contract.
        // This keeps the reward rate in the right range, preventing overflows due to
        // very high values of rewardRate in the earned and rewardsPerToken functions;
        // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
        uint256 balance = rewardsToken.balanceOf(address(this));
        require(
            rewardRate <= balance.div(rewardsDuration),
            "Provided reward too high"
        );

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardAdded(reward);
    }

    /** @dev Add's more rewards and updates the duration of the rewards distribution.
     * @param rewardAmount The additional reward amount
     */
    function addRewards(uint256 rewardAmount)
        external
        updateReward(address(0))
        onlyRewardsDistribution
    {
        uint256 periodToExtend = getPeriodsToExtend(rewardAmount);
        rewardsToken.transferFrom(msg.sender, address(this), rewardAmount);
        periodFinish = periodFinish.add(periodToExtend);
        rewardsDuration = rewardsDuration.add(periodToExtend);
        emit RewardExtended(rewardAmount, now, periodToExtend);
    }

    /* ========== MODIFIERS ========== */

    /** @dev Modifier that re-calculates the rewards per user on user action.
     */
    modifier updateReward(address account) {
        latestRewardPerTokenSaved = rewardPerToken(); // Calculate the reward until now
        lastUpdateTime = lastTimeRewardApplicable(); // Update the last update time to now (or end date) for future calculations
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenRecorded[account] = latestRewardPerTokenSaved;
        }
        _;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardExtended(
        uint256 rewardAmount,
        uint256 date,
        uint256 periodToExtend
    );
}
