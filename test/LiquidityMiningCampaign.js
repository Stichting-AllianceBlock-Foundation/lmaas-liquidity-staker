const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const LockScheme = require('../build/LockScheme.json');
const TestERC20 = require('../build/TestERC20.json');
const PercentageCalculator = require('../build/PercentageCalculator.json')
const LMC = require("../build/LiquidityMiningCampaign.json")
const { mineBlock } = require('./utils')

describe.only('LMC', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
	let staker = aliceAccount;
    let deployer;

    let LockSchemeInstance;
    let stakingTokenAddress;
	let LmcInstance;

	let rampUpBlock;
	let lockBlock;

    let rewardTokensInstances;
    let rewardTokensAddresses;
	let rewardPerBlock;
	let lockSchemеs;



	const rewardTokensCount = 1; // 5 rewards tokens for tests
	const bonusPercet = 10000 // In thousands
    const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const bOne = ethers.utils.parseEther("1");
	const bTen = ethers.utils.parseEther("10")
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens
	const additionalRewards = [bTen]
	const stakeLimit = amount;


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
		rampUpBlock = currentBlock.number + 15;
		lockBlock = rampUpBlock + 30;
		startBlock = currentBlock.number + 10;
		endBlock = startBlock + 40

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


		LockSchemeInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, LmcInstance.contractAddress, stakingTokenAddress);
		lockSchemеs.push(LockSchemeInstance.contractAddress);

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

				let initialContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);
				let currentBlock = await deployer.provider.getBlock('latest');
				await LmcInstance.stakeAndLock(bTen,LockSchemeInstance.contractAddress);
				let finalContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);

				const totalStakedAmount = await LmcInstance.totalStaked();
				const userInfo = await LmcInstance.userInfo(aliceAccount.signer.address)
				const userRewardDebt = await LmcInstance.getUserRewardDebt(aliceAccount.signer.address, 0);
				const userOwedToken = await LmcInstance.getUserOwedTokens(aliceAccount.signer.address, 0);

				let userInfoLock= await LockSchemeInstance.userInfo(aliceAccount.signer.address);
				let userBonus = await LockSchemeInstance.getUserBonus(aliceAccount.signer.address);
				let userAccruedRewards = await LockSchemeInstance.getUserAccruedReward(aliceAccount.signer.address);
				currentBlock = await deployer.provider.getBlock('latest');

				assert(finalContractBalance.eq(initialContractBalance.add(bTen)), "The balance of the contract was not incremented properly");
				assert(userInfoLock.balance.eq(bTen), "The transferred amount is not corrent");
				assert(userInfoLock.lockInitialStakeBlock.eq(currentBlock.number), "The lock block is not set properly");
				assert(userAccruedRewards.eq(0), "The rewards were not set properly");
				assert(userBonus.eq(0), "User bonuses should be equal to zero");
				assert(totalStakedAmount.eq(bTen), "The stake was not successful")
				assert(userInfo.amountStaked.eq(bTen), "User's staked amount is not correct")
				assert(userInfo.firstStakedBlockNumber.eq(startBlock+2), "User's first block is not correct")
				assert(userRewardDebt.eq(0), "User's reward debt is not correct")
				assert(userOwedToken.eq(0), "User's reward debt is not correct")

				await mineBlock(deployer.provider);

				const accumulatedReward = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);
				assert(accumulatedReward.eq(bOne), "The reward accrued was not 1 token");
			})

			it("Should fail staking and locking with zero amount", async() => {
				await assert.revertWith(LmcInstance.stakeAndLock(0,LockSchemeInstance.contractAddress), "stakeAndLock::Cannot stake 0");
			})

			it("Should fail staking and locking if the ramp up period has finished", async() => {

				const currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta = (rampUpBlock-currentBlock.number);
				for (let i=0; i<blocksDelta; i++) {
					await mineBlock(deployer.provider);
				}
				await assert.revertWith(LmcInstance.stakeAndLock(bTen,LockSchemeInstance.contractAddress), "stakeAndLock::The ramp up period has finished");
			})
		})

		describe("Withdraw and Exit", () => {

			beforeEach(async () => {
				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await stakingTokenInstance.approve(LmcInstance.contractAddress, amount);
				await stakingTokenInstance.from(bobAccount.signer).approve(LmcInstance.contractAddress, amount);
				let currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta1 = (startBlock-currentBlock.number);

				for (let i=0; i<blocksDelta1; i++) {
					await mineBlock(deployer.provider);
				}
			
				await LmcInstance.stakeAndLock(standardStakingAmount,LockSchemeInstance.contractAddress);
				currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta2 = (lockBlock-currentBlock.number);
				
				for (let i=0; i<blocksDelta2; i++) {
					await mineBlock(deployer.provider);
				}
 			});
			
			it("Should withdraw and exit sucessfully", async() => {


				let initialContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);
	
				const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
				const userInfoInitial = await LmcInstance.userInfo(aliceAccount.signer.address);

				const initialTotalStakedAmount = await LmcInstance.totalStaked();
				const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
				const userRewards = await LmcInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

				let userInfo = await LockSchemeInstance.userInfo(aliceAccount.signer.address);
				await LmcInstance.exitAndUnlock();
				let finalContractBalance = await stakingTokenInstance.balanceOf(LockSchemeInstance.contractAddress);
			
				let userBonus = await LockSchemeInstance.getUserBonus(aliceAccount.signer.address);
				let userAccruedRewards = await LockSchemeInstance.getUserAccruedReward(aliceAccount.signer.address);
				let bonus = userRewards.add(bOne).div(10)

				const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
				const userTokensOwed = await LmcInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
				const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
				const userInfoFinal = await LmcInstance.userInfo(aliceAccount.signer.address);
				const finalTotalStkaedAmount = await LmcInstance.totalStaked();
				assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "Rewards claim was not successful")
				assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(userRewards.add(bOne).add(userBonus))), "User rewards were not calculated properly")
				assert(userTokensOwed.eq(0), "User tokens owed should be zero")
				assert(userFinalBalanceStaking.eq(userInitialBalanceStaking.add(standardStakingAmount)), "Withdraw was not successfull")
				assert(userInfoFinal.amountStaked.eq(userInfoInitial.amountStaked.sub(standardStakingAmount)), "User staked amount is not updated properly")
				assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")
	
				assert(finalContractBalance.eq(initialContractBalance.sub(standardStakingAmount)), "The balance of the contract was not changed properly");
				console.log(userInfo.balance.toString())
				assert(userInfo.balance.eq(0), "The transferred amount is not corrent");
				assert(userAccruedRewards.eq(0), "The rewards were not set properly");
				console.log(userBonus.toString())
				console.log(bonus.toString())
				assert(userBonus.eq(bonus), "User bonuses are not calculated properly");

			})

			it("Should fail calling the exit function only", async() => {

				await assert.revertWith(LmcInstance.exit(),"exit:cannot exit from this contract. Only exit and Unlock.");
			})

			it("Should fail calling the claim function only", async() => {

				await assert.revertWith(LmcInstance.claim(),"claim:cannot claim from this contract. Only exit and Unlock.");
			})
		})


	

});