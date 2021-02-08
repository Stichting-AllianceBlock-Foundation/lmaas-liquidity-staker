// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./RewardsPool.sol";

contract RewardsPoolFactory is Ownable {
    using SafeERC20Detailed for IERC20Detailed;

    uint256 public rewardsPoolGenesis;

    /** @dev all liquidity mining campaigns
     */
    address[] public rewardsPools;

    event LiquidityMiningCampaignDeployed(address indexed rewardsPoolAddress, address indexed stakingToken);

    /* ========== CONSTRUCTOR ========== */

    /** @dev Function called once on deployment time
     * @param _rewardsPoolGenesis Timestamp after which the staking can start
     */
    constructor(
        uint256 _rewardsPoolGenesis
    ) public {
        require(_rewardsPoolGenesis >= block.timestamp, 'RewardsPoolFactory::constructor: genesis too soon');

        rewardsPoolGenesis = _rewardsPoolGenesis;
    }

    /* ========== Permissioned FUNCTIONS ========== */

    /** @dev Deploy a reward pool contract for the staking token, and store the reward amount,the reward will be distributed to the reward pool contract no sooner than the genesis
     * @param _stakingToken The address of the token being staked
     * @param _rewardsTokens The addresses of the tokens the rewards will be paid in
     * @param _rewardsAmounts The reward amounts
     * @param _rewardsDuration Rewards duration in seconds
     */
    function deploy(
        address            _stakingToken,
        address[] calldata _rewardsTokens,
        uint256[] calldata _rewardsAmounts,
        uint256            _rewardsDuration
    ) external onlyOwner {
        require(_rewardsDuration != 0, 'RewardsPoolFactory::deploy:The Duration should be greater than zero');
        require(_rewardsTokens.length != 0, 'RewardsPoolFactory::deploy: RewardsTokens and RewardsAmounts arrays could not be empty');
        require(_rewardsTokens.length == _rewardsAmounts.length, 'RewardsPoolFactory::deploy: RewardsTokens and RewardsAmounts should have a matching sizes');

        for (uint256 i = 0; i < _rewardsTokens.length; i++) {
            require(_rewardsTokens[i] != address(0), 'RewardsPoolFactory::deploy: Reward token address could not be invalid');
            require(_rewardsAmounts[i] != 0, 'RewardsPoolFactory::deploy: Reward must be greater than zero');
        }

        address rewardsPool = address(new RewardsPool(_rewardsTokens, _rewardsAmounts, _stakingToken, _rewardsDuration));

        rewardsPools.push(rewardsPool);

        emit LiquidityMiningCampaignDeployed(rewardsPool, _stakingToken);
    }

    /** @dev Function that will extend the rewards period, but not change the reward rate, for a given staking contract.
     * @param rewardsPoolAddress The address of liquidity mining campaign
     * @param extendRewardToken The address of the token the rewards will be paid in
     * @param extendRewardAmount The additional reward amount
     */
    function extendRewardPeriod(
        address rewardsPoolAddress,
        address extendRewardToken,
        uint256 extendRewardAmount
    )
        external
        onlyOwner
    {
        require(extendRewardAmount != 0, 'RewardsPoolFactory::extendRewardPeriod: Reward must be greater than zero');

        require(rewardsPoolAddress != address(0), 'RewardsPoolFactory::extendRewardPeriod: not deployed');
        require(hasStakingStarted(rewardsPoolAddress), 'RewardsPoolFactory::extendRewardPeriod: Staking has not started');

        (uint256 rate, , , ,) = RewardsPool(rewardsPoolAddress).rewardsTokensMap(extendRewardToken);

        require(rate != 0, 'RewardsPoolFactory::extendRewardPeriod: Token for extending reward is not known'); // its expected that valid token should have a valid rate

        IERC20Detailed(extendRewardToken).safeApprove(rewardsPoolAddress, extendRewardAmount);
        RewardsPool(rewardsPoolAddress).addRewards(extendRewardToken, extendRewardAmount);
    }

    /* ========== Permissionless FUNCTIONS ========== */

    /** @dev Calls startStakings for all staking tokens.
     */
    function startStakings() external {
        require(rewardsPools.length != 0, 'RewardsPoolFactory::startStakings: called before any deploys');

        for (uint256 i = 0; i < rewardsPools.length; i++) {
            startStaking(rewardsPools[i]);
        }
    }

    /** @dev Function to determine whether the staking and rewards distribution has stared for a given RewardsPool contract
     * @param rewardsPoolAddress The address of the reward pools contract
     */
    function hasStakingStarted(address rewardsPoolAddress)
        public
        view
        returns (bool)
    {
        return RewardsPool(rewardsPoolAddress).hasPeriodStarted();
    }

    /** @dev Starts the staking and rewards distribution for a given staking token. This is a fallback in case the startStakings() costs too much gas to call for all contracts
     * @param rewardsPoolAddress The address of liquidity mining campaign
     */
    function startStaking(address rewardsPoolAddress) public {
        require(block.timestamp >= rewardsPoolGenesis, 'RewardsPoolFactory::startStaking: not ready');
        require(rewardsPoolAddress != address(0), 'RewardsPoolFactory::startStaking: not deployed');


        RewardsPool srInstance = RewardsPool(rewardsPoolAddress);
       
        require(!hasStakingStarted(rewardsPoolAddress), 'RewardsPoolFactory::startStaking: Staking has started');

        uint256 rtsSize = srInstance.getRewardsTokensCount();
        for (uint256 i = 0; i < rtsSize; i++) {
            require(
                IERC20Detailed(srInstance.rewardsTokensArr(i))
                    .transfer(rewardsPoolAddress, srInstance.rewardsAmountsArr(i)),
                'RewardsPoolFactory::startStaking: transfer failed'
            );
        }

        srInstance.start();
    }

    /** @dev Triggers the withdrawal of LP rewards from the rewards pool contract to the given recipient address
     * @param rewardsPoolAddress The address of the token being staked
     * @param recipient The address to whom the rewards will be trasferred
     * @param lpTokenContract The address of the rewards contract
     */
    function withdrawLPRewards(address rewardsPoolAddress, address recipient, address lpTokenContract)
        external
        onlyOwner {

        require(rewardsPoolAddress != address(0), 'RewardsPoolFactory::startStaking: not deployed');
        RewardsPool srInstance = RewardsPool(rewardsPoolAddress);
        srInstance.withdrawLPRewards(recipient, lpTokenContract);
        
    }

    /** @dev Triggers the withdrawal of rewards from the rewards pool contract.
     * @param rewardsPoolAddress The address of the token being staked
     */
    function withdrawRewards(address rewardsPoolAddress)
        external
        onlyOwner {
            
        require(rewardsPoolAddress != address(0), 'RewardsPoolFactory::startStaking: not deployed');
        RewardsPool srInstance = RewardsPool(rewardsPoolAddress);
        srInstance.withdrawRewards();
    }

    /** @dev Returns the total number of rewards pools.
     */
    function getRewardsPoolNumber() public view returns (uint256) {
        return rewardsPools.length;
    }

}
