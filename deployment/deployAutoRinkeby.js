const etherlime = require("etherlime-lib");
const ethers = require("ethers");

const CompoundingRewardsPoolFactory = require("../build/CompoundingRewardsPoolFactory.json");
const CompoundingRewardsPool = require("../build/CompoundingRewardsPool.json");
const TestERC20 = require("../build/TestERC20.json");
const Treasury = require("../build/Treasury.json");
const Calculator = require("../build/Calculator.json");
const { JsonRpcProvider } = require("@ethersproject/providers");

// CONTSANTS
const BLOCKS_PER_DAY_BSC = 28800;
const BLOCKS_PER_HOUR_BSC = BLOCKS_PER_DAY_BSC / 24;
const BLOCKS_PER_MINUTE_BSC = BLOCKS_PER_HOUR_BSC / 60;
const BLOCKS_PER_SECOND_BSC = BLOCKS_PER_MINUTE_BSC / 60;
const BLOCKS_PER_WEEK_BSC = BLOCKS_PER_DAY_BSC * 7;
const BLOCKS_PER_30_DAYS_BSC = BLOCKS_PER_DAY_BSC * 30;
const BLOCKS_PER_MINUTE = 5;

// Addresses
const RinkebyTestALBTAddress = "0x1DFD95eb75A7486945D366a0bC0b937F0AAa526F";
const UniSwapRouter = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"; //This address is not real
const infuraApiKey = "df77c40c85ac442595b6be7d84ba2024";

let rewardTokensAddresses = [RinkebyTestALBTAddress];
let rewardsPerBock = 0;
let throttleRoundBlocks = BLOCKS_PER_MINUTE_BSC * 10;

