const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const OneStakerRewardsPool = require('../build/OneStakerRewardsPoolMock.json');
const AutoStake = require('../build/AutoStake.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')

describe('AutoStake', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
	let staker = aliceAccount;
    let deployer;

    let OneStakerRewardsPoolInstance;
	let AutoStakingInstance;
    let stakingTokenAddress;

	let startBlock;
	let endBlock;

	let throttleRoundBlocks = 20


    const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const bOne = ethers.utils.parseEther("1");
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens


	const setupRewardsPoolParameters = async (deployer) => {
		const currentBlock = await deployer.provider.getBlock('latest');
		startBlock = currentBlock.number + 15;
		endBlock = startBlock + 30;

	}

	describe("Deploy and connect", async function() {
		it("Should deploy and connect the two tokens", async() => {
			deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);

			stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			stakingTokenAddress = stakingTokenInstance.contractAddress;

			await setupRewardsPoolParameters(deployer)

			AutoStakingInstance = await deployer.deploy(AutoStake, {}, stakingTokenAddress, throttleRoundBlocks, bOne, endBlock);

			OneStakerRewardsPoolInstance = await deployer.deploy(
				OneStakerRewardsPool,
				{},
				stakingTokenAddress,
				startBlock,
				endBlock,
				[stakingTokenAddress],
				[bOne],
				AutoStakingInstance.contractAddress
			);

			await AutoStakingInstance.setPool(OneStakerRewardsPoolInstance.contractAddress);

			const stakingToken = await AutoStakingInstance.stakingToken();
			assert.equal(stakingToken, stakingTokenAddress, "The staking token was not set correctly");

			const rewardPool = await AutoStakingInstance.rewardPool();
			assert.equal(rewardPool, OneStakerRewardsPoolInstance.contractAddress, "The rewards pool was not set correctly");
		});
	})

	describe("Staking", async function(){
		beforeEach(async () => {
			deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);

			stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			stakingTokenAddress = stakingTokenInstance.contractAddress;

			await setupRewardsPoolParameters(deployer)

			AutoStakingInstance = await deployer.deploy(AutoStake, {}, stakingTokenAddress, throttleRoundBlocks, bOne, endBlock);

			OneStakerRewardsPoolInstance = await deployer.deploy(
				OneStakerRewardsPool,
				{},
				stakingTokenAddress,
				startBlock,
				endBlock,
				[stakingTokenAddress],
				[bOne],
				AutoStakingInstance.contractAddress
			);

			await AutoStakingInstance.setPool(OneStakerRewardsPoolInstance.contractAddress);
			await stakingTokenInstance.mint(staker.signer.address, amount);
			await stakingTokenInstance.mint(bobAccount.signer.address, amount);

			await stakingTokenInstance.mint(OneStakerRewardsPoolInstance.contractAddress,amount);

			await stakingTokenInstance.approve(AutoStakingInstance.contractAddress, standardStakingAmount);
			await stakingTokenInstance.from(bobAccount.signer).approve(AutoStakingInstance.contractAddress, standardStakingAmount);
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (startBlock-currentBlock.number);

			for (let i=0; i<blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}
		});

		it("Should successfully stake", async() => {
				
			await AutoStakingInstance.from(staker.signer).stake(standardStakingAmount);
			const totalStakedAmount = await OneStakerRewardsPoolInstance.totalStaked();
			const userInfo = await OneStakerRewardsPoolInstance.userInfo(AutoStakingInstance.contractAddress)
			const userRewardDebt = await OneStakerRewardsPoolInstance.getUserRewardDebt(AutoStakingInstance.contractAddress, 0);
			const userOwedToken = await OneStakerRewardsPoolInstance.getUserOwedTokens(AutoStakingInstance.contractAddress, 0);
			const userBalance = await AutoStakingInstance.balanceOf(staker.signer.address);
			const userShares = await AutoStakingInstance.share(staker.signer.address);

			assert(totalStakedAmount.eq(standardStakingAmount), "The stake was not successful")
			assert(userInfo.amountStaked.eq(standardStakingAmount), "User's staked amount is not correct")
			assert(userInfo.firstStakedBlockNumber.eq(startBlock + 1), "User's first block is not correct")
			assert(userRewardDebt.eq(0), "User's reward debt is not correct")
			assert(userOwedToken.eq(0), "User's reward debt is not correct")
			assert(userBalance.eq(standardStakingAmount), "The user balance was not correct")
			assert(userShares.eq(standardStakingAmount), "The user share balance was not correct")

		})

		it("Should accumulate reward", async() => {
				
			await AutoStakingInstance.from(staker.signer).stake(standardStakingAmount);

			await mineBlock(deployer.provider);

			const accumulatedReward = await OneStakerRewardsPoolInstance.getUserAccumulatedReward(AutoStakingInstance.contractAddress, 0);
			assert(accumulatedReward.eq(bOne), "The reward accrued was not 1 token");

			await AutoStakingInstance.refreshAutoStake();

			const userBalance = await AutoStakingInstance.balanceOf(staker.signer.address);
			const userShares = await AutoStakingInstance.share(staker.signer.address);

			assert(userBalance.eq(standardStakingAmount.add(bOne.mul(2))), "The user balance was not correct")
			assert(userShares.eq(standardStakingAmount), "The user share balance was not correct")
		})

		it("Should accumulate with two stakers", async() => {
				
			await AutoStakingInstance.from(staker.signer).stake(standardStakingAmount);
			await AutoStakingInstance.from(bobAccount.signer).stake(standardStakingAmount);

			await AutoStakingInstance.refreshAutoStake();

			const userBalance = await AutoStakingInstance.balanceOf(staker.signer.address);
			const bobBalance = await AutoStakingInstance.balanceOf(bobAccount.signer.address);
			const userShares = await AutoStakingInstance.share(staker.signer.address);
			const bobShares = await AutoStakingInstance.share(bobAccount.signer.address);
			const valuePerShare = await AutoStakingInstance.valuePerShare();

			assert(userBalance.gt(standardStakingAmount.add(bOne)), "Staker balance was not correct")
			assert(bobBalance.gt(standardStakingAmount), "Bobs balance was not correct")
			assert(userShares.eq(standardStakingAmount), "The user share balance was not correct")
			assert(bobShares.lt(standardStakingAmount), "Bob share balance was not correct")
			assert(valuePerShare.gt(bOne), "Value per share has not increased");
		})

		describe("Exiting", async function() {

			describe("Interaction Mechanics", async function() {

				beforeEach(async () => {
					await AutoStakingInstance.from(staker.signer).stake(standardStakingAmount);
				});

				it("Should not exit before end of campaign", async() => {
					await assert.revertWith(AutoStakingInstance.exit(), "onlyUnlocked::cannot perform this action until the end of the lock");
				})


				it("Should request exit successfully", async() => {
					const currentBlock = await deployer.provider.getBlock('latest');
					const blocksDelta = (endBlock-currentBlock.number);

					for (let i=0; i<blocksDelta; i++) {
						await mineBlock(deployer.provider);
					}

					await AutoStakingInstance.exit();

					const userBalanceAfter = await AutoStakingInstance.balanceOf(staker.signer.address);
					const userExitInfo = await AutoStakingInstance.exitInfo(staker.signer.address)

					assert(userExitInfo.exitStake.eq(standardStakingAmount.add(bOne.mul(29))), "User exit amount is not updated properly");
					assert(userBalanceAfter.eq(0), "User balance is not updated properly");
					
				})

				it("Should not get twice reward on exit twice", async() => {
					const currentBlock = await deployer.provider.getBlock('latest');
					const blocksDelta = (endBlock-currentBlock.number);

					for (let i=0; i<blocksDelta; i++) {
						await mineBlock(deployer.provider);
					}

					await AutoStakingInstance.exit();
					await AutoStakingInstance.exit();

					const userBalanceAfter = await AutoStakingInstance.balanceOf(staker.signer.address);
					const userExitInfo = await AutoStakingInstance.exitInfo(staker.signer.address)

					assert(userExitInfo.exitStake.eq(standardStakingAmount.add(bOne.mul(29))), "User exit amount is not updated properly");
					assert(userBalanceAfter.eq(0), "User balance is not updated properly");
				})
			})

			describe("Completing Exit", async function() {

				beforeEach(async () => {
					await AutoStakingInstance.from(staker.signer).stake(standardStakingAmount);
				});

				it("Should not complete early", async() => {
					const currentBlock = await deployer.provider.getBlock('latest');
					const blocksDelta = (endBlock-currentBlock.number);

					for (let i=0; i<blocksDelta; i++) {
						await mineBlock(deployer.provider);
					}

					await AutoStakingInstance.exit();
					
					await assert.revertWith(AutoStakingInstance.completeExit(), "finalizeExit::Trying to exit too early");
				})

				it("Should complete succesfully", async() => {
					const currentBlock = await deployer.provider.getBlock('latest');
					const blocksDelta = (endBlock-currentBlock.number);

					for (let i=0; i<blocksDelta; i++) {
						await mineBlock(deployer.provider);
					}

					await AutoStakingInstance.exit();

					for (let i=0; i<throttleRoundBlocks; i++) {
						await mineBlock(deployer.provider);
					}

					const userBalanceBefore = await stakingTokenInstance.balanceOf(staker.signer.address);
					const contractBalance = await stakingTokenInstance.balanceOf(AutoStakingInstance.contractAddress);

					const tokenAddress = await AutoStakingInstance.stakingToken();

					await AutoStakingInstance.completeExit();

					const userBalanceAfter = await stakingTokenInstance.balanceOf(staker.signer.address);
					const userExitInfo = await AutoStakingInstance.exitInfo(staker.signer.address)

					assert(userExitInfo.exitStake.eq(0), "User exit amount is not updated properly");
					assert(userBalanceAfter.eq(userBalanceBefore.add(standardStakingAmount.add(bOne.mul(29)))), "User balance is not updated properly");
				})

			})
		})
	})
	



		

		// it("Should fail if amount to stake is not greater than zero", async() => {
		// 	await assert.revertWith(OneStakerRewardsPoolInstance.from(bobAccount.signer).stake(standardStakingAmount), "onlyStaker::incorrect staker");
		// })



});