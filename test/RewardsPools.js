const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const RewardsPool = require('../build/RewardsPool.json');
const TestERC20 = require('../build/TestERC20.json');

describe('RewardsPool', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;

    let RewardsPoolInstance;
    let stakingTokenAddress;

    let rewardTokensInstances;
    let rewardTokensAddresses;
    let rewardAmounts;

    let lpContractInstance;

    const rewardTokensCount = 5; // 5 rewards tokens for tests
    const duration = 60 * 24 * 60 * 60;
    const amount = ethers.utils.parseEther("5184000");

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);

        stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
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
            rewardAmounts.push(amount);
        }

        RewardsPoolInstance = await deployer.deploy(
            RewardsPool,
            {},
            rewardTokensAddresses,
            rewardAmounts,
            stakingTokenAddress,
            duration
        );
    });

    it('should deploy valid staking rewards contract', async () => {
        assert.isAddress(RewardsPoolInstance.contractAddress, "The StakingReward contract was not deployed");

        const savedStakingTokenAddress = await RewardsPoolInstance.stakingToken();
        const savedRewardsDistributor = await RewardsPoolInstance.rewardsDistributor();
        assert.strictEqual(stakingTokenInstance.contractAddress.toLowerCase(), savedStakingTokenAddress.toLowerCase(), "The saved staking token was not the same as the inputted one");
        assert.strictEqual(aliceAccount.signer.address.toLowerCase(), savedRewardsDistributor.toLowerCase(), "The saved rewards distributor was not the same as the inputted one");

        for (i = 0; i < rewardTokensCount; i++) {
            let storedRewardContract = await RewardsPoolInstance.rewardsTokensArr(i);

            assert.isAddress(storedRewardContract, "The reward token contract was not deployed");
            assert.strictEqual(rewardTokensAddresses[i].toLowerCase(), storedRewardContract.toLowerCase(), "The saved reward token was not the same as the inputted one");

            let info = await RewardsPoolInstance.rewardsTokensMap(storedRewardContract);

            assert(info.periodFinish.eq(0), "Period finish is not 0 before start");
            assert(info.rewardRate.eq(0), "Reward rate is not 0 before start");
            assert(info.lastUpdateTime.eq(0), "lastUpdate is not 0 before start");
            assert(info.latestRewardPerTokenSaved.eq(0), "Reward per token is not 0 before start");
            assert(info.rewardDuration.eq(duration), "The saved duration was not correct before start");
        }

        const totalSupply = await RewardsPoolInstance.totalStakesAmount();
        assert(totalSupply.eq(0), "Total supply is not 0 before start");
    });

    describe('Starting', async function () {

        beforeEach(async () => {
            for (i = 0; i < rewardTokensCount; i++) {
                await rewardTokensInstances[i].transfer(RewardsPoolInstance.contractAddress, rewardAmounts[i]);
            }
        })

        it('Should successfully start the staking', async () => {
            await RewardsPoolInstance.start();

            const {
                timestamp: now
            } = await deployer.provider.getBlock('latest');

            for (i = 0; i < rewardTokensCount; i++) {
                let storedRewardContract = await RewardsPoolInstance.rewardsTokensArr(i);
                let info = await RewardsPoolInstance.rewardsTokensMap(storedRewardContract);

                assert(info.lastUpdateTime.eq(now), "lastUpdate is not correct after start");
                assert(info.periodFinish.eq(now + duration), "Period finish was not correct after start");
                assert(info.rewardRate.eq(ethers.utils.parseEther("1")), "Reward rate is not 1 token per second after start");
                assert(info.latestRewardPerTokenSaved.eq(0), "Reward per token is not 0 after start");
            }
        });

        it('Should fail on start being called not by distributor', async () => {
            await assert.revert(RewardsPoolInstance.from(bobAccount.signer.address).start());
        });
    })

    describe('Staking', async function () {

        const standardStakingAmount = ethers.utils.parseEther('10') // 10 tokens

        beforeEach(async () => {
            await stakingTokenInstance.transfer(bobAccount.signer.address, standardStakingAmount)

            for (i = 0; i < rewardTokensCount; i++) {
                await rewardTokensInstances[i].transfer(RewardsPoolInstance.contractAddress, rewardAmounts[i]);
            }
            await RewardsPoolInstance.start();
        })

        it('Should successfully stake and earn reward', async () => {
            await stakingTokenInstance.approve(RewardsPoolInstance.contractAddress, standardStakingAmount);
            await utils.timeTravel(deployer.provider, 10000)
            await RewardsPoolInstance.stake(standardStakingAmount);

            const {
                timestamp: after
            } = await deployer.provider.getBlock('latest');

            for (i = 0; i < rewardTokensCount; i++) {
                let storedRewardContract = await RewardsPoolInstance.rewardsTokensArr(i);
                let info = await RewardsPoolInstance.rewardsTokensMap(storedRewardContract);

                let userRewardPerTokenRecorded = await RewardsPoolInstance.getUserRewardPerTokenRecorded(aliceAccount.signer.address, storedRewardContract);

                assert(info.lastUpdateTime.eq(after), "lastUpdate is not correct after stake");
                assert(info.latestRewardPerTokenSaved.eq(0), "reward per token is not correct right after stake");
                assert(userRewardPerTokenRecorded.eq(0), "userRewardPerTokenRecorded is not correct after first stake");
            }

            await utils.timeTravel(deployer.provider, 10000);

            for (i = 0; i < rewardTokensCount; i++) {
                let storedRewardContract = await RewardsPoolInstance.rewardsTokensArr(i);
                let info = await RewardsPoolInstance.rewardsTokensMap(storedRewardContract);

                let savedLastUpdateTime = info.lastUpdateTime;
                const applicableTime = await RewardsPoolInstance.lastTimeRewardApplicable(storedRewardContract);
                const ellapsedTime = applicableTime.sub(savedLastUpdateTime);

                savedRewardPerToken = await RewardsPoolInstance.rewardPerToken(storedRewardContract);
                const earnings = await RewardsPoolInstance.earned(aliceAccount.signer.address, storedRewardContract);

                assert(savedRewardPerToken.eq(ethers.utils.parseEther(ellapsedTime.toString(10)).div(10)), "Reward per token was not correct sometime after stake");
                assert(earnings.eq(ethers.utils.parseEther(ellapsedTime.toString(10))), "Earnings was not correct sometime after stake");
            }
        });

        it('Should fail with stake 0', async () => {
            await stakingTokenInstance.approve(RewardsPoolInstance.contractAddress, standardStakingAmount);
            await assert.revertWith(RewardsPoolInstance.stake(0), "Cannot stake 0");
        })

        it('Should fail with insufficient balance', async () => {
            await stakingTokenInstance.approve(RewardsPoolInstance.contractAddress, standardStakingAmount.div(2));
            await assert.revert(RewardsPoolInstance.stake(standardStakingAmount));
        })

        describe('Rewards and withdraws', async function () {
            beforeEach(async () => {
                await stakingTokenInstance.approve(RewardsPoolInstance.contractAddress, standardStakingAmount);
                await utils.timeTravel(deployer.provider, 10000)
                await RewardsPoolInstance.stake(standardStakingAmount);
                await utils.timeTravel(deployer.provider, 10000)

                lpContractInstance = await deployer.deploy(TestERC20, {}, amount);
                await lpContractInstance.mint(RewardsPoolInstance.contractAddress, "100000000000")
            })

            describe('Withdrawing', async function () {

                it('Should not get new earnings after withdraw', async () => {
                    let rewardToken = rewardTokensAddresses[0];
                    let info = await RewardsPoolInstance.rewardsTokensMap(rewardToken);

                    const savedLastUpdateTime = info.lastUpdateTime;
                    const applicableTime = await RewardsPoolInstance.lastTimeRewardApplicable(rewardToken);
                    const ellapsedTime = applicableTime.sub(savedLastUpdateTime);

                    const balanceBefore = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);
                    await RewardsPoolInstance.withdraw(standardStakingAmount);

                    const balanceAfter = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);

                    assert(balanceAfter.eq(balanceBefore.add(standardStakingAmount), "The stake was not returned"));

                    const earningsBefore = await RewardsPoolInstance.earned(aliceAccount.signer.address, rewardToken);
                    assert(earningsBefore.eq(ethers.utils.parseEther(ellapsedTime.toString(10))), "Earnings was not correct sometime after withdraw");

                    await utils.timeTravel(deployer.provider, 10000);

                    const earningsAfter = await RewardsPoolInstance.earned(aliceAccount.signer.address, rewardToken);

                    assert(earningsAfter.eq(earningsBefore), "Earnings have changed after withdraw");
                });

                it('Should fail to withdraw 0', async () => {
                    await assert.revertWith(RewardsPoolInstance.withdraw(0), "Cannot withdraw 0");
                });
            })

            describe('Getting Reward', async function () {

                it('Should get the correct reward', async () => {
                    let ellapsedTimeForAllTokens = [];

                    for (i = 0; i < rewardTokensCount; i++) {
                        let rewardToken = rewardTokensAddresses[i];
                        let info = await RewardsPoolInstance.rewardsTokensMap(rewardToken);

                        const savedLastUpdateTime = info.lastUpdateTime;
                        const applicableTime = await RewardsPoolInstance.lastTimeRewardApplicable(rewardToken);
                        const ellapsedTime = applicableTime.sub(savedLastUpdateTime);
                        ellapsedTimeForAllTokens.push(ellapsedTime);

                        const earnings = await RewardsPoolInstance.earned(aliceAccount.signer.address, rewardToken);
                        assert(earnings.eq(ethers.utils.parseEther(ellapsedTime.toString(10))), "Earnings was not correct before getting reward");
                    }

                    await RewardsPoolInstance.getReward();

                    for (i = 0; i < rewardTokensCount; i++) {
                        const balanceReward = await rewardTokensInstances[i].balanceOf(aliceAccount.signer.address);
                        assert(balanceReward.eq(ethers.utils.parseEther(ellapsedTimeForAllTokens[i].toString(10))), "Reward was not correct ");
                    }
                });
            });

            describe('Exitting', async function () {

                it('Should get the correct reward and stake', async () => {
                    let balancesBefore = [];
                    let ellapsedTimes = [];

                    for (i = 0; i < rewardTokensCount; i++) {
                        let rewardToken = rewardTokensAddresses[i];
                        let info = await RewardsPoolInstance.rewardsTokensMap(rewardToken);

                        const savedLastUpdateTime = info.lastUpdateTime;
                        const applicableTime = await RewardsPoolInstance.lastTimeRewardApplicable(rewardToken);
                        const ellapsedTime = applicableTime.sub(savedLastUpdateTime);

                        ellapsedTimes.push(ellapsedTime);

                        const earnings = await RewardsPoolInstance.earned(aliceAccount.signer.address, rewardToken);
                        assert(earnings.eq(ethers.utils.parseEther(ellapsedTime.toString(10))), "Earnings was not correct sometime after stake");

                        balancesBefore.push(await stakingTokenInstance.balanceOf(aliceAccount.signer.address));
                    }

                    await RewardsPoolInstance.exit();

                    const balanceAfter = await stakingTokenInstance.balanceOf(aliceAccount.signer.address);

                    for (i = 0; i < rewardTokensCount; i++) {
                        const balanceReward = await rewardTokensInstances[i].balanceOf(aliceAccount.signer.address);
                        assert(balanceReward.gte(ethers.utils.parseEther(ellapsedTimes[i].toString(10))), "Earnings was not correct sometime after exit");
                        assert(balanceAfter.eq(balancesBefore[i].add(standardStakingAmount), "The stake was not returned"));
                    }
                });
            });

            describe('Extending Rewards', async function () {

                it("Should fail directly calling add rewards with zero amount", async () => {
                    let distributionAddress = await RewardsPoolInstance.rewardsDistributor();

                    for (i = 0; i < rewardTokensCount; i++) {
                        await assert.revertWith(RewardsPoolInstance.from(distributionAddress).addRewards(rewardTokensAddresses[i], 0), "Rewards should be greater than zero");
                    }
                });

                it("Should fail directly calling add rewards if the staking has not started", async () => {
                    let distributionAddress = await RewardsPoolInstance.rewardsDistributor();
                    let secondRewardsPoolInstance = await deployer.deploy(
                        RewardsPool,
                        {},
                        rewardTokensAddresses,
                        rewardAmounts,
                        stakingTokenInstance.contractAddress,
                        duration
                    );

                    await assert.revertWith(secondRewardsPoolInstance.from(distributionAddress).addRewards(rewardTokensAddresses[0], rewardAmounts[0]), "Staking is not yet started");
                });

                it("Should fail directly calling add rewards with zero amount", async () => {
                    let secondRewardsPoolInstance = await deployer.deploy(
                        RewardsPool,
                        {},
                        rewardTokensAddresses,
                        rewardAmounts,
                        stakingTokenInstance.contractAddress,
                        duration
                    );

                    await assert.revert(secondRewardsPoolInstance.addRewards(rewardTokensAddresses[0], rewardAmounts[0]));
                });

                it("Should not change the reward rate after extending the reward", async () => {
                    let distributionAddress = await RewardsPoolInstance.rewardsDistributor();

                    for (i = 0; i < rewardTokensCount; i++) {
                        let rewardToken = rewardTokensAddresses[i];
                        let info = await RewardsPoolInstance.rewardsTokensMap(rewardToken);
                        let initialRewardsRate = info.rewardRate;

                        await rewardTokensInstances[i].mint(aliceAccount.signer.address, rewardAmounts[0])
                        await rewardTokensInstances[i].transfer(distributionAddress, rewardAmounts[0]);
                        await rewardTokensInstances[i].from(distributionAddress).approve(RewardsPoolInstance.contractAddress, rewardAmounts[0]);

                        info = await RewardsPoolInstance.rewardsTokensMap(rewardToken);
                        let finalRewardsRate = info.rewardRate;
                        assert(initialRewardsRate.eq(finalRewardsRate, "Rewards rate was changed"));
                    }
                });
            });

            describe('Withdrawing LP rewards', async function () {


                it("Should not withdtaw if the caller is not the factory contract", async () => {
                    
                    let lptokenAddress = lpContractInstance.contractAddress;

                    await assert.revert(RewardsPoolInstance.from(bobAccount.signer.address).withdrawLPRewards(carolAccount.signer.address,lptokenAddress ));
                });
                it("Should revert if the token to withdraw is part of the rewards", async () => {
                    
                    await assert.revert(RewardsPoolInstance.withdrawLPRewards(carolAccount.signer.address,rewardTokensAddresses[0]));
                });
        });
    });
});
});