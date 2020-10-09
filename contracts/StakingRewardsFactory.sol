pragma solidity ^0.5.16;

import 'openzeppelin-solidity-2.3.0/contracts/token/ERC20/IERC20.sol';
import 'openzeppelin-solidity-2.3.0/contracts/ownership/Ownable.sol';

import './StakingRewards.sol';

contract StakingRewardsFactory is Ownable {
    // immutables
    address public rewardsToken;
    uint public stakingRewardsGenesis;

    // the staking tokens for which the rewards contract has been deployed
    address[] public stakingTokens;

    // info about rewards for a particular staking token
    struct StakingRewardsInfo {
        address stakingRewards;
        uint rewardAmount;
    }

    // rewards info by staking token
    mapping(address => StakingRewardsInfo) public stakingRewardsInfoByStakingToken;

    constructor(
        address _rewardsToken,
        uint _stakingRewardsGenesis
    ) Ownable() public {
        require(_stakingRewardsGenesis >= block.timestamp, 'StakingRewardsFactory::constructor: genesis too soon');

        rewardsToken = _rewardsToken;
        stakingRewardsGenesis = _stakingRewardsGenesis;
    }

    ///// permissioned functions

    // deploy a staking reward contract for the staking token, and store the reward amount
    // the reward will be distributed to the staking reward contract no sooner than the genesis
    function deploy(address stakingToken, uint rewardAmount) public onlyOwner {
        StakingRewardsInfo storage info = stakingRewardsInfoByStakingToken[stakingToken];
        require(info.stakingRewards == address(0), 'StakingRewardsFactory::deploy: already deployed');

        info.stakingRewards = address(new StakingRewards(/*_rewardsDistribution=*/ address(this), rewardsToken, stakingToken));
        info.rewardAmount = rewardAmount;
        stakingTokens.push(stakingToken);
    }

    ///// permissionless functions

    // call startStakings for all staking tokens. 
    function startStakings() public {
        require(stakingTokens.length > 0, 'StakingRewardsFactory::notifyRewardAmounts: called before any deploys');
        for (uint i = 0; i < stakingTokens.length; i++) {
            startStaking(stakingTokens[i]);
        }
    }

    function isStakingStarted(address stakingToken) public view returns (bool _isStakignStared) {
       uint256 stakingStarted = StakingRewards(stakingToken).periodFinish();
       if(stakingStarted > 0) {
           return true;
       }
       return false;
    }
    // startsstaking for an individual staking token.
    // this is a fallback in case the startsStakings() costs too much gas to call for all contracts
    function startStaking(address stakingToken ) public {
        require(block.timestamp >= stakingRewardsGenesis, 'StakingRewardsFactory::notifyRewardAmount: not ready');

        StakingRewardsInfo storage info = stakingRewardsInfoByStakingToken[stakingToken];
        require(info.stakingRewards != address(0), 'StakingRewardsFactory::notifyRewardAmount: not deployed');
        require(info.rewardAmount > 0 , "Reward must be greater than zero");
        require(!isStakingStarted(stakingToken), 'Staking has started');

        uint rewardAmount = info.rewardAmount;
        require(
            IERC20(rewardsToken).transfer(info.stakingRewards, rewardAmount),
            'StakingRewardsFactory::notifyRewardAmount: transfer failed'
        );
            StakingRewards(info.stakingRewards).start(rewardAmount);
    }

    function extendRewardPeriod(address stakingToken, uint256 rewardsAmount) public {
        require(rewardsAmount > 0, "Reward amount should be greater than zero");
        StakingRewardsInfo storage info = stakingRewardsInfoByStakingToken[stakingToken];
        require(info.stakingRewards != address(0), 'StakingRewardsFactory::notifyRewardAmount: not deployed');
        require(!isStakingStarted(stakingToken), 'Staking has started');

        require(
                IERC20(rewardsToken).approve(info.stakingRewards, rewardsAmount),
                'StakingRewardsFactory::notifyRewardAmount: transfer failed'
            );
        StakingRewards(info.stakingRewards).addRewards(rewardsAmount);
    }
}