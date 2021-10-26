const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const OnlyExitFeature = require('../build/OnlyExitRewardsPoolMock.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')

describe('OnlyExitFeature', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;

    let OnlyExitFeatureInstance;
    let stakingTokenAddress;

    let rewardTokensInstances;
    let rewardTokensAddresses;
	let rewardPerBlock;

	let startBlock;
	let endBlock;


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
			let parsedReward = await ethers.utils.parseEther(`${i+1}`);
            rewardPerBlock.push(parsedReward);
        }

		const currentBlock = await deployer.provider.getBlock('latest');
		startTimestmap = currentBlock.timestamp + oneMinute ;
		endTimestamp = startTimestmap + oneMinute*2;
		startBlock = Math.trunc(startTimestmap/virtualBlocksTime)
		endBlock = Math.trunc(endTimestamp/virtualBlocksTime)
	}

    beforeEach(async () => {
		deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
		
		
		stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
		await stakingTokenInstance.mint(aliceAccount.signer.address,amount);
		await stakingTokenInstance.mint(bobAccount.signer.address,amount);
		

        stakingTokenAddress = stakingTokenInstance.contractAddress;

        await setupRewardsPoolParameters(deployer)

        OnlyExitFeatureInstance = await deployer.deploy(
            OnlyExitFeature,
            {},
            stakingTokenAddress,
			startTimestmap,
			endTimestamp,
            rewardTokensAddresses,
            rewardPerBlock,
			stakeLimit,
			contractStakeLimit,
			virtualBlocksTime
		);

		await rewardTokensInstances[0].mint(OnlyExitFeatureInstance.contractAddress,amount);

		await stakingTokenInstance.approve(OnlyExitFeatureInstance.contractAddress, standardStakingAmount);
		await stakingTokenInstance.from(bobAccount.signer).approve(OnlyExitFeatureInstance.contractAddress, standardStakingAmount);
		const currentBlock = await deployer.provider.getBlock('latest');
		const blocksDelta = (startBlock-currentBlock.number);

		await utils.timeTravel(deployer.provider, 70);
		await OnlyExitFeatureInstance.stake(standardStakingAmount);
	});

	it("Should not claim or withdraw", async() => {

		await utils.timeTravel(deployer.provider, 70);
		const userInitialBalance = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
		const userRewards = await OnlyExitFeatureInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

		await assert.revertWith(OnlyExitFeatureInstance.claim(), "OnlyExitFeature::cannot claim from this contract. Only exit.");
		await assert.revertWith(OnlyExitFeatureInstance.withdraw(bOne), "OnlyExitFeature::cannot withdraw from this contract. Only exit.");
	})

	it("Should exit successfully from the RewardsPool", async() => {
		await utils.timeTravel(deployer.provider, 130);

		const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
		const userInfoInitial = await OnlyExitFeatureInstance.userInfo(aliceAccount.signer.address);
		const initialTotalStakedAmount = await OnlyExitFeatureInstance.totalStaked();
		const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
		const userRewards = await OnlyExitFeatureInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

		await OnlyExitFeatureInstance.exit();
		
		const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
		const userTokensOwed = await OnlyExitFeatureInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
		const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
		const userInfoFinal = await OnlyExitFeatureInstance.userInfo(aliceAccount.signer.address);
		const finalTotalStkaedAmount = await OnlyExitFeatureInstance.totalStaked();

		assert(userFinalBalanceRewards.gt(userInitialBalanceRewards), "Rewards claim was not successful")
		assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(userRewards)), "Rewards claim was not successful")
		assert(userTokensOwed.eq(0), "User tokens owed should be zero")
		assert(userFinalBalanceStaking.eq(userInitialBalanceStaking.add(standardStakingAmount)), "Withdraw was not successfull")
		assert(userInfoFinal.amountStaked.eq(userInfoInitial.amountStaked.sub(standardStakingAmount)), "User staked amount is not updated properly")
		assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")
	})

});