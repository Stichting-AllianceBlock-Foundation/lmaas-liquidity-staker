const ethers = require('ethers');
const etherlime = require('etherlime-lib');

// Contracts
const TestERC20 = require('../build/TestERC20.json');
const LockScheme = require('../build/LockScheme.json');
const LMC = require("../build/LiquidityMiningCampaign.json");
const PercentageCalculator = require('../build/PercentageCalculator.json');

// Utils
const { mineBlock } = require('./utils');
const { parseEther, formatEther } = ethers.utils;

// Accounts
AAlice = {
  address: accounts[3].signer.address,
  secret: accounts[3].secretKey
};

ABob = {
  address: accounts[4].signer.address,
  secret: accounts[4].secretKey
};

// Instances
let instLockScheme;
let instLMC;
let instStakingTokens;
let instRewardTokens;
let instPercentageCalculator;

// Addresses
let addrStakingTokens;

let rewardTokensAddresses;
let rewardPerBlock;
let lockSchemеs;
let libraries;

// Rewards settings
const rewardTokensCount = 1;
const bonusPermile = 50000;

// Lock scheme settings
let startBlock;
let endBlock;
let lockBlock;
let rampUpBlock;

// Amounts
const amount = parseEther("1000000");
const bOne = parseEther("1");
const bFive = parseEther("5");
const bTen = parseEther("10");
const bTwenty = parseEther("20");
const bThirty = parseEther("30");

const standardStakingAmount = parseEther('10');
const stakeLimit = amount;
const contractStakeLimit = parseEther('35');

let throttleRoundBlocks = 10;
let throttleRoundCap = parseEther("1");

const getBalancesByAddress = async (_address, _message = '') => {
  const balanceStakingToken = await instStakingTokens.balanceOf(_address);
  const balanceLMC = await instLMC.balanceOf(_address);
  const balanceRewardTokens = await rewardTokensInstances[0].balanceOf(_address);
  const userInfoLockScheme = await instLockScheme.userInfo(_address);
  const userBonus = await instLockScheme.getUserBonus(_address);
  const getUserAccruedReward = await instLockScheme.getUserAccruedReward(_address);
  const userTokensOwed = await instLMC.getUserOwedTokens(_address, 0);

  console.log(``);
  console.log(`========================`);
  
  if (_message !== '') {
    console.log(`--- ${_message} ---`);
  }

  console.log(`Balances:`);
  console.log(`* Staking Token: ${formatEther(balanceStakingToken)}`);
  console.log(`* LMC: ${formatEther(balanceLMC)}`);
  console.log(`* Reward Token: ${formatEther(balanceRewardTokens)}`);
  console.log(`* User Tokens Owed: ${formatEther(userTokensOwed)}`);
  console.log(``);
  console.log(`User info in Lock Scheme:`);
  console.log(`* Balance: ${formatEther(userInfoLockScheme.balance)}`);
  console.log(`* Accrued Reward: ${formatEther(userInfoLockScheme.accruedReward)}`);
  console.log(`* Accrued Reward from Function: ${formatEther(getUserAccruedReward)}`);
  console.log(`* User Bonus: ${formatEther(userBonus)}`);
  console.log(`========================`);
  console.log(``);
}

const setupRewardsPoolParameters = async (deployer) => {
  rewardTokensInstances = [];
  rewardTokensAddresses = [];
  rewardPerBlock = [];
  lockSchemеs = [];
  lockSchemеsNoLock = [];

  for (i = 0; i < rewardTokensCount; i++) {
    const instTokeReward = await deployer.deploy(TestERC20, {}, amount);

    // Populate tokens
    rewardTokensInstances.push(instTokeReward);
    rewardTokensAddresses.push(instTokeReward.contractAddress);

    // Populate amounts
    let parsedReward = await parseEther(`${i + 1}`);
    rewardPerBlock.push(parsedReward);
  }

  const currentBlock = await deployer.provider.getBlock('latest');

  startBlock = currentBlock.number + 10;
  endBlock = startBlock + 61;
  lockBlock = 30;
  rampUpBlock = 20;
}

