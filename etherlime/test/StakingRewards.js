const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const StakingRewards = require('../build/StakingRewards.json');
const TestERC20 = require('../build/TestERC20.json');

xdescribe('StakingRewards', () => {
    let aliceAccount = accounts[3];
    let deployer;
    let stakingRewardsInstance;
    let rewardTokenInstance;
    let stakingTokenAddress;
    let rewardPool = ethers.utils.parseEther("5184000");

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        rewardTokenInstance = await deployer.deploy(TestERC20, {}, rewardPool);
        stakingTokenInstance = await deployer.deploy(TestERC20, {}, rewardPool);
        stakingRewardsInstance = await deployer.deploy(StakingRewards, {}, aliceAccount.signer.address, rewardTokenInstance.contractAddress, stakingTokenInstance.contractAddress);
    });

    it('should deploy valid staking rewards contract', async () => {
        assert.isAddress(stakingRewardsInstance.contractAddress, "The StakingReward contract was not deployed");
        assert.isAddress(rewardTokenInstance.contractAddress, "The reward token contract was not deployed");

        const savedRewardTokenAddress = await stakingRewardsInstance.rewardsToken();
        const savedStakingTokenAddress = await stakingRewardsInstance.stakingToken();
        const savedRewardsDistributor = await stakingRewardsInstance.rewardsDistribution();

        assert.strictEqual(rewardTokenInstance.contractAddress.toLowerCase(), savedRewardTokenAddress.toLowerCase(), "The saved reward token was not the same as the inputted one");
        assert.strictEqual(stakingTokenInstance.contractAddress.toLowerCase(), savedStakingTokenAddress.toLowerCase(), "The saved staking token was not the same as the inputted one");
        assert.strictEqual(aliceAccount.signer.address.toLowerCase(), savedRewardsDistributor.toLowerCase(), "The saved rewards distributor was not the same as the inputted one");
    })

    // describe('Deploying StakingRewards', async function() {
    //     let stakingTokenAddress;
    //     let rewardAmount = ethers.utils.parseEther("100000");
    //     beforeEach(async () => {
    //         stakingTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));
    //         stakingTokenAddress = stakingTokenInstance.contractAddress;
    //     });

    //     it('Should deploy staking rewards successfully', async () => {
    //         await stakingRewardsInstance.deploy(stakingTokenAddress, rewardAmount);
    //         const firstToken = await stakingRewardsInstance.stakingTokens(0);
    //         assert.strictEqual(stakingTokenAddress.toLowerCase(), firstToken.toLowerCase(), "The saved staking token was not the same as the inputted one");

    //         const info = await stakingRewardsInstance.stakingRewardsInfoByStakingToken(stakingTokenAddress);
    //         assert(info.rewardAmount.eq(rewardAmount), "The saved reward amount was not the same");
    //         assert.isAddress(info.stakingRewards, "The staking reward contract was not deployed");
    //     })

    //     it('Should fail on deploying the same token again', async () => {
    //         await stakingRewardsInstance.deploy(stakingTokenAddress, rewardAmount);
    //         await assert.revert(stakingRewardsInstance.deploy(stakingTokenAddress, rewardAmount));
    //     })
    //     describe('Adding Reward', async function() {
           
    //         beforeEach(async () => {
    //         });

    //         // TODO
    //     })
    // })

    

});