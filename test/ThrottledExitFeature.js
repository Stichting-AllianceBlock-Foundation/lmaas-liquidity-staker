const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const ThrottledExitFeature = require('../build/ThrottledExitRewardsPoolMock.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')


describe('ThrottledExitFeature', () => {

	let aliceAccount = accounts[3];
	let bobAccount = accounts[4];
	let carolAccount = accounts[5];
	let deployer;

	let ThrottledExitFeatureInstance;
	let stakingTokenAddress;

	let rewardTokensInstances;
	let rewardTokensAddresses;
	let rewardPerBlock;

	let startBlock;
	let endBlock;
	let throttleRoundBlocks = 10;
	let throttleRoundCap = ethers.utils.parseEther("1");


	const rewardTokensCount = 1; // 5 rewards tokens for tests
	const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const stakeLimit = amount;
	const bOne = ethers.utils.parseEther("1");
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens
	const contractStakeLimit = ethers.utils.parseEther('10') // 10 tokens


	const setupRewardsPoolParameters = async (deployer) => {
		rewardTokensInstances = [];
		rewardTokensAddresses = [];
		rewardPerBlock = [];
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
		startBlock = currentBlock.number + 5;
		endBlock = startBlock + 20;

	}

	const stake = async (_throttleRoundBlocks, _throttleRoundCap) => {
		ThrottledExitFeatureInstance = await deployer.deploy(
			ThrottledExitFeature,
			{},
			stakingTokenAddress,
			startBlock,
			endBlock,
			rewardTokensAddresses,
			rewardPerBlock,
			stakeLimit,
			_throttleRoundBlocks,
			_throttleRoundCap,
			contractStakeLimit
		);

		await rewardTokensInstances[0].mint(ThrottledExitFeatureInstance.contractAddress, amount);

		await stakingTokenInstance.approve(ThrottledExitFeatureInstance.contractAddress, standardStakingAmount);
		await stakingTokenInstance.from(bobAccount.signer).approve(ThrottledExitFeatureInstance.contractAddress, standardStakingAmount);
		let currentBlock = await deployer.provider.getBlock('latest');
		let blocksDelta = (startBlock - currentBlock.number);

		for (let i = 0; i < blocksDelta; i++) {
			await mineBlock(deployer.provider);
		}
		await ThrottledExitFeatureInstance.stake(standardStakingAmount);


	}

	describe("Interaction Mechanics", async function () {

		beforeEach(async () => {
			deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);


			stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			await stakingTokenInstance.mint(aliceAccount.signer.address, amount);
			await stakingTokenInstance.mint(bobAccount.signer.address, amount);


			stakingTokenAddress = stakingTokenInstance.contractAddress;

			await setupRewardsPoolParameters(deployer)

			await stake(throttleRoundBlocks, throttleRoundCap);
		});

		it("Should not claim or withdraw", async () => {

			await mineBlock(deployer.provider);
			const userInitialBalance = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewards = await ThrottledExitFeatureInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			await assert.revertWith(ThrottledExitFeatureInstance.claim(), "OnlyExitFeature::cannot claim from this contract. Only exit.");
			await assert.revertWith(ThrottledExitFeatureInstance.withdraw(bOne), "OnlyExitFeature::cannot withdraw from this contract. Only exit.");
		})

		it("Should request exit successfully", async () => {
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			for (let i = 0; i < blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}

			const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoInitial = await ThrottledExitFeatureInstance.userInfo(aliceAccount.signer.address);
			const initialTotalStakedAmount = await ThrottledExitFeatureInstance.totalStaked();
			const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewards = await ThrottledExitFeatureInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			await ThrottledExitFeatureInstance.exit();

			const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userTokensOwed = await ThrottledExitFeatureInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
			const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoFinal = await ThrottledExitFeatureInstance.userInfo(aliceAccount.signer.address);
			const finalTotalStkaedAmount = await ThrottledExitFeatureInstance.totalStaked();
			const finalRewardDebt = await ThrottledExitFeatureInstance.getUserRewardDebt(aliceAccount.signer.address, 0)

			assert(userFinalBalanceRewards.eq(userInitialBalanceRewards), "Rewards claim was not successful")
			assert(userTokensOwed.eq(0), "User tokens owed should be zero")
			assert(finalRewardDebt.eq(0), "User reward debt should be zero")
			assert(userFinalBalanceStaking.eq(userInitialBalanceStaking), "Withdraw was not successfull")
			assert(userInfoFinal.amountStaked.eq(0), "User staked amount is not updated properly")
			assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")

			const userExitInfo = await ThrottledExitFeatureInstance.exitInfo(aliceAccount.signer.address)
			const pendingReward = await ThrottledExitFeatureInstance.getPendingReward(0);
			assert(userInfoInitial.amountStaked.eq(userExitInfo.exitStake), "User exit amount is not updated properly");
			assert(userRewards.eq(pendingReward), "User exit rewards are not updated properly");
		})

		it("Should not get twice reward on exit twice", async () => {
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			for (let i = 0; i < blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}

			const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoInitial = await ThrottledExitFeatureInstance.userInfo(aliceAccount.signer.address);
			const initialTotalStakedAmount = await ThrottledExitFeatureInstance.totalStaked();
			const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewards = await ThrottledExitFeatureInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			await ThrottledExitFeatureInstance.exit();
			await ThrottledExitFeatureInstance.exit();

			const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userTokensOwed = await ThrottledExitFeatureInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
			const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoFinal = await ThrottledExitFeatureInstance.userInfo(aliceAccount.signer.address);
			const finalTotalStkaedAmount = await ThrottledExitFeatureInstance.totalStaked();
			const finalRewardDebt = await ThrottledExitFeatureInstance.getUserRewardDebt(aliceAccount.signer.address, 0)

			assert(userFinalBalanceRewards.eq(userInitialBalanceRewards), "Rewards claim was not successful")
			assert(userTokensOwed.eq(0), "User tokens owed should be zero")
			assert(finalRewardDebt.eq(0), "User reward debt should be zero")
			assert(userFinalBalanceStaking.eq(userInitialBalanceStaking), "Withdraw was not successfull")
			assert(userInfoFinal.amountStaked.eq(0), "User staked amount is not updated properly")
			assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")

			const userExitInfo = await ThrottledExitFeatureInstance.exitInfo(aliceAccount.signer.address)
			const pendingReward = await ThrottledExitFeatureInstance.getPendingReward(0);
			assert(userInfoInitial.amountStaked.eq(userExitInfo.exitStake), "User exit amount is not updated properly");
			assert(userRewards.eq(pendingReward), "User exit rewards are not updated properly");
		})
	})

	describe("Cap and Rounds Mechanics", async function () {

		beforeEach(async () => {
			deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);


			stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			await stakingTokenInstance.mint(aliceAccount.signer.address, amount);
			await stakingTokenInstance.mint(bobAccount.signer.address, amount);


			stakingTokenAddress = stakingTokenInstance.contractAddress;

			await setupRewardsPoolParameters(deployer)

		});

		it("Should not change nextAvailableExitBlock before cap", async () => {

			const _throttleRoundBlocks = 10;
			const _throttleRoundCap = standardStakingAmount.mul(2);

			await stake(_throttleRoundBlocks, _throttleRoundCap)

			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			for (let i = 0; i < blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}

			await ThrottledExitFeatureInstance.exit();

			const nextBlock = await ThrottledExitFeatureInstance.nextAvailableExitBlock();
			assert(nextBlock.eq(endBlock + throttleRoundBlocks), "End block has changed but it should not have");

			const volume = await ThrottledExitFeatureInstance.nextAvailableRoundExitVolume();
			assert(volume.eq(standardStakingAmount), "Exit volume was incorrect");

			const userExitInfo = await ThrottledExitFeatureInstance.exitInfo(aliceAccount.signer.address)
			assert(userExitInfo.exitBlock.eq(nextBlock), "The exit block for the user was not set on the next block");
		})

		it("Should change nextAvailableExitBlock if cap is hit", async () => {

			const _throttleRoundBlocks = 10;
			const _throttleRoundCap = standardStakingAmount.mul(2);

			await stake(_throttleRoundBlocks, _throttleRoundCap)

			await ThrottledExitFeatureInstance.from(bobAccount.signer).stake(standardStakingAmount);

			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			for (let i = 0; i < blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}

			await ThrottledExitFeatureInstance.exit();
			await ThrottledExitFeatureInstance.from(bobAccount.signer).exit();

			const nextBlock = await ThrottledExitFeatureInstance.nextAvailableExitBlock();
			assert(nextBlock.eq(endBlock + (throttleRoundBlocks * 2)), "End block has changed incorrectly");

			const volume = await ThrottledExitFeatureInstance.nextAvailableRoundExitVolume();
			assert(volume.eq(0), "Exit volume was incorrect");

			const userExitInfo = await ThrottledExitFeatureInstance.exitInfo(bobAccount.signer.address)
			assert(userExitInfo.exitBlock.eq(endBlock + throttleRoundBlocks), "The exit block for the user was not set for the current block");
		})

		it("Should find next available", async () => {

			const _throttleRoundBlocks = 10;
			const _throttleRoundCap = standardStakingAmount.mul(2);

			await stake(_throttleRoundBlocks, _throttleRoundCap)

			await ThrottledExitFeatureInstance.from(bobAccount.signer).stake(standardStakingAmount);

			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			for (let i = 0; i < blocksDelta + _throttleRoundBlocks; i++) {
				await mineBlock(deployer.provider);
			}

			await ThrottledExitFeatureInstance.exit();

			const nextBlock = await ThrottledExitFeatureInstance.nextAvailableExitBlock();
			assert(nextBlock.eq(endBlock + (throttleRoundBlocks * 2)), "End block has changed incorrectly");

			const volume = await ThrottledExitFeatureInstance.nextAvailableRoundExitVolume();
			assert(volume.eq(standardStakingAmount), "Exit volume was incorrect");

			const userExitInfo = await ThrottledExitFeatureInstance.exitInfo(aliceAccount.signer.address)
			assert(userExitInfo.exitBlock.eq(nextBlock), "The exit block for the user was not set on the next block");
		})
	})

	describe("Completing Exit", async function () {

		beforeEach(async () => {
			deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);


			stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			await stakingTokenInstance.mint(aliceAccount.signer.address, amount);
			await stakingTokenInstance.mint(bobAccount.signer.address, amount);


			stakingTokenAddress = stakingTokenInstance.contractAddress;

			await setupRewardsPoolParameters(deployer)

			await stake(throttleRoundBlocks, throttleRoundCap);
		});

		it("Should not complete early", async () => {
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			for (let i = 0; i < blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}

			await ThrottledExitFeatureInstance.exit();

			await assert.revertWith(ThrottledExitFeatureInstance.completeExit(), "finalizeExit::Trying to exit too early");
		})

		it("Should complete succesfully", async () => {
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			for (let i = 0; i < blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}

			const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoInitial = await ThrottledExitFeatureInstance.userInfo(aliceAccount.signer.address);
			const initialTotalStakedAmount = await ThrottledExitFeatureInstance.totalStaked();
			const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewards = await ThrottledExitFeatureInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			await ThrottledExitFeatureInstance.exit();

			for (let i = 0; i < throttleRoundBlocks; i++) {
				await mineBlock(deployer.provider);
			}

			await ThrottledExitFeatureInstance.completeExit();

			const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userTokensOwed = await ThrottledExitFeatureInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
			const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoFinal = await ThrottledExitFeatureInstance.userInfo(aliceAccount.signer.address);
			const finalTotalStkaedAmount = await ThrottledExitFeatureInstance.totalStaked();

			assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "Rewards claim was not successful")
			assert(userTokensOwed.eq(0), "User tokens owed should be zero")
			assert(userFinalBalanceStaking.eq(userInitialBalanceStaking.add(standardStakingAmount)), "Withdraw was not successfull")
			assert(userInfoFinal.amountStaked.eq(userInfoInitial.amountStaked.sub(standardStakingAmount)), "User staked amount is not updated properly")
			assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")

			const userExitInfo = await ThrottledExitFeatureInstance.exitInfo(aliceAccount.signer.address)
			const pendingReward = await ThrottledExitFeatureInstance.getPendingReward(0);
			assert(userExitInfo.exitStake.eq(0), "User exit amount is not updated properly");
			assert(pendingReward.eq(0), "User exit rewards are not updated properly");
		})

	})

});