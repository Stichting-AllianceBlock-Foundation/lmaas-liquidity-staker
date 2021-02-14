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

	let startBlock;
	let endBlock;


    const rewardTokensCount = 1; // 5 rewards tokens for tests
    const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const bOne = ethers.utils.parseEther("1");


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
		startBlock = currentBlock.number + 5;
		endBlock = startBlock + 20;

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
			startBlock,
			endBlock,
            rewardTokensAddresses,
            rewardPerBlock
		);
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

		const savedStartBlock = await RewardsPoolBaseInstance.startBlock();
		assert(savedStartBlock.eq(startBlock), "The start block saved was incorrect")

		const savedEndBlock = await RewardsPoolBaseInstance.endBlock();
		assert(savedEndBlock.eq(endBlock), "The end block saved was incorrect")

	});

	// TODO add tests with negative cases that triggers the requires in the constructor


	describe("Staking", function() {
		const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens

		it("Should not stake before staking start", async() => {
			await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
			await assert.revertWith(RewardsPoolBaseInstance.stake(standardStakingAmount), "Stake::Staking has not yet started");
		})

		describe("Inside bounds", function() {

			beforeEach(async () => {
				await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
				await stakingTokenInstance.from(bobAccount.signer).approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
				const currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta = (startBlock-currentBlock.number);

				for (let i=0; i<blocksDelta; i++) {
					await mineBlock(deployer.provider);
				}
 			});

			it("Should successfully stake and accumulate reward", async() => {
				
				await RewardsPoolBaseInstance.stake(standardStakingAmount);
				const totalStakedAmount = await RewardsPoolBaseInstance.totalStaked();
				const userInfo = await RewardsPoolBaseInstance.userInfo(aliceAccount.signer.address)
				const userRewardDebt = await RewardsPoolBaseInstance.getUserRewardDebt(aliceAccount.signer.address, 0);
				const userOwedToken = await RewardsPoolBaseInstance.getUserOwedTokens(aliceAccount.signer.address, 0);

				assert(totalStakedAmount.eq(standardStakingAmount), "The stake was not successful")
				assert(userInfo.amountStaked.eq(standardStakingAmount), "User's staked amount is not correct")
				assert(userInfo.firstStakedBlockNumber.eq(startBlock+1), "User's first block is not correct")
				assert(userRewardDebt.eq(0), "User's reward debt is not correct")
				assert(userOwedToken.eq(0), "User's reward debt is not correct")

				await mineBlock(deployer.provider);

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

				await mineBlock(deployer.provider);
				await mineBlock(deployer.provider);

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

		})

		it("Should not after staking end", async() => {
			await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (endBlock-currentBlock.number);

			for (let i=0; i<=blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}

			await assert.revertWith(RewardsPoolBaseInstance.stake(standardStakingAmount), "Stake::Staking has finished");
		})
		
	})


});