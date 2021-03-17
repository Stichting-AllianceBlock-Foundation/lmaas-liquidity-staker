const etherlime = require('etherlime-lib');
const ethers = require('ethers');
const NonCompoundingRewardsPoolFactory = require('../build/NonCompoundingRewardsPoolFactory.json');
const TestERC20 = require('../build/TestERC20.json');
const NonCompoundingRewardsPool = require('../build/NonCompoundingRewardsPool.json');
const Treasury = require('../build/Treasury.json');

const KovanALBTAddress =  "0xD21913390c484d490D24F046Da5329F1d778b75b";
const KovanEthALbtStaking = "0x4697038B031F78A9cd3D1A7C42c501543E723C1F"
const UniswapRouterKovan = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const infuraApiKey = "df77c40c85ac442595b6be7d84ba2024";

let NonCompoundingRewardsPoolFactoryInstance;
let TreasuryInstance;

let rewardTokensInstances;
let rewardTokensAddresses = [KovanALBTAddress];
let rewardsPerBock = []
let stakeLimit 
let throttleRoundBlocks = 36
let throttleRoundCap


let startBlock 
let endBlock


const deploy = async (network, secret, etherscanApiKey) => {

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraApiKey);
	const wallet = new ethers.Wallet(secret, deployer.provider)

	let albtInstance = new ethers.Contract(KovanALBTAddress, TestERC20.abi, wallet);

	let parsedReward = await ethers.utils.parseEther(`10`);
	rewardsPerBock.push(parsedReward);
	stakeLimit = await ethers.utils.parseEther(`200`);
	contractStakeLimit = await ethers.utils.parseEther(`400`);
	longerContractStakeLimit = await ethers.utils.parseEther(`4000`);
	throttleRoundCap = await ethers.utils.parseEther(`400`);

	const currentBlock = await deployer.provider.getBlock('latest');
	const blocksInADay = 6646
	// endBlock = startBlock +  500;
	startBlock = currentBlock.number + 60; // 10-15 minutes timeout
	endBlock1 = startBlock +  92; // 20 minutes of staking
	endBlock = startBlock +  138; // 20 minutes of staking
	endBlock3 = startBlock + 207; // 30 minutes of staking
	endBlock6 = startBlock + 368; // 40 minutes of staking
	endBlock12 = startBlock + (blocksInADay * 30); // 40 minutes of staking
	endBlock24 = startBlock + (blocksInADay * 60); // 40 minutes of staking
	const blockDelta = endBlock24 - startBlock;
	const amountToTransfer = rewardsPerBock[0].mul(blockDelta)
	const amount = amountToTransfer.add(amountToTransfer)
	const allRewards = amountToTransfer.mul(5)

	TreasuryInstance = await deployer.deploy(Treasury, {}, UniswapRouterKovan, KovanALBTAddress);
	console.log(TreasuryInstance.contractAddress, "Treasury address")
	


	NonCompoundingRewardsPoolFactoryInstance = await deployer.deploy(NonCompoundingRewardsPoolFactory, {}, TreasuryInstance.contractAddress, KovanALBTAddress);
	console.log(NonCompoundingRewardsPoolFactoryInstance.contractAddress, "Non Compounding Factory address")	
	
	let mint = await albtInstance.mint(NonCompoundingRewardsPoolFactoryInstance.contractAddress, allRewards);
	await mint.wait();

	let poolDeployment0 = await NonCompoundingRewardsPoolFactoryInstance.deploy(KovanALBTAddress, startBlock, endBlock1, rewardTokensAddresses, rewardsPerBock, stakeLimit, throttleRoundBlocks, throttleRoundCap,contractStakeLimit);
	await poolDeployment0.wait()
	
	let nonCompoundingPool0 = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(0);
	console.log(nonCompoundingPool0, "First NonCompoundingPool address 0")
	
	let poolDeployment = await NonCompoundingRewardsPoolFactoryInstance.deploy(KovanALBTAddress, startBlock, endBlock, rewardTokensAddresses, rewardsPerBock, stakeLimit, throttleRoundBlocks, throttleRoundCap,contractStakeLimit);
	await poolDeployment.wait()
	
	let nonCompoundingPool = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(1);
	console.log(nonCompoundingPool, "First NonCompoundingPool address 1")

	let poolDeployment3 = await NonCompoundingRewardsPoolFactoryInstance.deploy(KovanALBTAddress, startBlock, endBlock3, rewardTokensAddresses, rewardsPerBock, stakeLimit, throttleRoundBlocks, throttleRoundCap,contractStakeLimit);
	await poolDeployment3.wait()
	
	let nonCompoundingPool3 = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(2);
	console.log(nonCompoundingPool3, "First NonCompoundingPool address 3")

	let poolDeployment6 = await NonCompoundingRewardsPoolFactoryInstance.deploy(KovanALBTAddress, startBlock, endBlock6, rewardTokensAddresses, rewardsPerBock, stakeLimit, throttleRoundBlocks, throttleRoundCap,contractStakeLimit);
	await poolDeployment6.wait()
	
	let nonCompoundingPool6 = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(3);
	console.log(nonCompoundingPool6, "First NonCompoundingPool address 6")

	let poolDeployment12 = await NonCompoundingRewardsPoolFactoryInstance.deploy(KovanALBTAddress, startBlock, endBlock12, rewardTokensAddresses, rewardsPerBock, stakeLimit, throttleRoundBlocks, throttleRoundCap , longerContractStakeLimit);
	await poolDeployment12.wait()
	
	let nonCompoundingPool12 = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(4);
	console.log(nonCompoundingPool12, "First NonCompoundingPool address 12")

	let poolDeployment24 = await NonCompoundingRewardsPoolFactoryInstance.deploy(KovanALBTAddress, startBlock, endBlock12, rewardTokensAddresses, rewardsPerBock, stakeLimit, throttleRoundBlocks, throttleRoundCap,longerContractStakeLimit);
	await poolDeployment24.wait()
	
	let nonCompoundingPool24 = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(5);
	console.log(nonCompoundingPool24, "First NonCompoundingPool address 14")


	await NonCompoundingRewardsPoolFactoryInstance.enableReceivers(nonCompoundingPool0, [nonCompoundingPool,nonCompoundingPool3,nonCompoundingPool6,nonCompoundingPool12,nonCompoundingPool24])
	await NonCompoundingRewardsPoolFactoryInstance.enableReceivers(nonCompoundingPool, [nonCompoundingPool,nonCompoundingPool3,nonCompoundingPool6,nonCompoundingPool12,nonCompoundingPool24])
	await NonCompoundingRewardsPoolFactoryInstance.enableReceivers(nonCompoundingPool3, [nonCompoundingPool,nonCompoundingPool3,nonCompoundingPool6,nonCompoundingPool12,nonCompoundingPool24])
	await NonCompoundingRewardsPoolFactoryInstance.enableReceivers(nonCompoundingPool6, [nonCompoundingPool,nonCompoundingPool3,nonCompoundingPool6,nonCompoundingPool12,nonCompoundingPool24])
	await NonCompoundingRewardsPoolFactoryInstance.enableReceivers(nonCompoundingPool24, [nonCompoundingPool,nonCompoundingPool3,nonCompoundingPool6,nonCompoundingPool12,nonCompoundingPool24])
	
};

module.exports = {
	deploy
};