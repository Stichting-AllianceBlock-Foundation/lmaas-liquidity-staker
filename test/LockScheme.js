const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const LockScheme = require('../build/LockScheme.json');
const TestERC20 = require('../build/TestERC20.json');
const PercentageCalculator = require('../build/PercentageCalculator.json')
const { mineBlock } = require('./utils')

describe('LockScheme', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
	let staker = aliceAccount;
    let deployer;

    let LockSchemeInstance;
    let stakingTokenAddress;

	let rampUpBlock;
	let lockBlock;



	const bonusPercet = 10000 // In thousands
    const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const bOne = ethers.utils.parseEther("1");
	const bTen = ethers.utils.parseEther("10")
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens
	const additionalRewards = bTen


	const setupRewardsPoolParameters = async (deployer) => {
		const currentBlock = await deployer.provider.getBlock('latest');
		rampUpBlock = currentBlock.number + 15;
		lockBlock = rampUpBlock + 30;

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

		LockSchemeInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, aliceAccount.signer.address, stakingTokenAddress);

	});

		it("Should deploy the lock scheme successfully", async() => {
			assert.isAddress(LockSchemeInstance.contractAddress, "The LockScheme contract was not deployed");
		});

		it("Should lock tokens sucessfully", async() => {

			

			let initialContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);
			await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
			await LockSchemeInstance.lock(aliceAccount.signer.address,bOne,additionalRewards);

			let finalContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);

			let userInfo = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
			let userBonuses = await LockSchemeInstance.getUserBonus(aliceAccount.signer.address);
			let userAccruedRewards = await LockSchemeInstance.getUserAccruedReward(aliceAccount.signer.address);
			const currentBlock = await deployer.provider.getBlock('latest');
			

			assert(finalContractBalance.eq(initialContractBalance.add(bOne)), "The balance of the contract was not incremented properly");
			assert(userInfo.balance.eq(bOne), "The transferred amount is not corrent");
			assert(userInfo.lockInitialStakeBlock.eq(currentBlock.number), "The lock block is not set properly");
			assert(userAccruedRewards.eq(additionalRewards), "The rewards were not set properly");
			assert(userBonuses.eq(0), "The rewards were not set properly");
		})


		it("Should revert if the ramp up block has passed" , async() => {
			const currentBlock = await deployer.provider.getBlock('latest');
			const blockDelta = (rampUpBlock - currentBlock.number);
			
			for (let i = 0; i <= blockDelta; i++) {
				await mineBlock(deployer.provider);
			}	
			await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
			await assert.revertWith(LockSchemeInstance.lock(aliceAccount.signer.address,bOne,additionalRewards), "lock::The ramp up period has finished")
		})

		it("Should fail trying to lock from non lmc address", async() => {
			await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
			await LockSchemeInstance.lock(aliceAccount.signer.address,bOne,additionalRewards);
			await assert.revertWith(LockSchemeInstance.from(bobAccount.signer.address).lock(aliceAccount.signer.address,bOne,additionalRewards), "onlyLmc::Caller is not the LMC contract")
		})

		it("Should exit sucessfully and update the bonuses", async() => {

			let initialContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);
			await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
			await LockSchemeInstance.lock(aliceAccount.signer.address,bOne,additionalRewards);

			const currentBlock = await deployer.provider.getBlock('latest');
			const blockDelta = (lockBlock - currentBlock.number);
			
			for (let i = 0; i <= blockDelta; i++) {
				await mineBlock(deployer.provider);
			}	
			await LockSchemeInstance.exit(aliceAccount.signer.address);
			let finalContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);
			let userInfo = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
			let userBonus = await LockSchemeInstance.getUserBonus(aliceAccount.signer.address);
			let userAccruedRewards = await LockSchemeInstance.getUserAccruedReward(aliceAccount.signer.address);

			assert(finalContractBalance.eq(initialContractBalance), "The balance of the contract was not changed properly");
			assert(userInfo.balance.eq(0), "The transferred amount is not corrent");
			assert(userAccruedRewards.eq(0), "The rewards were not set properly");
			assert(userBonus.eq(bOne), "User bonuses are not calculated properly");
		})



		it("Should exit sucessfully and update the forfeitedBonuses if the exit is before the lock end", async() => {

			let initialContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);
			
			await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
			await LockSchemeInstance.lock(aliceAccount.signer.address,bOne,additionalRewards);
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


		it("Should fail trying to exit from non lmc address", async() => {
			await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
			await LockSchemeInstance.lock(aliceAccount.signer.address,bOne,additionalRewards);
			await assert.revertWith(LockSchemeInstance.from(bobAccount.signer.address).exit(aliceAccount.signer.address), "onlyLmc::Caller is not the LMC contract")
		})

	

});