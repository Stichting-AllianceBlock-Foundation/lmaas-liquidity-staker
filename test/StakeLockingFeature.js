const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const StakeLockingFeature = require('../build/StakeLockingRewardsPoolMock.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')


describe('StakeLockingFeature', () => {

    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;

    let StakeLockingFeatureInstance;
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
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens


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

        StakeLockingFeatureInstance = await deployer.deploy(
            StakeLockingFeature,
            {},
            stakingTokenAddress,
			startBlock,
			endBlock,
            rewardTokensAddresses,
            rewardPerBlock
		);

		await rewardTokensInstances[0].mint(StakeLockingFeatureInstance.contractAddress,amount);

		await stakingTokenInstance.approve(StakeLockingFeatureInstance.contractAddress, standardStakingAmount);
		await stakingTokenInstance.from(bobAccount.signer).approve(StakeLockingFeatureInstance.contractAddress, standardStakingAmount);
		const currentBlock = await deployer.provider.getBlock('latest');
		const blocksDelta = (startBlock-currentBlock.number);

		for (let i=0; i<blocksDelta; i++) {
			await mineBlock(deployer.provider);
		}
		await StakeLockingFeatureInstance.stake(standardStakingAmount);
	});

	it("Should not claim or withdraw", async() => {

		await mineBlock(deployer.provider);
		const userInitialBalance = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
		const userRewards = await StakeLockingFeatureInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

		await assert.revertWith(StakeLockingFeatureInstance.claim(), "OnlyExitFeature::cannot claim from this contract. Only exit.");
		await assert.revertWith(StakeLockingFeatureInstance.withdraw(bOne), "OnlyExitFeature::cannot withdraw from this contract. Only exit.");
	})

	it("Should not exit before end of campaign", async() => {
		await assert.revertWith(StakeLockingFeatureInstance.exit(), "onlyUnlocked::cannot perform this action until the end of the campaign");
	})


	it("Should exit successfully from the RewardsPool", async() => {
		const currentBlock = await deployer.provider.getBlock('latest');
		const blocksDelta = (endBlock-currentBlock.number);

		for (let i=0; i<blocksDelta; i++) {
			await mineBlock(deployer.provider);
		}

		const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
		const userInfoInitial = await StakeLockingFeatureInstance.userInfo(aliceAccount.signer.address);
		const initialTotalStakedAmount = await StakeLockingFeatureInstance.totalStaked();
		const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
		const userRewards = await StakeLockingFeatureInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

		await StakeLockingFeatureInstance.exit();
		
		const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
		const userTokensOwed = await StakeLockingFeatureInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
		const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
		const userInfoFinal = await StakeLockingFeatureInstance.userInfo(aliceAccount.signer.address);
		const finalTotalStkaedAmount = await StakeLockingFeatureInstance.totalStaked();

		assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "Rewards claim was not successful")
		assert(userTokensOwed.eq(0), "User tokens owed should be zero")
		assert(userFinalBalanceStaking.eq(userInitialBalanceStaking.add(standardStakingAmount)), "Withdraw was not successfull")
		assert(userInfoFinal.amountStaked.eq(userInfoInitial.amountStaked.sub(standardStakingAmount)), "User staked amount is not updated properly")
		assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")
	})

});