ALBT Liqudity Staker
Forked from @uniswap/liquidity-staker



## Project Overview

AllianceBlock Liquidity Staker project aims to provide to the users easy way to stake their liquidity pool tokens and earn rewards based on their stake. The solutions consists of several smart contracts owned by multisignature wallet. 

**V2** of the project introduces a lot of new features for the users. The smart contracts in that version give the users the opportunity to stake rewards tokens for given periods, lock staking tokens for even more rewards, treasury for single sided liquidity functions and others. 

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

**TestERC20**
Contract used only in tests, for easily deploying ERC20 tokens.

**RolesManager**
Contract that would serve as a role manger, creating, removing, granting and revoking roles.

## sdk directory
*Please do not audit this one, not used in the project*

## Smart Contracts Error Codes 
### CompoundingRewardsPoolFactory

- CRPF:Err01: External reward address can't be zero address
- CRPF:Err02: deploy: Staking token address can't be zero address
- CRPF:Err03:deploy: Reward per block must be more than 0
- CRPF:Err04:deploy: Stake limit must be more than 0
- CRPF:Err05:deploy: Throttle round blocks must be more than 0
- CRPF:Err06:deploy: Throttle round cap must be more than 0

### LimitedAutoStake

LAS:Err01:constructor::stake limit should not be 0

LAS:Errr02:onlyUnderStakeLimit::Stake limit reached

### AutoStake

- AS:Err01: Reward pool already set
- AS:Err02: Caller is not the Factory contract
- AS:Err03: AutoStake:OUCSL: Stake limit reached

### Calculator Lib

- CL:Err01:CRA:: Rewards must be > zero

### AbstractPoolsFactory

- APF:Err01:onlyOwner:: The caller is not the owner
- APF:Err02:Cannot set owner to 0x0
- APF:Err03:Sender != proposed owner
- APF:Err04:WLPR:: not deployed

### StakeTransferEnabledFactory

- STEF:Err01:ER::Transferer cannot be 0"
- STEF:Err02:ER::Receiver cannot be 0

### StakeReceiverAutoStake

- SRAS:Err01:delegateStake::No stake sent
- SRAS:Err02:delegateStake::Invalid staker

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

## GO source code

You need Linux and Docker to run this procedure.

In order for other LMAAS back-end projects to call functions on the deployed contracts, Solidity code needs to be translated into the language of those projects.

This can be done using the provided script: `./generate_go_pkg.sh`

Run the following for help: 
```shell
bash ./generate_go_pkg.sh
```

Currently generated files:

```shell
bash ./generate_go_pkg.sh contracts LiquidityMiningCampaign staker staker
bash ./generate_go_pkg.sh contracts LockScheme lock staker/lock
bash ./generate_go_pkg.sh contracts/V2 NonCompoundingRewardsPool stakingcamp stakingcamp
```