describe.only('LMC Refactored', () => {

  beforeEach(async () => {
    // Get deployer
    deployer = new etherlime.EtherlimeGanacheDeployer(AAlice.secret);

    // Deploy staking token
    instStakingTokens = await deployer.deploy(TestERC20, {}, amount);

    // Mint tokens to deployer
    await instStakingTokens.mint(AAlice.address, bThirty);

    // Get staking token address
    addrStakingTokens = instStakingTokens.contractAddress;

    // Set rewards pool
    await setupRewardsPoolParameters(deployer);

    // Deploy percent calculator
    instPercentageCalculator = await deployer.deploy(PercentageCalculator);

    // Set libraries
    libraries = {
      PercentageCalculator: instPercentageCalculator.contractAddress
    }

    // Deploy LMC
    instLMC = await deployer.deploy(
      LMC,
      {},
      addrStakingTokens,
      startBlock,
      endBlock,
      rewardTokensAddresses,
      rewardPerBlock,
      rewardTokensAddresses[0],
      stakeLimit,
      contractStakeLimit
    );

    // Deploy lock scheme
    instLockScheme = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPermile, instLMC.contractAddress);

    lockSchemеs.push(instLockScheme.contractAddress);

    // Set lock scheme
    await instLMC.setLockSchemes(lockSchemеs);

    // Mint reward tokens
    await rewardTokensInstances[0].mint(instLMC.contractAddress, amount);
  });

  it("Should deploy the lock scheme successfully", async () => {
    assert.isAddress(instLockScheme.contractAddress, "The LockScheme contract was not deployed");
    assert.isAddress(instLMC.contractAddress, "The LMC contract was not deployed");
  });

  it("Should have proper balances", async () => {
    const deployerBalance = await instStakingTokens.balanceOf(AAlice.address);
    const LMCBalance = await instStakingTokens.balanceOf(instLMC.contractAddress);
    const LMCRewardBalance = await rewardTokensInstances[0].balanceOf(instLMC.contractAddress);

    assert(deployerBalance.eq(amount.add(bThirty)), "Deployer balance is wrong");
    assert(LMCBalance.eq(0), "LMC balance is wrong");
    assert(LMCRewardBalance.eq(amount), "LMC Reward balance is wrong");
  });

  describe("Staking and Locking", () => {

    beforeEach(async () => {
      // Approvals
      await instStakingTokens.approve(instLockScheme.contractAddress, amount);
      await instStakingTokens.approve(instLMC.contractAddress, amount);

      // Get current block and mine till campaign start
      const currentBlock = await deployer.provider.getBlock('latest');
      const blocksDelta = (startBlock - currentBlock.number);

      for (let i = 0; i < blocksDelta; i++) {
        await mineBlock(deployer.provider);
      }
    });

    it("Should stake and lock sucessfully", async () => {
      const LMCInitialBalance = await instStakingTokens.balanceOf(instLMC.contractAddress);
      const InitialBalance = await instStakingTokens.balanceOf(AAlice.address);

      await instLMC.stakeAndLock(bTen, instLockScheme.contractAddress);

      const LMCFinalBalance = await instStakingTokens.balanceOf(instLMC.contractAddress);
      const deployerFinalBalance = await instStakingTokens.balanceOf(AAlice.address);

      const totalStakedAmount = await instLMC.totalStaked();
      const userInfo = await instLMC.userInfo(AAlice.address);
      const userRewardDebt = await instLMC.getUserRewardDebt(AAlice.address, 0);
      const userOwedToken = await instLMC.getUserOwedTokens(AAlice.address, 0);

      const userInfoLock = await instLockScheme.userInfo(AAlice.address);
      const userBonus = await instLockScheme.getUserBonus(AAlice.address);
      const userAccruedRewards = await instLockScheme.getUserAccruedReward(AAlice.address);

      const currentBlock = await deployer.provider.getBlock('latest');

      assert(LMCFinalBalance.eq(LMCInitialBalance.add(bTen)), "The balance of the contract was not incremented properly");
      assert(userInfoLock.balance.eq(bTen), "The transferred amount is not corrent");
      assert(userInfoLock.lockInitialStakeBlock.eq(currentBlock.number), "The lock block is not set properly");
      assert(userAccruedRewards.eq(0), "The rewards were not set properly");
      assert(userBonus.eq(0), "User bonuses should be equal to zero");
      assert(totalStakedAmount.eq(bTen), "The stake was not successful")
      assert(userInfo.amountStaked.eq(bTen), "User's staked amount is not correct")
      assert(userInfo.firstStakedBlockNumber.eq(currentBlock.number), "User's first block is not correct")
      assert(userRewardDebt.eq(0), "User's reward debt is not correct")
      assert(userOwedToken.eq(0), "User's reward debt is not correct")
      assert(deployerFinalBalance.eq(InitialBalance.sub(bTen)), "User was not charged for staking");

      await mineBlock(deployer.provider);

      const accumulatedReward = await instLMC.getUserAccumulatedReward(AAlice.address, 0);
      assert(accumulatedReward.eq(bOne), "The reward accrued was not 1 token");
    });

    it.only("Should stake and lock sucessfully twice", async () => {
      const LMCInitialBalance = await instStakingTokens.balanceOf(instLMC.contractAddress);
      const InitialBalance = await instStakingTokens.balanceOf(AAlice.address);

      // await getBalancesByAddress(AAlice.address, "Before first stake");

      // Stake and Lock 
      await instLMC.stakeAndLock(bTen, instLockScheme.contractAddress);

      // Mine 10 blocks
      let blocksDelta = 11;

      for (let i = 0; i < blocksDelta; i++) {
        await mineBlock(deployer.provider);
      }

      await getBalancesByAddress(AAlice.address, "Before second stake");

      // Stake and Lock again
      await instLMC.stakeAndLock(bTen, instLockScheme.contractAddress);

      // Mine 20 blocks
      blocksDelta = 21;

      for (let i = 0; i < blocksDelta; i++) {
        await mineBlock(deployer.provider);
      }

      await getBalancesByAddress(AAlice.address, "Before exit");

      // Exit and Unlock
      await instLMC.exitAndUnlock();

      await getBalancesByAddress(AAlice.address, "After exit");
    });
  });

  describe("Withdraw and Exit with Only One Lock Scheme", () => {

    beforeEach(async () => {
      // Approvals
      await instStakingTokens.approve(instLockScheme.contractAddress, amount);
      await instStakingTokens.approve(instLMC.contractAddress, amount);

      // Get current block and mine till campaign starts
      let currentBlock = await deployer.provider.getBlock('latest');
      let blocksDelta = (startBlock - currentBlock.number);

      for (let i = 0; i < blocksDelta; i++) {
        await mineBlock(deployer.provider);
      }

      // Stake and lock
      await instLMC.stakeAndLock(bTen, instLockScheme.contractAddress);

      // Get current block and mine till campaign ends
      currentBlock = await deployer.provider.getBlock('latest');
      blocksDelta = (endBlock - currentBlock.number);

      for (let i = 0; i < blocksDelta; i++) {
        await mineBlock(deployer.provider);
      }
    });

    it("Should withdraw and exit sucessfully", async () => {
      const userInitialBalanceStaking = await instStakingTokens.balanceOf(AAlice.address);
      const userInfoInitial = await instLMC.userInfo(AAlice.address);
      const lockSchemeUserInfo = await instLockScheme.userInfo(AAlice.address);
      const userTokensOwedInitial = await instLMC.getUserAccumulatedReward(AAlice.address, 0);
      const userRewards = await instLMC.getUserAccumulatedReward(AAlice.address, 0);
      const initialTotalStakedAmount = await instLMC.totalStaked();
      const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(AAlice.address);

      await instLMC.exitAndUnlock();

      const bonus = await instPercentageCalculator.percentageCalc(userRewards, bonusPermile);
      let userInfo = await instLockScheme.userInfo(AAlice.address);
      let userAccruedRewards = await instLockScheme.getUserAccruedReward(AAlice.address);
      const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(AAlice.address);

      const userTokensOwed = await instLMC.getUserOwedTokens(AAlice.address, 0);
      const userFinalBalanceStaking = await instStakingTokens.balanceOf(AAlice.address);
      const userInfoFinal = await instLMC.userInfo(AAlice.address);
      const finalTotalStakedAmount = await instLMC.totalStaked();

      assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "Rewards claim was not successful")
      assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(userRewards.add(bonus))), "User rewards were not calculated properly")
      assert(userTokensOwed.eq(0), "User tokens owed should be zero")
      assert(userFinalBalanceStaking.eq(userInitialBalanceStaking.add(standardStakingAmount)), "Withdraw was not successfull")
      assert(userInfoFinal.amountStaked.eq(userInfoInitial.amountStaked.sub(standardStakingAmount)), "User staked amount is not updated properly")
      assert(finalTotalStakedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")

      assert(userInfo.balance.eq(0), "The transferred amount is not corrent");
      assert(userAccruedRewards.eq(0), "The rewards were not set properly");
    });
  })
});