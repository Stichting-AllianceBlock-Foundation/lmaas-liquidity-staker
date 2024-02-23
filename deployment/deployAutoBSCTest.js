const etherlime = require('etherlime-lib')
const ethers = require('ethers')

const CompoundingRewardsPoolFactory = require('../build/CompoundingRewardsPoolFactory.json')
const TestERC20 = require('../build/TestERC20.json')
const Treasury = require('../build/Treasury.json')

// CONTSANTS
const BLOCKS_PER_DAY_BSC = 28800
const BLOCKS_PER_HOUR_BSC = BLOCKS_PER_DAY_BSC / 24
const BLOCKS_PER_MINUTE_BSC = BLOCKS_PER_HOUR_BSC / 60
const BLOCKS_PER_SECOND_BSC = BLOCKS_PER_MINUTE_BSC / 60
const BLOCKS_PER_WEEK_BSC = BLOCKS_PER_DAY_BSC * 7
const BLOCKS_PER_30_DAYS_BSC = BLOCKS_PER_DAY_BSC * 30

// Addresses
const BSCTestALBTAddress = "0x666e672B2Ada59979Fc4dB7AF9A4710E0E4D51E6"
const PancakeSwapRouter = "0xd954551853F55deb4Ae31407c423e67B1621424A" //This address is not real

let rewardTokensAddresses = [BSCTestALBTAddress]
let rewardsPerBock = 0
let throttleRoundBlocks = BLOCKS_PER_MINUTE_BSC * 10

const deploy = async (network, secret, etherscanApiKey) => {
  const { parseEther } = ethers.utils

  const deployer = new etherlime.JSONRPCPrivateKeyDeployer(secret, 'https://data-seed-prebsc-1-s1.binance.org:8545/', {})
  const wallet = new ethers.Wallet(secret, deployer.provider)

  let albtInstance = new ethers.Contract(BSCTestALBTAddress, TestERC20.abi, wallet)

  let parsedReward = parseEther(`10`)
  rewardsPerBock = parsedReward

  // Stake limits
  const stakeLimit = parseEther(`200`)
  const contractStakeLimit = parseEther(`400`)
  const longerContractStakeLimit = parseEther(`4000`)
  const throttleRoundCap = parseEther(`400`)

  const currentBlock = await deployer.provider.getBlock('latest')

  const startBlock = currentBlock.number + 5 * BLOCKS_PER_MINUTE_BSC    // 5 minutes timeout
  const endBlock0 = startBlock + (BLOCKS_PER_MINUTE_BSC * 30)           // 7 days / 30 minutes of staking
  const endBlock1 = startBlock + BLOCKS_PER_HOUR_BSC                    // 1 month / 60 minutes of staking
  const endBlock3 = startBlock + (BLOCKS_PER_HOUR_BSC * 24)             // 3 months / 24 hours of staking
  const endBlock6 = startBlock + (BLOCKS_PER_30_DAYS_BSC * 6)           // 6 months of staking
  const endBlock12 = startBlock + (BLOCKS_PER_30_DAYS_BSC * 12)         // 12 months of staking
  const endBlock24 = startBlock + (BLOCKS_PER_30_DAYS_BSC * 24)         // 24 monts of staking

  const blockDelta = endBlock24 - startBlock

  const amountToTransfer = rewardsPerBock.mul(blockDelta)
  const allRewards = amountToTransfer.mul(5)
  const gasPrice = { gasPrice: 20000000000 }

  const TreasuryInstance = await deployer.deploy(Treasury, {}, PancakeSwapRouter, BSCTestALBTAddress, gasPrice)
  console.log('\x1b[36m%s\x1b[0m', `--- Treasury address: ${TreasuryInstance.contractAddress} ---`)

  const CompoundingRewardsPoolFactoryInstance = await deployer.deploy(
    CompoundingRewardsPoolFactory,
    {},
    TreasuryInstance.contractAddress,
    BSCTestALBTAddress
  )
  console.log('\x1b[36m%s\x1b[0m', `--- Factory address: ${CompoundingRewardsPoolFactoryInstance.contractAddress} ---`)

  // Mint
  const mint = await albtInstance.mint(CompoundingRewardsPoolFactoryInstance.contractAddress, allRewards, gasPrice)
  const mintStatus = await mint.wait()

  const poolDeployment0 = await CompoundingRewardsPoolFactoryInstance.deploy(
    BSCTestALBTAddress,
    startBlock,
    endBlock0,
    rewardsPerBock,
    stakeLimit,
    throttleRoundBlocks,
    throttleRoundCap,
    contractStakeLimit,
  )
  await poolDeployment0.wait()

  let nonCompoundingPool0 = await CompoundingRewardsPoolFactoryInstance.rewardsPools(0)
  console.log('\x1b[36m%s\x1b[0m', `--- First NonCompoundingPool address 0: ${nonCompoundingPool0} ---`)

  console.log(`
helperContracts: {
  "factory" : "${CompoundingRewardsPoolFactoryInstance.contractAddress}",
  "treasury": "${TreasuryInstance.contractAddress}"
},
  `)

  console.log(`
stakerContracts: {
    "bALBT-0M": "${nonCompoundingPool0}",
},
  `)
}

module.exports = {
  deploy
}