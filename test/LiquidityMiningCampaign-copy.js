const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const LockScheme = require('../build/LockScheme.json');
const TestERC20 = require('../build/TestERC20.json');
const PercentageCalculator = require('../build/PercentageCalculator.json')
const LMC = require("../build/LiquidityMiningCampaign.json")
const NonCompoundingRewardsPool = require('../build/NonCompoundingRewardsPool.json');
const { mineBlock } = require('./utils')

describe('LMC', () => {
	let aliceAccount = accounts[3];
	let bobAccount = accounts[4];
	let carolAccount = accounts[5];
	let staker = aliceAccount;
	let treasury = accounts[8];
	let deployer;

	let LockSchemeInstance;
	let LockSchemeInstance2;
	let stakingTokenAddress;
	let LmcInstance;


	let rampUpBlock;
	let lockBlock;

	let lockBlock0;
	let rampUpBlock0;

	let rewardTokensInstances
	let rewardTokensAddresses
	let rewardPerBlock
	let lockSchemеs
	let libraries


	const rewardTokensCount = 1; // 5 rewards tokens for tests
	const bonusPercet = 10000 // In thousands
	const bonus20 = 20000
	const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const thirty = ethers.utils.parseEther("30");
	const bOne = ethers.utils.parseEther("1");
	const bTen = ethers.utils.parseEther("10")
	const bTwenty = ethers.utils.parseEther("20")
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens
	const additionalRewards = [bTen]
	const stakeLimit = amount;
	const contractStakeLimit = ethers.utils.parseEther('35') // 10 tokens
	let throttleRoundBlocks = 10;
	let throttleRoundCap = ethers.utils.parseEther("1");



	const setupRewardsPoolParameters = async (deployer) => {

		rewardTokensInstances = [];
		rewardTokensAddresses = [];
		rewardPerBlock = [];
		lockSchemеs = [];

		for (i = 0; i < rewardTokensCount; i++) {
			const tknInst = await deployer.deploy(TestERC20, {}, amount);
			// populate tokens
			rewardTokensInstances.push(tknInst);
			rewardTokensAddresses.push(tknInst.contractAddress);

			// populate amounts
			let parsedReward = await ethers.utils.parseEther(`${i + 1}`);
			rewardPerBlock.push(parsedReward);
		}
		const currentBlock = await deployer.provider.getBlock('latest');
		rampUpBlock = 20;
		lockBlock = 30;
		startBlock = currentBlock.number + 10;
		endBlock = startBlock + 40
		secondLockBlock = lockBlock + 5
		lockBlock0 = endBlock;
		rampUpBlock0 = lockBlock0 - 1;
	}

	beforeEach(async () => {
		deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);


		stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
		await stakingTokenInstance.mint(aliceAccount.signer.address, thirty);
		await stakingTokenInstance.mint(bobAccount.signer.address, amount);


		stakingTokenAddress = stakingTokenInstance.contractAddress;

		await setupRewardsPoolParameters(deployer)

		const percentageCalculator = await deployer.deploy(PercentageCalculator);
		libraries = {
			PercentageCalculator: percentageCalculator.contractAddress
		}

		LmcInstance = await deployer.deploy(
			LMC,
			{},
			stakingTokenAddress,
			startBlock,
			endBlock,
			rewardTokensAddresses,
			rewardPerBlock,
			rewardTokensAddresses[0],
			stakeLimit,
			contractStakeLimit
		);

		LockSchemeInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, LmcInstance.contractAddress);
		LockSchemeInstance6 = await deployer.deploy(LockScheme, libraries, secondLockBlock, rampUpBlock, bonus20, LmcInstance.contractAddress);
		LockSchemeInstance3 = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, LmcInstance.contractAddress);
		LockSchemeInstance0 = await deployer.deploy(LockScheme, libraries, lockBlock0, rampUpBlock0, 0, LmcInstance.contractAddress);

		lockSchemеs.push(LockSchemeInstance.contractAddress);
		lockSchemеs.push(LockSchemeInstance6.contractAddress);
		lockSchemеs.push(LockSchemeInstance3.contractAddress);
		lockSchemеs.push(LockSchemeInstance0.contractAddress);

		await LmcInstance.setLockSchemes(lockSchemеs);
		await rewardTokensInstances[0].mint(LmcInstance.contractAddress, amount);

	});

	it("Should deploy the lock scheme successfully", async () => {
		assert.isAddress(LockSchemeInstance.contractAddress, "The LockScheme contract was not deployed");
		assert.isAddress(LmcInstance.contractAddress, "The LMC contract was not deployed");
	});


	describe("Staking and Locking", () => {

		beforeEach(async () => {
			await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
			await stakingTokenInstance.approve(LmcInstance.contractAddress, amount);
			await stakingTokenInstance.from(bobAccount.signer).approve(LmcInstance.contractAddress, amount);
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (startBlock - currentBlock.number);
			for (let i = 0; i < blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}
		});

		it("Should stake and lock sucessfully", async () => {

			let currentBlock = await deployer.provider.getBlock('latest');
			let contractInitialBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);
			let userInitialBalance = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);

			await LmcInstance.stakeAndLock(bTen, LockSchemeInstance.contractAddress);

			let contractFinalBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);
			let userFinalBalance = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const totalStakedAmount = await LmcInstance.totalStaked();
			const userInfo = await LmcInstance.userInfo(aliceAccount.signer.address)
			const userRewardDebt = await LmcInstance.getUserRewardDebt(aliceAccount.signer.address, 0);
			const userOwedToken = await LmcInstance.getUserOwedTokens(aliceAccount.signer.address, 0);

			let userInfoLock = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
			let userBonus = await LockSchemeInstance.getUserBonus(aliceAccount.signer.address);
			let userAccruedRewards = await LockSchemeInstance.getUserAccruedReward(aliceAccount.signer.address);
			currentBlock = await deployer.provider.getBlock('latest');

			assert(contractFinalBalance.eq(contractInitialBalance.add(bTen)), "The balance of the contract was not incremented properly")
			assert(userInfoLock.balance.eq(bTen), "The transferred amount is not corrent");
			assert(userInfoLock.lockInitialStakeBlock.eq(currentBlock.number), "The lock block is not set properly");
			assert(userAccruedRewards.eq(0), "The rewards were not set properly");
			assert(userBonus.eq(0), "User bonuses should be equal to zero");
			assert(totalStakedAmount.eq(bTen), "The stake was not successful")
			assert(userInfo.amountStaked.eq(bTen), "User's staked amount is not correct")
			assert(userInfo.firstStakedBlockNumber.eq(currentBlock.number), "User's first block is not correct")
			assert(userRewardDebt.eq(0), "User's reward debt is not correct")
			assert(userOwedToken.eq(0), "User's reward debt is not correct")
			assert(userFinalBalance.eq(userInitialBalance.sub(bTen)), "User was not charged for staking");

			await mineBlock(deployer.provider);

			const accumulatedReward = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
			assert(accumulatedReward.eq(bOne), "The reward accrued was not 1 token");
		})

		it("Should stake and lock sucessfully in two different lmc's", async () => {

			let currentBlock = await deployer.provider.getBlock('latest');
			let contractInitialBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);

			await LmcInstance.stakeAndLock(bTen, LockSchemeInstance6.contractAddress);

			await LmcInstance.stakeAndLock(bTwenty, LockSchemeInstance.contractAddress);


			for (let i = 0; i < 6; i++) {
				await mineBlock(deployer.provider);

			}
			const accumulatedReward = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			let contractFinalBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);
			const totalStakedAmount = await LmcInstance.totalStaked();
			const userInfo = await LmcInstance.userInfo(aliceAccount.signer.address)

			let userInfoLock = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
			let userInfoLock2 = await LockSchemeInstance6.userInfo(aliceAccount.signer.address);
			let userBonus = await LockSchemeInstance.getUserBonus(aliceAccount.signer.address);
			let userAccruedRewards = await LockSchemeInstance6.getUserAccruedReward(aliceAccount.signer.address);
			currentBlock = await deployer.provider.getBlock('latest');

			assert(contractFinalBalance.eq(contractInitialBalance.add(bTen).add(bTwenty)), "The balance of the contract was not incremented properly")
			assert(userInfoLock.balance.eq(bTwenty), "The transferred amount is not corrent");
			assert(userInfoLock2.balance.eq(bTen), "The transferred amount is not corrent in the second lock scheme");
			assert(userAccruedRewards.eq(bOne), "The rewards were not set properly");
			assert(userBonus.eq(0), "User bonuses should be equal to zero");
			assert(totalStakedAmount.eq(bTen.add(bTwenty)), "The stake was not successful")
			assert(userInfo.amountStaked.eq(bTen.add(bTwenty)), "User's staked amount is not correct")
			assert(accumulatedReward.eq(bOne.mul(7)), "The reward accrued was not 1 token");
		})

		it("Should fail staking and locking with zero amount", async () => {
			await assert.revertWith(LmcInstance.stakeAndLock(0, LockSchemeInstance.contractAddress), "stakeAndLock::Cannot stake 0");
		})

		it("Should fail staking and locking if the ramp up period has finished", async () => {

			await LmcInstance.stakeAndLock(bTen, LockSchemeInstance6.contractAddress);

			for (let i = 0; i < 25; i++) {
				await mineBlock(deployer.provider);
			}
			await assert.revertWith(LmcInstance.stakeAndLock(bTen, LockSchemeInstance6.contractAddress), "lock::The ramp up period has finished");
		})
	})

	describe.only("Only Staking", () => {

		beforeEach(async () => {
			await stakingTokenInstance.approve(LockSchemeInstance0.contractAddress, amount);
			await stakingTokenInstance.approve(LmcInstance.contractAddress, amount);
			await stakingTokenInstance.from(bobAccount.signer).approve(LmcInstance.contractAddress, amount);

			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (startBlock - currentBlock.number);

			for (let i = 0; i < blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}
		});

		it("Should stake only sucessfully", async () => {

			let currentBlock = await deployer.provider.getBlock('latest');
			let contractInitialBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);
			let userInitialBalance = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);

			await LmcInstance.stakeAndLock(bTen, LockSchemeInstance0.contractAddress);

			let contractFinalBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);
			let userFinalBalance = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const totalStakedAmount = await LmcInstance.totalStaked();
			const userInfo = await LmcInstance.userInfo(aliceAccount.signer.address)
			const userRewardDebt = await LmcInstance.getUserRewardDebt(aliceAccount.signer.address, 0);
			const userOwedToken = await LmcInstance.getUserOwedTokens(aliceAccount.signer.address, 0);

			let userInfoLock = await LockSchemeInstance0.userInfo(aliceAccount.signer.address);
			let userBonus = await LockSchemeInstance0.getUserBonus(aliceAccount.signer.address);
			let userAccruedRewards = await LockSchemeInstance0.getUserAccruedReward(aliceAccount.signer.address);
			currentBlock = await deployer.provider.getBlock('latest');

			console.log(ethers.utils.formatEther(userInfoLock.balance));

			assert(contractFinalBalance.eq(contractInitialBalance.add(bTen)), "The balance of the contract was not incremented properly")
			assert(userInfoLock.balance.eq(bTen), "The transferred amount is not corrent");
			assert(userInfoLock.lockInitialStakeBlock.eq(currentBlock.number), "The lock block is not set properly");
			assert(userAccruedRewards.eq(0), "The rewards were not set properly");
			assert(userBonus.eq(0), "User bonuses should be equal to zero");
			assert(totalStakedAmount.eq(bTen), "The stake was not successful")
			assert(userInfo.amountStaked.eq(bTen), "User's staked amount is not correct")
			assert(userInfo.firstStakedBlockNumber.eq(currentBlock.number), "User's first block is not correct")
			assert(userRewardDebt.eq(0), "User's reward debt is not correct")
			assert(userOwedToken.eq(0), "User's reward debt is not correct")
			assert(userFinalBalance.eq(userInitialBalance.sub(bTen)), "User was not charged for staking");

			await mineBlock(deployer.provider);

			const accumulatedReward = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
			assert(accumulatedReward.eq(bOne), "The reward accrued was not 1 token");
		})

		it("Should fail staking with zero amount", async () => {
			await assert.revertWith(LmcInstance.stakeAndLock(0, LockSchemeInstance0.contractAddress), "stakeAndLock::Cannot stake 0");
		})
	})
});