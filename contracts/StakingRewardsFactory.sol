pragma solidity ^0.5.16;

import "openzeppelin-solidity-2.3.0/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity-2.3.0/contracts/ownership/Ownable.sol";

import "./StakingRewards.sol";

contract StakingRewardsFactory is Ownable {
    address public rewardsToken;
    uint256 public stakingRewardsGenesis;

    /** @dev the staking tokens for which the rewards contract has been deployed
     */
    address[] public stakingTokens;

    /** @dev Structure holding information about a particular Staking Rewards
     */
    struct StakingRewardsInfo {
        address stakingRewards;
        uint256 rewardAmount;
    }

    /** @dev Mapping with StakingRewards contract addresses and the structure
     */
    mapping(address => StakingRewardsInfo)
        public stakingRewardsInfoByStakingToken;

    //TODO this would change with latest changes for single configurable rewards
    /* ========== CONSTRUCTOR ========== */
    /** @dev Function called once on deployment time
     * @param _rewardsToken The address of the token in which the rewards will be paid
     * @param _stakingRewardsGenesis Timestamp after which the staking can start
     */
    constructor(address _rewardsToken, uint256 _stakingRewardsGenesis)
        public
        Ownable()
    {
        require(
            _stakingRewardsGenesis >= block.timestamp,
            "StakingRewardsFactory::constructor: genesis too soon"
        );

        rewardsToken = _rewardsToken;
        stakingRewardsGenesis = _stakingRewardsGenesis;
    }

    /* ========== Permissioned FUNCTIONS ========== */

    // deploy a staking reward contract for the staking token, and store the reward amount
    // the reward will be distributed to the staking reward contract no sooner than the genesis
    /** @dev Deploy a staking reward contract for the staking token, and store the reward amount,the reward will be distributed to the staking reward contract no sooner than the genesis
     * @param stakingToken The address of the token which should be staked
     * @param rewardAmount The amount of rewards that will be distributed
     */
    function deploy(address stakingToken, uint256 rewardAmount)
        public
        onlyOwner
    {

            StakingRewardsInfo storage info
         = stakingRewardsInfoByStakingToken[stakingToken];
        require(
            info.stakingRewards == address(0),
            "StakingRewardsFactory::deploy: already deployed"
        );

        info.stakingRewards = address(
            new StakingRewards(
                /*_rewardsDistribution=*/
                address(this),
                rewardsToken,
                stakingToken
            )
        );
        info.rewardAmount = rewardAmount;
        stakingTokens.push(stakingToken);
    }

    /* ========== Permissionless FUNCTIONS ========== */

    /** @dev Calls startStakings for all staking tokens.
     */
    function startStakings() public {
        require(
            stakingTokens.length > 0,
            "StakingRewardsFactory::startStakings: called before any deploys"
        );
        for (uint256 i = 0; i < stakingTokens.length; i++) {
            startStaking(stakingTokens[i]);
        }
    }

    /** @dev Function to determine whether the starking and rewards distribution has stared for a given staking rewards contract
     * @param stakingRewards The address of the staking rewards contract
     */
    function hasStakingStarted(address stakingRewards)
        public
        view
        returns (bool _isStakignStared)
    {
        return (StakingRewards(stakingRewards).periodFinish() > 0);
    }

    /** @dev Starts the staking and rewards distribution for a given staking token. This is a fallback in case the startsStakings() costs too much gas to call for all contracts
     * @param stakingToken The address of the token which should be staked
     */
    function startStaking(address stakingToken) public {
        require(
            block.timestamp >= stakingRewardsGenesis,
            "StakingRewardsFactory::startStaking: not ready"
        );


            StakingRewardsInfo storage info
         = stakingRewardsInfoByStakingToken[stakingToken];
        require(
            info.stakingRewards != address(0),
            "StakingRewardsFactory::startStaking: not deployed"
        );
        require(info.rewardAmount > 0, "Reward must be greater than zero");
        require(!hasStakingStarted(info.stakingRewards), "Staking has started");

        uint256 rewardAmount = info.rewardAmount;
        require(
            IERC20(rewardsToken).transfer(info.stakingRewards, rewardAmount),
            "StakingRewardsFactory::startStaking: transfer failed"
        );
        StakingRewards(info.stakingRewards).start(rewardAmount);
    }
    /** @dev Function that will extend the rewards period, but not change the reward rate, for a given staking contract. 
     * @param stakingToken The address of the token which should be staked
     * @param rewardsAmount The amount with which the rewards should be extended
     */
    function extendRewardPeriod(address stakingToken, uint256 rewardsAmount)
        public
    {
        require(rewardsAmount > 0, "Reward amount should be greater than zero");


            StakingRewardsInfo storage info
         = stakingRewardsInfoByStakingToken[stakingToken];
        require(
            info.stakingRewards != address(0),
            "StakingRewardsFactory::extendRewardPeriod: not deployed"
        );
        require(
            hasStakingStarted(info.stakingRewards),
            "Staking has not started"
        );

        IERC20(rewardsToken).approve(info.stakingRewards, rewardsAmount);

        StakingRewards(info.stakingRewards).addRewards(rewardsAmount);
    }
}
