const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const RewardsPoolFactory = require('../build/RewardsPoolFactory.json');
const TestERC20 = require('../build/TestERC20.json');
const RewardsPoolBase = require('../build/RewardsPoolBase.json');


describe.only('RewardsPoolFactory', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;
    let RewardsPoolFactoryInstance;
    let rewardTokensInstances;
    let rewardTokensAddresses;
    let lpContractInstance;
    let rewardPerBlock;
    let startBlock;
    let endBlock;
    let rewardAmounts;
    const duration = 60 * 24 * 60 * 60; // 60 days in seconds
    const rewardTokensCount = 1; // 5 rewards tokens for tests
    const amount = ethers.utils.parseEther("5184000");
    const amountToTransfer = ethers.utils.parseEther("100");
    



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
		startBlock = currentBlock.number + 10;
		endBlock = startBlock + 20;

	}

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
    
        await setupRewardsPoolParameters(deployer)
        RewardsPoolFactoryInstance = await deployer.deploy(RewardsPoolFactory, {});
    });

    it('should deploy valid rewards pool factory contract', async () => {
        assert.isAddress(RewardsPoolFactoryInstance.contractAddress, "The RewardsPoolFactory contract was not deployed");

        for (i = 0; i < rewardTokensInstances.length; i++) {
            assert.isAddress(rewardTokensInstances[i].contractAddress, "The reward token contract was not deployed");
        }
    });

    describe.only('Deploying RewardsPoolBase', async function () {
        let stakingTokenAddress;

        beforeEach(async () => {

            stakingTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));
            stakingTokenAddress = stakingTokenInstance.contractAddress;
        });

        it('Should deploy base rewards pool successfully', async () => {

            for (i = 0; i < rewardTokensAddresses.length; i++) {
                await rewardTokensInstances[i].transfer(RewardsPoolFactoryInstance.contractAddress, amountToTransfer);
            }
            await RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock);

            const firstRewardsPool = await RewardsPoolFactoryInstance.rewardsPools(0);
			const RewardsPoolContract = await etherlime.ContractAt(RewardsPoolBase, firstRewardsPool);
			const stakingToken = await  RewardsPoolContract.stakingToken(); 

			assert.strictEqual(stakingTokenAddress.toLowerCase(), stakingToken.toLowerCase(), "The saved staking token was not the same as the inputted one");
            assert.isAddress(firstRewardsPool, "The staking reward contract was not deployed");
        });

        it('Should deploy the rewards pool contract with the correct data', async() => {
			
			
            for (i = 0; i < rewardTokensAddresses.length; i++) {
                await rewardTokensInstances[i].transfer(RewardsPoolFactoryInstance.contractAddress, amountToTransfer);
            }
            await RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock);
			let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
			let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )

            // check if correctly stored in staking contract
            const RewardsPoolContract = await etherlime.ContractAt(RewardsPoolBase, rewardsPoolAddress);

            for (i = 0; i < rewardTokensAddresses.length; i++) {
                const tokenAddress = await RewardsPoolContract.rewardsTokens(i);
                assert.equal(tokenAddress, rewardTokensAddresses[i], `The saved address of the reward token ${i} was incorrect`);
    
                const rewardPerBlock = await RewardsPoolContract.rewardPerBlock(i);
                assert(rewardPerBlock.eq(ethers.utils.parseEther(`${i+1}`)), "The saved reward per block is incorrect");
    
                const accumulatedMultiplier = await RewardsPoolContract.accumulatedRewardMultiplier(i);
                assert(accumulatedMultiplier.eq(ethers.utils.bigNumberify(0)), "The saved accumulatedMultiplier is incorrect");
            }

		    const totalStaked = await RewardsPoolContract.totalStaked();
		    assert(totalStaked.eq(0), "There was something staked already");

		    const savedStartBlock = await RewardsPoolContract.startBlock();
		    assert(savedStartBlock.eq(startBlock), "The start block saved was incorrect")

		    const savedEndBlock = await RewardsPoolContract.endBlock();
		    assert(savedEndBlock.eq(endBlock), "The end block saved was incorrect") 
        });

        it('Should fail on deploying not from owner', async () => {
            await assert.revert(RewardsPoolFactoryInstance.from(bobAccount).deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock));
        });

        it('Should fail on deploying with zero address as staking token', async () => {
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(ethers.constants.AddressZero, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock), "RewardsPoolFactory::deploy: Staking token address can't be zero address");
        });
     

        it('Should fail on deploying with empty token and reward arrays', async () => {
            const errorString = "RewardsPoolFactory::deploy: RewardsTokens array could not be empty"
            const errorStringMatchingSizes = "RewardsPoolFactory::deploy: RewardsTokens and RewardPerBlock should have a matching sizes"
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, [],rewardPerBlock), errorString);
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,[]), errorStringMatchingSizes);
        });

        it('Should fail if the reward amount is not greater than zero', async () => {
            const errorString = "RewardsPoolFactory::deploy: Reward token address could not be invalid"
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, [ethers.constants.AddressZero],rewardPerBlock), errorString);
        });

        it('Should fail if the reward token amount is invalid address', async () => {
            const errorString = "RewardsPoolFactory::deploy: Reward per block must be greater than zero"
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,[0]), errorString);
        });

        xdescribe('Extending Rewards', async function () {
            beforeEach(async () => {
                await RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock);
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