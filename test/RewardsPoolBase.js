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


    const rewardTokensCount = 5; // 5 rewards tokens for tests
    const day = 60 * 24 * 60;
    const amount = ethers.utils.parseEther("5184000");

    beforeEach(async () => {
		deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
		const currentBlock = await deployer.provider.getBlock('latest');
		
		stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
		await stakingTokenInstance.mint(aliceAccount.signer.address,amount);

        stakingTokenAddress = stakingTokenInstance.contractAddress;
        rewardTokensInstances = [];
        rewardTokensAddresses = [];
        rewardAmounts = [];
        for (i = 0; i < rewardTokensCount; i++) {
            let tknInst = await deployer.deploy(TestERC20, {}, amount);

            // populate tokens
            rewardTokensInstances.push(tknInst);
            rewardTokensAddresses.push(tknInst.contractAddress);

            // populate amounts
            rewardAmounts.push(i);
        }
        RewardsPoolBaseInstance = await deployer.deploy(
            RewardsPoolBase,
            {},
            stakingTokenAddress,
            rewardAmounts,
            rewardTokensAddresses,
            (currentBlock.timestamp + day )
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
		await utils.timeTravel(deployer.provider, day)
		await RewardsPoolBaseInstance.stake(standardStakingAmount);
		
		let totalStakedAmount = await RewardsPoolBaseInstance.totalStakedAmount();
		let userStakedAmount = await RewardsPoolBaseInstance.getUserStakedAmount(aliceAccount.signer.address)
		let userRewardDept = await RewardsPoolBaseInstance.getUserRewardDept(aliceAccount.signer.address)
		
		assert(totalStakedAmount.eq(standardStakingAmount), "The stake was not successful")
		assert(userStakedAmount.eq(standardStakingAmount), "User's staked amount is not correct")
		assert(userRewardDept.eq(standardStakingAmount), "User's staked amount is not correct")
	})
});