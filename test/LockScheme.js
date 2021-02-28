const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const LockScheme = require('../build/LockScheme.json');
const TestERC20 = require('../build/TestERC20.json');
const PercentageCalculator = require('../build/PercentageCalculator.json')
const { mineBlock } = require('./utils')

describe.only('LockScheme', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
	let staker = aliceAccount;
    let deployer;

    let LockSchemeInstance;
    let stakingTokenAddress;

	let rampUpBlock;
	let lockEndPeriod;



	const bonusPercet = 10000 // In thousands
    const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const bOne = ethers.utils.parseEther("1");
	const bTen = ethers.utils.parseEther("10")
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens
	const additionalRewards = bTen


	const setupRewardsPoolParameters = async (deployer) => {
		const currentBlock = await deployer.provider.getBlock('latest');
		rampUpBlock = 15;
		lockEndPeriod = 30;

	}

	beforeEach(async () => {
		deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
		
		
		stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
		await stakingTokenInstance.mint(aliceAccount.signer.address,amount);
		await stakingTokenInstance.mint(bobAccount.signer.address,amount);
		

        stakingTokenAddress = stakingTokenInstance.contractAddress;

        await setupRewardsPoolParameters(deployer)

		const percentageCalculator = await deployer.deploy(PercentageCalculator);
		const libraries = {
			PercentageCalculator: percentageCalculator.contractAddress
		}

		LockSchemeInstance = await deployer.deploy(LockScheme, libraries, lockEndPeriod, rampUpBlock, bonusPercet, aliceAccount.signer.address);

	});

		it("Should deploy the lock scheme successfully", async() => {
			assert.isAddress(LockSchemeInstance.contractAddress, "The LockScheme contract was not deployed");
		});
	
		describe("Locking", () => {

	
			it("Should lock tokens sucessfully", async() => {

				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);

				let userInfo = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
				let userBonuses = await LockSchemeInstance.getUserBonus(aliceAccount.signer.address);
				let userAccruedRewards = await LockSchemeInstance.getUserAccruedReward(aliceAccount.signer.address);
				const currentBlock = await deployer.provider.getBlock('latest');

				assert(userInfo.balance.eq(bOne), "The transferred amount is not corrent");
				assert(userInfo.lockInitialStakeBlock.eq(currentBlock.number), "The lock block is not set properly");
				assert(userAccruedRewards.eq(0), "The rewards were not set properly");
				assert(userBonuses.eq(0), "The rewards were not set properly");
			})

			it("Should lock tokens two times and not update the lock start block sucessfully", async() => {

				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);
				const currentBlock = await deployer.provider.getBlock('latest');
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);

				let userInfo = await LockSchemeInstance.userInfo(aliceAccount.signer.address);

				assert(userInfo.balance.eq(bOne.add(bOne)), "The transferred amount is not corrent");
				assert(userInfo.lockInitialStakeBlock.eq(currentBlock.number), "The lock block is not set properly");
			})

			it("Should update the user accrued rewards successfully", async() => {

				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);

				await LockSchemeInstance.updateUserAccruedRewards(aliceAccount.signer.address, bOne)

				let userInfo = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
				assert(userInfo.accruedReward.eq(bOne), "User's accrued rewards were not updated properly");
			})


			it("Should not update the user accrued rewards if the user hasn't locked", async() => {

				await LockSchemeInstance.updateUserAccruedRewards(aliceAccount.signer.address, bOne)
				let userInfo = await LockSchemeInstance.userInfo(aliceAccount.signer.address);

				assert(userInfo.accruedReward.eq(0), "User's accrued rewards were not updated properly");
			})


			it("Should revert if the ramp up block has passed" , async() => {
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);
				
				const currentBlock = await deployer.provider.getBlock('latest');
				const userInfo = await LockSchemeInstance.userInfo(aliceAccount.signer.address)
				const userInitialLockEndperiod = userInfo.lockInitialStakeBlock
				const blockDelta = (userInitialLockEndperiod.add(rampUpBlock).sub(currentBlock.number));

				for (let i = 0; i <= blockDelta.toString(); i++) {
					await mineBlock(deployer.provider);
				}	
				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await assert.revertWith(LockSchemeInstance.lock(aliceAccount.signer.address,bOne), "lock::The ramp up period has finished")
			})

			it("Should fail trying to lock from non lmc address", async() => {
				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);
				await assert.revertWith(LockSchemeInstance.from(bobAccount.signer.address).lock(aliceAccount.signer.address,bOne), "onlyLmc::Caller is not the LMC contract")
			})
	})
		describe("Exitting", () => {
			it("Should exit sucessfully and update the balances", async() => {

				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);

				const currentBlock = await deployer.provider.getBlock('latest');
				const blockDelta = (lockEndPeriod - currentBlock.number);

				for (let i = 0; i <= blockDelta; i++) {
					await mineBlock(deployer.provider);
				}	
				await LockSchemeInstance.exit(aliceAccount.signer.address);
				let userInfo = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
				let userBonus = await LockSchemeInstance.getUserBonus(aliceAccount.signer.address);
				let userAccruedRewards = await LockSchemeInstance.getUserAccruedReward(aliceAccount.signer.address);

				assert(userInfo.balance.eq(0), "The transferred amount is not corrent");
				assert(userAccruedRewards.eq(0), "The rewards were not set properly");
			})

			it("Should exit sucessfully and update the forfeitedBonuses if the exit is before the lock end", async() => {

				let initialContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);

				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);
				await LockSchemeInstance.updateUserAccruedRewards(aliceAccount.signer.address, bTen)
				await LockSchemeInstance.exit(aliceAccount.signer.address);

				let finalContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);
				let userInfo = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
				let userBonus = await LockSchemeInstance.getUserBonus(aliceAccount.signer.address);
				let userAccruedRewards = await LockSchemeInstance.getUserAccruedReward(aliceAccount.signer.address);
				let forfeitedBonuses = await LockSchemeInstance.forfeitedBonuses();

				assert(finalContractBalance.eq(initialContractBalance), "The balance of the contract was not changed properly");
				assert(userInfo.balance.eq(0), "The transferred amount is not corrent");
				assert(userAccruedRewards.eq(0), "The rewards were not set properly");
				assert(userBonus.eq(0), "User bonuses are not calculated properly");
				assert(forfeitedBonuses.eq(bOne), "Forfeited bonuses are not calculated properly");
			})

			it("Should not exit if the user hasn't locked", async() => {

				let userInfoInitial = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
				await LockSchemeInstance.exit(aliceAccount.signer.address);
				let userInfoFinal = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
				assert(userInfoFinal.balance.eq(userInfoInitial.balance), "The balance of the user is not correct");
			})


			it("Should fail trying to exit from non lmc address", async() => {
				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);
				await assert.revertWith(LockSchemeInstance.from(bobAccount.signer.address).exit(aliceAccount.signer.address), "onlyLmc::Caller is not the LMC contract")
			})
	})

	describe("Helpers", () => {
			it("Should return true if the rampup has ended", async() => {

				const currentBlock = await deployer.provider.getBlock('latest');
				const blockDelta = (rampUpBlock - currentBlock.number);

				for (let i = 0; i <= blockDelta; i++) {
					await mineBlock(deployer.provider);
				}	

				let hasRampUpEnded = await LockSchemeInstance.hasUserRampUpEnded(aliceAccount.signer.address)
				assert.isTrue(hasRampUpEnded, "Returned ramp up check is not correct")
			})

			it("Should return the user bonus", async() => {
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);
				let userBonus =  await LockSchemeInstance.getUserBonus(aliceAccount.signer.address)
				assert(userBonus.eq(0), "User's bonuses are not calculated properly");
			})

			it("Should return the user's accrued rewards", async() => {
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);
				let accruedRewards = await LockSchemeInstance.getUserAccruedReward(aliceAccount.signer.address)
				assert(accruedRewards.eq(0), "User's accrued rewards are not calculated properly");
			})
			it("Should return the users's locked stake", async() => {
				await LockSchemeInstance.lock(aliceAccount.signer.address,bOne);
				let lockedStake =  await LockSchemeInstance.getUserLockedStake(aliceAccount.signer.address)
				assert(lockedStake.eq(bOne), "User's locked stake are not calculated properly");
			})



	})
	

});