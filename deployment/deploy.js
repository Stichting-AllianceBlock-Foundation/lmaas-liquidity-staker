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
let throttleRoundBlocks = 100
let throttleRoundCap


let startBlock 
let endBlock


const deploy = async (network, secret, etherscanApiKey) => {

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraApiKey);
	const wallet = new ethers.Wallet(secret, deployer.provider)

	let albtInstance = new ethers.Contract(KovanALBTAddress, TestERC20.abi, wallet);

	let parsedReward = await ethers.utils.parseEther(`10`);
	rewardsPerBock.push(parsedReward);
	stakeLimit = await ethers.utils.parseEther(`100`);
	throttleRoundCap = stakeLimit

	const currentBlock = await deployer.provider.getBlock('latest');
	const blocksInADay = 6646
	startBlock = currentBlock.number + 20;
	endBlock = startBlock + (blocksInADay * 10);
	const blockDelta = endBlock - startBlock;
	const amountToTransfer = rewardsPerBock[0].mul(blockDelta)
	const amount = amountToTransfer.add(amountToTransfer)

	TreasuryInstance = await deployer.deploy(Treasury, {}, UniswapRouterKovan, KovanALBTAddress);
	console.log(TreasuryInstance.contractAddress, "Treasury address")
	
	NonCompoundingRewardsPoolFactoryInstance = await deployer.deploy(NonCompoundingRewardsPoolFactory, {}, TreasuryInstance.contractAddress, KovanALBTAddress);
	console.log(NonCompoundingRewardsPoolFactoryInstance.contractAddress, "Non Compounding Factory address")	
	
	let mint = await albtInstance.mint(NonCompoundingRewardsPoolFactoryInstance.contractAddress, amount);
	await mint.wait();
	
	let poolDeployment = await NonCompoundingRewardsPoolFactoryInstance.deploy(KovanEthALbtStaking, startBlock, endBlock, rewardTokensAddresses, rewardsPerBock, stakeLimit, throttleRoundBlocks, throttleRoundCap);
	await poolDeployment.wait()
	
	let nonCompoundingPool = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(0);
	console.log(nonCompoundingPool, "First NonCompoundingPool address")
};

module.exports = {
	deploy
};