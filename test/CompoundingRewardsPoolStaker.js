const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const StakeTransfererAutoStake = require('../build/CompoundingRewardsPoolStaker.json');
const CompoundingRewardsPool = require('../build/CompoundingRewardsPool.json');
const StakeReceiverAutoStake = require('../build/CompoundingRewardsPoolStaker.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')

describe('CompoundingRewardsPoolStaker', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
	let treasury = accounts[8];
    let deployer;

    let StakeTransfererAutoStakeInstance;
	let StakeReceiverAutoStakeInstance;
    let stakingTokenAddress;

    let rewardTokensInstances;
    let rewardTokensAddresses;
	let rewardPerBlock;

	let startBlock;
	let endBlock;


    let throttleRoundBlocks = 20

    const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const bOne = ethers.utils.parseEther("1");
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens
	const contractStakeLimit = ethers.utils.parseEther('15') // 10 tokens


	const setupRewardsPoolParameters = async (deployer) => {
		const currentBlock = await deployer.provider.getBlock('latest');
		startBlock = currentBlock.number + 15;
		endBlock = startBlock + 30;

	}

    beforeEach(async () => {
		deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
		
		
		stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);

        stakingTokenAddress = stakingTokenInstance.contractAddress;

		externalRewardsTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));
        externalRewardsTokenAddress = externalRewardsTokenInstance.contractAddress;
    

        await setupRewardsPoolParameters(deployer)

		StakeTransfererAutoStakeInstance = await deployer.deploy(StakeTransfererAutoStake, {}, stakingTokenAddress, throttleRoundBlocks, bOne, endBlock, standardStakingAmount.mul(2));

		CompoundingRewardsPoolInstance = await deployer.deploy(
			CompoundingRewardsPool,
			{},
			stakingTokenAddress,
			startBlock,
			endBlock,
			[stakingTokenAddress],
			[bOne],
			ethers.constants.MaxUint256,
			StakeTransfererAutoStakeInstance.contractAddress, 
			treasury.signer.address, 
			externalRewardsTokenAddress,
			contractStakeLimit
		);

		await StakeTransfererAutoStakeInstance.setPool(CompoundingRewardsPoolInstance.contractAddress);
		await stakingTokenInstance.mint(CompoundingRewardsPoolInstance.contractAddress,amount);

		StakeReceiverAutoStakeInstance = await deployer.deploy(StakeReceiverAutoStake, {}, stakingTokenAddress, throttleRoundBlocks, bOne, endBlock+1, standardStakingAmount);

		CompoundingRewardsPoolInstance = await deployer.deploy(
			CompoundingRewardsPool,
			{},
			stakingTokenAddress,
			startBlock,
			endBlock+1,
			[stakingTokenAddress],
			[bOne],
			ethers.constants.MaxUint256,
			StakeReceiverAutoStakeInstance.contractAddress,
			treasury.signer.address, 
			externalRewardsTokenAddress,
			contractStakeLimit
		);

		await StakeReceiverAutoStakeInstance.setPool(CompoundingRewardsPoolInstance.contractAddress);
		await stakingTokenInstance.mint(CompoundingRewardsPoolInstance.contractAddress,amount);

		await StakeTransfererAutoStakeInstance.setReceiverWhitelisted(StakeReceiverAutoStakeInstance.contractAddress, true);

		await stakingTokenInstance.mint(aliceAccount.signer.address,amount);
		await stakingTokenInstance.mint(bobAccount.signer.address,amount);

		await stakingTokenInstance.approve(StakeTransfererAutoStakeInstance.contractAddress, standardStakingAmount);
		await stakingTokenInstance.from(bobAccount.signer).approve(StakeTransfererAutoStakeInstance.contractAddress, standardStakingAmount);
		const currentBlock = await deployer.provider.getBlock('latest');
		const blocksDelta = (startBlock-currentBlock.number);

		for (let i=0; i<blocksDelta; i++) {
			await mineBlock(deployer.provider);
		}
		await StakeTransfererAutoStakeInstance.stake(standardStakingAmount);
	});

	it("Should exit correctly", async() => {
		await StakeTransfererAutoStakeInstance.from(bobAccount.signer).stake(standardStakingAmount.div(10));
		const currentBlock = await deployer.provider.getBlock('latest');
		const blocksDelta = (endBlock-currentBlock.number);

		for (let i=0; i<blocksDelta; i++) {
			await mineBlock(deployer.provider);
		}

		const userBalance = await StakeTransfererAutoStakeInstance.balanceOf(bobAccount.signer.address);
		const userShares = await StakeTransfererAutoStakeInstance.share(bobAccount.signer.address);

		await StakeTransfererAutoStakeInstance.from(bobAccount.signer).exitAndTransfer(StakeReceiverAutoStakeInstance.contractAddress);

		const userBalanceAfter = await StakeReceiverAutoStakeInstance.balanceOf(bobAccount.signer.address);
		const userSharesAfter = await StakeReceiverAutoStakeInstance.share(bobAccount.signer.address);
		
	})

	it("Should not exit to non whitelisted contract", async() => {
		await stakingTokenInstance.approve(StakeTransfererAutoStakeInstance.contractAddress, standardStakingAmount);
		await StakeTransfererAutoStakeInstance.stake(standardStakingAmount);
		const currentBlock = await deployer.provider.getBlock('latest');
		const blocksDelta = (endBlock-currentBlock.number);

		for (let i=0; i<blocksDelta; i++) {
			await mineBlock(deployer.provider);
		}

		await assert.revertWith(StakeTransfererAutoStakeInstance.exitAndTransfer(bobAccount.signer.address), "exitAndTransfer::receiver is not whitelisted");
		
	})

	it("Should not exit to above limit", async() => {
		await StakeTransfererAutoStakeInstance.setReceiverWhitelisted(StakeReceiverAutoStakeInstance.contractAddress, true);

		await stakingTokenInstance.approve(StakeTransfererAutoStakeInstance.contractAddress, standardStakingAmount);
		await StakeTransfererAutoStakeInstance.stake(standardStakingAmount);
		const currentBlock = await deployer.provider.getBlock('latest');
		const blocksDelta = (endBlock-currentBlock.number);

		for (let i=0; i<blocksDelta; i++) {
			await mineBlock(deployer.provider);
		}

		await assert.revertWith(StakeTransfererAutoStakeInstance.exitAndTransfer(StakeReceiverAutoStakeInstance.contractAddress), "onlyUnderStakeLimit::Stake limit reached");
		
	})


});