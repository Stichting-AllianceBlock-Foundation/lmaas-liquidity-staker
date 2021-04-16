const etherlime = require('etherlime-lib')
const ethers = require('ethers')

const { parseEther, formatEther } = ethers.utils

const TestERC20 = require('../build/TestERC20.json')
const LMCFactory = require('../build/LiquidityMiningCampaignFactory.json')
const LMC = require('../build/LiquidityMiningCampaign.json')
const LockScheme = require('../build/LockScheme.json')
const PercentageCalculator = require('../build/PercentageCalculator.json')

// CONTSANTS
const BLOCKS_PER_DAY = 6500
const BLOCKS_PER_HOUR = 270
const BLOCKS_PER_MINUTE = 5

let rewardTokensInstances = []
let rewardTokensAddresses = []
let rewardsPerBlock = [parseEther("1")]
let throttleRoundBlocks = BLOCKS_PER_MINUTE * 10

const stakeLimit = parseEther("1000")
const contractStakeLimit = parseEther("100000000")

const gasPrice = { gasPrice: 20000000000 }
const amountReward = parseEther("1000000000000000")

const deploy = async (network, secret, etherscanApiKey) => {
  const deployer = new etherlime.EtherlimeGanacheDeployer("0x2030b463177db2da82908ef90fa55ddfcef56e8183caf60db464bc398e736e6f")
  const wallet = new ethers.Wallet("0x2030b463177db2da82908ef90fa55ddfcef56e8183caf60db464bc398e736e6f", deployer.provider)

  // Deploy LMC Factory
  const LMCFactoryInstance = await deployer.deploy(LMCFactory, {})
  console.log('\x1b[36m%s\x1b[0m', `--- LMC Factory address: ${LMCFactoryInstance.contractAddress} ---`)

  // Deploy Staking token
  const stakingTokenInstance = await deployer.deploy(TestERC20, {}, amountReward)
  await stakingTokenInstance.mint(LMCFactoryInstance.contractAddress, amountReward)

  // Rewards tokens
  let tknInst = await deployer.deploy(TestERC20, {}, amountReward)
  rewardTokensInstances.push(tknInst)
  rewardTokensAddresses.push(tknInst.contractAddress)

  await rewardTokensInstances[0].mint(LMCFactoryInstance.contractAddress, amountReward)

  // LMC settings
  const currentBlock = await deployer.provider.getBlock('latest')
  const startBlock = currentBlock.number + 5
  const endBlock = startBlock + BLOCKS_PER_DAY * 7

  await LMCFactoryInstance.deploy(stakingTokenInstance.contractAddress, startBlock, endBlock, rewardTokensAddresses, rewardsPerBlock, rewardTokensAddresses[0], stakeLimit, contractStakeLimit);

  const lmcAddress = await LMCFactoryInstance.rewardsPools(0);
  const LMCInstance = await etherlime.ContractAt(LMC, lmcAddress);

  const percentageCalculator = await deployer.deploy(PercentageCalculator);
  
  const libraries = {
    PercentageCalculator: percentageCalculator.contractAddress
  }
  
  const lockBlock = startBlock + (BLOCKS_PER_DAY * 2)
  const rampUpBlock = startBlock + (BLOCKS_PER_DAY * 1)
  const bonusPermile = 50000

  const lockSchemеs = [];

  // Deploy Lock Scheme
  const LSCInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPermile, LMCInstance.contractAddress);

  lockSchemеs.push(LSCInstance.contractAddress);

  // Set Lock Scheme
  await LMCFactoryInstance.setLockSchemesToLMC(lockSchemеs, LMCInstance.contractAddress);

  // Stake some tokens
  // await LMCInstance.stakeAndLock(parseEther("10"), LSCInstance.contractAddress);

  /*
  console.log(`
helperContracts: {
  "factory" : "${NonCompoundingRewardsPoolFactoryInstance.contractAddress}",
  "treasury": "${TreasuryInstance.contractAddress}"
},
  `)

  console.log(`
stakerContracts: {
    "bALBT-0M": "${nonCompoundingPool0}",
    "bALBT-1M": "${nonCompoundingPool1}",
    "bALBT-3M": "${nonCompoundingPool3}",
    "bALBT-6M": "${nonCompoundingPool6}",
    "bALBT-12M": "${nonCompoundingPool12}",
    "bALBT-24M": "${nonCompoundingPool24}"
},
  `)
  */
}

module.exports = {
  deploy
}