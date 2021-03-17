const etherlime = require('etherlime-lib');
const ethers = require('ethers');
const NonCompoundingRewardsPoolFactory = require('../build/NonCompoundingRewardsPoolFactory.json');
const Treasury = require('../build/Treasury.json');

const ALBTAddress =  "0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0";
const UniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const infuraApiKey = "7797fd5aada5475c831fedefe288a949";
const etherscanApiKey = "WRQUFHG1QNT2DUNU2YMGQBRTSQFII9A7VD";

let NonCompoundingRewardsPoolFactoryInstance;
let TreasuryInstance;

let rewardTokensAddresses = [ALBTAddress];
const blocksInADay = 6646 // 60*60*24/13

let startBlock 

const deploy = async (network, secret) => {

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraApiKey, {etherscanApiKey});

	const currentBlock = await deployer.provider.getBlock('latest');
	startBlock = currentBlock.number + 23; // 5 minutes timeout

	let threeMonthsEndBlock = startBlock +  (blocksInADay * 90); // 3 month staking
	let sixMonthsEndBlock = startBlock +  (blocksInADay * 180); // 6 month staking
	let twelveMonthsEndBlock = startBlock +  (blocksInADay * 360); // 12 month staking
	let twentyFourMonthsEndBlock = startBlock +  (blocksInADay * 720); // 24 month staking

	let threeMonthsContractLimit = await ethers.utils.parseEther(`6000000`);
	let sixMonthsContractLimit = await ethers.utils.parseEther(`7500000`);
	let twelveMonthsContractLimit = await ethers.utils.parseEther(`12000000`);
	let twentyFourMonthsContractLimit = await ethers.utils.parseEther(`13000000`);

	let rewardThreeMonths = await ethers.utils.parseEther(`250000`);
	let rewardSixMonths = await ethers.utils.parseEther(`750000`);
	let rewardTwelveMonths = await ethers.utils.parseEther(`3000000`);
	let rewardTwentyFourMonths = await ethers.utils.parseEther(`8000000`);


	let rewardPerBlockThreeMonths = rewardThreeMonths.div(threeMonthsEndBlock);
	let rewardPerBlockSixMonths = rewardSixMonths.div(sixMonthsEndBlock);
	let rewardPerBlockTwelveMonths = rewardTwelveMonths.div(twelveMonthsEndBlock);
	let rewardPerBlockTwentyFourMonths = rewardTwentyFourMonths.div(twentyFourMonthsEndBlock);

	let throttleRoundBlocks = blocksInADay 

	let throttleRoundCapThreeMonths = await ethers.utils.parseEther(`700000`);
	let throttleRoundCapSixMonths = await ethers.utils.parseEther(`510000`);
	let throttleRoundCapTwelveMonths = await ethers.utils.parseEther(`600000`);
	let throttleRoundCapTwentyFourMonths = await ethers.utils.parseEther(`505000`);

	let usersStakeLimit = await ethers.utils.parseEther(`500000`);

	TreasuryInstance = await deployer.deploy(Treasury, {}, UniswapRouter, ALBTAddress);
	console.log(TreasuryInstance.contractAddress, "Treasury address")
	
	NonCompoundingRewardsPoolFactoryInstance = await deployer.deploy(NonCompoundingRewardsPoolFactory, {}, TreasuryInstance.contractAddress, ALBTAddress);
	console.log(NonCompoundingRewardsPoolFactoryInstance.contractAddress, "Non Compounding Factory address")	
	
	let poolDeployment3Months = await NonCompoundingRewardsPoolFactoryInstance.deploy(ALBTAddress, startBlock, threeMonthsEndBlock, rewardTokensAddresses, [rewardPerBlockThreeMonths], usersStakeLimit, throttleRoundBlocks, throttleRoundCapThreeMonths, threeMonthsContractLimit);
	await poolDeployment3Months.wait()
	
	let poolDeployment3MonthsAddress = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(0);
	console.log(poolDeployment3MonthsAddress, "Pool for 3 Months")
	
	let poolDeployment6Months = await NonCompoundingRewardsPoolFactoryInstance.deploy(ALBTAddress, startBlock, sixMonthsEndBlock, rewardTokensAddresses, [rewardPerBlockSixMonths], usersStakeLimit, throttleRoundBlocks, throttleRoundCapSixMonths, sixMonthsContractLimit);
	await poolDeployment6Months.wait()
	
	let poolDeployment6MonthsAddress = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(1);
	console.log(poolDeployment6MonthsAddress, "Pool for 6 Months")

	let poolDeployment12Months = await NonCompoundingRewardsPoolFactoryInstance.deploy(ALBTAddress, startBlock, twelveMonthsEndBlock, rewardTokensAddresses, [rewardPerBlockTwelveMonths], usersStakeLimit, throttleRoundBlocks, throttleRoundCapTwelveMonths, twelveMonthsContractLimit);
	await poolDeployment12Months.wait()
	
	let poolDeployment12MonthsAddress = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(2);
	console.log(poolDeployment12MonthsAddress, "Pool for 12 Months")

	let poolDeployment24Months = await NonCompoundingRewardsPoolFactoryInstance.deploy(ALBTAddress, startBlock, twentyFourMonthsEndBlock, rewardTokensAddresses, [rewardPerBlockTwentyFourMonths], usersStakeLimit, throttleRoundBlocks, throttleRoundCapTwentyFourMonths, twentyFourMonthsContractLimit);
	await poolDeployment24Months.wait()
	
	let poolDeployment24MonthsAddress = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(3);
	console.log(poolDeployment24MonthsAddress, "Pool for 24 Months")

	let enablerFirstReceivers = await NonCompoundingRewardsPoolFactoryInstance.enableReceivers(poolDeployment3MonthsAddress, [poolDeployment6MonthsAddress,poolDeployment12MonthsAddress,poolDeployment24MonthsAddress])
	enablerFirstReceivers.wait()

	let enablerSecondReceivers = await NonCompoundingRewardsPoolFactoryInstance.enableReceivers(poolDeployment6MonthsAddress, [poolDeployment12MonthsAddress,poolDeployment24MonthsAddress])
	enablerSecondReceivers.wait()

	let enablerThirdReceivers = await NonCompoundingRewardsPoolFactoryInstance.enableReceivers(poolDeployment12MonthsAddress, [poolDeployment24MonthsAddress])
	enablerThirdReceivers.wait()
	
};

module.exports = {
	deploy
};