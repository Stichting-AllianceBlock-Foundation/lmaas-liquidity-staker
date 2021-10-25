const etherlime = require("etherlime-lib");
const ethers = require("ethers");

const CompoundingRewardsPoolFactory = require("../build/CompoundingRewardsPoolFactory.json");
const TestERC20 = require("../build/TestERC20.json");

// Contsants
const BLOCKS_PER_MINUTE = 5;
const BLOCKS_PER_HOUR = BLOCKS_PER_MINUTE * 60;
const BLOCKS_PER_DAY = BLOCKS_PER_HOUR * 24;

// Addresses
const stakingTokenAddress = "0x1DFD95eb75A7486945D366a0bC0b937F0AAa526F";
const infuraApiKey = "df77c40c85ac442595b6be7d84ba2024";
const calculatorAddress = "0xE9f2B997eE9A7c6C4DAE7B156Ca6578F1B691239";

const deploy = async (network, secret) => {
  const { parseEther } = ethers.utils;

  // Get Deployer and Wallet
  const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraApiKey);
  const wallet = new ethers.Wallet(secret, deployer.provider);

  // Get Staking Token
  const tokenInstance = new ethers.Contract(stakingTokenAddress, TestERC20.abi, wallet);

  // Campaign props
  const rewardsPerBock = parseEther("10");
  const stakeLimit = parseEther("1000");
  const contractStakeLimit = parseEther("10000");
  const throttleRoundBlocks = BLOCKS_PER_HOUR * 1;
  const throttleRoundCap = parseEther("100");
  const gasPrice = { gasPrice: 20000000000 };

  const currentBlock = await deployer.provider.getBlock("latest");
  const startBlock = currentBlock.number + BLOCKS_PER_MINUTE * 5; // Offset with 5 mins
  const endBlock = startBlock + BLOCKS_PER_DAY * 10;
  const blockDelta = endBlock - startBlock;

  const allRewards = rewardsPerBock.mul(blockDelta);

  const libraries = {
    Calculator: calculatorAddress,
  };

  console.log("\x1b[36m%s\x1b[0m", `Deploying factory...`);

  const CompoundingRewardsPoolFactoryInstance = await deployer.deploy(
    CompoundingRewardsPoolFactory,
    libraries,
    stakingTokenAddress,
  );
  console.log(
    "\x1b[36m%s\x1b[0m",
    `--- Factory address: ${CompoundingRewardsPoolFactoryInstance.contractAddress} ---`,
  );

  console.log("\x1b[36m%s\x1b[0m", `Minting rewards...`);

  // Mint rewards to facotory
  const mint = await tokenInstance.mint(
    CompoundingRewardsPoolFactoryInstance.contractAddress,
    allRewards,
    gasPrice,
  );
  await mint.wait();

  console.log("\x1b[36m%s\x1b[0m", `Deploying campaign...`);

  const poolDeployment = await CompoundingRewardsPoolFactoryInstance.deploy(
    stakingTokenAddress,
    startBlock,
    endBlock,
    rewardsPerBock,
    stakeLimit,
    throttleRoundBlocks,
    throttleRoundCap,
    contractStakeLimit,
    allRewards,
  );
  await poolDeployment.wait();

  let compoundingPool = await CompoundingRewardsPoolFactoryInstance.rewardsPools(0);
  console.log(
    "\x1b[36m%s\x1b[0m",
    `--- CompoundingPool address: ${compoundingPool.toLowerCase()} ---`,
  );
};

module.exports = {
  deploy,
};
