const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const StakeTransfererAutoStake = require('../build/AutoStakeTransfererMock.json');
const OneStakerRewardsPool = require('../build/OneStakerRewardsPoolMock.json');
const StakeReceiverAutoStake = require('../build/AutoStakeReceiverMock.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')

describe('AutoStakeTransfer', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;

    let StakeTransfererAutoStakeInstance;
	let StakeReceiverAutoStakeInstance;
    let stakingTokenAddress;

    let rewardTokensInstances;
    let rewardTokensAddresses;
	let rewardPerBlock;

	let startBlock;
	let endBlock;
	let startTimestmap;
	let endTimestamp;

	const virtualBlocksTime = 10 // 10s == 10000ms
	const oneMinute = 60


    let throttleRoundBlocks = 20

    const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const bOne = ethers.utils.parseEther("1");
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens
	const contractStakeLimit = amount


	const setupRewardsPoolParameters = async (deployer) => {
		const currentBlock = await deployer.provider.getBlock('latest');
		startTimestmap = currentBlock.timestamp + oneMinute ;
		endTimestamp = startTimestmap + oneMinute*2;
		endBlock = Math.trunc(endTimestamp/virtualBlocksTime)
	}

    beforeEach(async () => {
		deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
		
		
		stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);

        stakingTokenAddress = stakingTokenInstance.contractAddress;

        await setupRewardsPoolParameters(deployer)

		StakeTransfererAutoStakeInstance = await deployer.deploy(StakeTransfererAutoStake, {}, stakingTokenAddress, throttleRoundBlocks, bOne, endTimestamp, virtualBlocksTime);

		OneStakerRewardsPoolInstance = await deployer.deploy(
			OneStakerRewardsPool,
			{},
			stakingTokenAddress,
			startTimestmap,
			endTimestamp,
			[stakingTokenAddress],
			[bOne],
			ethers.constants.MaxUint256,
			StakeTransfererAutoStakeInstance.contractAddress,
			contractStakeLimit,
			virtualBlocksTime
		);

		await StakeTransfererAutoStakeInstance.setPool(OneStakerRewardsPoolInstance.contractAddress);
		await stakingTokenInstance.mint(OneStakerRewardsPoolInstance.contractAddress,amount);

		StakeReceiverAutoStakeInstance = await deployer.deploy(StakeReceiverAutoStake, {}, stakingTokenAddress, throttleRoundBlocks, bOne, endTimestamp+oneMinute, virtualBlocksTime);

		OneStakerRewardsPoolInstance = await deployer.deploy(
			OneStakerRewardsPool,
			{},
			stakingTokenAddress,
			startTimestmap,
			endTimestamp+oneMinute,
			[stakingTokenAddress],
			[bOne],
			ethers.constants.MaxUint256,
			StakeReceiverAutoStakeInstance.contractAddress,
			contractStakeLimit,
			virtualBlocksTime
		);

		await StakeReceiverAutoStakeInstance.setPool(OneStakerRewardsPoolInstance.contractAddress);
		await stakingTokenInstance.mint(OneStakerRewardsPoolInstance.contractAddress,amount);

		await StakeTransfererAutoStakeInstance.setReceiverWhitelisted(StakeReceiverAutoStakeInstance.contractAddress, true);

		await stakingTokenInstance.mint(aliceAccount.signer.address,amount);
		await stakingTokenInstance.mint(bobAccount.signer.address,amount);

		await stakingTokenInstance.approve(StakeTransfererAutoStakeInstance.contractAddress, standardStakingAmount);
		await stakingTokenInstance.from(bobAccount.signer).approve(StakeTransfererAutoStakeInstance.contractAddress, standardStakingAmount);
		const currentBlock = await deployer.provider.getBlock('latest');
		const blocksDelta = (startBlock-currentBlock.number);

		await utils.timeTravel(deployer.provider, 70);
		await StakeTransfererAutoStakeInstance.stake(standardStakingAmount);
	});

	it("Should exit to another contract", async() => {
		const currentBlock = await deployer.provider.getBlock('latest');
		
		await utils.timeTravel(deployer.provider, 130);

		const userBalance = await StakeTransfererAutoStakeInstance.balanceOf(aliceAccount.signer.address);
		const userShares = await StakeTransfererAutoStakeInstance.share(aliceAccount.signer.address);

		await StakeTransfererAutoStakeInstance.exitAndTransfer(StakeReceiverAutoStakeInstance.contractAddress);
		
		const userBalanceAfter = await StakeReceiverAutoStakeInstance.balanceOf(aliceAccount.signer.address);
		const userSharesAfter = await StakeReceiverAutoStakeInstance.share(aliceAccount.signer.address);
	})

	it("Should not exit to non whitelisted contract", async() => {
		await mineBlock(deployer.provider);

		await assert.revertWith(StakeTransfererAutoStakeInstance.exitAndTransfer(bobAccount.signer.address), "exitAndTransfer::receiver is not whitelisted");
	})

	it("Should not set contract whitelisted by not deployer", async() => {
		await mineBlock(deployer.provider);

		await assert.revertWith(StakeTransfererAutoStakeInstance.from(bobAccount.signer.address).setReceiverWhitelisted(bobAccount.signer.address, true), "Caller is not the Factory contract");
	})

});