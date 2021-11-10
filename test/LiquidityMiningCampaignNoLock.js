const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const LockScheme = require('../build/LockScheme.json');
const TestERC20 = require('../build/TestERC20.json');
const PercentageCalculator = require('../build/PercentageCalculator.json')
const LMC = require("../build/LiquidityMiningCampaignNoLock.json")
const NonCompoundingRewardsPool = require('../build/NonCompoundingRewardsPool.json');
const { mineBlock } = require('./utils')

describe('LMC No Lock', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
	let staker = aliceAccount;
	let treasury = accounts[8];
    let deployer;

    let stakingTokenAddress;
	let LmcInstance;


	let rampUpBlock;
	let lockBlock;

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
	const thirty =  ethers.utils.parseEther("30");
	const bOne = ethers.utils.parseEther("1");
	const bTen = ethers.utils.parseEther("10")
	const bTwenty = ethers.utils.parseEther("20")
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens
	const additionalRewards = [bTen]
	const stakeLimit = amount;
	const contractStakeLimit = ethers.utils.parseEther('35') // 10 tokens
	let throttleRoundBlocks = 10;
	let throttleRoundCap = ethers.utils.parseEther("1");
	
	let startTimestmap;
	let endTimestamp;
	const virtualBlocksTime = 10 // 10s == 10000ms
	const oneMinute = 60


	const setupRewardsPoolParameters = async (deployer) => {

		rewardTokensInstances = [];
		rewardTokensAddresses = [];
		rewardPerBlock = [];
		lockSchemеs =[];

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
		startTimestmap = currentBlock.timestamp + oneMinute ;
		endTimestamp = startTimestmap + oneMinute*2;
		startBlock = Math.trunc(startTimestmap/virtualBlocksTime)
		endBlock = Math.trunc(endTimestamp/virtualBlocksTime)
        rampUpBlock = startBlock + 5;
		lockBlock = endBlock + 30;
		secondLockBlock = lockBlock + 5

	}

	beforeEach(async () => {
		deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
		
		
		stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
		await stakingTokenInstance.mint(aliceAccount.signer.address,thirty);
		await stakingTokenInstance.mint(bobAccount.signer.address,amount);
		

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
			startTimestmap,
			endTimestamp,
            rewardTokensAddresses,
            rewardPerBlock,
			rewardTokensAddresses[0],
			stakeLimit,
			contractStakeLimit,
			virtualBlocksTime
		);


		await rewardTokensInstances[0].mint(LmcInstance.contractAddress,amount);
		
	});

		it("Should deploy the lock scheme successfully", async() => {
			assert.isAddress(LmcInstance.contractAddress, "The LMC contract was not deployed");
		});


		describe("Staking and Locking", () => {

			beforeEach(async () => {
				await stakingTokenInstance.approve(LmcInstance.contractAddress, amount);
				await stakingTokenInstance.from(bobAccount.signer).approve(LmcInstance.contractAddress, amount);
				await utils.timeTravel(deployer.provider, 70);
 			});
			
			it("Should stake and lock sucessfully", async() => {

				let currentBlock = await deployer.provider.getBlock('latest');
				let contractInitialBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);
				let userInitialBalance = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);

				await LmcInstance.stake(bTen);

				let contractFinalBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);
				let userFinalBalance = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
				const totalStakedAmount = await LmcInstance.totalStaked();
				const userInfo = await LmcInstance.userInfo(aliceAccount.signer.address)
				const userRewardDebt = await LmcInstance.getUserRewardDebt(aliceAccount.signer.address, 0);
				const userOwedToken = await LmcInstance.getUserOwedTokens(aliceAccount.signer.address, 0);

				currentBlock = await LmcInstance._getBlock();
				await utils.timeTravel(deployer.provider, 10);

				assert(contractFinalBalance.eq(contractInitialBalance.add(bTen)), "The balance of the contract was not incremented properly")
				assert(totalStakedAmount.eq(bTen), "The stake was not successful")
				assert(userInfo.amountStaked.eq(bTen), "User's staked amount is not correct")
				assert(userInfo.firstStakedBlockNumber.eq(currentBlock), "User's first block is not correct")
				assert(userRewardDebt.eq(0), "User's reward debt is not correct")
				assert(userOwedToken.eq(0), "User's reward debt is not correct")
				assert(userFinalBalance.eq(userInitialBalance.sub(bTen)), "User was not charged for staking");
				

				const accumulatedReward = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				assert(accumulatedReward.eq(bOne), "The reward accrued was not 1 token");
			})

			it("Should stake and lock sucessfully in two different lmc's", async() => {

				let currentBlock = await deployer.provider.getBlock('latest');
				let contractInitialBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);

				await LmcInstance.stake(bTen);
				await LmcInstance.stake(bTwenty);


				await utils.timeTravel(deployer.provider, 70);
				const accumulatedReward = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				console.log(accumulatedReward.toString())
				let contractFinalBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);
				const totalStakedAmount = await LmcInstance.totalStaked();
				const userInfo = await LmcInstance.userInfo(aliceAccount.signer.address)
				
				currentBlock = await deployer.provider.getBlock('latest');
				
				assert(contractFinalBalance.eq(contractInitialBalance.add(bTen).add(bTwenty)), "The balance of the contract was not incremented properly")
				assert(totalStakedAmount.eq(bTen.add(bTwenty)), "The stake was not successful")
				assert(userInfo.amountStaked.eq(bTen.add(bTwenty)), "User's staked amount is not correct")
				assert(accumulatedReward.eq(bOne.mul(7)), "The reward accrued was not 1 token");
			})

			it("Should fail staking and locking with zero amount", async() => {
				await assert.revertWith(LmcInstance.stake(0), "Stake::Cannot stake 0");
			})
		})

		describe("Withdraw and Exit", () => {

			beforeEach(async () => {
				await stakingTokenInstance.approve(LmcInstance.contractAddress, amount);
				await stakingTokenInstance.from(bobAccount.signer).approve(LmcInstance.contractAddress, amount);
				let currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta1 = (startBlock-currentBlock.number);
				await utils.timeTravel(deployer.provider, 70);
				await LmcInstance.stake(bTen);
				await utils.timeTravel(deployer.provider, 80);
				await LmcInstance.stake(bTwenty);
				// await utils.timeTravel(deployer.provider, 10);
 			});
			
			it("Should withdraw and exit sucessfully", async() => {


				const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
				const userInfoInitial = await LmcInstance.userInfo(aliceAccount.signer.address);
				const userTokensOwedInitial = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				const initialTotalStakedAmount = await LmcInstance.totalStaked();
				const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
				const userRewards = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				
				await LmcInstance.exit();
				const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			

				const userTokensOwed = await LmcInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
				const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);

				const userInfoFinal = await LmcInstance.userInfo(aliceAccount.signer.address);
				const finalTotalStkaedAmount = await LmcInstance.totalStaked();
				assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "Rewards claim was not successful")
				assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(userRewards)), "User rewards were not calculated properly")
				assert(userTokensOwed.eq(0), "User tokens owed should be zero")
				assert(userFinalBalanceStaking.eq(userInitialBalanceStaking.add(bTen).add(bTwenty)), "Withdraw was not successfull")
				assert(userInfoFinal.amountStaked.eq(userInfoInitial.amountStaked.sub(bTen).sub(bTwenty)), "User staked amount is not updated properly")
				assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(bTen).sub(bTwenty)), "Contract total staked amount is not updated properly")

			})

			it("Should withdraw sucessfully when staked in two different lmcs", async() => {

				let currentBlock = await deployer.provider.getBlock('latest');
				let contractInitialBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);

				const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			
  				const totalStakedAmount = await LmcInstance.totalStaked();
				const userInfo = await LmcInstance.userInfo(aliceAccount.signer.address)
				

				currentBlock = await deployer.provider.getBlock('latest');
				
				await utils.timeTravel(deployer.provider, 120);

				const userTokensOwedInitial = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				await LmcInstance.exit();
				let contractFinalBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);

				const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
				const userAccruedRewards = await LmcInstance.userAccruedRewards(aliceAccount.signer.address);

				assert(contractFinalBalance.eq(contractInitialBalance.sub(bTen).sub(bTwenty)), "The balance of the contract was not incremented properly")
				assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(userTokensOwedInitial)), "The rewards balance is not correct")
				assert(totalStakedAmount.eq(bTen.add(bTwenty)), "The stake was not successful")
				assert(userInfo.amountStaked.eq(bTen.add(bTwenty)), "User's staked amount is not correct")
				assert(userAccruedRewards.eq(0), "User's accrued rewards should be zero")
			})
			it("Should withdraw sucessfully when staked in two different lmcs and called only exit", async() => {

				let currentBlock = await deployer.provider.getBlock('latest');
				let contractInitialBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);

				const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			
  				const totalStakedAmount = await LmcInstance.totalStaked();
				const userInfo = await LmcInstance.userInfo(aliceAccount.signer.address)
				

				currentBlock = await deployer.provider.getBlock('latest');
				
				await utils.timeTravel(deployer.provider, 120);
				const userTokensOwedInitial = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				await LmcInstance.exit();
				let contractFinalBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);

				const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
				const userAccruedRewards = await LmcInstance.userAccruedRewards(aliceAccount.signer.address);

				assert(contractFinalBalance.eq(contractInitialBalance.sub(bTen).sub(bTwenty)), "The balance of the contract was not incremented properly")
				assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(userTokensOwedInitial)), "The rewards balance is not correct")
				assert(totalStakedAmount.eq(bTen.add(bTwenty)), "The stake was not successful")
				assert(userInfo.amountStaked.eq(bTen.add(bTwenty)), "User's staked amount is not correct")
				assert(userAccruedRewards.eq(0), "User's accrued rewards should be zero")
			})

			it("Should exit and stake sucessfully", async() => {

				

				//Prepare new Contracts
				await setupRewardsPoolParameters(deployer)
				await setupRewardsPoolParameters(deployer)

				const _contractStakeLimit = amount
	
				let NewLmcInstance = await deployer.deploy(
					LMC,
					{},
					stakingTokenAddress,
					startTimestmap,
					endTimestamp,
					rewardTokensAddresses,
					rewardPerBlock,
					rewardTokensAddresses[0],
					stakeLimit,
					_contractStakeLimit,
					virtualBlocksTime
				);
				
				await rewardTokensInstances[0].mint(NewLmcInstance.contractAddress,amount);
				let externalRewardsTokenInstance = await deployer.deploy(TestERC20, {}, amount);
				await externalRewardsTokenInstance.mint(treasury.signer.address, amount);
	
				externalRewardsTokenAddress = externalRewardsTokenInstance.contractAddress;

				NonCompoundingRewardsPoolInstance = await deployer.deploy(
					NonCompoundingRewardsPool,
					{},
					rewardTokensAddresses[0],
					startTimestmap,
					endTimestamp+oneMinute,
					rewardTokensAddresses,
					rewardPerBlock,
					stakeLimit,
					throttleRoundBlocks,
					throttleRoundCap,
					_contractStakeLimit,
					virtualBlocksTime
				);

				
				await stakingTokenInstance.approve(NewLmcInstance.contractAddress, amount);
				await utils.timeTravel(deployer.provider, 70);
				await NewLmcInstance.stake(bTen);
				await NewLmcInstance.setReceiverWhitelisted(NonCompoundingRewardsPoolInstance.contractAddress, true);

				currentBlock = await deployer.provider.getBlock('latest');
				
				await utils.timeTravel(deployer.provider, 120);

				let initialBalance = await NonCompoundingRewardsPoolInstance.balanceOf(aliceAccount.signer.address);
				const userTokensOwedInitial = await NewLmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				// const userInitialBalanceRewards = await rewardTokensInstances[1].balanceOf(aliceAccount.signer.address);
				
				await NewLmcInstance.exitAndStake(NonCompoundingRewardsPoolInstance.contractAddress);
				// const userFinalBalanceRewards = await rewardTokensInstances[1].balanceOf(aliceAccount.signer.address);


				let finalBalance = await NonCompoundingRewardsPoolInstance.balanceOf(aliceAccount.signer.address);
				let totalStakedAmount = await NonCompoundingRewardsPoolInstance.totalStaked()
				let userInfo = await NonCompoundingRewardsPoolInstance.userInfo(aliceAccount.signer.address)
				const userAccruedRewards = await NewLmcInstance.userAccruedRewards(aliceAccount.signer.address);
				assert(finalBalance.gt(initialBalance), "Staked amount is not correct");
				assert(finalBalance.eq(userTokensOwedInitial), "User rewards were not calculated properly");
				assert(totalStakedAmount.eq(userTokensOwedInitial), "Total Staked amount is not correct");
				assert(userInfo.amountStaked.eq(finalBalance), "User's staked amount is not correct");
				assert(userAccruedRewards.eq(0), "User's accrued rewards should be zero")
				// assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "User's second rewards is not correct")


			})

			it("Should fail calling the claim function only", async() => {

				await assert.revertWith(LmcInstance.claim(),"OnlyExitFeature::cannot claim from this contract. Only exit.");
			})

			it("Should return from exit if the user hasn;t locked", async() => {
				await assert.revertWith(LmcInstance.from(bobAccount.signer.address).exit(),"Withdraw::Cannot withdraw 0");	
			})

			it("Should return from the exit and stake if the user hasn't locked", async() => {
				await utils.timeTravel(deployer.provider, 120);
				await LmcInstance.setReceiverWhitelisted(aliceAccount.signer.address, true);
				await LmcInstance.from(bobAccount.signer.address).exitAndStake(aliceAccount.signer.address);
			})

			it("Should fail to exit and stake if the poolAddress is not whitelisted ", async() => {

				await assert.revertWith(LmcInstance.exitAndStake(aliceAccount.signer.address),"exitAndTransfer::receiver is not whitelisted");
				
			})
		})


	

});