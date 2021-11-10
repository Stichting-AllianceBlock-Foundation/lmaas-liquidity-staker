const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const NonCompoundingRewardsPool = require('../build/NonCompoundingRewardsPool.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')


describe('NonCompoundingRewardsPool', () => {

	let aliceAccount = accounts[3];
	let bobAccount = accounts[4];
	let carolAccount = accounts[5];
	let treasury = accounts[8];
	let deployer;

	let NonCompoundingRewardsPoolInstance;
	let stakingTokenAddress;
	let externalRewardsTokenAddress;
	let stakingTokenInstance;
	let externalRewardsTokenInstance;

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

	let startTimestmap;
	let endTimestamp;
	const virtualBlocksTime = 10 // 10s == 10000ms
	const oneMinute = 60



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
		startTimestmap = currentBlock.timestamp + oneMinute ;
		endTimestamp = startTimestmap + oneMinute*2;
		startBlock = Math.trunc(startTimestmap/virtualBlocksTime)
		endBlock = Math.trunc(endTimestamp/virtualBlocksTime)

	}

	const stake = async (_throttleRoundBlocks, _throttleRoundCap) => {
		NonCompoundingRewardsPoolInstance = await deployer.deploy(
			NonCompoundingRewardsPool,
			{},
			stakingTokenAddress,
			startTimestmap,
			endTimestamp,
			rewardTokensAddresses,
			rewardPerBlock,
			stakeLimit,
			_throttleRoundBlocks,
			_throttleRoundCap,
			contractStakeLimit,
			virtualBlocksTime
		);

		const reward = rewardPerBlock[0].mul(endBlock-startBlock);

		await rewardTokensInstances[0].mint(NonCompoundingRewardsPoolInstance.contractAddress, reward);

		await stakingTokenInstance.approve(NonCompoundingRewardsPoolInstance.contractAddress, standardStakingAmount);
		await stakingTokenInstance.from(bobAccount.signer).approve(NonCompoundingRewardsPoolInstance.contractAddress, standardStakingAmount);
		
		await utils.timeTravel(deployer.provider, 70);
		await NonCompoundingRewardsPoolInstance.stake(standardStakingAmount);


	}

	describe("Interaction Mechanics", async function () {

		beforeEach(async () => {
			deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);

			stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			await stakingTokenInstance.mint(aliceAccount.signer.address, amount);
			await stakingTokenInstance.mint(bobAccount.signer.address, amount);

			stakingTokenAddress = stakingTokenInstance.contractAddress;

			externalRewardsTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			await externalRewardsTokenInstance.mint(treasury.signer.address, amount);

			externalRewardsTokenAddress = externalRewardsTokenInstance.contractAddress;

			await setupRewardsPoolParameters(deployer)

			await stake(throttleRoundBlocks, throttleRoundCap);
		});

		it("Should not claim or withdraw", async () => {

			const userInitialBalance = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewards = await NonCompoundingRewardsPoolInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			await assert.revertWith(NonCompoundingRewardsPoolInstance.claim(), "OnlyExitFeature::cannot claim from this contract. Only exit.");
			await assert.revertWith(NonCompoundingRewardsPoolInstance.withdraw(bOne), "OnlyExitFeature::cannot withdraw from this contract. Only exit.");
		})

		it("Should not exit before end of campaign", async () => {
			await assert.revertWith(NonCompoundingRewardsPoolInstance.exit(), "onlyUnlocked::cannot perform this action until the end of the lock");
		})

		it("Should request exit successfully", async () => {

			await utils.timeTravel(deployer.provider, 130);
		
			const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoInitial = await NonCompoundingRewardsPoolInstance.userInfo(aliceAccount.signer.address);
			const initialTotalStakedAmount = await NonCompoundingRewardsPoolInstance.totalStaked();
			const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewards = await NonCompoundingRewardsPoolInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			await NonCompoundingRewardsPoolInstance.exit();

			const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userTokensOwed = await NonCompoundingRewardsPoolInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
			const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoFinal = await NonCompoundingRewardsPoolInstance.userInfo(aliceAccount.signer.address);
			const finalTotalStkaedAmount = await NonCompoundingRewardsPoolInstance.totalStaked();
			const finalRewardDebt = await NonCompoundingRewardsPoolInstance.getUserRewardDebt(aliceAccount.signer.address, 0)

			assert(userFinalBalanceRewards.eq(userInitialBalanceRewards), "Rewards claim was not successful")
			assert(userTokensOwed.eq(0), "User tokens owed should be zero")
			assert(finalRewardDebt.eq(0), "User reward debt should be zero")
			assert(userFinalBalanceStaking.eq(userInitialBalanceStaking), "Withdraw was not successfull")
			assert(userInfoFinal.amountStaked.eq(0), "User staked amount is not updated properly")
			assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")

			const userExitInfo = await NonCompoundingRewardsPoolInstance.exitInfo(aliceAccount.signer.address)
			const pendingReward = await NonCompoundingRewardsPoolInstance.getPendingReward(0);
			assert(userInfoInitial.amountStaked.eq(userExitInfo.exitStake), "User exit amount is not updated properly");
			assert(userRewards.eq(pendingReward), "User exit rewards are not updated properly");
		})

		it("Should not get twice reward on exit twice", async () => {
			await utils.timeTravel(deployer.provider, 130);

			const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoInitial = await NonCompoundingRewardsPoolInstance.userInfo(aliceAccount.signer.address);
			const initialTotalStakedAmount = await NonCompoundingRewardsPoolInstance.totalStaked();
			const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewards = await NonCompoundingRewardsPoolInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			await NonCompoundingRewardsPoolInstance.exit();
			await NonCompoundingRewardsPoolInstance.exit();

			const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userTokensOwed = await NonCompoundingRewardsPoolInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
			const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoFinal = await NonCompoundingRewardsPoolInstance.userInfo(aliceAccount.signer.address);
			const finalTotalStkaedAmount = await NonCompoundingRewardsPoolInstance.totalStaked();
			const finalRewardDebt = await NonCompoundingRewardsPoolInstance.getUserRewardDebt(aliceAccount.signer.address, 0)

			assert(userFinalBalanceRewards.eq(userInitialBalanceRewards), "Rewards claim was not successful")
			assert(userTokensOwed.eq(0), "User tokens owed should be zero")
			assert(finalRewardDebt.eq(0), "User reward debt should be zero")
			assert(userFinalBalanceStaking.eq(userInitialBalanceStaking), "Withdraw was not successfull")
			assert(userInfoFinal.amountStaked.eq(0), "User staked amount is not updated properly")
			assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")

			const userExitInfo = await NonCompoundingRewardsPoolInstance.exitInfo(aliceAccount.signer.address)
			const pendingReward = await NonCompoundingRewardsPoolInstance.getPendingReward(0);
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
			await utils.timeTravel(deployer.provider, 190);

			await NonCompoundingRewardsPoolInstance.exit();

			const nextBlock = await NonCompoundingRewardsPoolInstance.nextAvailableExitBlock();
			assert(nextBlock.eq(endBlock + throttleRoundBlocks), "End block has changed but it should not have");

			const volume = await NonCompoundingRewardsPoolInstance.nextAvailableRoundExitVolume();
			assert(volume.eq(standardStakingAmount), "Exit volume was incorrect");

			const userExitInfo = await NonCompoundingRewardsPoolInstance.exitInfo(aliceAccount.signer.address)
			assert(userExitInfo.exitBlock.eq(nextBlock), "The exit block for the user was not set on the next block");
		})

		it("Should change nextAvailableExitBlock if cap is hit", async () => {

			const _throttleRoundBlocks = 10;
			const _throttleRoundCap = standardStakingAmount.mul(2);

			await stake(_throttleRoundBlocks, _throttleRoundCap)
			await utils.timeTravel(deployer.provider, 70);
			await NonCompoundingRewardsPoolInstance.from(bobAccount.signer).stake(standardStakingAmount);

			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			await utils.timeTravel(deployer.provider, 70);

			await NonCompoundingRewardsPoolInstance.exit();
			await utils.timeTravel(deployer.provider, 10);
			await NonCompoundingRewardsPoolInstance.from(bobAccount.signer).exit();
		
			const nextBlock = await NonCompoundingRewardsPoolInstance.nextAvailableExitBlock();
			assert(nextBlock.eq(endBlock + (throttleRoundBlocks * 2)), "End block has changed incorrectly");

			const volume = await NonCompoundingRewardsPoolInstance.nextAvailableRoundExitVolume();
			assert(volume.eq(0), "Exit volume was incorrect");

			const userExitInfo = await NonCompoundingRewardsPoolInstance.exitInfo(bobAccount.signer.address)
			assert(userExitInfo.exitBlock.eq(endBlock + throttleRoundBlocks), "The exit block for the user was not set for the current block");
		})

		it("Should find next available", async () => {

			const _throttleRoundBlocks = 10;
			const _throttleRoundCap = standardStakingAmount.mul(2);

			await stake(_throttleRoundBlocks, _throttleRoundCap)

			await NonCompoundingRewardsPoolInstance.from(bobAccount.signer).stake(standardStakingAmount);

			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			await utils.timeTravel(deployer.provider, 120);

			await NonCompoundingRewardsPoolInstance.exit();

			const nextBlock = await NonCompoundingRewardsPoolInstance.nextAvailableExitBlock();
			
			assert(nextBlock.eq(endBlock + (throttleRoundBlocks )), "End block has changed incorrectly");

			const volume = await NonCompoundingRewardsPoolInstance.nextAvailableRoundExitVolume();
			assert(volume.eq(standardStakingAmount), "Exit volume was incorrect");

			const userExitInfo = await NonCompoundingRewardsPoolInstance.exitInfo(aliceAccount.signer.address)
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

			externalRewardsTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			await externalRewardsTokenInstance.mint(treasury.signer.address, amount);

			externalRewardsTokenAddress = externalRewardsTokenInstance.contractAddress;

			await setupRewardsPoolParameters(deployer)
			
			await stake(throttleRoundBlocks, throttleRoundCap);
		});

		it("Should not complete early", async () => {
			await utils.timeTravel(deployer.provider, 130);
			await NonCompoundingRewardsPoolInstance.exit();

			await assert.revertWith(NonCompoundingRewardsPoolInstance.completeExit(), "finalizeExit::Trying to exit too early");
		})

		it("Should complete succesfully", async () => {
			await utils.timeTravel(deployer.provider, 190);

			const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoInitial = await NonCompoundingRewardsPoolInstance.userInfo(aliceAccount.signer.address);
			const initialTotalStakedAmount = await NonCompoundingRewardsPoolInstance.totalStaked();
			const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewards = await NonCompoundingRewardsPoolInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			await NonCompoundingRewardsPoolInstance.exit();
			await utils.timeTravel(deployer.provider, 40);

			await NonCompoundingRewardsPoolInstance.completeExit();

			const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userTokensOwed = await NonCompoundingRewardsPoolInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
			const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoFinal = await NonCompoundingRewardsPoolInstance.userInfo(aliceAccount.signer.address);
			const finalTotalStkaedAmount = await NonCompoundingRewardsPoolInstance.totalStaked();

			assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "Rewards claim was not successful")
			assert(userTokensOwed.eq(0), "User tokens owed should be zero")
			assert(userFinalBalanceStaking.eq(userInitialBalanceStaking.add(standardStakingAmount)), "Withdraw was not successfull")
			assert(userInfoFinal.amountStaked.eq(userInfoInitial.amountStaked.sub(standardStakingAmount)), "User staked amount is not updated properly")
			assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")

			const userExitInfo = await NonCompoundingRewardsPoolInstance.exitInfo(aliceAccount.signer.address)
			const pendingReward = await NonCompoundingRewardsPoolInstance.getPendingReward(0);
			assert(userExitInfo.exitStake.eq(0), "User exit amount is not updated properly");
			assert(pendingReward.eq(0), "User exit rewards are not updated properly");
		})

		//Tresury was removed
		xit("Should get external reward", async () => {
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			await externalRewardsTokenInstance.from(treasury.signer.address).approve(NonCompoundingRewardsPoolInstance.contractAddress, bOne);
			await NonCompoundingRewardsPoolInstance.from(treasury.signer.address).notifyExternalReward(bOne);

			await utils.timeTravel(deployer.provider, 190);

			const userInitialExternalReward = await externalRewardsTokenInstance.balanceOf(aliceAccount.signer.address);

			await NonCompoundingRewardsPoolInstance.exit();

			await utils.timeTravel(deployer.provider, 130);

			await NonCompoundingRewardsPoolInstance.completeExit();

			const userFinalExternalReward = await externalRewardsTokenInstance.balanceOf(aliceAccount.signer.address);

			assert(userFinalExternalReward.gt(userInitialExternalReward), "User balance was not the external balance")

		})


	})
	//Treasury functionality was removed
	xdescribe("Treasury interactions", async function () {

		beforeEach(async () => {
			deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);


			stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			await stakingTokenInstance.mint(aliceAccount.signer.address, amount);
			await stakingTokenInstance.mint(bobAccount.signer.address, amount);

			stakingTokenAddress = stakingTokenInstance.contractAddress;

			externalRewardsTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			await externalRewardsTokenInstance.mint(treasury.signer.address, amount);

			externalRewardsTokenAddress = externalRewardsTokenInstance.contractAddress;

			await setupRewardsPoolParameters(deployer)

			await stake(throttleRoundBlocks, throttleRoundCap);
		});

		it("Should withdraw stake", async () => {

			const balanceBefore = await stakingTokenInstance.balanceOf(NonCompoundingRewardsPoolInstance.contractAddress);

			await NonCompoundingRewardsPoolInstance.from(treasury.signer.address).withdrawStake(bOne);

			const balanceAfter = await stakingTokenInstance.balanceOf(NonCompoundingRewardsPoolInstance.contractAddress);
			const balanceTreasuryAfter = await stakingTokenInstance.balanceOf(treasury.signer.address);

			assert(balanceAfter.eq(balanceBefore.sub(bOne)), "The staking balance was not lowered");
			assert(balanceTreasuryAfter.eq(bOne), "The treasury staking balance was not increased");

		})

		it("Should get external reward", async () => {
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock - currentBlock.number);

			for (let i = 0; i < blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}

			await externalRewardsTokenInstance.from(treasury.signer.address).approve(NonCompoundingRewardsPoolInstance.contractAddress, bOne);
			await NonCompoundingRewardsPoolInstance.from(treasury.signer.address).notifyExternalReward(bOne);

			const userInitialExternalReward = await externalRewardsTokenInstance.balanceOf(aliceAccount.signer.address);

			await NonCompoundingRewardsPoolInstance.exit();

			for (let i = 0; i < throttleRoundBlocks; i++) {
				await mineBlock(deployer.provider);
			}

			await NonCompoundingRewardsPoolInstance.completeExit();

			const userFinalExternalReward = await externalRewardsTokenInstance.balanceOf(aliceAccount.signer.address);

			assert(userFinalExternalReward.gt(userInitialExternalReward), "User balance was not the external balance")

		})


	})

});