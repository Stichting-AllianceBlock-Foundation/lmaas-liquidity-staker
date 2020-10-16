// SPDX-License-Identifier: MIT
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

     /* ========== CONSTRUCTOR ========== */
    /** @dev Function called once on deployment time
     * @param _stakingRewardsGenesis Timestamp after which the staking can start
     */
    mapping(address => StakingRewardsInfo) public stakingRewardsInfoByStakingToken;

    constructor(
        uint _stakingRewardsGenesis
    ) Ownable() public {
        require(_stakingRewardsGenesis >= block.timestamp, 'StakingRewardsFactory::constructor: genesis too soon');

        stakingRewardsGenesis = _stakingRewardsGenesis;
    }

    /* ========== Permissioned FUNCTIONS ========== */

    /** @dev Deploy a staking reward contract for the staking token, and store the reward amount,the reward will be distributed to the staking reward contract no sooner than the genesis
     * @param _stakingToken The address of the token being staked
     * @param _rewardsToken The address of the token the rewards will be paid in
     * @param _rewardAmount The reward amount
     */
  
    function deploy(
        address _stakingToken, 
        address _rewardsToken,
        uint _rewardAmount
    ) public onlyOwner {
        StakingRewardsInfo storage info = stakingRewardsInfoByStakingToken[_stakingToken];
        require(info.stakingRewards == address(0), 'StakingRewardsFactory::deploy: already deployed');

        info.stakingRewards = address(new StakingRewards(/*_rewardsDistribution=*/ address(this), _rewardsToken, _stakingToken));
        info.rewardAmount = _rewardAmount;
        stakingTokens.push(_stakingToken);
    }

    /** @dev Function that will extend the rewards period, but not change the reward rate, for a given staking contract.
     * @param stakingToken The address of the token being staked
     * @param rewardsAmount The additional reward amount
     */
    function extendRewardPeriod(address stakingToken, uint256 rewardsAmount)
        public
        onlyOwner
    {
        require(rewardsAmount > 0, 'Reward amount should be greater than zero');
        StakingRewardsInfo storage info = stakingRewardsInfoByStakingToken[stakingToken];
        require(info.stakingRewards != address(0), 'StakingRewardsFactory::extendRewardPeriod: not deployed');
        require(hasStakingStarted(info.stakingRewards), 'Staking has not started');

        StakingRewards(info.stakingRewards).rewardsToken().approve(info.stakingRewards, rewardsAmount);
            
        StakingRewards(info.stakingRewards).addRewards(rewardsAmount);
    }

    /* ========== Permissionless FUNCTIONS ========== */

    /** @dev Calls startStakings for all staking tokens.
     */
    function startStakings() public {

        require(stakingTokens.length > 0, 'StakingRewardsFactory::startStakings: called before any deploys');
        for (uint i = 0; i < stakingTokens.length; i++) {
            startStaking(stakingTokens[i]);
        }
    }

    /** @dev Function to determine whether the staking and rewards distribution has stared for a given StakingRewards contract
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
     * @param stakingToken The address of the token being staked
     */
    function startStaking(address stakingToken) public {
        require(block.timestamp >= stakingRewardsGenesis, 'StakingRewardsFactory::startStaking: not ready');

        StakingRewardsInfo storage info = stakingRewardsInfoByStakingToken[stakingToken];
        require(info.stakingRewards != address(0), 'StakingRewardsFactory::startStaking: not deployed');
        require(info.rewardAmount > 0 , 'Reward must be greater than zero');
        require(!hasStakingStarted(info.stakingRewards), 'Staking has started');

        uint rewardAmount = info.rewardAmount;
        require(
            StakingRewards(info.stakingRewards).rewardsToken().transfer(info.stakingRewards, rewardAmount),
            'StakingRewardsFactory::startStaking: transfer failed'
        );
        StakingRewards(info.stakingRewards).start(rewardAmount);
    }
}
