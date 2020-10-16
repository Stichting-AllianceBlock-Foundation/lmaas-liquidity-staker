pragma solidity ^0.5.16;

import 'openzeppelin-solidity-2.3.0/contracts/token/ERC20/IERC20.sol';
import 'openzeppelin-solidity-2.3.0/contracts/ownership/Ownable.sol';

import './StakingRewards.sol';

contract StakingRewardsFactory is Ownable {
    // immutables
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
        uint _stakingRewardsGenesis
    ) Ownable() public {
        require(_stakingRewardsGenesis >= block.timestamp, 'StakingRewardsFactory::constructor: genesis too soon');

        stakingRewardsGenesis = _stakingRewardsGenesis;
    }

    ///// permissioned functions

    // deploy a staking reward contract for the staking token, and store the reward amount
    // the reward will be distributed to the staking reward contract no sooner than the genesis
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

    ///// permissionless functions

    // call startStakings for all staking tokens. 
    function startStakings() public {
        require(stakingTokens.length > 0, 'StakingRewardsFactory::startStakings: called before any deploys');
        for (uint i = 0; i < stakingTokens.length; i++) {
            startStaking(stakingTokens[i]);
        }
    }

    function hasStakingStarted(address stakingRewards) public view returns (bool _isStakignStared) {
       return (StakingRewards(stakingRewards).periodFinish() > 0 );
    }
    // starts staking for an individual staking token.
    // this is a fallback in case the startsStakings() costs too much gas to call for all contracts
    function startStaking(address stakingToken ) public {
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

    function extendRewardPeriod(address stakingToken, uint256 rewardsAmount) public {
        require(rewardsAmount > 0, 'Reward amount should be greater than zero');
        StakingRewardsInfo storage info = stakingRewardsInfoByStakingToken[stakingToken];
        require(info.stakingRewards != address(0), 'StakingRewardsFactory::extendRewardPeriod: not deployed');
        require(hasStakingStarted(info.stakingRewards), 'Staking has not started');

        StakingRewards(info.stakingRewards).rewardsToken().approve(info.stakingRewards, rewardsAmount);
            
        StakingRewards(info.stakingRewards).addRewards(rewardsAmount);
    }
}