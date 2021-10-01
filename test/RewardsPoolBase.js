const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const RewardsPoolBase = require('../build/RewardsPoolBase.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')

describe.only('RewardsPoolBase', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;

    let RewardsPoolBaseInstance;
    let stakingTokenAddress;

    let rewardTokensInstances;
    let rewardTokensAddresses;
	let rewardPerBlock;

	let startTimestamp;
	let endTimestamp;
	const virtualBlockTime = 10 //10s == 10000ms
	const oneMinute = 60 // 1 minute

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
			let parsedReward = await ethers.utils.parseEther(`${i+1}`);
            rewardPerBlock.push(parsedReward);
        }

		const currentBlock = await deployer.provider.getBlock('latest');
		startTimestamp = currentBlock.timestamp + oneMinute;
		endTimestamp = startTimestamp + oneMinute*2	;

	}

    beforeEach(async () => {
		deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
		
		
		stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
		await stakingTokenInstance.mint(aliceAccount.signer.address,amount);
		await stakingTokenInstance.mint(bobAccount.signer.address,amount);
		

        stakingTokenAddress = stakingTokenInstance.contractAddress;

        await setupRewardsPoolParameters(deployer)

        RewardsPoolBaseInstance = await deployer.deploy(
            RewardsPoolBase,
            {},
            stakingTokenAddress,
			startTimestamp,
			endTimestamp,
            rewardTokensAddresses,
            rewardPerBlock,
			stakeLimit,
			contractStakeLimit,
			virtualBlockTime
		);

		await rewardTokensInstances[0].mint(RewardsPoolBaseInstance.contractAddress,amount);
	});

	it("Should deploy the RewardsPoolBase properly", async() => {
		assert.isAddress(RewardsPoolBaseInstance.contractAddress, "The RewardsPoolBase contract was not deployed");
		const savedStakingTokenAddress = await RewardsPoolBaseInstance.stakingToken();

		assert.equal(savedStakingTokenAddress, stakingTokenInstance.contractAddress, "The saved address of the staking token was incorrect");

        for (i = 0; i < rewardTokensAddresses.length; i++) {
			const tokenAddress = await RewardsPoolBaseInstance.rewardsTokens(i);
			assert.equal(tokenAddress, rewardTokensAddresses[i], `The saved address of the reward token ${i} was incorrect`);

			const rewardPerBlock = await RewardsPoolBaseInstance.rewardPerBlock(i);
			assert(rewardPerBlock.eq(ethers.utils.parseEther(`${i+1}`)), "The saved reward per block is incorrect");

			const accumulatedMultiplier = await RewardsPoolBaseInstance.accumulatedRewardMultiplier(i);
			assert(accumulatedMultiplier.eq(ethers.utils.bigNumberify(0)), "The saved accumulatedMultiplier is incorrect");
        }

		const totalStaked = await RewardsPoolBaseInstance.totalStaked();
		assert(totalStaked.eq(0), "There was something staked already");

		const savedstartTimestamp = await RewardsPoolBaseInstance.startTimestamp();
		assert(savedstartTimestamp.eq(startTimestamp), "The start block saved was incorrect")

		const savedEndBlock = await RewardsPoolBaseInstance.endTimestamp();
		assert(savedEndBlock.eq(endTimestamp), "The end block saved was incorrect")

	});

	//This is covered from the factory
	xit("Should fail to deploy RewardsPoolBase with zero staking token address", async() => {

		await assert.revertWith(deployer.deploy(
			RewardsPoolBase,
            {},
            ethers.constants.AddressZero,
			startTimestamp,
			endTimestamp,
            rewardTokensAddresses,
            rewardPerBlock,
			stakeLimit,
			contractStakeLimit,
			virtualBlockTime
		), "Constructor::Invalid staking token address")
	})

	it("Should fail to deploy RewardsPoolBase with empty rewards token addresses array", async() => {

		await assert.revertWith(deployer.deploy(
			RewardsPoolBase,
            {},
            stakingTokenAddress,
			startTimestamp,
			endTimestamp,
            [],
            rewardPerBlock,
			stakeLimit,
			contractStakeLimit,
			virtualBlockTime
		), "Constructor::Rewards per block and rewards tokens must be with the same length.")
	})

	it("Should fail to deploy RewardsPoolBase with empty rewards per block array", async() => {

		await assert.revertWith(deployer.deploy(
			RewardsPoolBase,
            {},
            stakingTokenAddress,
			startTimestamp,
			endTimestamp,
            rewardTokensAddresses,
            [],
			stakeLimit,
			contractStakeLimit,
			virtualBlockTime
		), "Constructor::Rewards per block and rewards tokens must be with the same length.")
	})
	
	it("Should fail to deploy RewardsPoolBase if the start block is not in the future", async() => {

		await assert.revertWith(deployer.deploy(
			RewardsPoolBase,
            {},
            stakingTokenAddress,
			0,
			endTimestamp,
            rewardTokensAddresses,
            rewardPerBlock,
			stakeLimit,
			contractStakeLimit,
			virtualBlockTime
		), "Constructor::The starting timestamp must be in the future.")
	})

	it("Should fail to deploy RewardsPoolBase if the end block is not in the future", async() => {

		await assert.revertWith(deployer.deploy(
			RewardsPoolBase,
            {},
            stakingTokenAddress,
			startTimestamp,
			0,
            rewardTokensAddresses,
            rewardPerBlock,
			stakeLimit,
			contractStakeLimit,
			virtualBlockTime
		), "Constructor::The end timestamp must be in the future.")
	})

	it("Should fail to deploy RewardsPoolBase with 0 staking limit", async() => {

		await assert.revertWith(deployer.deploy(
			RewardsPoolBase,
            {},
            stakingTokenAddress,
			startTimestamp,
			endTimestamp,
            rewardTokensAddresses,
            rewardPerBlock,
			0,
			contractStakeLimit,
			virtualBlockTime
		), "Constructor::Stake limit needs to be more than 0")
	})
	it("Should fail to deploy RewardsPoolBase with 0 contract staking limit", async() => {

		await assert.revertWith(deployer.deploy(
			RewardsPoolBase,
            {},
            stakingTokenAddress,
			startTimestamp,
			endTimestamp,
            rewardTokensAddresses,
            rewardPerBlock,
			stakeLimit,
			0,
			virtualBlockTime
		), "Constructor:: Contract Stake limit needs to be more than 0")
	})

	describe("Staking", function() {

		it("Should not stake before staking start", async() => {
			await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
			await assert.revertWith(RewardsPoolBaseInstance.stake(standardStakingAmount), "Stake::Staking has not yet started");
		})

		describe("Inside bounds", function() {

			beforeEach(async () => {
				await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
				await stakingTokenInstance.from(bobAccount.signer).approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
				//timetraveling 70 seconds from now  in order to start the campaign
				await utils.timeTravel(deployer.provider, 70);
 			});

			it("Should successfully stake and accumulate reward", async() => {

				

				await RewardsPoolBaseInstance.stake(standardStakingAmount);

				const block = await RewardsPoolBaseInstance._getBlock()
				const totalStakedAmount = await RewardsPoolBaseInstance.totalStaked();
				const userInfo = await RewardsPoolBaseInstance.userInfo(aliceAccount.signer.address)
				const userRewardDebt = await RewardsPoolBaseInstance.getUserRewardDebt(aliceAccount.signer.address, 0);
				const userOwedToken = await RewardsPoolBaseInstance.getUserOwedTokens(aliceAccount.signer.address, 0);

				assert(totalStakedAmount.eq(standardStakingAmount), "The stake was not successful")
				assert(userInfo.amountStaked.eq(standardStakingAmount), "User's staked amount is not correct")
				assert(userInfo.firstStakedBlockNumber.eq(block), "User's first block is not correct")
				assert(userRewardDebt.eq(0), "User's reward debt is not correct")
				assert(userOwedToken.eq(0), "User's reward debt is not correct")

				//simulate mining of one block after staking
				await utils.timeTravel(deployer.provider, 10);
				const accumulatedReward = await RewardsPoolBaseInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				assert(accumulatedReward.eq(bOne), "The reward accrued was not 1 token");
			})

			it("Should accumulate reward and update multipliers", async() => {
				await RewardsPoolBaseInstance.stake(standardStakingAmount);
				await RewardsPoolBaseInstance.from(bobAccount.signer).stake(standardStakingAmount);

				const totalStake = standardStakingAmount.add(standardStakingAmount);
				let expectedMultiplier = (bOne.mul(2)).div(totalStake.div(bOne))

				let accumulatedMultiplier = await RewardsPoolBaseInstance.accumulatedRewardMultiplier(0)
				assert(accumulatedMultiplier.eq(expectedMultiplier), "The accumulated multiplier was incorrect");

				await utils.timeTravel(deployer.provider, 20);

				const accumulatedRewardAlice = await RewardsPoolBaseInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				assert(accumulatedRewardAlice.eq(bOne.add(bOne)), "The reward accrued was not 2 token");

				const accumulatedRewardBob = await RewardsPoolBaseInstance.getUserAccumulatedReward(bobAccount.signer.address, 0);
				assert(accumulatedRewardBob.eq(bOne), "The reward accrued was not 1 token");

				await RewardsPoolBaseInstance.updateRewardMultipliers();

				expectedMultiplier = (bOne.mul(5)).div(totalStake.div(bOne))
				accumulatedMultiplier = await RewardsPoolBaseInstance.accumulatedRewardMultiplier(0)
				assert(accumulatedMultiplier.eq(expectedMultiplier), "The accumulated multiplier was incorrect");

			})

			it("Should fail if amount to stake is not greater than zero", async() => {
				await assert.revertWith(RewardsPoolBaseInstance.stake(0), "Stake::Cannot stake 0");
			})

			it("Should fail if amount to stake is more than limit", async() => {
				await assert.revertWith(RewardsPoolBaseInstance.stake(stakeLimit.mul(2)), "onlyUnderStakeLimit::Stake limit reached");
			})

			it("Should fail if amount to stake is more than the contract limit", async() => {
				await assert.revertWith(RewardsPoolBaseInstance.stake(contractStakeLimit.mul(2)), "onlyUnderStakeLimit::Contract Stake limit reached");
			})

		})

		it("Should not after staking end", async() => {
			await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
			// await utils.timeTravel(deployer.provider, oneMinue*2)
			await utils.timeTravel(deployer.provider, 70000);
			await assert.revertWith(RewardsPoolBaseInstance.stake(standardStakingAmount), "Stake::Staking has finished");
		})
		
	})

	describe("Rewards", function() {

		beforeEach(async () => {
			await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
			await stakingTokenInstance.from(bobAccount.signer).approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (startTimestamp-currentBlock.number);

			await utils.timeTravel(deployer.provider, 70);
			await RewardsPoolBaseInstance.stake(standardStakingAmount);
		 });

		it("Should claim the rewards successfully", async() => {

			await utils.timeTravel(deployer.provider, 10);
			const userInitialBalance = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewards = await RewardsPoolBaseInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			await RewardsPoolBaseInstance.claim();

			const userFinalBalance = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewardsAfterClaiming = await RewardsPoolBaseInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
			const userTokensOwed = await RewardsPoolBaseInstance.getUserOwedTokens(aliceAccount.signer.address, 0);

			assert(userFinalBalance.gt(userInitialBalance), "Rewards claim was not successful, user final balance was not increased")
			assert(userFinalBalance.eq(userInitialBalance.add(userRewards)), "Rewards claim was not successful, user's final balance was not correct")
			assert(userRewardsAfterClaiming.eq(0), "There are rewards left")
			assert(userTokensOwed.eq(0), "User tokens owed should be zero")
		})

		it("Shouild withdraw the stake succesfully", async() => {
			await utils.timeTravel(deployer.provider, 10);

			const userInitialBalance = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoInitial = await RewardsPoolBaseInstance.userInfo(aliceAccount.signer.address);
			const initialTotalStkaedAmount = await RewardsPoolBaseInstance.totalStaked();

			await RewardsPoolBaseInstance.withdraw(bOne);

			const userFinalBalance = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoFinal = await RewardsPoolBaseInstance.userInfo(aliceAccount.signer.address);
			const finalTotalStkaedAmount = await RewardsPoolBaseInstance.totalStaked();

			assert(userFinalBalance.eq(userInitialBalance.add(bOne)), "Withdraw was not successfull")
			assert(userInfoFinal.amountStaked.eq(userInfoInitial.amountStaked.sub(bOne)), "User staked amount is not updated properly")
			assert(finalTotalStkaedAmount.eq(initialTotalStkaedAmount.sub(bOne)), "Contract total staked amount is not updated properly")

		})

		it("Should exit successfully from the RewardsPool", async() => {
			await utils.timeTravel(deployer.provider, 10);

			const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoInitial = await RewardsPoolBaseInstance.userInfo(aliceAccount.signer.address);
			const initialTotalStakedAmount = await RewardsPoolBaseInstance.totalStaked();
			const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userRewards = await RewardsPoolBaseInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

			await RewardsPoolBaseInstance.exit();
			
			const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			const userTokensOwed = await RewardsPoolBaseInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
			const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
			const userInfoFinal = await RewardsPoolBaseInstance.userInfo(aliceAccount.signer.address);
			const finalTotalStkaedAmount = await RewardsPoolBaseInstance.totalStaked();


			assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "Rewards claim was not successful, user's final balance was not increased")
			assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(userRewards)), "Rewards claim was not successful, users' final balance was not correct")
			assert(userTokensOwed.eq(0), "User tokens owed should be zero")
			assert(userFinalBalanceStaking.eq(userInitialBalanceStaking.add(standardStakingAmount)), "Withdraw was not successfull")
			assert(userInfoFinal.amountStaked.eq(userInfoInitial.amountStaked.sub(standardStakingAmount)), "User staked amount is not updated properly")
			assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")
		})

		it("Should fail withdrawing if the amount to withraw is not greater than zero", async() => {
			assert.revertWith(RewardsPoolBaseInstance.withdraw(0), "Withdraw::Cannot withdraw 0");
		})

		it("Should fail withdrawing if the amount to withraw is not greater than zero", async() => {
			assert.revertWith(RewardsPoolBaseInstance.withdraw(ethers.constants.MaxUint256),  "SafeMath: subtraction overflow");
		})



		const calculateRewardsAmount = async (startTimestamp, endTimestamp, rewardsPerBlock) => {
			let rewardsPeriod = endTimestamp - startTimestamp;
			let amount = rewardsPerBlock*(rewardsPeriod)
			let rewardsAmount = await ethers.utils.parseEther(amount.toString())
			
			return rewardsAmount
		 }

		it("Should extend the periods and update the reward per block", async() => {
			await utils.timeTravel(deployer.provider, 10);

			let currentEndBlock = await RewardsPoolBaseInstance.endTimestamp()
			let currentRewardPerBlock = await RewardsPoolBaseInstance.rewardPerBlock(0);
			let newRewardsPerBlock = []

			const bigTwenty = ethers.utils.bigNumberify(20);
			const newEndBlock = currentEndBlock.add(bigTwenty);
			let currentRemainingRewards = []
			let newRemainingReward = []
			const currentBlock = await deployer.provider.getBlock('latest');
			
			for (i = 0; i < rewardTokensCount; i++) {

				let parsedReward = await ethers.utils.parseEther(`${i+2}`);
				newRewardsPerBlock.push(parsedReward);
				let currentRewardsPerBlock = await RewardsPoolBaseInstance.rewardPerBlock(i)
				

				currentRemainingRewards.push(await calculateRewardsAmount(currentBlock.number, currentEndBlock.toString(), currentRewardsPerBlock.toString()));
            	newRemainingReward.push(await calculateRewardsAmount(currentBlock.number, newEndBlock.toString(), newRewardsPerBlock[i].toString()));
			}
			await RewardsPoolBaseInstance.extend(newEndBlock,newRewardsPerBlock,currentRemainingRewards,newRemainingReward);
			let endTimestamp = await RewardsPoolBaseInstance.endTimestamp()
			let rewardPerBlock = await RewardsPoolBaseInstance.rewardPerBlock(0);


			assert(endTimestamp.eq(currentEndBlock.add(bigTwenty)), "Extending the end block was not successfull")
			assert(rewardPerBlock.eq(currentRewardPerBlock.add(bOne)), "Extending the reward per block was not successfull")
		})

		it("Should fail extending the rewards pool if the end block is not in the future", async() => {
			let currentRemainingRewards = []
			let newRemainingReward = []
			await assert.revertWith( RewardsPoolBaseInstance.extend(0,rewardPerBlock,currentRemainingRewards,newRemainingReward), "Extend::End block must be in the future")
		})

		it("Should fail extentind the rewards pool if the end block is not greater than the previous", async() => {
			let currentEndBlock = await RewardsPoolBaseInstance.endTimestamp()
			let newEndBlock = currentEndBlock.sub(1)
			let currentRemainingRewards = []
			let newRemainingReward = []
			await assert.revertWith( RewardsPoolBaseInstance.extend(newEndBlock,rewardPerBlock,currentRemainingRewards,newRemainingReward), "Extend::End block must be after the current end block")
		})

		it("Should fail extentind the rewards pool if the rewards per block arrays is with different length", async() => {

			let currentEndBlock = await RewardsPoolBaseInstance.endTimestamp()
			let newRewardsPerBlock = []

			const bigTwenty = ethers.utils.bigNumberify(20);
			const newEndBlock = currentEndBlock.add(bigTwenty);
			let currentRemainingRewards = []
			let newRemainingReward = []

			for (i = 0; i <= rewardTokensCount; i++) {
	
				let parsedReward = await ethers.utils.parseEther(`${i+2}`);
				newRewardsPerBlock.push(parsedReward);
			}
			await assert.revertWith( RewardsPoolBaseInstance.extend(newEndBlock,newRewardsPerBlock,currentRemainingRewards,newRemainingReward), "Extend::Rewards amounts length is less than expected")
		})

		it("Should fail extending the rewards pool the caller is not the factory", async() => {
			let newEndBlock = endTimestamp + 10
			let currentRemainingRewards = []
			let newRemainingReward = []
			await assert.revertWith( RewardsPoolBaseInstance.from(bobAccount.signer.address).extend(newEndBlock,rewardPerBlock,currentRemainingRewards,newRemainingReward), "Caller is not RewardsPoolFactory contract")
		})
	})

	describe('Withdrawing LP rewards', async function () {

		it("Should not withdtaw if the caller is not the factory contract", async () => {
			lpContractInstance = await deployer.deploy(TestERC20, {}, amount);

			await lpContractInstance.mint(RewardsPoolBaseInstance.contractAddress, "100000000000")
		
			await assert.revert(RewardsPoolBaseInstance.from(bobAccount.signer.address).withdrawLPRewards(carolAccount.signer.address,lpContractInstance.contractAddress ));
		});
		it("Should revert if the token to withdraw is part of the rewards", async () => {
			
			await assert.revert(RewardsPoolBaseInstance.withdrawLPRewards(carolAccount.signer.address,rewardTokensAddresses[0]));
		});
	});

	describe('Helper Methods Tests', async function () {

		it("Should return true if staking has started", async () => {

			await utils.timeTravel(deployer.provider, 10);
			let hasStakingStarted = await RewardsPoolBaseInstance.hasStakingStarted()
			assert.isTrue(hasStakingStarted, "Staking is not started")
		});

		it("Should return false if staking hasn't started", async () => {

			let hasStakingStarted = await RewardsPoolBaseInstance.hasStakingStarted()
			assert.isFalse(hasStakingStarted, "Staking has started")
		});

		it("Shoult return the tokens owed  and reward debt length for a valid user ", async() => {

			const currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta = (startTimestamp-currentBlock.number);

				for (let i=0; i<blocksDelta; i++) {
					await mineBlock(deployer.provider);
				}
				
			await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
			await RewardsPoolBaseInstance.stake(standardStakingAmount);
			
			let tokensOwedLength = await RewardsPoolBaseInstance.getUserTokensOwedLength(aliceAccount.signer.address)
			let rewardDebtLength = await RewardsPoolBaseInstance.getUserRewardDebtLength(aliceAccount.signer.address)

			assert(tokensOwedLength.eq(rewardTokensCount), "The tokens owed lenght must the the same as the rewards tokens")
			assert(rewardDebtLength.eq(rewardTokensCount), "The tokens owed lenght must the the same as the rewards tokens")
		})

		it("Shoult fail to return the lenght of token owed with zero address ", async() => {
			
			await assert.revertWith(RewardsPoolBaseInstance.getUserTokensOwedLength(ethers.constants.AddressZero), "GetUserTokensOwedLength::Invalid user address")
		})

		it("Shoult fail to return the lenght of token owed with zero address ", async() => {
			
			await assert.revertWith(RewardsPoolBaseInstance.getUserRewardDebtLength(ethers.constants.AddressZero), "GetUserRewardDebtLength::Invalid user address")
		})
		it("Should revert if the token to withdraw is part of the rewards", async () => {
			
			await assert.revert(RewardsPoolBaseInstance.withdrawLPRewards(carolAccount.signer.address,rewardTokensAddresses[0]));
		});
	});


});