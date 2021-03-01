ALBT Liqudity Staker
Forked from @uniswap/liquidity-staker



## Project Overview

AllianceBlock Liquidity Staker project aims to provide to the users easy way to stake their liquidity pool tokens and earn rewards based on their stake. The solutions consists of several smart contracts owned by multisignature wallet. 

**V2** of the project introduces a lot of new features for the users. The smart contracts in that version are give the users the opportunity to stake rewards tokens for given periods, lock staking tokens for even more rewards, treasury functions and others. 

## V1
### StakingRewards.sol

Smart contract handling staking of tokens and rewards distribution. The smart contract exposes functionalities for staking tokens, claiming rewards and withdrawing the stake.  Rewards can be extended by providing additional token amount to rewards. 

### StakingRewardsFactory.sol

Factory contract handling the deployment of StakingRewards. The factory, also handles starting the staking and extending the rewards for given StakingReward.

### RewardsDistributionRecipient.sol

Helper contract with only one modifier, checking whether a caller is eligible of making changes to the StakingRewards contract.

## V2
### Liquidity Mining
This category consists of several smart contract having that name plus the LockScheme contract. These contract will handle most of the lofig for staking liquidity pool tokens and earn rewards based on the stake. The LockScheme contracts will provide different options for locking periods, with different bonus calcultions ontop of the earned reward.

### Features Contracts
Feature contracts are composed for better readability. Each contract holds different feature. StakeTransfere and StakeReceiver contracts, handle the transfers of stake from one active stake campaign to another from behalf of the user. Other contracts are limitating the features for different staking contracts, that can provide only staking or exiting for example.

### Treasury
Treasury operated smart contracts, will have the ability to withdraw staked funds from the pools, and stake them elsewhere. With this approach, when the funds are returned there will be bonus reward on top.

### Auto Staking
Auto-Staking contract support the feature that will provide the users with the ability to automatically stake their rewards tokens. In that way the users will earn more rewards. All of this will be done with the knowledge of the user.

### Helper Conctracts
**Mocks**
These contracts are helping and making the test process easier and faster.

**Percentage Calculator**
This contract provides еasier and more precise calculations of perentages.

## sdk directory
*Please do not audit this one, not used in the project*

## Usage
```
# Requirements:
node v10.17

npm install 
npm install -g etherlime

# Compile
etherlime compile

# Start local ganache 
etherlime ganache

# Run unit tests
etherlime test
```