const deploy = async (network, secret, etherscanApiKey) => {
  const { parseEther } = ethers.utils;

  const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraApiKey);
  const wallet = new ethers.Wallet(secret, deployer.provider);

  let albtInstance = new ethers.Contract(RinkebyTestALBTAddress, TestERC20.abi, wallet);

  let parsedReward = parseEther(`10`);
  rewardsPerBock = parsedReward;

  // Stake limits
  const stakeLimit = parseEther(`200`);
  const contractStakeLimit = parseEther(`400`);
  const longerContractStakeLimit = parseEther(`4000`);
  const throttleRoundCap = parseEther(`400`);

  const currentBlock = await deployer.provider.getBlock("latest");

  const startBlock = currentBlock.number + 10; // 5 minutes timeout
  const endBlock0 = startBlock + BLOCKS_PER_MINUTE * 30; // 7 days / 30 minutes of staking
  const endBlock1 = startBlock + BLOCKS_PER_MINUTE * 60; // 1 month / 60 minutes of staking
  const endBlock3 = startBlock + BLOCKS_PER_MINUTE * 180; // 3 months / 24 hours of staking
  const endBlock6 = startBlock + BLOCKS_PER_30_DAYS_BSC * 6; // 6 months of staking
  const endBlock12 = startBlock + BLOCKS_PER_30_DAYS_BSC * 12; // 12 months of staking
  const endBlock24 = startBlock + BLOCKS_PER_30_DAYS_BSC * 24; // 24 monts of staking

  const blockDelta = endBlock24 - startBlock;

  const amountToTransfer = rewardsPerBock.mul(blockDelta);
  const allRewards = amountToTransfer.mul(5);
  const gasPrice = { gasPrice: 20000000000 };

  // const TreasuryInstance = await deployer.deploy(Treasury, {}, UniSwapRouter, RinkebyTestALBTAddress, gasPrice)
  //   // console.log('\x1b[36m%s\x1b[0m', `--- Treasury address: ${TreasuryInstance.contractAddress} ---`)

  const calculatorIntance = await deployer.deploy(Calculator);
  console.log(
    "\x1b[36m%s\x1b[0m",
    `--- Calculator address: ${calculatorIntance.contractAddress} ---`,
  );

  const libraries = {
    Calculator: calculatorIntance.contractAddress,
  };

  const CompoundingRewardsPoolFactoryInstance = await deployer.deploy(
    CompoundingRewardsPoolFactory,
    libraries,
    RinkebyTestALBTAddress,
  );
  console.log(
    "\x1b[36m%s\x1b[0m",
    `--- Factory address: ${CompoundingRewardsPoolFactoryInstance.contractAddress} ---`,
  );

  // Mint
  const mint = await albtInstance.mint(
    CompoundingRewardsPoolFactoryInstance.contractAddress,
    allRewards,
    gasPrice,
  );
  const mintStatus = await mint.wait();
  const mint1 = await albtInstance.mint(
    CompoundingRewardsPoolFactoryInstance.contractAddress,
    allRewards,
    gasPrice,
  );
  const mintStatus1 = await mint1.wait();
  const mint2 = await albtInstance.mint(
    CompoundingRewardsPoolFactoryInstance.contractAddress,
    allRewards,
    gasPrice,
  );
  const mintStatus2 = await mint2.wait();
  const mint3 = await albtInstance.mint(
    CompoundingRewardsPoolFactoryInstance.contractAddress,
    allRewards,
    gasPrice,
  );
  const mintStatus3 = await mint3.wait();

  const poolDeployment0 = await CompoundingRewardsPoolFactoryInstance.deploy(
    RinkebyTestALBTAddress,
    startBlock,
    endBlock0,
    rewardsPerBock,
    stakeLimit,
    throttleRoundBlocks,
    throttleRoundCap,
    contractStakeLimit,
    allRewards,
  );
  await poolDeployment0.wait();

  const poolDeployment1 = await CompoundingRewardsPoolFactoryInstance.deploy(
    RinkebyTestALBTAddress,
    startBlock + 5,
    endBlock0,
    rewardsPerBock,
    stakeLimit,
    throttleRoundBlocks,
    throttleRoundCap,
    contractStakeLimit,
    allRewards,
  );

  await poolDeployment1.wait();

  const poolDeployment2 = await CompoundingRewardsPoolFactoryInstance.deploy(
    RinkebyTestALBTAddress,
    startBlock + 10,
    endBlock1,
    rewardsPerBock,
    contractStakeLimit,
    throttleRoundBlocks,
    throttleRoundCap,
    contractStakeLimit,
    allRewards,
  );
  await poolDeployment2.wait();

  const poolDeployment3 = await CompoundingRewardsPoolFactoryInstance.deploy(
    RinkebyTestALBTAddress,
    startBlock + 15,
    endBlock3,
    rewardsPerBock,
    contractStakeLimit,
    throttleRoundBlocks,
    throttleRoundCap,
    contractStakeLimit,
    allRewards,
  );
  await poolDeployment3.wait();

  let nonCompoundingPool0 = await CompoundingRewardsPoolFactoryInstance.rewardsPools(0);
  console.log(
    "\x1b[36m%s\x1b[0m",
    `--- First NonCompoundingPool address 0: ${nonCompoundingPool0} ---`,
  );
  let nonCompoundingPool1 = await CompoundingRewardsPoolFactoryInstance.rewardsPools(1);
  console.log(
    "\x1b[36m%s\x1b[0m",
    `--- First NonCompoundingPool address 0: ${nonCompoundingPool1} ---`,
  );
  let nonCompoundingPool2 = await CompoundingRewardsPoolFactoryInstance.rewardsPools(2);
  console.log(
    "\x1b[36m%s\x1b[0m",
    `--- First NonCompoundingPool address 0: ${nonCompoundingPool2} ---`,
  );
  let nonCompoundingPool3 = await CompoundingRewardsPoolFactoryInstance.rewardsPools(3);
  console.log(
    "\x1b[36m%s\x1b[0m",
    `--- First NonCompoundingPool address 0: ${nonCompoundingPool3} ---`,
  );

  console.log(`
helperContracts: {
  "factory" : "${CompoundingRewardsPoolFactoryInstance.contractAddress}",
},
  `);

  console.log(`
stakerContracts: {
    "bALBT-0M": "${nonCompoundingPool0}",
},
  `);

  let enable = await CompoundingRewardsPoolFactoryInstance.enableReceivers(nonCompoundingPool0, [
    nonCompoundingPool2,
    nonCompoundingPool3,
  ]);
  enable.wait();
  let enable1 = await CompoundingRewardsPoolFactoryInstance.enableReceivers(nonCompoundingPool1, [
    nonCompoundingPool2,
    nonCompoundingPool3,
  ]);
  console.log(enable);
  console.log(enable1);
};

module.exports = {
  deploy,
};
