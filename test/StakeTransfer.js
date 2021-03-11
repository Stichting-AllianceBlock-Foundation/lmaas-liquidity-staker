const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const StakeTransferer = require('../build/StakeTransfererRewardsPoolMock.json');
const StakeReceiver = require('../build/StakeReceiverRewardsPoolMock.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')

describe('StakeTransfer', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;

    let StakeTransfererInstance;
	let StakeReceiverInstance;
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

        StakeTransfererInstance = await deployer.deploy(
            StakeTransferer,
            {},
            stakingTokenAddress,
			startBlock,
			endBlock,
            rewardTokensAddresses,
            rewardPerBlock,
			stakeLimit
		);

		StakeReceiverInstance = await deployer.deploy(
            StakeReceiver,
            {},
            stakingTokenAddress,
			startBlock,
			endBlock,
            rewardTokensAddresses,
            rewardPerBlock,
			stakeLimit
		);

		await StakeTransfererInstance.setReceiverWhitelisted(StakeReceiverInstance.contractAddress, true);

		await rewardTokensInstances[0].mint(StakeTransfererInstance.contractAddress,amount);
		await rewardTokensInstances[0].mint(StakeReceiverInstance.contractAddress,amount);

		await stakingTokenInstance.approve(StakeTransfererInstance.contractAddress, standardStakingAmount);
		await stakingTokenInstance.from(bobAccount.signer).approve(StakeTransfererInstance.contractAddress, standardStakingAmount);
		const currentBlock = await deployer.provider.getBlock('latest');
		const blocksDelta = (startBlock-currentBlock.number);

		for (let i=0; i<blocksDelta; i++) {
			await mineBlock(deployer.provider);
		}
		await StakeTransfererInstance.stake(standardStakingAmount);
	});

	it("Should exit to another contract", async() => {
		await mineBlock(deployer.provider);

		const userInitialBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
		const userInfoInitial = await StakeTransfererInstance.userInfo(aliceAccount.signer.address);
		const initialTotalStakedAmount = await StakeTransfererInstance.totalStaked();
		const userInitialBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
		const userRewards = await StakeTransfererInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

		await StakeTransfererInstance.exitAndTransfer(StakeReceiverInstance.contractAddress);
		
		const userFinalBalanceRewards = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
		const userTokensOwed = await StakeTransfererInstance.getUserOwedTokens(aliceAccount.signer.address, 0);
		const userFinalBalanceStaking = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
		const userInfoFinal = await StakeTransfererInstance.userInfo(aliceAccount.signer.address);
		const finalTotalStkaedAmount = await StakeTransfererInstance.totalStaked();

		assert(userFinalBalanceRewards.eq(userInitialBalanceRewards.add(userRewards.add(userRewards))), "Rewards claim was not successful")
		assert(userTokensOwed.eq(0), "User tokens owed should be zero")
		assert(userInfoFinal.amountStaked.eq(0), "User staked amount is not updated properly")
		assert(finalTotalStkaedAmount.eq(initialTotalStakedAmount.sub(standardStakingAmount)), "Contract total staked amount is not updated properly")

		const userinfoInReceiverContract = await StakeReceiverInstance.userInfo(aliceAccount.signer.address);

		assert(userInfoInitial.amountStaked.eq(userinfoInReceiverContract.amountStaked), "Receiver User staked amount is not updated properly")
	})

	it("Should not exit to non whitelisted contract", async() => {
		await mineBlock(deployer.provider);

		await assert.revertWith(StakeTransfererInstance.exitAndTransfer(bobAccount.signer.address), "exitAndTransfer::receiver is not whitelisted");
	})

	it("Should not set contract whitelisted by not deployer", async() => {
		await mineBlock(deployer.provider);

		await assert.revertWith(StakeTransfererInstance.from(bobAccount.signer.address).setReceiverWhitelisted(bobAccount.signer.address, true), "Caller is not RewardsPoolFactory contract");
	})

});