const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const StakingRewards = require('../build/StakingRewards.json');
const TestERC20 = require('../build/TestERC20.json');

describe('StakingRewards', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;
    let stakingRewardsInstance;
    let rewardTokenInstance;
    let stakingTokenAddress;
    const duration = 60*24*60*60;

    let rewardAmount = ethers.utils.parseEther("5184000");

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        rewardTokenInstance = await deployer.deploy(TestERC20, {}, rewardAmount);
        stakingTokenInstance = await deployer.deploy(TestERC20, {}, rewardAmount);
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

        const savedPeriodFinish = await stakingRewardsInstance.periodFinish();
        const savedRewardRate = await stakingRewardsInstance.rewardRate();
        const savedLastUpdateTime = await stakingRewardsInstance.lastUpdateTime();
        const savedRewardPerToken = await stakingRewardsInstance.latestRewardPerTokenSaved();
        const savedDuration = await stakingRewardsInstance.rewardsDuration();
        const totalSupply = await stakingRewardsInstance.totalSupply();

        assert(savedPeriodFinish.eq(0), "Period finish is not 0 before start")
        assert(savedRewardRate.eq(0), "Reward rate is not 0 before start")
        assert(savedLastUpdateTime.eq(0), "lastUpdate is not 0 before start")
        assert(savedRewardPerToken.eq(0), "Reward per token is not 0 before start")
        assert(totalSupply.eq(0), "Total supply is not 0 before start")
        assert(savedDuration.eq(duration), "The saved duration was not correct before start")

    })

    describe('Starting', async function() {

        beforeEach(async () => {
            await rewardTokenInstance.transfer(stakingRewardsInstance.contractAddress, rewardAmount);
        })

        it('Should successfully start the staking', async () => {
            await stakingRewardsInstance.start(rewardAmount);

            const { timestamp: now } = await deployer.provider.getBlock('latest')
            const savedPeriodFinish = await stakingRewardsInstance.periodFinish();
            const savedRewardRate = await stakingRewardsInstance.rewardRate();
            const savedLastUpdateTime = await stakingRewardsInstance.lastUpdateTime();
            const savedRewardPerToken = await stakingRewardsInstance.rewardPerToken();

            assert(savedLastUpdateTime.eq(now), "lastUpdate is not correct after start")
            assert(savedPeriodFinish.eq(now + duration), "Period finish was not correct after start")
            assert(savedRewardRate.eq(ethers.utils.parseEther("1")), "Reward rate is not 1 token per second after start")
            assert(savedRewardPerToken.eq(0), "Reward per token is not 0 after start")
        })

        it('Should fail on start being called not by distributor', async () => {
            await assert.revert(stakingRewardsInstance.from(bobAccount.signer.address).start(rewardAmount));
        })

        it('Should fail on start with higher reward than available', async () => {
            await assert.revertWith(stakingRewardsInstance.start(rewardAmount.mul(2)), "Provided reward too high");
        })
    })

    describe('Staking', async function() {

        const standardStakingAmount = ethers.utils.parseEther('10') // 10 tokens

        beforeEach(async () => {
            await stakingTokenInstance.transfer(bobAccount.signer.address, standardStakingAmount)
            await rewardTokenInstance.transfer(stakingRewardsInstance.contractAddress, rewardAmount);
            await stakingRewardsInstance.start(rewardAmount);
        })

        it('Should successfully stake and earn reward', async () => {

            await stakingTokenInstance.approve(stakingRewardsInstance.contractAddress, standardStakingAmount);
            await stakingRewardsInstance.stake(standardStakingAmount);

            const { timestamp: after } = await deployer.provider.getBlock('latest')
            let savedLastUpdateTime = await stakingRewardsInstance.lastUpdateTime();
            let savedRewardPerToken = await stakingRewardsInstance.rewardPerToken();
            let userRewardPerTokenRecorded = await stakingRewardsInstance.userRewardPerTokenRecorded(aliceAccount.signer.address)

            assert(savedLastUpdateTime.eq(after), "lastUpdate is not correct after stake");
            assert(savedRewardPerToken.eq(0), "reward per token is not correct right after stake");
            assert(userRewardPerTokenRecorded.eq(0), "userRewardPerTokenRecorded is not correct after first stake");

            await utils.timeTravel(deployer.provider, 10000)

            savedLastUpdateTime = await stakingRewardsInstance.lastUpdateTime();
            const applicableTime = await stakingRewardsInstance.lastTimeRewardApplicable();
            const ellapsedTime = applicableTime.sub(savedLastUpdateTime);

            savedRewardPerToken = await stakingRewardsInstance.rewardPerToken();
            const earnings = await stakingRewardsInstance.earned(aliceAccount.signer.address)

            assert(savedRewardPerToken.eq(ethers.utils.parseEther(ellapsedTime.toString(10)).div(10)), "Reward per token was not correct sometime after stake");
            assert(earnings.eq(ethers.utils.parseEther(ellapsedTime.toString(10))), "Earnings was not correct sometime after stake");

        })

        it('Should fail with stake 0', async () => {
            await stakingTokenInstance.approve(stakingRewardsInstance.contractAddress, standardStakingAmount);
            await assert.revertWith(stakingRewardsInstance.stake(0), "Cannot stake 0");
        })

        it('Should fail with insufficient balance', async () => {
            await stakingTokenInstance.approve(stakingRewardsInstance.contractAddress, standardStakingAmount.div(2));
            await assert.revert(stakingRewardsInstance.stake(standardStakingAmount));
        })

        describe('Rewards and withdraws', async function() {
            beforeEach(async () => {
                await stakingTokenInstance.approve(stakingRewardsInstance.contractAddress, standardStakingAmount);
                await stakingRewardsInstance.stake(standardStakingAmount);
                await utils.timeTravel(deployer.provider, 10000)
            })

            describe('Withdrawing', async function() {

                it('Should not get new earnings after withdraw', async () => {
                    const savedLastUpdateTime = await stakingRewardsInstance.lastUpdateTime();
                    const applicableTime = await stakingRewardsInstance.lastTimeRewardApplicable();
                    const ellapsedTime = applicableTime.sub(savedLastUpdateTime);

                    const balanceBefore = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);

                    await stakingRewardsInstance.withdraw(standardStakingAmount);

                    const balanceAfter = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);

                    assert(balanceAfter.eq(balanceBefore.add(standardStakingAmount), "The stake was not returned"));

                    const earningsBefore = await stakingRewardsInstance.earned(aliceAccount.signer.address)
                    assert(earningsBefore.eq(ethers.utils.parseEther(ellapsedTime.toString(10))), "Earnings was not correct sometime after withdraw");

                    await utils.timeTravel(deployer.provider, 10000)

                    const earningsAfter = await stakingRewardsInstance.earned(aliceAccount.signer.address)

                    assert(earningsAfter.eq(earningsBefore), "Earnings have changed after withdraw");

                })

                it('Should fail to withdraw 0', async () => {
                    await assert.revertWith(stakingRewardsInstance.withdraw(0), "Cannot withdraw 0");
                })
            })

            describe('Getting Reward', async function() {

                it('Should get the correct reward', async () => {
                    const savedLastUpdateTime = await stakingRewardsInstance.lastUpdateTime();
                    const applicableTime = await stakingRewardsInstance.lastTimeRewardApplicable();
                    const ellapsedTime = applicableTime.sub(savedLastUpdateTime);
                    const earnings = await stakingRewardsInstance.earned(aliceAccount.signer.address)
                    assert(earnings.eq(ethers.utils.parseEther(ellapsedTime.toString(10))), "Earnings was not correct before getting reward");

                    await stakingRewardsInstance.getReward();

                    const balanceReward = await rewardTokenInstance.balanceOf(aliceAccount.signer.address);

                    assert(balanceReward.eq(ethers.utils.parseEther(ellapsedTime.toString(10))), "Reward was not correct ");

                })
            })

            describe('Exitting', async function() {

                it('Should get the correct reward and stake', async () => {
                    const savedLastUpdateTime = await stakingRewardsInstance.lastUpdateTime();
                    const applicableTime = await stakingRewardsInstance.lastTimeRewardApplicable();
                    const ellapsedTime = applicableTime.sub(savedLastUpdateTime);
                    const earnings = await stakingRewardsInstance.earned(aliceAccount.signer.address)
                    assert(earnings.eq(ethers.utils.parseEther(ellapsedTime.toString(10))), "Earnings was not correct sometime after stake");

                    const balanceBefore = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);

                    await stakingRewardsInstance.exit();

                    const balanceAfter = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
                    const balanceReward = await rewardTokenInstance.balanceOf(aliceAccount.signer.address);

                    assert(balanceReward.gte(ethers.utils.parseEther(ellapsedTime.toString(10))), "Earnings was not correct sometime after exit");
                    assert(balanceAfter.eq(balanceBefore.add(standardStakingAmount), "The stake was not returned"));

                })
            })

            describe('Extending Rewards', async function() {
                it("Should fail directly calling add rewards with zero amount", async() => {
                    let distributionAddress = await stakingRewardsInstance.rewardsDistribution();
                    await assert.revertWith(stakingRewardsInstance.from(distributionAddress).addRewards(0), "Rewards should be greater than zero")
                })
                it("Should fail directly calling add rewards if the staking has not started", async() => {
                    let distributionAddress = await stakingRewardsInstance.rewardsDistribution();
                    let secondStakingRewardsInstance = await deployer.deploy(StakingRewards, {}, aliceAccount.signer.address, rewardTokenInstance.contractAddress, stakingTokenInstance.contractAddress);
                    await assert.revertWith(secondStakingRewardsInstance.from(distributionAddress).addRewards(rewardAmount), "Staking is not yet started")
                })
                it("Should fail directly calling add rewards with zero amount", async() => {
                    let secondStakingRewardsInstance = await deployer.deploy(StakingRewards, {}, aliceAccount.signer.address, rewardTokenInstance.contractAddress, stakingTokenInstance.contractAddress);
                    await assert.revert(secondStakingRewardsInstance.addRewards(rewardAmount))
                })

                it("Should not change the reward rate after extending the reward", async() => { 
                    let distributionAddress = await stakingRewardsInstance.rewardsDistribution();
                    let initialRewardsRate = await stakingRewardsInstance.rewardRate();

                    await rewardTokenInstance.mint(aliceAccount.signer.address,rewardAmount)
                    await rewardTokenInstance.transfer(distributionAddress, rewardAmount);
                    await rewardTokenInstance.from(distributionAddress).approve(stakingRewardsInstance.contractAddress, rewardAmount);

                    let finalRewardsRate = await stakingRewardsInstance.rewardRate();
                    assert(initialRewardsRate.eq(finalRewardsRate, "Rewards rate was changed"))
                })
            })

        })

    })
    

});