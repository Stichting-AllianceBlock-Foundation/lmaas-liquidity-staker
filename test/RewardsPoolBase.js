const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const RewardsPoolBase = require('../build/RewardsPoolBase.json');
const TestERC20 = require('../build/TestERC20.json');

describe.only('RewardsPoolBase', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;

    let RewardsPoolBaseInstance;
    let stakingTokenAddress;

    let rewardTokensInstances;
    let rewardTokensAddresses;
	let rewardAmounts;
	let rewardPerStakedToken


    const rewardTokensCount = 1; // 5 rewards tokens for tests
    const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const bOne = ethers.utils.parseEther("1");

    beforeEach(async () => {
		deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
		const currentBlock = await deployer.provider.getBlock('latest');
		
		stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
		await stakingTokenInstance.mint(aliceAccount.signer.address,amount);

        stakingTokenAddress = stakingTokenInstance.contractAddress;
        rewardTokensInstances = [];
        rewardTokensAddresses = [];
		rewardAmounts = [];
		rewardPerStakedToken = [];
        for (i = 0; i < rewardTokensCount; i++) {
            let tknInst = await deployer.deploy(TestERC20, {}, amount);

            // populate tokens
            rewardTokensInstances.push(tknInst);
			rewardTokensAddresses.push(tknInst.contractAddress);
			rewardPerStakedToken.push(0)

			// populate amounts
			let rewardAmount = i + 1
			let parsedReward = await ethers.utils.parseEther(rewardAmount.toString());
            rewardAmounts.push(parsedReward);
        }
        RewardsPoolBaseInstance = await deployer.deploy(
            RewardsPoolBase,
            {},
            stakingTokenAddress,
            rewardAmounts,
            rewardTokensAddresses,
			(currentBlock.number + 40 ),
			rewardPerStakedToken
		);
	});

	it("Should deploy the RewardsPoolbase properly", async() => {
		assert.isAddress(RewardsPoolBaseInstance.contractAddress, "The RewardsPoolBase contract was not deployed");

        for (i = 0; i < rewardTokensInstances.length; i++) {
            assert.isAddress(rewardTokensInstances[i].contractAddress, "The reward token contract was not deployed");
        }
	});

	it("Should successfully stake", async() => {
		const standardStakingAmount = ethers.utils.parseEther('10') // 10 tokens
		await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
		for (i = 0; i < 50; i++) {
			//forcing to mine some blocks
			await stakingTokenInstance.mint(aliceAccount.signer.address,amount);
        }
		await RewardsPoolBaseInstance.stake(standardStakingAmount);
		
		let totalStakedAmount = await RewardsPoolBaseInstance.totalStakedAmount();

		let userInfo = await RewardsPoolBaseInstance.userInfo(aliceAccount.signer.address)

		assert(totalStakedAmount.eq(standardStakingAmount), "The stake was not successful")
		assert(userInfo.amountStaked.eq(standardStakingAmount), "User's staked amount is not correct")
		assert(userInfo.rewardDebt.eq(standardStakingAmount), "User's staked amount is not correct")
	})

	it("Should successfully stake and update the rates", async() => {
		const standardStakingAmount = ethers.utils.parseEther('10') // 10 tokens
		await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, ethers.constants.MaxUint256);
		for (i = 0; i < 50; i++) {
			//forcing to mine some blocks
			await stakingTokenInstance.mint(aliceAccount.signer.address,amount);
        }
		await RewardsPoolBaseInstance.stake(standardStakingAmount);
		const blockBeforeStake = await deployer.provider.getBlock('latest');
		let lastRewardBlock = await RewardsPoolBaseInstance.lastRewardBlock()

		let blockSinceLastReward = lastRewardBlock.add(ethers.utils.bigNumberify("1")).sub(ethers.utils.bigNumberify(blockBeforeStake.number))
		let rewardPerBlock = await RewardsPoolBaseInstance.tokenRewardPerBlock(0)
		let rewardPerToken = await RewardsPoolBaseInstance.rewardPerStakedToken(0)
		let totalStakedAmount = await RewardsPoolBaseInstance.totalStakedAmount();
		let reward = blockSinceLastReward.mul(rewardPerBlock)
		let updatedRewardPerToken = reward.add(rewardPerToken).mul(bOne).div(totalStakedAmount)

		
		await RewardsPoolBaseInstance.stake(standardStakingAmount);

		let rewardsPerStakedToken = await RewardsPoolBaseInstance.rewardPerStakedToken(0);

		assert(rewardsPerStakedToken.eq(updatedRewardPerToken), "The stake was not successful")
	})

	it("Should fail if amount to stake is not greater than zero", async() => {
		const standardStakingAmount = ethers.utils.parseEther('10') // 10 tokens
		await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);
		for (i = 0; i < 50; i++) {
			//forcing to mine some blocks
			await stakingTokenInstance.mint(aliceAccount.signer.address,amount);
        }

		await assert.revert(RewardsPoolBaseInstance.stake(0))
	})

	it("Should fail if the current timestamp is not in the future", async() => {
		const standardStakingAmount = ethers.utils.parseEther('10') // 10 tokens
		await stakingTokenInstance.approve(RewardsPoolBaseInstance.contractAddress, standardStakingAmount);

		await assert.revert(RewardsPoolBaseInstance.stake(standardStakingAmount))
	})
});