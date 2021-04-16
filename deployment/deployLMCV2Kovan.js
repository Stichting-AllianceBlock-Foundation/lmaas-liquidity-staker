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

// Addresses
const KovanALBTAddress = "0xD21913390c484d490D24F046Da5329F1d778b75b"
const KovanEthALbtStaking = "0x4697038B031F78A9cd3D1A7C42c501543E723C1F"
const infuraApiKey = "40c2813049e44ec79cb4d7e0d18de173"

let rewardTokensAddresses = [KovanALBTAddress]
let rewardsPerBlock = [parseEther("1")]
let throttleRoundBlocks = BLOCKS_PER_MINUTE * 10

const stakeLimit = parseEther("1000")
const contractStakeLimit = parseEther("100000000")

const gasPrice = { gasPrice: 20000000000 }
const amountReward = parseEther("100000000000")
const initialTokensToUser = parseEther("100")

const deploy = async (network, secret, etherscanApiKey) => {
  const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraApiKey)
  const wallet = new ethers.Wallet(secret, deployer.provider)

  // Deploy LMC Factory
  const LMCFactoryInstance = await deployer.deploy(LMCFactory, {})

  // Get Reward Token Instance
  const rewardTokensInstance = new ethers.Contract(KovanALBTAddress, TestERC20.abi, wallet)
  
  // Mint reward tokens
  let mint = await rewardTokensInstance.mint(LMCFactoryInstance.contractAddress, amountReward)
  await mint.wait();

  // LMC settings
  const currentBlock = await deployer.provider.getBlock('latest')
  const startBlock = currentBlock.number + 5
  const endBlock = startBlock + BLOCKS_PER_DAY * 7

  // Deploy LMC
  const LMCDeployTx = await LMCFactoryInstance.deploy(KovanEthALbtStaking, startBlock, endBlock, rewardTokensAddresses, rewardsPerBlock, rewardTokensAddresses[0], stakeLimit, contractStakeLimit);
  console.log(`LMCDeployTx: ${LMCDeployTx.hash}`);
  await LMCDeployTx.wait();
  
  // Get LMC Address
  const LMCAddress = await LMCFactoryInstance.rewardsPools(0);
  
  // Get LMC Instance
  const LMCInstance = await etherlime.ContractAt(LMC, LMCAddress);
  
  // Deploy Calculator
  const percentageCalculator = await deployer.deploy(PercentageCalculator);

  // Scheme settings
  const libraries = {
    PercentageCalculator: percentageCalculator.contractAddress
  }

  const lockBlock = startBlock + BLOCKS_PER_DAY
  const rampUpBlock = startBlock + BLOCKS_PER_HOUR * 3
  const bonusPermile = 50000

  const lockSchemеs = [];

  // Deploy Lock Scheme
  const LSCInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPermile, LMCInstance.contractAddress);

  lockSchemеs.push(LSCInstance.contractAddress);

  // Set Lock Scheme
  await LMCFactoryInstance.setLockSchemesToLMC(lockSchemеs, LMCInstance.contractAddress);

  console.log(`
rewardContracts: {
  "ETH-ALBT1": "${LMCAddress}",
},

lockSchemeAddresses: {
  "LS1": "${LSCInstance.contractAddress}",
},
  `)

  /*

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