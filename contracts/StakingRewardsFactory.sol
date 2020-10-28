// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

import "openzeppelin-solidity-2.3.0/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity-2.3.0/contracts/ownership/Ownable.sol";
import "./StakingRewards.sol";

contract StakingRewardsFactory is Ownable {
    uint256 public stakingRewardsGenesis;

    /** @dev the staking tokens for which the rewards contract has been deployed
     */
    address[] public stakingTokens;

    /** @dev Mapping holding information about a particular Staking Rewards Contract Address by Staking Token
     */
    mapping(address => address) public stakingRewardsByStakingToken;

    /** @dev Mapping holding information about a particular Rewards Tokens by Staking Token
     */
    mapping(address => address[]) public rewardsTokensByStakingToken;

    /** @dev Mapping holding information about a particular Rewards Amounts by Staking Token
     */
    mapping(address => uint256[]) public rewardsAmountsByStakingToken;

    function getRewardsTokensCount(address stakingToken)
        public
        view
        returns (uint)
    {
        return rewardsTokensByStakingToken[stakingToken].length;
    }

    /* ========== CONSTRUCTOR ========== */

    /** @dev Function called once on deployment time
     * @param _stakingRewardsGenesis Timestamp after which the staking can start
     */
    constructor(
        uint _stakingRewardsGenesis
    ) Ownable() public {
        require(_stakingRewardsGenesis >= block.timestamp, 'StakingRewardsFactory::constructor: genesis too soon');

        stakingRewardsGenesis = _stakingRewardsGenesis;
    }

    /* ========== Permissioned FUNCTIONS ========== */

    /** @dev Deploy a staking reward contract for the staking token, and store the reward amount,the reward will be distributed to the staking reward contract no sooner than the genesis
     * @param _stakingToken The address of the token being staked
     * @param _rewardsTokens The addresses of the tokens the rewards will be paid in
     * @param _rewardsAmounts The reward amounts
     * @param _rewardsDuration Rewards duration in seconds
     */
    function deploy(
        address          _stakingToken,
        address[] memory _rewardsTokens,
        uint[]    memory _rewardsAmounts,
        uint             _rewardsDuration
    ) public onlyOwner {
        require(stakingRewardsByStakingToken[_stakingToken] == address(0), 'StakingRewardsFactory::deploy: already deployed');
        require(_rewardsDuration > 0, 'StakingRewardsFactory::deploy:The Duration should be greater than zero');
        require(_rewardsTokens.length > 0 && _rewardsAmounts.length > 0, 'StakingRewardsFactory::deploy: RewardsTokens and RewardsAmounts arrays could not be empty');
        require(_rewardsTokens.length == _rewardsAmounts.length, 'StakingRewardsFactory::deploy: RewardsTokens and RewardsAmounts should have a matching sizes');

        for (uint i = 0; i < _rewardsTokens.length; i++) {
            require(_rewardsTokens[i] != address(0), 'StakingRewardsFactory::deploy: Reward token address could not be invalid');
            require(_rewardsAmounts[i] > 0, 'StakingRewardsFactory::deploy: Reward must be greater than zero');
        }

        stakingRewardsByStakingToken[_stakingToken] = address(new StakingRewards(/*_rewardsDistribution=*/ address(this), _rewardsTokens, _stakingToken, _rewardsDuration));
        rewardsTokensByStakingToken[_stakingToken] = _rewardsTokens;
        rewardsAmountsByStakingToken[_stakingToken] = _rewardsAmounts;

        stakingTokens.push(_stakingToken);
    }

    /** @dev Function that will extend the rewards period, but not change the reward rate, for a given staking contract.
     * @param stakingToken The address of the token being staked
     * @param extendRewardToken The address of the token the rewards will be paid in
     * @param extendRewardAmount The additional reward amount
     */
    function extendRewardPeriod(
        address stakingToken,
        address extendRewardToken,
        uint256 extendRewardAmount
    )
        public
        onlyOwner
    {
        require(extendRewardAmount > 0, 'StakingRewardsFactory::extendRewardPeriod: Reward must be greater than zero');

        address sr = stakingRewardsByStakingToken[stakingToken]; // StakingRewards

        require(sr != address(0), 'StakingRewardsFactory::extendRewardPeriod: not deployed');
        require(hasStakingStarted(sr), 'StakingRewardsFactory::extendRewardPeriod: Staking has not started');

        (IERC20 tkn, uint256 rate, , , ) = StakingRewards(sr).rewardsTokensMap(extendRewardToken);

        require(rate > 0, 'StakingRewardsFactory::extendRewardPeriod: Token for extending reward is not known'); // its expected that valid token should have a valid rate

        tkn.approve(sr, extendRewardAmount);
        StakingRewards(sr).addRewards(extendRewardToken, extendRewardAmount);
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
        returns (bool)
    {
        return StakingRewards(stakingRewards).hasPeriodStarted();
    }

    /** @dev Starts the staking and rewards distribution for a given staking token. This is a fallback in case the startsStakings() costs too much gas to call for all contracts
     * @param stakingToken The address of the token being staked
     */
    function startStaking(address stakingToken) public {
        require(block.timestamp >= stakingRewardsGenesis, 'StakingRewardsFactory::startStaking: not ready');

        address sr = stakingRewardsByStakingToken[stakingToken]; // StakingRewards
        address[] storage rts = rewardsTokensByStakingToken[stakingToken]; // RewardTokenS
        uint256[] storage ras = rewardsAmountsByStakingToken[stakingToken]; // RewardAmountS

        require(sr != address(0), 'StakingRewardsFactory::startStaking: not deployed');
        require(!hasStakingStarted(sr), 'StakingRewardsFactory::startStaking: Staking has started');

        for (uint i = 0; i < rts.length; i++) {
            require(
                IERC20(rts[i]).transfer(sr, ras[i]),
                'StakingRewardsFactory::startStaking: transfer failed'
            );
        }

        StakingRewards(sr).start(rts, ras);
    }
}