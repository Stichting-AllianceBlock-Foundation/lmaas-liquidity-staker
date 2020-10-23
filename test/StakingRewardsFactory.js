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
    let rewardTokensInstances;
    let rewardTokensAddresses;
    let rewardAmounts;
    let genesisTime;
    const duration = 60 * 24 * 60 * 60; // 60 days in seconds
    const rewardTokensCount = 5; // 5 rewards tokens for tests

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        const {
            timestamp: now
        } = await deployer.provider.getBlock('latest');
        genesisTime = now + 60 * 60;

        // clear
        rewardTokensInstances = [];
        rewardTokensAddresses = [];
        rewardAmounts = [];

        // repopulate
        for (i = 0; i < rewardTokensCount; i++) {
            let tknInst = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));

            // populate tokens
            rewardTokensInstances.push(tknInst);
            rewardTokensAddresses.push(tknInst.contractAddress);

            // populate amounts
            rewardAmounts.push(ethers.utils.parseEther("10000" + i.toString()));
        }

        stakingRewardsFactoryInstance = await deployer.deploy(StakingRewardsFactory, {}, genesisTime);
    });

    it('should deploy valid staking rewards factory contract', async () => {
        assert.isAddress(stakingRewardsFactoryInstance.contractAddress, "The StakingRewardFactory contract was not deployed");

        for (i = 0; i < rewardTokensInstances.length; i++) {
            assert.isAddress(rewardTokensInstances[i].contractAddress, "The reward token contract was not deployed");
        }

        const savedGenesisTime = await stakingRewardsFactoryInstance.stakingRewardsGenesis();
        assert(savedGenesisTime.eq(genesisTime), "The saved genesis time was not the same");
    });

    describe('Deploying StakingRewards', async function () {
        let stakingTokenAddress;

        beforeEach(async () => {
            stakingTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));
            stakingTokenAddress = stakingTokenInstance.contractAddress;
        });

        it('Should deploy staking rewards successfully', async () => {
            await stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, duration);

            const firstToken = await stakingRewardsFactoryInstance.stakingTokens(0);

            assert.strictEqual(stakingTokenAddress.toLowerCase(), firstToken.toLowerCase(), "The saved staking token was not the same as the inputted one");

            const stakingRewards = await stakingRewardsFactoryInstance.stakingRewardsByStakingToken(stakingTokenAddress);
            const stakingRewardsContract = await etherlime.ContractAt(StakingRewards, stakingRewards);
            const rewardsDuration = await stakingRewardsContract.rewardsDuration();

            assert.isAddress(stakingRewards, "The staking reward contract was not deployed");
            assert.equal(rewardsDuration.toString(), duration, "Rewards Duration was not set properly")
        });

        it('Should store and deploy correct reward token and reward amounts', async function () {
            await stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, duration);

            // check if correctly stored in factory
            const countFactory = await stakingRewardsFactoryInstance.getRewardsTokensCount(stakingTokenAddress);

            assert(countFactory.eq(rewardTokensCount), "Count of reward tokens in factory is not correct");

            for (i = 0; i < countFactory; i++) {
                const savedRewardToken = await stakingRewardsFactoryInstance.rewardsTokensByStakingToken(stakingTokenAddress, i);
                const savedRewardAmount = await stakingRewardsFactoryInstance.rewardsAmountsByStakingToken(stakingTokenAddress, i);

                assert.strictEqual(
                    rewardTokensAddresses[i].toLowerCase(),
                    savedRewardToken.toLowerCase(),
                    "The saved reward token (" + i + ") in factory was not the same as the inputted one"
                );

                assert(rewardAmounts[i].eq(savedRewardAmount),
                    "The saved reward amount (" + i + ") in factory was not the same as the inputted one"
                );
            }

            // check if correctly stored in staking contract
            const stakingRewards = await stakingRewardsFactoryInstance.stakingRewardsByStakingToken(stakingTokenAddress);
            const stakingRewardsContract = await etherlime.ContractAt(StakingRewards, stakingRewards);
            const count = await stakingRewardsContract.getRewardsTokensCount();

            assert(count.eq(rewardTokensCount), "Count of reward tokens in staking contract is not correct");

            for (i = 0; i < count; i++) {
                let savedRewardTokenAddress = await stakingRewardsContract.rewardsTokensArr(i);
                assert.strictEqual(
                    rewardTokensAddresses[i].toLowerCase(),
                    savedRewardTokenAddress.toLowerCase(),
                    "The saved reward token (" + i + ") in staking rewards contract was not the same as the inputted one"
                );
            }
        });

        it('Should fail on deploying the same token again', async () => {
            await stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, duration);
            await assert.revert(stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, duration));
        });

        it('Should fail on deploying not from owner', async () => {
            await assert.revert(stakingRewardsFactoryInstance.from(bobAccount).deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, duration));
        });

        it('Should fail on deploying with zero duration', async () => {
            await assert.revertWith(stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, 0), "The Duration should be greater than zero");
        });

        it('Should fail on deploying with empty token and reward arrays', async () => {
            const errorString = "StakingRewardsFactory::deploy: RewardsTokens and RewardsAmounts arrays could not be empty"
            await assert.revertWith(stakingRewardsFactoryInstance.deploy(stakingTokenAddress, [], [], duration), errorString);
            await assert.revertWith(stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, [], duration), errorString);
            await assert.revertWith(stakingRewardsFactoryInstance.deploy(stakingTokenAddress, [], rewardAmounts, duration), errorString);
        });

        it('Should fail on deploying with not matching token and reward arrays', async () => {
            const errorString = "StakingRewardsFactory::deploy: RewardsTokens and RewardsAmounts should have a matching sizes"
            await assert.revertWith(stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts.slice(0, 1), duration), errorString);
            await assert.revertWith(stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses.slice(0, 1), rewardAmounts, duration), errorString);
        });

        describe('Adding Reward', async function () {

            beforeEach(async () => {
                await stakingRewardsFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, duration);
            });

            it('Should fail on starting the staking reward prior the genesis time', async () => {
                await assert.revertWith(stakingRewardsFactoryInstance.startStaking(stakingTokenAddress), 'StakingRewardsFactory::startStaking: not ready');
            });

            describe('After Genesis Time', async function () {

                beforeEach(async () => {
                    utils.timeTravel(deployer.provider, 60 * 60)
                });

                it('Should start the staking reward completely', async () => {
                    const stakingRewards = await stakingRewardsFactoryInstance.stakingRewardsByStakingToken(stakingTokenAddress);
                    const stakingRewardsContract = await etherlime.ContractAt(StakingRewards, stakingRewards);
                    const count = await stakingRewardsContract.getRewardsTokensCount();

                    for (i = 0; i < count; i++) {
                        const addr = await stakingRewardsContract.rewardsTokensArr(i);
                        const info = await stakingRewardsContract.rewardsTokensMap(addr);
                        const lastUpdateTimeBefore = info.lastUpdateTime;
                        const balanceBefore = await rewardTokensInstances[i].balanceOf(stakingRewards);

                        assert(lastUpdateTimeBefore.eq(0), "The last update time was not 0 before start");
                        assert(balanceBefore.eq(0), "The balance was not 0 before start");
                    }

                    // transfer all rewards
                    for (i = 0; i < count; i++) {
                        await rewardTokensInstances[i].transfer(stakingRewardsFactoryInstance.contractAddress, rewardAmounts[i]);
                    }

                    await stakingRewardsFactoryInstance.startStaking(stakingTokenAddress);

                    for (i = 0; i < count; i++) {
                        const addr = await stakingRewardsContract.rewardsTokensArr(i);
                        const info = await stakingRewardsContract.rewardsTokensMap(addr);

                        const lastRewardRateAfter = info.rewardRate;
                        const lastPeriodFinsihAfter = info.periodFinish; // duration + timestamp of block
                        const latestRewardPerTokenSavedAfter = info.latestRewardPerTokenSaved;
                        const lastUpdateTimeAfter = info.lastUpdateTime;

                        const balanceAfter = await rewardTokensInstances[i].balanceOf(stakingRewards);

                        assert(lastRewardRateAfter.gt(0), "The reward rate was greater was 0 after start")
                        assert(lastPeriodFinsihAfter.gt(duration), "The last period finish was not greather than duration")
                        assert(latestRewardPerTokenSavedAfter.eq(0), "The last reward per token saved was not 0 after start")
                        assert(lastUpdateTimeAfter.gt(0), "The last update time was 0 after start")
                        assert(balanceAfter.eq(rewardAmounts[i]), "The balance was the reward amount after start")
                    }
                });

                it('Should fail on starting without deployed staking', async () => {
                    const randomAddress = accounts[6].signer.address;
                    await assert.revertWith(stakingRewardsFactoryInstance.startStaking(randomAddress), 'StakingRewardsFactory::startStaking: not deployed');
                });

                it('Should fail on starting the staking reward without having transferred the tokens to the factory', async () => {
                    await assert.revert(stakingRewardsFactoryInstance.startStaking(stakingTokenAddress));
                });

                it('Should fail if the reward amount is not greater than zero', async () => {
                    let secondStakingTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));
                    await stakingRewardsFactoryInstance.deploy(secondStakingTokenInstance.contractAddress, [rewardTokensAddresses[0]], [0], duration);
                    await assert.revertWith(stakingRewardsFactoryInstance.startStaking(secondStakingTokenInstance.contractAddress), 'Reward must be greater than zero')
                });

                it('Should fail if trying to start the staking while it has already been started', async () => {
                    for (i = 0; i < rewardTokensCount; i++) {
                        await rewardTokensInstances[i].transfer(stakingRewardsFactoryInstance.contractAddress, rewardAmounts[i]);
                    }
                    await stakingRewardsFactoryInstance.startStaking(stakingTokenAddress);

                    const hasStarted = await stakingRewardsFactoryInstance.hasStakingStarted(stakingTokenAddress);
                    console.log(hasStarted);

                    await assert.revertWith(stakingRewardsFactoryInstance.startStaking(stakingTokenAddress), 'Staking has started')
                });
            })

            describe('Extending the rewards period', async function () {

                beforeEach(async () => {
                    utils.timeTravel(deployer.provider, 60 * 60)
                });

                it("Should extend the rewards period successfully", async () => {
                    const stakingRewards = await stakingRewardsFactoryInstance.stakingRewardsByStakingToken(stakingTokenAddress);
                    const stakingRewardsContract = await etherlime.ContractAt(StakingRewards, stakingRewards);

                    const rewardTokenInstance = rewardTokensInstances[0];
                    const rewardToken = rewardTokensAddresses[0];
                    const rewardAmount = rewardAmounts[0];

                    let amountToTransfer = rewardAmount.mul(2)
                    await rewardTokenInstance.transfer(stakingRewardsFactoryInstance.contractAddress, amountToTransfer);
                    await stakingRewardsFactoryInstance.startStaking(stakingTokenAddress);

                    let rewardInfo = await stakingRewardsContract.rewardsTokensMap(rewardToken);
                    let periodFinishInitial = rewardInfo.periodFinish;
                    let rewardsDurationInitial = await stakingRewardsContract.rewardsDuration();

                    await stakingRewardsFactoryInstance.extendRewardPeriod(stakingTokenAddress, rewardToken, rewardAmount);

                    let stakingRewardsBalanceFinal = await rewardTokenInstance.balanceOf(stakingRewards);
                    rewardInfo = await stakingRewardsContract.rewardsTokensMap(rewardToken);
                    let periodFinishFinal = rewardInfo.periodFinish;
                    let rewardsDurationFinal = await stakingRewardsContract.rewardsDuration();

                    let finalPeriod = periodFinishInitial.add(duration)
                    let finalDuration = rewardsDurationInitial.add(duration)

                    assert(periodFinishFinal.eq(finalPeriod), "The finish period is not correct")
                    assert(stakingRewardsBalanceFinal.eq(amountToTransfer), "The rewards amount is not correct")
                    assert(rewardsDurationFinal.eq(finalDuration), "The reward duration is not correct")
                })

                it("Should fail if the rewards amount is not greater than zero", async () => {
                    await assert.revertWith(stakingRewardsFactoryInstance.extendRewardPeriod(
                        stakingTokenAddress,
                        rewardTokensAddresses[0],
                        0
                    ), 'StakingRewardsFactory::extendRewardPeriod: Reward must be greater than zero');
                })

                it("Should fail if the staking contracts is not deployed", async () => {
                    const randomAddress = accounts[6].signer.address;
                    await assert.revertWith(stakingRewardsFactoryInstance.extendRewardPeriod(
                        randomAddress,
                        rewardTokensAddresses[0],
                        rewardAmounts[0]
                    ), 'StakingRewardsFactory::extendRewardPeriod: not deployed')
                })

                it("Should fail if the staking has not yet started", async () => {
                    await assert.revertWith(stakingRewardsFactoryInstance.extendRewardPeriod(
                        stakingTokenAddress,
                        rewardTokensAddresses[0],
                        rewardAmounts[0]
                    ), 'Staking has not started')
                })

            });
        });
    });
});