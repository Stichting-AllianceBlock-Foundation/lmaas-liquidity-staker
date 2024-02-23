const etherlime = require('etherlime-lib')
const ethers = require('ethers')

const NonCompoundingRewardsPoolFactory = require('../build/NonCompoundingRewardsPoolFactory.json')
const PercentageCalculator = require("../build/PercentageCalculator.json")
const Treasury = require('../build/Treasury.json')

// CONTSANTS
const BLOCKS_PER_DAY_BSC = 28800
const BLOCKS_PER_HOUR_BSC = BLOCKS_PER_DAY_BSC / 24
const BLOCKS_PER_MINUTE_BSC = BLOCKS_PER_HOUR_BSC / 60
const BLOCKS_PER_SECOND_BSC = BLOCKS_PER_MINUTE_BSC / 60
const BLOCKS_PER_WEEK_BSC = BLOCKS_PER_DAY_BSC * 7
const BLOCKS_PER_30_DAYS_BSC = BLOCKS_PER_DAY_BSC * 30

// Addresses
const bscALBTAddress = "0x72fAa679E1008Ad8382959FF48E392042A8b06f7"
const PancakeSwapRouter = "0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F" 

let rewardTokensAddresses = [bscALBTAddress]

const deploy = async (network, secret, etherscanApiKey) => {
  const { parseEther } = ethers.utils

  const deployer = new etherlime.JSONRPCPrivateKeyDeployer(secret, 'https://bsc-dataseed.binance.org/', {})
   

  const currentBlock = await deployer.provider.getBlock('latest')
  const wallet = new ethers.Wallet(secret, deployer.provider)
  const startBlock = currentBlock.number + 5 * BLOCKS_PER_MINUTE_BSC    // 5 minutes timeout
  const endBlock3Months = startBlock + (BLOCKS_PER_DAY_BSC * 90)    
  
  let threeMonthsContractLimit = await ethers.utils.parseEther(`6000000`);// 3 months staking
  let rewardThreeMonths = await ethers.utils.parseEther(`250000`);
  let rewardPerBlockThreeMonths = rewardThreeMonths.div(endBlock3Months - startBlock);

  let throttleRoundBlocks = BLOCKS_PER_DAY_BSC 

	let throttleRoundCapThreeMonths = await ethers.utils.parseEther(`700000`);
  let usersStakeLimit = await ethers.utils.parseEther(`300000`);

  const percentageCalculator = await deployer.deploy(PercentageCalculator);
  console.log(percentageCalculator)



  // const TreasuryInstance = await deployer.deploy(Treasury, {}, PancakeSwapRouter, bscALBTAddress)
  // console.log('\x1b[36m%s\x1b[0m', `--- Treasury address: ${TreasuryInstance.contractAddress} ---`)

  // const NonCompoundingRewardsPoolFactoryInstance = await deployer.deploy(NonCompoundingRewardsPoolFactory, {}, TreasuryInstance.contractAddress, bscALBTAddress)
  // console.log('\x1b[36m%s\x1b[0m', `--- Factory address: ${NonCompoundingRewardsPoolFactoryInstance.contractAddress} ---`)


  // let  NonCompoundingRewardsPoolFactoryInstance = new ethers.Contract("0x93d8Db5F7C57D22332eC13FA71B165770fc8A4AE", NonCompoundingRewardsPoolFactory.abi, wallet)

  // const poolDeployment3Months = await NonCompoundingRewardsPoolFactoryInstance.deploy(bscALBTAddress, startBlock, endBlock3Months, rewardTokensAddresses, [rewardPerBlockThreeMonths], usersStakeLimit, throttleRoundBlocks, throttleRoundCapThreeMonths, threeMonthsContractLimit)
  // await poolDeployment3Months.wait()

  // let nonCompoundingPool3Months = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(0)
  // console.log('\x1b[36m%s\x1b[0m', `--- First NonCompoundingPool address 0: ${nonCompoundingPool3Months} ---`)

 

//   console.log(`
// helperContracts: {
//   "factory" : "${NonCompoundingRewardsPoolFactoryInstance.contractAddress}",
//   "treasury": "${TreasuryInstance.contractAddress}"
// },
//   `)

//   console.log(`
// stakerContracts: {
//     "bALBT-3M": "${nonCompoundingPool3Months}"
// },
//   `)
}

module.exports = {
  deploy
}