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
const KovanETHALBTStaking = "0x4697038B031F78A9cd3D1A7C42c501543E723C1F"
const KovanALBT2TESTStaking = "0x41F5C832F6F14a4BA973231fF4dF06Fd5Ae2c271"
const KovanLMCFactory = "0x6cDa9e4eC662bBf7F547EB53ba462dEe54c473EF"
const PercentageCalculatorAddress = "0x68b2874397e1ECdAa7B5E041ED3Fd5c873002d7F";
const infuraApiKey = "40c2813049e44ec79cb4d7e0d18de173"

const stakingTokenAddresses = [KovanETHALBTStaking, KovanALBT2TESTStaking];

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
  let LMCFactoryInstance;

  // Check for deployed Factory
  if (KovanLMCFactory !== '') {
    LMCFactoryInstance = deployer.wrapDeployedContract(LMCFactory, KovanLMCFactory, wallet)
  } else {
    LMCFactoryInstance = await deployer.deploy(LMCFactory, {})
  }

  // Get Reward Token Instance
  const rewardTokensInstance = new ethers.Contract(KovanALBTAddress, TestERC20.abi, wallet)

  // Mint reward tokens
  let mint = await rewardTokensInstance.mint(LMCFactoryInstance.contractAddress, amountReward.mul(stakingTokenAddresses.length + 1))
  await mint.wait();

  // LMC settings
  const currentBlock = await deployer.provider.getBlock('latest')
  const startBlock = currentBlock.number + 10
  const endBlock = startBlock + BLOCKS_PER_DAY * 365

  let LMCAddresses = [];
  let LMCInstances = [];

  // Deploy LMC
  // for (let i = 0; i < stakingTokenAddresses.length; i++) {
  //   let LMCDeployTx1 = await LMCFactoryInstance.deploy(stakingTokenAddresses[0], startBlock, endBlock, rewardTokensAddresses, rewardsPerBlock, rewardTokensAddresses[0], stakeLimit, contractStakeLimit);
  // await LMCDeployTx1.wait();

  //   let LMCDeployTx2 = await LMCFactoryInstance.deploy(stakingTokenAddresses[1], startBlock, endBlock, rewardTokensAddresses, rewardsPerBlock, rewardTokensAddresses[0], stakeLimit, contractStakeLimit);
  //   await LMCDeployTx2.wait();
  // }

  // Get Rewards Pool number
  let rewardsPoolsLength = await LMCFactoryInstance.getRewardsPoolNumber();
  
  for (let i = 0; i < rewardsPoolsLength; i++) {
    // Get LMC Address
    let LMCAddress = await LMCFactoryInstance.rewardsPools(i);
  
    // Get LMC Instance
    let LMCInstance = deployer.wrapDeployedContract(LMC, LMCAddress, wallet)
    
    LMCAddresses.push(LMCAddress)
    LMCInstances.push(LMCInstance)
  }

  let percentageCalculator;

  if (PercentageCalculatorAddress === "") {
    // Deploy Calculator
    percentageCalculator = await deployer.deploy(PercentageCalculator);
  } 

  // Scheme settings
  const libraries = {
    PercentageCalculator: PercentageCalculatorAddress === "" ? percentageCalculator.contractAddress : PercentageCalculatorAddress
  }

  const lockSchemеsSettings = [
    {
      title: "NO-LOCK",
      bonusPermile: 0,
      lockBlock: BLOCKS_PER_DAY * 365,
      rampUpBlock: BLOCKS_PER_DAY * 365 - 1
    },
    {
      title: "0M",
      bonusPermile: 0,
      lockBlock: BLOCKS_PER_DAY * 7,
      rampUpBlock: 1
    },
    {
      title: "3M",
      bonusPermile: 7000,
      lockBlock: BLOCKS_PER_DAY * 90,
      rampUpBlock: BLOCKS_PER_DAY * 30
    },
    {
      title: "6M",
      bonusPermile: 18000,
      lockBlock: BLOCKS_PER_DAY * 180,
      rampUpBlock: BLOCKS_PER_DAY * 60
    }
  ];

  // for (let i = 0; i < rewardsPoolsLength; i++) {
  //   const LMCAddress = await LMCFactoryInstance.rewardsPools(i);
  //   const lockSchemеs = [];

  //   for (let j = 0; j < lockSchemеsSettings.length; j++) {
      
  //     // Deploy Lock Scheme
  //     let LSCInstance = await deployer.deploy(
  //       LockScheme,
  //       libraries,
  //       lockSchemеsSettings[j].lockBlock,
  //       lockSchemеsSettings[j].rampUpBlock,
  //       lockSchemеsSettings[j].bonusPermile,
  //       LMCAddress
  //     );

  //     lockSchemеs.push(LSCInstance.contractAddress);
  //   }
  
  //   // Set Lock Scheme
  //   let tx = await LMCFactoryInstance.setLockSchemesToLMC(lockSchemеs, LMCAddress);
  //   await tx.wait();
  // }

  // Set Transfered and receiver
  let tx = await LMCFactoryInstance.enableReceivers("0xb3175EcFA313C5321687665aDFE6429c287bF897", ["0x2CB7Af1b0E42008765b78629bE562C037A6D3411"]);
  console.log(tx.hash);
  await tx.wait();

  /* 
  console.log(`
rewardContracts: {
  "ETH-ALBT1": "${LMCAddress}",
},

lockSchemeAddresses: {
  "LS1": "${LSCInstance.contractAddress}",
},
  `)
*/
}

module.exports = {
  deploy
}