<h2 align="center">ALBT Liqudity Staker</h2>
Forked from @uniswap/liquidity-staker

## Project Overview

AllianceBlock Liquidity Staker project aims to provide to the users easy way to stake their liquidity pool tokens and earn rewards based on their stake. The solutions consists of several smart contracts owned by multisignature wallet. 

## StakingRewards.sol

Smart contract handling staking of tokens and rewards distribution. The smart contract exposes functionalities for staking tokens, claiming rewards and withdrawing the stake.  Rewards can be extend with providing additional token amount to rewards. 

## StakingRewardsFactory.sol

Factory contract handling the deployment of StakingRewards. The factory, also handles starting the staking and extending the rewards for given StakingReward.

## RewardsDistributionRecipient.sol

Helper contract with only one modifier, checking whether a caller is eligible of making changes to the StakingRewards contract.

## Usage
```bash
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