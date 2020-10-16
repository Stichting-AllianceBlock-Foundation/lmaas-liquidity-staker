const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const StakingRewardsFactory = require('../build/StakingRewardsFactory.json');
const TestERC20 = require('../build/TestERC20.json');
const StakingRewards = require('../build/StakingRewards.json');


describe('StakingRewardsFactory', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let deployer;
    let stakingRewardsFactoryInstance;
    let rewardTokenInstance;
    let genesisTime
    const duration = 60 * 24 * 60 * 60;

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        const {
            timestamp: now
        } = await deployer.provider.getBlock('latest')
        genesisTime = now + 60 * 60
        rewardTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("200000"));

        stakingRewardsFactoryInstance = await deployer.deploy(StakingRewardsFactory, {}, genesisTime);
    });

    it('should deploy valid staking rewards factory contract', async () => {
        assert.isAddress(stakingRewardsFactoryInstance.contractAddress, "The StakingRewardFactory contract was not deployed");
        assert.isAddress(rewardTokenInstance.contractAddress, "The reward token contract was not deployed");

        const savedGenesisTime = await stakingRewardsFactoryInstance.stakingRewardsGenesis();

        assert(savedGenesisTime.eq(genesisTime), "The saved genesis time was not the same");
    })

    describe('Deploying StakingRewards', async function () {
        let stakingTokenAddress;
        let rewardAmount = ethers.utils.parseEther("100000");
        beforeEach(async () => {
            stakingTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));
            stakingTokenAddress = stakingTokenInstance.contractAddress;
        });

        it('Should deploy staking rewards successfully', async () => {
            await stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokenInstance.contractAddress, rewardAmount, duration);
            const firstToken = await stakingRewardsFactoryInstance.stakingTokens(0);

            assert.strictEqual(stakingTokenAddress.toLowerCase(), firstToken.toLowerCase(), "The saved staking token was not the same as the inputted one");

            const info = await stakingRewardsFactoryInstance.stakingRewardsInfoByStakingToken(stakingTokenAddress);
            const stakingRewardsContract = await etherlime.ContractAt(StakingRewards, info.stakingRewards)
            const rewardsDuration = await stakingRewardsContract.rewardsDuration();
            assert(info.rewardAmount.eq(rewardAmount), "The saved reward amount was not the same");
            assert.isAddress(info.stakingRewards, "The staking reward contract was not deployed");
            assert.equal(rewardsDuration.toString(), duration, "Rewards Duration was not set properly")
        })

        it('Should deploy correct reward token', async function () {
            await stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokenInstance.contractAddress, rewardAmount, duration);
            let info = await stakingRewardsFactoryInstance.stakingRewardsInfoByStakingToken(stakingTokenAddress);
            const stakingRewardsContract = await etherlime.ContractAt(StakingRewards, info.stakingRewards)
            const savedRewardTokenAddress = await stakingRewardsContract.rewardsToken();

            assert.strictEqual(rewardTokenInstance.contractAddress.toLowerCase(), savedRewardTokenAddress.toLowerCase(), "The saved reward token was not the same as the inputted one");
        });

        it('Should fail on deploying the same token again', async () => {
            await stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokenInstance.contractAddress, rewardAmount, duration);
            await assert.revert(stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokenInstance.contractAddress, rewardAmount, duration));
        })

        it('Should fail on deploying not from owner', async () => {
            await assert.revert(stakingRewardsFactoryInstance.from(bobAccount).deploy(stakingTokenAddress, rewardTokenInstance.contractAddress, rewardAmount, duration));
        })
        it('Should fail on deploying with zero duration', async () => {
            await assert.revertWith(stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokenInstance.contractAddress, rewardAmount, 0), "The Duration should be greater than zero");
        })

        describe('Adding Reward', async function () {

            beforeEach(async () => {
                await stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokenInstance.contractAddress, rewardAmount, duration);
            });

            it('Should fail on starting the staking reward prior the genesis time', async () => {
                await assert.revertWith(stakingRewardsFactoryInstance.startStaking(stakingTokenAddress), 'StakingRewardsFactory::startStaking: not ready');
            })

            describe('After Genesis Time', async function () {

                beforeEach(async () => {
                    utils.timeTravel(deployer.provider, 60 * 60)
                });

                it('Should start the staking reward completely', async () => {
                    let info = await stakingRewardsFactoryInstance.stakingRewardsInfoByStakingToken(stakingTokenAddress);
                    const stakingRewardsContract = await etherlime.ContractAt(StakingRewards, info.stakingRewards)
                    const lastUpdateTimeBefore = await stakingRewardsContract.lastUpdateTime();
                    const balanceBefore = await rewardTokenInstance.balanceOf(info.stakingRewards)

                    assert(lastUpdateTimeBefore.eq(0), "The last update time was not 0 before start")
                    assert(balanceBefore.eq(0), "The balance was not 0 before start")

                    await rewardTokenInstance.transfer(stakingRewardsFactoryInstance.contractAddress, rewardAmount);
                    await stakingRewardsFactoryInstance.startStaking(stakingTokenAddress);
                    info = await stakingRewardsFactoryInstance.stakingRewardsInfoByStakingToken(stakingTokenAddress);
                    const lastUpdateTimeAfter = await stakingRewardsContract.lastUpdateTime();

                    const balanceAfter = await rewardTokenInstance.balanceOf(info.stakingRewards)
                    assert(lastUpdateTimeAfter.gt(0), "The last update time was 0 after start")
                    assert(balanceAfter.eq(rewardAmount), "The balance was the reward amount after start")

                })

                it('Should fail on starting without deployed staking', async () => {
                    const randomAddress = accounts[6].signer.address;
                    await assert.revertWith(stakingRewardsFactoryInstance.startStaking(randomAddress), 'StakingRewardsFactory::startStaking: not deployed');
                })

                it('Should fail on starting the staking reward without having transferred the tokens to the factory', async () => {
                    await assert.revert(stakingRewardsFactoryInstance.startStaking(stakingTokenAddress));
                })

                it('Should fail if the reward amount is not greater than zero', async () => {
                    let secondStakingTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));
                    await stakingRewardsFactoryInstance.deploy(secondStakingTokenInstance.contractAddress, rewardTokenInstance.contractAddress, 0, duration);
                    await assert.revertWith(stakingRewardsFactoryInstance.startStaking(secondStakingTokenInstance.contractAddress), 'Reward must be greater than zero')
                })

                it('Should fail if trying to start the staking while it has already been started', async () => {

                    await rewardTokenInstance.transfer(stakingRewardsFactoryInstance.contractAddress, rewardAmount);
                    await stakingRewardsFactoryInstance.startStaking(stakingTokenAddress);
                    await assert.revertWith(stakingRewardsFactoryInstance.startStaking(stakingTokenAddress), 'Staking has started')
                })
            })

            describe('Extending the rewards period', async function () {

                beforeEach(async () => {
                    utils.timeTravel(deployer.provider, 60 * 60)
                });

                it("Should extend the rewards period successfully", async () => {
                    let info = await stakingRewardsFactoryInstance.stakingRewardsInfoByStakingToken(stakingTokenAddress);
                    const stakingRewardsContract = await etherlime.ContractAt(StakingRewards, info.stakingRewards)
                    let amountToTransfer = rewardAmount.mul(2)

                    await rewardTokenInstance.transfer(stakingRewardsFactoryInstance.contractAddress, amountToTransfer);
                    await stakingRewardsFactoryInstance.startStaking(stakingTokenAddress);

                    let periodFinishInitial = await stakingRewardsContract.periodFinish();
                    let rewardsDurationInitial = await stakingRewardsContract.rewardsDuration();

                    await stakingRewardsFactoryInstance.extendRewardPeriod(stakingTokenAddress, rewardAmount);

                    let stakingRewardsBalanceFinal = await rewardTokenInstance.balanceOf(info.stakingRewards);
                    let periodFinishFinal = await stakingRewardsContract.periodFinish();
                    let rewardsDurationFinal = await stakingRewardsContract.rewardsDuration();

                    let finalPeriod = periodFinishInitial.add(duration)
                    let finalDuration = rewardsDurationInitial.add(duration)

                    assert(periodFinishFinal.eq(finalPeriod), "The finish period is not correct")
                    assert(stakingRewardsBalanceFinal.eq(amountToTransfer), "The rewards amount is not correct")
                    assert(rewardsDurationFinal.eq(finalDuration), "The reward duration is not correct")
                })

                it("Should failf if the rewards amount is not greater than zero", async () => {
                    await assert.revertWith(stakingRewardsFactoryInstance.extendRewardPeriod(stakingTokenAddress, 0), 'Reward amount should be greater than zero');
                })

                it("Should fail if the staking contracts is not deployed", async () => {
                    const randomAddress = accounts[6].signer.address;
                    await assert.revertWith(stakingRewardsFactoryInstance.extendRewardPeriod(randomAddress, rewardAmount), 'StakingRewardsFactory::extendRewardPeriod: not deployed')
                })

                it("Should fail if the staking has not yet started", async () => {
                    await assert.revertWith(stakingRewardsFactoryInstance.extendRewardPeriod(stakingTokenAddress, rewardAmount), 'Staking has not started')
                })

            })

        })
    })



});