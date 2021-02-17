const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const RewardsPoolFactory = require('../build/RewardsPoolFactory.json');
const TestERC20 = require('../build/TestERC20.json');
const RewardsPool = require('../build/RewardsPool.json');


describe('RewardsPoolFactory', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;
    let RewardsPoolFactoryInstance;
    let rewardTokensInstances;
    let rewardTokensAddresses;
    let lpContractInstance;
    let rewardAmounts;
    const duration = 60 * 24 * 60 * 60; // 60 days in seconds
    const rewardTokensCount = 5; // 5 rewards tokens for tests
    const amount = ethers.utils.parseEther("5184000");

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
        const {
            timestamp: now
        } = await deployer.provider.getBlock('latest');

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

        RewardsPoolFactoryInstance = await deployer.deploy(RewardsPoolFactory, {});
    });

    it('should deploy valid rewards pool factory contract', async () => {
        assert.isAddress(RewardsPoolFactoryInstance.contractAddress, "The RewardsPoolFactory contract was not deployed");

        for (i = 0; i < rewardTokensInstances.length; i++) {
            assert.isAddress(rewardTokensInstances[i].contractAddress, "The reward token contract was not deployed");
        }
    });

    describe('Deploying RewardsPool', async function () {
        let stakingTokenAddress;

        beforeEach(async () => {
            stakingTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));
            stakingTokenAddress = stakingTokenInstance.contractAddress;
        });

        it('Should deploy staking rewards successfully', async () => {
            await RewardsPoolFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, duration);

            const firstRewardsPool = await RewardsPoolFactoryInstance.rewardsPools(0);

			const RewardsPoolContract = await etherlime.ContractAt(RewardsPool, firstRewardsPool);
			const stakingToken = await  RewardsPoolContract.stakingToken(); 
			assert.strictEqual(stakingTokenAddress.toLowerCase(), stakingToken.toLowerCase(), "The saved staking token was not the same as the inputted one");
            assert.isAddress(firstRewardsPool, "The staking reward contract was not deployed");
        });

        it('Should store and deploy correct reward token and reward amounts', async function () {
			
			await RewardsPoolFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, duration);
			let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
			let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )

            // check if correctly stored in staking contract
            const RewardsPoolContract = await etherlime.ContractAt(RewardsPool, rewardsPoolAddress);
            const count = await RewardsPoolContract.getRewardsTokensCount();

            assert(count.eq(rewardTokensCount), "Count of reward tokens in staking contract is not correct");

            for (i = 0; i < count; i++) {
                let savedRewardTokenAddress = await RewardsPoolContract.rewardsTokensArr(i);
                assert.strictEqual(
                    rewardTokensAddresses[i].toLowerCase(),
                    savedRewardTokenAddress.toLowerCase(),
                    "The saved reward token (" + i + ") in staking rewards contract was not the same as the inputted one"
                );
            }
        });

        it('Should fail on deploying not from owner', async () => {
            await assert.revert(RewardsPoolFactoryInstance.from(bobAccount).deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, duration));
        });

        it('Should fail on deploying with zero duration', async () => {
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, 0), "The Duration should be greater than zero");
        });

        it('Should fail on deploying with empty token and reward arrays', async () => {
            const errorString = "RewardsPoolFactory::deploy: RewardsTokens and RewardsAmounts arrays could not be empty"
            const errorStringMatchingSizes = "RewardsPoolFactory::deploy: RewardsTokens and RewardsAmounts should have a matching sizes"
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, [], [], duration), errorString);
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, [], duration), errorStringMatchingSizes);
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, [], rewardAmounts, duration), errorString);
        });

        it('Should fail on deploying with not matching token and reward arrays', async () => {
            const errorString = "RewardsPoolFactory::deploy: RewardsTokens and RewardsAmounts should have a matching sizes"
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts.slice(0, 1), duration), errorString);
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses.slice(0, 1), rewardAmounts, duration), errorString);
        });

        it('Should fail if the reward amount is not greater than zero', async () => {
            const errorString = "RewardsPoolFactory::deploy: Reward must be greater than zero"
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, [rewardTokensAddresses[0]], [0], duration), errorString);
        });

        it('Should fail if the reward token amount is invalid address', async () => {
            const errorString = "RewardsPoolFactory::deploy: Reward token address could not be invalid"
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, [ethers.constants.AddressZero], [rewardAmounts[0]], duration), errorString);
        });

        describe('Adding Reward', async function () {
            beforeEach(async () => {
				 await RewardsPoolFactoryInstance.deploy(stakingTokenAddress, rewardTokensAddresses, rewardAmounts, duration);
            });

            describe('Starting Rewards', async function () {

                it('Should start the staking reward completely', async () => {
					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )
					const RewardsPoolContract = await etherlime.ContractAt(RewardsPool, rewardsPoolAddress);
                    const count = await RewardsPoolContract.getRewardsTokensCount();
                    for (i = 0; i < count; i++) {
						const addr = await RewardsPoolContract.rewardsTokensArr(i);
						const info = await RewardsPoolContract.rewardsTokensMap(addr);
                        const lastUpdateTimeBefore = info.lastUpdateTime;
                        const balanceBefore = await rewardTokensInstances[i].balanceOf(rewardsPoolAddress);

                        assert(lastUpdateTimeBefore.eq(0), "The last update time was not 0 before start");
                        assert(balanceBefore.eq(0), "The balance was not 0 before start");
                    }
                    // transfer all rewards
                    for (i = 0; i < count; i++) {
                        await rewardTokensInstances[i].transfer(RewardsPoolFactoryInstance.contractAddress, rewardAmounts[i]);
                    }
                    await RewardsPoolFactoryInstance.startStaking(rewardsPoolAddress);
                    for (i = 0; i < count; i++) {
                        const addr = await RewardsPoolContract.rewardsTokensArr(i);
                        const info = await RewardsPoolContract.rewardsTokensMap(addr);

                        const lastRewardRateAfter = info.rewardRate;
                        const lastPeriodFinsihAfter = info.periodFinish; // duration + timestamp of block
                        const latestRewardPerTokenSavedAfter = info.latestRewardPerTokenSaved;
                        const lastUpdateTimeAfter = info.lastUpdateTime;
                        const rewardDuration = info.rewardDuration;

                        const balanceAfter = await rewardTokensInstances[i].balanceOf(rewardsPoolAddress);

                        assert(lastRewardRateAfter.gt(0), "The reward rate was greater was 0 after start");
                        assert(lastPeriodFinsihAfter.gt(duration), "The last period finish was not greather than duration");
                        assert(latestRewardPerTokenSavedAfter.eq(0), "The last reward per token saved was not 0 after start");
                        assert(lastUpdateTimeAfter.gt(0), "The last update time was 0 after start");
                        assert(balanceAfter.eq(rewardAmounts[i]), "The balance was the reward amount after start");
                        assert(rewardDuration.eq(duration), "The reward duration was unexpected value");
                    }
                });

                it('Should fail on starting without deployed staking', async () => {
                    await assert.revertWith(RewardsPoolFactoryInstance.startStaking(ethers.constants.AddressZero), 'RewardsPoolFactory::startStaking: not deployed');
                });

                it('Should fail on starting the staking reward without having transferred the tokens to the factory', async () => {
					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )
					await assert.revert(RewardsPoolFactoryInstance.startStaking(rewardsPoolAddress));
					
                });

                it('Should fail if trying to start the staking while it has already been started', async () => {
                    for (i = 0; i < rewardTokensCount; i++) {
                        await rewardTokensInstances[i].transfer(RewardsPoolFactoryInstance.contractAddress, rewardAmounts[i]);
                    }

					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )
                    await RewardsPoolFactoryInstance.startStaking(rewardsPoolAddress);

                    const hasStarted = await RewardsPoolFactoryInstance.hasStakingStarted(rewardsPoolAddress);

                    for (i = 0; i < rewardTokensCount; i++) {
                        await rewardTokensInstances[i].transfer(RewardsPoolFactoryInstance.contractAddress, rewardAmounts[i]);
                    }

                    await assert.revertWith(RewardsPoolFactoryInstance.startStaking(rewardsPoolAddress), 'Staking has started')
                });
            });

            describe('Extending the rewards period', async function () {

                beforeEach(async () => {
                    lpContractInstance = await deployer.deploy(TestERC20, {}, amount);
                });

                it("Should extend the rewards period successfully", async () => {
					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )
                    const RewardsPoolContract = await etherlime.ContractAt(RewardsPool, rewardsPoolAddress);
                    const rewardTokenInstance = rewardTokensInstances[0];
                    const rewardToken = rewardTokensAddresses[0];
                    const rewardAmount = rewardAmounts[0];

                    for (i = 0; i < rewardTokensCount; i++) {
                        await rewardTokensInstances[i].transfer(RewardsPoolFactoryInstance.contractAddress, rewardAmounts[i]);
                    }
                    await RewardsPoolFactoryInstance.startStaking(rewardsPoolAddress);
					let rewardInfo = await RewardsPoolContract.rewardsTokensMap(rewardToken);
                    let periodFinishInitial = rewardInfo.periodFinish;
                    let rewardDurationInitial = rewardInfo.rewardDuration;

                    await rewardTokensInstances[0].transfer(RewardsPoolFactoryInstance.contractAddress, rewardAmount);
                    await RewardsPoolFactoryInstance.extendRewardPeriod(rewardsPoolAddress, rewardToken, rewardAmount);
					let RewardsPoolBalanceFinal = await rewardTokenInstance.balanceOf(rewardsPoolAddress);
					rewardInfo = await RewardsPoolContract.rewardsTokensMap(rewardToken);
                    let periodFinishFinal = rewardInfo.periodFinish;
                    let rewardDurationFinal = rewardInfo.rewardDuration;

                    let finalPeriod = periodFinishInitial.add(duration)
                    let finalDuration = rewardDurationInitial.add(duration)

                    assert(periodFinishFinal.eq(finalPeriod), "The finish period is not correct")
                    assert(RewardsPoolBalanceFinal.eq(rewardAmount.mul(2)), "The rewards amount is not correct")
                    assert(rewardDurationFinal.eq(finalDuration), "The reward duration is not correct")
                });

                it("Should fail if the rewards amount is not greater than zero", async () => {
                    await assert.revertWith(RewardsPoolFactoryInstance.extendRewardPeriod(
                        stakingTokenAddress,
                        rewardTokensAddresses[0],
                        0
                    ), 'RewardsPoolFactory::extendRewardPeriod: Reward must be greater than zero');
                });

                it("Should fail if the staking contracts is not deployed", async () => {
                    const randomAddress = accounts[6].signer.address;
                    await assert.revertWith(RewardsPoolFactoryInstance.extendRewardPeriod(
                        ethers.constants.AddressZero,
                        rewardTokensAddresses[0],
                        rewardAmounts[0]
                    ), 'RewardsPoolFactory::extendRewardPeriod: not deployed')
                });

                it("Should fail if the staking has not yet started", async () => {
					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )
                    await assert.revertWith(RewardsPoolFactoryInstance.extendRewardPeriod(
                        rewardsPoolAddress,
                        rewardTokensAddresses[0],
                        rewardAmounts[0]
                    ), 'Staking has not started')
                });
            });

            describe('Withdrawing rewards', async function () {
			

                beforeEach(async () => {
					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )
                    lpContractInstance = await deployer.deploy(TestERC20, {}, amount);
					await lpContractInstance.mint(rewardsPoolAddress, "100000000000")
					utils.timeTravel(deployer.provider, 60 * 60)
                });

                it("Should withdraw the lp rewards", async () => {
					
					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )
                    let lptokenAddress = lpContractInstance.contractAddress;
                   
                    let contractInitialBalance = await lpContractInstance.balanceOf(rewardsPoolAddress);

                    await RewardsPoolFactoryInstance.withdrawLPRewards(rewardsPoolAddress ,carolAccount.signer.address,lptokenAddress );

                    let userBalanceFinal = await lpContractInstance.balanceOf(carolAccount.signer.address);
                    let contractFinalBalance = await lpContractInstance.balanceOf(rewardsPoolAddress);
                    assert(contractInitialBalance.eq(userBalanceFinal, "The balance of the user was not updated"));
                    assert(contractFinalBalance.eq(0, "The balance of the contract was not updated"));

                });

                it("Should not withdtaw if the caller is not the owner ", async () => {
                    
                    let lptokenAddress = lpContractInstance.contractAddress;

                    await assert.revert(RewardsPoolFactoryInstance.from(bobAccount.signer.address).withdrawLPRewards(stakingTokenAddress,carolAccount.signer.address,lptokenAddress ));
                });

                it("Should not withdtaw if the staking rewards is not present", async () => {
                    
                    let lptokenAddress = lpContractInstance.contractAddress;

                    await assert.revert(RewardsPoolFactoryInstance.withdrawLPRewards(bobAccount.signer.address,carolAccount.signer.address,lptokenAddress ));
				});
				
				it("Should withdraw the rewards before the campaign being started", async () => {
					
					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )
					const RewardsContract = await etherlime.ContractAt(TestERC20, rewardTokensAddresses[0]);
					const amountToMint = ethers.utils.parseEther("100000000000")
					await RewardsContract.from(aliceAccount).mint(rewardsPoolAddress, amountToMint)
                    let contractInitialBalance = await RewardsContract.balanceOf(RewardsPoolFactoryInstance.contractAddress);

                    await RewardsPoolFactoryInstance.withdrawRewards(rewardsPoolAddress);

					let contractFinalBalance = await RewardsContract.balanceOf(RewardsPoolFactoryInstance.contractAddress);
			
					assert(contractFinalBalance.gt(0, "The balance of the contract was not updated"));
					assert(contractFinalBalance.gt(contractInitialBalance, "The balance of the contract was not updated"))
					assert(contractFinalBalance.eq(amountToMint, "The balance of the contract was not updated"))
				});

				it("Should not revert if the staking has started ", async () => {
					
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((0) )
					const RewardsPoolContract = await etherlime.ContractAt(RewardsPool, rewardsPoolAddress);
					const count = await RewardsPoolContract.getRewardsTokensCount();
					for (i = 0; i < count; i++) {
                        await rewardTokensInstances[i].transfer(RewardsPoolFactoryInstance.contractAddress, rewardAmounts[i]);
                    }
					await RewardsPoolFactoryInstance.startStaking(rewardsPoolAddress)

                    await assert.revert(RewardsPoolFactoryInstance.withdrawRewards(rewardsPoolAddress));
				});

			});
			
			
        });
    });
});