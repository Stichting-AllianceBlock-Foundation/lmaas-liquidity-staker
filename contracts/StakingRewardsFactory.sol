// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./StakingRewards.sol";

contract StakingRewardsFactory is Ownable {
    using SafeERC20Detailed for IERC20Detailed;

    uint256 public stakingRewardsGenesis;

    /** @dev the staking tokens for which the rewards contract has been deployed
     */
    address[] public stakingTokens;

    /** @dev Mapping holding information about a particular Staking Rewards Contract Address by Staking Token
     */
    mapping(address => address) public stakingRewardsByStakingToken;

    /* ========== CONSTRUCTOR ========== */

    /** @dev Function called once on deployment time
     * @param _stakingRewardsGenesis Timestamp after which the staking can start
     */
    constructor(uint256 _stakingRewardsGenesis) public {
        require(
            _stakingRewardsGenesis >= block.timestamp,
            "StakingRewardsFactory::constructor: genesis too soon"
        );

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
        address _stakingToken,
        address[] calldata _rewardsTokens,
        uint256[] calldata _rewardsAmounts,
        uint256 _rewardsDuration
    ) external onlyOwner {
        require(
            stakingRewardsByStakingToken[_stakingToken] == address(0),
            "StakingRewardsFactory::deploy: already deployed"
        );
        require(
            _rewardsDuration != 0,
            "StakingRewardsFactory::deploy:The Duration should be greater than zero"
        );
        require(
            _rewardsTokens.length != 0,
            "StakingRewardsFactory::deploy: RewardsTokens and RewardsAmounts arrays could not be empty"
        );
        require(
            _rewardsTokens.length == _rewardsAmounts.length,
            "StakingRewardsFactory::deploy: RewardsTokens and RewardsAmounts should have a matching sizes"
        );

        for (uint256 i = 0; i < _rewardsTokens.length; i++) {
            require(
                _rewardsTokens[i] != address(0),
                "StakingRewardsFactory::deploy: Reward token address could not be invalid"
            );
            require(
                _rewardsAmounts[i] != 0,
                "StakingRewardsFactory::deploy: Reward must be greater than zero"
            );
        }

        stakingRewardsByStakingToken[_stakingToken] = address(
            new StakingRewards(
                _rewardsTokens,
                _rewardsAmounts,
                _stakingToken,
                _rewardsDuration
            )
        );

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
    ) external onlyOwner {
        require(
            extendRewardAmount != 0,
            "StakingRewardsFactory::extendRewardPeriod: Reward must be greater than zero"
        );

        address sr = stakingRewardsByStakingToken[stakingToken]; // StakingRewards

        require(
            sr != address(0),
            "StakingRewardsFactory::extendRewardPeriod: not deployed"
        );
        require(
            hasStakingStarted(sr),
            "StakingRewardsFactory::extendRewardPeriod: Staking has not started"
        );

        (uint256 rate, , , , ) =
            StakingRewards(sr).rewardsTokensMap(extendRewardToken);

        require(
            rate != 0,
            "StakingRewardsFactory::extendRewardPeriod: Token for extending reward is not known"
        ); // its expected that valid token should have a valid rate

        IERC20Detailed(extendRewardToken).safeApprove(sr, extendRewardAmount);
        StakingRewards(sr).addRewards(extendRewardToken, extendRewardAmount);
    }

    /* ========== Permissionless FUNCTIONS ========== */

    /** @dev Calls startStakings for all staking tokens.
     */
    function startStakings() external {
        require(
            stakingTokens.length != 0,
            "StakingRewardsFactory::startStakings: called before any deploys"
        );

        for (uint256 i = 0; i < stakingTokens.length; i++) {
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

    /** @dev Starts the staking and rewards distribution for a given staking token. This is a fallback in case the startStakings() costs too much gas to call for all contracts
     * @param stakingToken The address of the token being staked
     */
    function startStaking(address stakingToken) public {
        require(
            block.timestamp >= stakingRewardsGenesis,
            "StakingRewardsFactory::startStaking: not ready"
        );

        address sr = stakingRewardsByStakingToken[stakingToken]; // StakingRewards

        StakingRewards srInstance = StakingRewards(sr);
        require(
            sr != address(0),
            "StakingRewardsFactory::startStaking: not deployed"
        );
        require(
            !hasStakingStarted(sr),
            "StakingRewardsFactory::startStaking: Staking has started"
        );

        uint256 rtsSize = srInstance.getRewardsTokensCount();
        for (uint256 i = 0; i < rtsSize; i++) {
            require(
                IERC20Detailed(srInstance.rewardsTokensArr(i)).transfer(
                    sr,
                    srInstance.rewardsAmountsArr(i)
                ),
                "StakingRewardsFactory::startStaking: transfer failed"
            );
        }

        srInstance.start();
    }

    /** @dev Triggers the withdrawal of LP rewards from the staking rewards contract to the given recipient address
     * @param stakingToken The address of the token being staked
     * @param recipient The address to whom the rewards will be trasferred
     * @param lpTokenContract The address of the rewards contract
     */
    function withdrawLPRewards(
        address stakingToken,
        address recipient,
        address lpTokenContract
    ) external onlyOwner {
        address sr = stakingRewardsByStakingToken[stakingToken]; // StakingRewards

        require(
            sr != address(0),
            "StakingRewardsFactory::startStaking: not deployed"
        );
        StakingRewards srInstance = StakingRewards(sr);
        srInstance.withdrawLPRewards(recipient, lpTokenContract);
    }
}
