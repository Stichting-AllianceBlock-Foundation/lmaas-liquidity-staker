const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const LockScheme = require('../build/LockScheme.json');
const TestERC20 = require('../build/TestERC20.json');
const PercentageCalculator = require('../build/PercentageCalculator.json')
const LMC = require("../build/LiquidityMiningCampaign.json")
const NonCompoundingRewardsPool = require('../build/NonCompoundingRewardsPool.json');
const { mineBlock } = require('./utils')

describe.only('LMC', () => {
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
	let throttleRoundBlocks = 10;
	let throttleRoundCap = ethers.utils.parseEther("1");
	


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
		rampUpBlock =  20;
		lockBlock =  30;
		startBlock = currentBlock.number + 10;
		endBlock = startBlock + 40
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
			startBlock,
			endBlock,
            rewardTokensAddresses,
            rewardPerBlock,
			stakeLimit
		);

		


		LockSchemeInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, LmcInstance.contractAddress);
		LockSchemeInstance6 = await deployer.deploy(LockScheme, libraries, secondLockBlock, rampUpBlock, bonus20, LmcInstance.contractAddress);
		LockSchemeInstance3 = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, LmcInstance.contractAddress);
		lockSchemеs.push(LockSchemeInstance.contractAddress);
		lockSchemеs.push(LockSchemeInstance6.contractAddress);
		lockSchemеs.push(LockSchemeInstance3.contractAddress);

		await LmcInstance.setLockSchemes(lockSchemеs);
		await rewardTokensInstances[0].mint(LmcInstance.contractAddress,amount);

	});

		it("Should deploy the lock scheme successfully", async() => {
			assert.isAddress(LockSchemeInstance.contractAddress, "The LockScheme contract was not deployed");
			assert.isAddress(LmcInstance.contractAddress, "The LMC contract was not deployed");
		});


		describe("Staking and Locking", () => {

			beforeEach(async () => {
				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await stakingTokenInstance.approve(LmcInstance.contractAddress, amount);
				await stakingTokenInstance.from(bobAccount.signer).approve(LmcInstance.contractAddress, amount);
				const currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta = (startBlock-currentBlock.number);
				for (let i=0; i<blocksDelta; i++) {
					await mineBlock(deployer.provider);
				}
 			});
			
			it("Should stake and lock sucessfully", async() => {

				let currentBlock = await deployer.provider.getBlock('latest');
				let contractInitialBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);
				await LmcInstance.stakeAndLock(bTen,LockSchemeInstance.contractAddress);
				let contractFinalBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);
				const totalStakedAmount = await LmcInstance.totalStaked();
				const userInfo = await LmcInstance.userInfo(aliceAccount.signer.address)
				const userRewardDebt = await LmcInstance.getUserRewardDebt(aliceAccount.signer.address, 0);
				const userOwedToken = await LmcInstance.getUserOwedTokens(aliceAccount.signer.address, 0);

				let userInfoLock= await LockSchemeInstance.userInfo(aliceAccount.signer.address);
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

				await mineBlock(deployer.provider);

				const accumulatedReward = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				assert(accumulatedReward.eq(bOne), "The reward accrued was not 1 token");
			})

			it("Should stake and lock sucessfully in two different lmc's", async() => {

				let currentBlock = await deployer.provider.getBlock('latest');
				let contractInitialBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);

				await LmcInstance.stakeAndLock(bTen,LockSchemeInstance6.contractAddress);

				await LmcInstance.stakeAndLock(bTwenty,LockSchemeInstance.contractAddress);


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

			it("Should fail staking and locking with zero amount", async() => {
				await assert.revertWith(LmcInstance.stakeAndLock(0,LockSchemeInstance.contractAddress), "stakeAndLock::Cannot stake 0");
			})

			it("Should fail staking and locking if the ramp up period has finished", async() => {

				await LmcInstance.stakeAndLock(bTen,LockSchemeInstance6.contractAddress);
				
				for (let i=0; i<25 ; i++) {
					await mineBlock(deployer.provider);
				}
				await assert.revertWith(LmcInstance.stakeAndLock(bTen,LockSchemeInstance6.contractAddress), "lock::The ramp up period has finished");
			})
		})

		describe("Withdraw and Exit", () => {

			beforeEach(async () => {
				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await stakingTokenInstance.approve(LmcInstance.contractAddress, amount);
				await stakingTokenInstance.from(bobAccount.signer).approve(LmcInstance.contractAddress, amount);
				let currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta1 = (startBlock-currentBlock.number);

				await LmcInstance.stakeAndLock(bTen,LockSchemeInstance6.contractAddress );
			
				await LmcInstance.stakeAndLock(bTwenty,LockSchemeInstance3.contractAddress);
				for (let i=0; i<blocksDelta1; i++) {
					await mineBlock(deployer.provider);
				}
			
				currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta2 = (lockBlock-currentBlock.number);
				
				for (let i=0; i<blocksDelta2; i++) {
					await mineBlock(deployer.provider);
				}
 			});
			
			xit("Should withdraw and exit sucessfully", async() => {

				const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
				const userInfoInitial = await LmcInstance.userInfo(aliceAccount.signer.address);
				const userTokensOwedInitial = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				const initialTotalStakedAmount = await LmcInstance.totalStaked();
				const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
				const userRewards = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				
				await LmcInstance.exitAndUnlock();

				const bonus = await LockSchemeInstance6.getUserBonus(aliceAccount.signer.address);
				let userInfo = await LockSchemeInstance6.userInfo(aliceAccount.signer.address);
				let userAccruedRewards = await LockSchemeInstance6.getUserAccruedReward(aliceAccount.signer.address);
				let userBonus = await LockSchemeInstance6.getUserBonus(aliceAccount.signer.address);
				const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
				console.log(userFinalBalanceRewards.toString())
				console.log(userInitialBalanceRewards.toString())
				console.log(bonus.toString())
				console.log(userRewards.toString())

				const userTokensOwed = await LmcInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
				const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
				const userInfoFinal = await LmcInstance.userInfo(aliceAccount.signer.address);
				const finalTotalStkaedAmount = await LmcInstance.totalStaked();
				assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "Rewards claim was not successful")
				assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(userRewards.add(bonus))), "User rewards were not calculated properly")
				assert(userTokensOwed.eq(0), "User tokens owed should be zero")
				assert(userFinalBalanceStaking.eq(userInitialBalanceStaking.add(standardStakingAmount)), "Withdraw was not successfull")
				assert(userInfoFinal.amountStaked.eq(userInfoInitial.amountStaked.sub(standardStakingAmount)), "User staked amount is not updated properly")
				assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")
	
				assert(userInfo.balance.eq(0), "The transferred amount is not corrent");
				assert(userAccruedRewards.eq(0), "The rewards were not set properly");
				assert(userBonus.eq(bonus), "User bonuses are not calculated properly");

			})

			it("Should withdraw sucessfully when staked in two different lmcs", async() => {

				let currentBlock = await deployer.provider.getBlock('latest');
				let contractInitialBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);

				const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
			
  				const totalStakedAmount = await LmcInstance.totalStaked();
				const userInfo = await LmcInstance.userInfo(aliceAccount.signer.address)
				
				let userInfoLock3 = await LockSchemeInstance3.userInfo(aliceAccount.signer.address);
				let userInfoLock6 = await LockSchemeInstance6.userInfo(aliceAccount.signer.address);

				currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta2 = (endBlock-currentBlock.number);
				
				for (let i=0; i<blocksDelta2; i++) {
					await mineBlock(deployer.provider);
				}
				const userTokensOwedInitial = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				await LmcInstance.exitAndUnlock();
				let contractFinalBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);

				// User has staked 10 Tokens for 6 months, in the next block he has staked 20 in the 3 months.
				// 1 token was accrued as a reward to the 6 month, during the second stake.
				// The tokens owed before the withdraw are 34
				// The rewards which was not calculated is 34-1 = 33. The proportions are 1/3 and 2/3 of 33 = 11 - send to the 6 months, and 22 to the 3 mothns
				// Total accrued reward is 12 to 6 month, and 22 to 3 month
				//  For the bonus for 6 months we calculate 12 (11 + 1) + 20% of 12 = 2.4
				//  For the bonus for 3 omnths we calculate 22  + 10% of 22 = 2.2
				// Totwal reward should be 38.6 tokens;
				let bonus6 = await ethers.utils.parseEther("2.4")
				let bonus3 =  await ethers.utils.parseEther("2.2")
				const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
				const userAccruedRewards = await LmcInstance.userAccruedRewads(aliceAccount.signer.address);

				assert(contractFinalBalance.eq(contractInitialBalance.sub(bTen).sub(bTwenty)), "The balance of the contract was not incremented properly")
				assert(userInfoLock3.balance.eq(bTwenty), "The transferred amount is not corrent");
				assert(userInfoLock6.balance.eq(bTen), "The transferred amount is not corrent in the second lock scheme");
				assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(bonus6).add(bonus3).add(userTokensOwedInitial)), "The rewards balance is not correct")
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
				
				let userInfoLock3 = await LockSchemeInstance3.userInfo(aliceAccount.signer.address);
				let userInfoLock6 = await LockSchemeInstance6.userInfo(aliceAccount.signer.address);

				currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta2 = (endBlock-currentBlock.number);
				
				for (let i=0; i<blocksDelta2; i++) {
					await mineBlock(deployer.provider);
				}
				const userTokensOwedInitial = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				await LmcInstance.exit();
				let contractFinalBalance = await stakingTokenInstance.balanceOf(LmcInstance.contractAddress);

				// User has staked 10 Tokens for 6 months, in the next block he has staked 20 in the 3 months.
				// 1 token was accrued as a reward to the 6 month, during the second stake.
				// The tokens owed before the withdraw are 34
				// The rewards which was not calculated is 34-1 = 33. The proportions are 1/3 and 2/3 of 33 = 11 - send to the 6 months, and 22 to the 3 mothns
				// Total accrued reward is 12 to 6 month, and 22 to 3 month
				//  For the bonus for 6 months we calculate 12 (11 + 1) + 20% of 12 = 2.4
				//  For the bonus for 3 omnths we calculate 22  + 10% of 22 = 2.2
				// Totwal reward should be 38.6 tokens;
				let bonus6 = await ethers.utils.parseEther("2.4")
				let bonus3 =  await ethers.utils.parseEther("2.2")
				const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
				const userAccruedRewards = await LmcInstance.userAccruedRewads(aliceAccount.signer.address);

				assert(contractFinalBalance.eq(contractInitialBalance.sub(bTen).sub(bTwenty)), "The balance of the contract was not incremented properly")
				assert(userInfoLock3.balance.eq(bTwenty), "The transferred amount is not corrent");
				assert(userInfoLock6.balance.eq(bTen), "The transferred amount is not corrent in the second lock scheme");
				assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(bonus6).add(bonus3).add(userTokensOwedInitial)), "The rewards balance is not correct")
				assert(totalStakedAmount.eq(bTen.add(bTwenty)), "The stake was not successful")
				assert(userInfo.amountStaked.eq(bTen.add(bTwenty)), "User's staked amount is not correct")
				assert(userAccruedRewards.eq(0), "User's accrued rewards should be zero")
			})

			it("Should exit and stake sucessfully", async() => {

				

				//Prepare new Contracts
				await setupRewardsPoolParameters(deployer)
				await setupRewardsPoolParameters(deployer)
	
				let NewLmcInstance = await deployer.deploy(
					LMC,
					{},
					stakingTokenAddress,
					startBlock,
					endBlock,
					rewardTokensAddresses,
					rewardPerBlock,
					stakeLimit
				);
				
				
				let lockScheme = []
				LockSchemeInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, NewLmcInstance.contractAddress);
				lockScheme.push(LockSchemeInstance.contractAddress);
		
				await NewLmcInstance.setLockSchemes(lockScheme);
				await rewardTokensInstances[0].mint(NewLmcInstance.contractAddress,amount);
				let externalRewardsTokenInstance = await deployer.deploy(TestERC20, {}, amount);
				await externalRewardsTokenInstance.mint(treasury.signer.address, amount);
	
				externalRewardsTokenAddress = externalRewardsTokenInstance.contractAddress;

				NonCompoundingRewardsPoolInstance = await deployer.deploy(
					NonCompoundingRewardsPool,
					{},
					rewardTokensAddresses[0],
					startBlock+2,
					endBlock+2,
					rewardTokensAddresses,
					rewardPerBlock,
					stakeLimit,
					throttleRoundBlocks,
					throttleRoundCap,
					treasury.signer.address,
					externalRewardsTokenAddress
				);

				
				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await stakingTokenInstance.approve(NewLmcInstance.contractAddress, amount);

				await NewLmcInstance.stakeAndLock(bTen,LockSchemeInstance.contractAddress);
				await NewLmcInstance.setReceiverWhitelisted(NonCompoundingRewardsPoolInstance.contractAddress, true);

				currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta2 = (endBlock-currentBlock.number);
				
				for (let i=0; i<blocksDelta2; i++) {
					await mineBlock(deployer.provider);
				}

				let initialBalance = await NonCompoundingRewardsPoolInstance.balanceOf(aliceAccount.signer.address);
				const userTokensOwedInitial = await NewLmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				// const userInitialBalanceRewards = await rewardTokensInstances[1].balanceOf(aliceAccount.signer.address);
				
				//the bonus is 10% of the reward
				const bonus = userTokensOwedInitial.mul(10).div(100);
				await NewLmcInstance.exitAndStake(NonCompoundingRewardsPoolInstance.contractAddress);
				// const userFinalBalanceRewards = await rewardTokensInstances[1].balanceOf(aliceAccount.signer.address);


				let finalBalance = await NonCompoundingRewardsPoolInstance.balanceOf(aliceAccount.signer.address);
				let totalStakedAmount = await NonCompoundingRewardsPoolInstance.totalStaked()
				let userInfo = await NonCompoundingRewardsPoolInstance.userInfo(aliceAccount.signer.address)
				const userAccruedRewards = await NewLmcInstance.userAccruedRewads(aliceAccount.signer.address);
				assert(finalBalance.gt(initialBalance), "Staked amount is not correct");
				assert(finalBalance.eq(userTokensOwedInitial.add(bonus)), "User rewards were not calculated properly");
				assert(totalStakedAmount.eq(userTokensOwedInitial.add(bonus)), "Total Staked amount is not correct");
				assert(userInfo.amountStaked.eq(finalBalance), "User's staked amount is not correct");
				assert(userAccruedRewards.eq(0), "User's accrued rewards should be zero")
				// assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "User's second rewards is not correct")


			})

			it("Should exit and migrate sucessfully", async() => {

				//Prepare new Contracts
				await setupRewardsPoolParameters(deployer)
				let NewLmcInstance = await deployer.deploy(
					LMC,
					{},
					stakingTokenAddress,
					startBlock,
					endBlock,
					rewardTokensAddresses,
					rewardPerBlock,
					stakeLimit
				);

				let MigrationLmcInstance = await deployer.deploy(
					LMC,
					{},
					stakingTokenAddress,
					startBlock + 5,
					endBlock + 5,
					rewardTokensAddresses,
					rewardPerBlock,
					stakeLimit
				);
				
				let lockScheme = []
				let migrateLockScheme = []

				LockSchemeInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, NewLmcInstance.contractAddress);
				MigrateLockSchemeInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, MigrationLmcInstance.contractAddress);
				lockScheme.push(LockSchemeInstance.contractAddress);
				migrateLockScheme.push(MigrateLockSchemeInstance.contractAddress)

				await NewLmcInstance.setLockSchemes(lockScheme);
				await rewardTokensInstances[0].mint(NewLmcInstance.contractAddress,amount);

				await MigrationLmcInstance.setLockSchemes(migrateLockScheme);
				await rewardTokensInstances[0].mint(MigrationLmcInstance.contractAddress,amount);

				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await stakingTokenInstance.approve(NewLmcInstance.contractAddress, amount);

				await NewLmcInstance.stakeAndLock(bTen,LockSchemeInstance.contractAddress);
				await NewLmcInstance.setReceiverWhitelisted(MigrationLmcInstance.contractAddress, true);

				currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta2 = (endBlock-currentBlock.number);
				
				for (let i=0; i<blocksDelta2; i++) {
					await mineBlock(deployer.provider);
				}

				let initialBalance = await stakingTokenInstance.balanceOf(MigrationLmcInstance.contractAddress);

				await NewLmcInstance.exitAndMigrate(MigrationLmcInstance.contractAddress,migrateLockScheme[0] );
				let finalBalance = await stakingTokenInstance.balanceOf(MigrationLmcInstance.contractAddress);
				let finallUserInfo  = await MigrationLmcInstance.userInfo(aliceAccount.signer.address);
				let totalStakedAmountInitial = await NewLmcInstance.totalStaked();
				let totalStakedAmountMigrated = await MigrationLmcInstance.totalStaked();

				
				assert(finalBalance.gt(initialBalance), "Staked amount is not correct");
				assert(finalBalance.eq(bTen), "User rewards were not calculated properly");
				assert(totalStakedAmountMigrated.eq(bTen), "Total Staked amount migrated is not correct");
				assert(totalStakedAmountInitial.eq(0), "Total Staked amount initial is not correct");
				assert(finallUserInfo.amountStaked.eq(bTen), "User's staked amount is not correct");

			})
			

			it("Should fail calling the claim function only", async() => {

				await assert.revertWith(LmcInstance.claim(),"OnlyExitFeature::cannot claim from this contract. Only exit.");
			})

			it("Should return from exit if the user hasn;t locked", async() => {

				await LmcInstance.from(bobAccount.signer.address).exitAndUnlock();
			})

			it("Should return from exit fomr the exit and stake if the user hasn't locked", async() => {
				await LmcInstance.setReceiverWhitelisted(aliceAccount.signer.address, true);
				await LmcInstance.from(bobAccount.signer.address).exitAndStake(aliceAccount.signer.address);
			})

			it("Should fail to exit and stake if the poolAddress is not whitelisted ", async() => {

				await assert.revertWith(LmcInstance.exitAndStake(aliceAccount.signer.address),"exitAndTransfer::receiver is not whitelisted");
				
			})
		})


	

});