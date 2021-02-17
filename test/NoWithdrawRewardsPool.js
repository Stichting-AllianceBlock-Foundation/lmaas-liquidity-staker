const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const NoWithdrawRewardsPool = require('../build/NoWithdrawRewardsPool.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')

describe('NoWithdrawRewardsPool', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;

    let NoWithdrawRewardsPoolInstance;
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

        NoWithdrawRewardsPoolInstance = await deployer.deploy(
            NoWithdrawRewardsPool,
            {},
            stakingTokenAddress,
			startBlock,
			endBlock,
            rewardTokensAddresses,
            rewardPerBlock
		);

		await rewardTokensInstances[0].mint(NoWithdrawRewardsPoolInstance.contractAddress,amount);

		await stakingTokenInstance.approve(NoWithdrawRewardsPoolInstance.contractAddress, standardStakingAmount);
		await stakingTokenInstance.from(bobAccount.signer).approve(NoWithdrawRewardsPoolInstance.contractAddress, standardStakingAmount);
		const currentBlock = await deployer.provider.getBlock('latest');
		const blocksDelta = (startBlock-currentBlock.number);

		for (let i=0; i<blocksDelta; i++) {
			await mineBlock(deployer.provider);
		}
		await NoWithdrawRewardsPoolInstance.stake(standardStakingAmount);
	});

	it("Should not claim or withdraw", async() => {

		await mineBlock(deployer.provider);
		const userInitialBalance = await rewardTokensInstances[0].balanceOf(aliceAccount.signer.address);
		const userRewards = await NoWithdrawRewardsPoolInstance.getUserAccumulatedReward(aliceAccount.signer.address, 0);

		await assert.revertWith(NoWithdrawRewardsPoolInstance.claim(), "NoWithdrawRewardsPool::cannot claim from this contract. Only exit.");
		await assert.revertWith(NoWithdrawRewardsPoolInstance.withdraw(bOne), "NoWithdrawRewardsPool::cannot withdraw from this contract. Only exit.");
	})

});