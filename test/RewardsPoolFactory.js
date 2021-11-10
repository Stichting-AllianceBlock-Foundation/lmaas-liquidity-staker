const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const RewardsPoolFactory = require('../build/RewardsPoolFactory.json');
const TestERC20 = require('../build/TestERC20.json');
const RewardsPoolBase = require('../build/RewardsPoolBase.json');
const { mineBlock } = require('./utils')

describe('RewardsPoolFactory', () => {
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
    const stakeLimit = amount;
    const amountToTransfer = ethers.utils.parseEther("10000");
    const contractStakeLimit = ethers.utils.parseEther('10') // 10 tokens

    let startTimestmap;
	let endTimestamp;

	const virtualBlocksTime = 10 // 10s == 10000ms
	const oneMinute = 60

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
			let parsedReward = await ethers.utils.parseEther(`${i+10}`);
            rewardPerBlock.push(parsedReward);
        }

		const currentBlock = await deployer.provider.getBlock('latest');
		startTimestmap = currentBlock.timestamp + oneMinute ;
		endTimestamp = startTimestmap + oneMinute*2;
		startBlock = Math.trunc(startTimestmap/virtualBlocksTime)
		endBlock = Math.trunc(endTimestamp/virtualBlocksTime)

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

    describe('Deploying RewardsPoolBase', async function () {
        let stakingTokenAddress;

        beforeEach(async () => {

            stakingTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));
            stakingTokenAddress = stakingTokenInstance.contractAddress;
        });

        it('Should deploy base rewards pool successfully', async () => {

            for (i = 0; i < rewardTokensAddresses.length; i++) {
                await rewardTokensInstances[i].transfer(RewardsPoolFactoryInstance.contractAddress, amountToTransfer);
            }
            await RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startTimestmap, endTimestamp, rewardTokensAddresses,rewardPerBlock, stakeLimit, contractStakeLimit, virtualBlocksTime);

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
            await RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startTimestmap, endTimestamp, rewardTokensAddresses,rewardPerBlock, stakeLimit, contractStakeLimit, virtualBlocksTime);
			let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
			let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )

            // check if correctly stored in staking contract
            const RewardsPoolContract = await etherlime.ContractAt(RewardsPoolBase, rewardsPoolAddress);

            for (i = 0; i < rewardTokensAddresses.length; i++) {
                const tokenAddress = await RewardsPoolContract.rewardsTokens(i);
                assert.equal(tokenAddress, rewardTokensAddresses[i], `The saved address of the reward token ${i} was incorrect`);
    
                const rewardPerBlock = await RewardsPoolContract.rewardPerBlock(i);
                assert(rewardPerBlock.eq(ethers.utils.parseEther(`${i+10}`)), "The saved reward per block is incorrect");
    
                const accumulatedMultiplier = await RewardsPoolContract.accumulatedRewardMultiplier(i);
                assert(accumulatedMultiplier.eq(ethers.utils.bigNumberify(0)), "The saved accumulatedMultiplier is incorrect");
            }

		    const totalStaked = await RewardsPoolContract.totalStaked();
		    assert(totalStaked.eq(0), "There was something staked already");

		    const savedStartBlock = await RewardsPoolContract.startBlock();
		    assert(savedStartBlock.eq(startBlock), "The start block saved was incorrect")

		    const savedEndBlock = await RewardsPoolContract.endBlock();
		    assert(savedEndBlock.eq(endBlock), "The end block saved was incorrect") 

            const virtualBlockTime = await RewardsPoolContract.virtualBlockTime();
            assert(virtualBlockTime.eq(virtualBlocksTime), "The virtual block time saved was incorrect")
        });

        it('Should fail on deploying not from owner', async () => {
            await assert.revert(RewardsPoolFactoryInstance.from(bobAccount).deploy(stakingTokenAddress, startTimestmap, endTimestamp, rewardTokensAddresses,rewardPerBlock, stakeLimit, contractStakeLimit, virtualBlocksTime));
        });

        it('Should fail on deploying with zero address as staking token', async () => {
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(ethers.constants.AddressZero, startTimestmap, endTimestamp, rewardTokensAddresses,rewardPerBlock, stakeLimit, contractStakeLimit, virtualBlocksTime), "RewardsPoolFactory::deploy: Staking token address can't be zero address");
        });
     

        it('Should fail on deploying with empty token and reward arrays', async () => {
            const errorString = "RewardsPoolFactory::deploy: RewardsTokens array could not be empty"
            const errorStringMatchingSizes = "RewardsPoolFactory::deploy: RewardsTokens and RewardPerBlock should have a matching sizes"
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startTimestmap, endTimestamp, [],rewardPerBlock, stakeLimit, contractStakeLimit, virtualBlocksTime), errorString);
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startTimestmap, endTimestamp, rewardTokensAddresses,[], stakeLimit, contractStakeLimit, virtualBlocksTime), errorStringMatchingSizes);
        });

        it('Should fail if the reward amount is not greater than zero', async () => {
            const errorString = "RewardsPoolFactory::deploy: Reward token address could not be invalid"
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startTimestmap, endTimestamp, [ethers.constants.AddressZero],rewardPerBlock, stakeLimit, contractStakeLimit, virtualBlocksTime), errorString);
        });

        it('Should fail if the reward token amount is invalid address', async () => {
            const errorString = "RewardsPoolFactory::deploy: Reward per block must be greater than zero"
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startTimestmap, endTimestamp, rewardTokensAddresses,[0], stakeLimit, contractStakeLimit, virtualBlocksTime), errorString);
        });

        it('Should fail on deploying zero stake limit', async () => {
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startTimestmap, endTimestamp, rewardTokensAddresses,rewardPerBlock, 0, contractStakeLimit, virtualBlocksTime), "RewardsPoolFactory::deploy: Stake limit must be more than 0");
        });

        it('Should fail on deploying with zero contract stake limit', async () => {
            await assert.revertWith(RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startTimestmap, endTimestamp, rewardTokensAddresses,rewardPerBlock, stakeLimit, 0, virtualBlocksTime), "Constructor:: Contract Stake limit needs to be more than 0");
        });

        describe('Extending Rewards', async function () {
            beforeEach(async () => {
                for (i = 0; i < rewardTokensAddresses.length; i++) {
                    await rewardTokensInstances[i].transfer(RewardsPoolFactoryInstance.contractAddress, amountToTransfer);
                }
                await RewardsPoolFactoryInstance.deploy(stakingTokenAddress, startTimestmap, endTimestamp, rewardTokensAddresses,rewardPerBlock, stakeLimit, contractStakeLimit, virtualBlocksTime);
            }); 

            const calculateRewardsAmount = async (startTimestmap, endTimestamp, rewardsPerBlock) => {
                let rewardsPeriod = endTimestamp - startTimestmap;
                let rewardsBlockPeriod = Math.trunc(rewardsPeriod/virtualBlocksTime)
                let rewardsAmount = rewardsPerBlock*(rewardsBlockPeriod)
                let amount = await ethers.utils.bigNumberify(rewardsAmount.toString());
                return amount
             }

                it("Should extend the rewards pool successfully with the same rate", async () => {
					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1))
                    const RewardsPoolContract = await etherlime.ContractAt(RewardsPoolBase, rewardsPoolAddress);
                    
                    const rewardTokenInstance = rewardTokensInstances[0];
                    let rewardsBalanceInitial = await rewardTokenInstance.balanceOf(RewardsPoolContract.contractAddress)

                    await utils.timeTravel(deployer.provider, 100);
                    let initialEndTimestamp = await RewardsPoolContract.endTimestamp();
                    let newEndTimestamp = initialEndTimestamp.add(oneMinute)
                    let extentionInBlocks = Math.trunc((newEndTimestamp.sub(initialEndTimestamp)).div(virtualBlocksTime))
                    for (i = 0; i < rewardTokensCount; i++) {
                        // let amount = await RewardsPoolFactoryInstance.calculateRewardsAmount(currentBlock.number,newEndBlock,rewardPerBlock[0])
                        let amount = rewardPerBlock[i].mul(extentionInBlocks)
                        await rewardTokensInstances[i].mint(RewardsPoolFactoryInstance.contractAddress, amountToTransfer);
                    }
                    await RewardsPoolFactoryInstance.extendRewardPool(newEndTimestamp, rewardPerBlock, rewardsPoolAddress);
                    let te = await RewardsPoolFactoryInstance.rewardsAmount()

                    let rewardsBalanceFinal = await rewardTokenInstance.balanceOf(RewardsPoolContract.contractAddress)
                    let finalEndTime = await RewardsPoolContract.endTimestamp();
                    let finalRewardPerBlock = await RewardsPoolContract.rewardPerBlock(0);
                    let amountToTransfer1 = rewardPerBlock[0].mul(extentionInBlocks)

                    assert(finalEndTime.eq(newEndTimestamp), "The endtime is different");
                    assert(finalRewardPerBlock.eq(rewardPerBlock[0]), "The rewards amount is not correct");
                    assert(rewardsBalanceFinal.eq((rewardsBalanceInitial.add(amountToTransfer1))), "The transfered amount is not correct")

                });

                it("Should extend the rewards pool successfully with the half of the rate", async () => {

					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1))
                    const RewardsPoolContract = await etherlime.ContractAt(RewardsPoolBase, rewardsPoolAddress);
                    const rewardTokenInstance = rewardTokensInstances[0];
                    let rewardsBalanceInitial = await rewardTokenInstance.balanceOf(RewardsPoolContract.contractAddress)

                    await utils.timeTravel(deployer.provider, 110);

                    let initialEndTimestamp = await RewardsPoolContract.endTimestamp();
                    let newEndTimestamp = initialEndTimestamp.add(oneMinute)

                    let newRewardPerBlock = []
                    for (i = 0; i < rewardTokensCount; i++) {
                        let newSingleReward = rewardPerBlock[i].div(2)
                        newRewardPerBlock.push(newSingleReward)
          
                    }
                    await RewardsPoolFactoryInstance.extendRewardPool(newEndTimestamp, newRewardPerBlock, rewardsPoolAddress);

                    let rewardsBalanceFinal = await rewardTokenInstance.balanceOf(RewardsPoolContract.contractAddress)
                    let finalEndTime = await RewardsPoolContract.endTimestamp();
                    let finalRewardPerBlock = await RewardsPoolContract.rewardPerBlock(0);

                    assert(finalEndTime.eq(newEndTimestamp), "The endblock is different");
                    assert(finalRewardPerBlock.eq(newRewardPerBlock[0]), "The rewards amount is not correct");
                    assert(rewardsBalanceFinal.eq((rewardsBalanceInitial)), "The transfered amount is not correct")

                });


                it("Should extend the rewards pool successfully with the of the lower rate and return some money", async () => {

					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1))
                    const RewardsPoolContract = await etherlime.ContractAt(RewardsPoolBase, rewardsPoolAddress);
                    const rewardTokenInstance = rewardTokensInstances[0];
                    let rewardsBalanceInitial = await rewardTokenInstance.balanceOf(RewardsPoolContract.contractAddress)
                    let factoryBalanceInitial = await rewardTokenInstance.balanceOf(RewardsPoolFactoryInstance.contractAddress)


                    await utils.timeTravel(deployer.provider, 110);
                    let initialEndTimestamp = await RewardsPoolContract.endTimestamp();
                    const currentBlock = await deployer.provider.getBlock('latest');
                    let newEndTimestamp = initialEndTimestamp.add(oneMinute)
                    let amountToTransfer = []
                    let newRewardPerBlock = []
                    for (i = 0; i < rewardTokensCount; i++) {
                        let newSingleReward = rewardPerBlock[i].div(5)
                        newRewardPerBlock.push(newSingleReward)
                        let currentRemainingReward = await calculateRewardsAmount((currentBlock.timestamp), endTimestamp,rewardPerBlock[i].toString())
                        let newRemainingReward = await calculateRewardsAmount((currentBlock.timestamp), newEndTimestamp,newSingleReward.toString())
                        amountToTransfer.push(currentRemainingReward.sub(newRemainingReward))
                    }
                    await RewardsPoolFactoryInstance.extendRewardPool(newEndTimestamp, newRewardPerBlock, rewardsPoolAddress);
                    let rewardsBalanceFinal = await rewardTokenInstance.balanceOf(RewardsPoolContract.contractAddress)
                    let factoryBalanceFinal = await rewardTokenInstance.balanceOf(RewardsPoolFactoryInstance.contractAddress)
                    let finalEndTime = await RewardsPoolContract.endTimestamp();
                    let finalRewardPerBlock = await RewardsPoolContract.rewardPerBlock(0);
                    
                    assert(finalEndTime.eq(newEndTimestamp), "The endblock is different");
                    assert(finalRewardPerBlock.eq(newRewardPerBlock[0]), "The rewards amount is not correct");
                    assert(rewardsBalanceFinal.eq((rewardsBalanceInitial.sub(amountToTransfer[0]))), "The transfered amount is not correct")
                    assert(factoryBalanceFinal.eq((factoryBalanceInitial.add(amountToTransfer[0]))), "The amount is not transferred to the factory")

                });

                it("Should fail trying to extend from not owner", async() => {
                    let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools(0)
                    let newEndBlock = endBlock + 10
                    await assert.revertWith(RewardsPoolFactoryInstance.from(bobAccount.signer.address).extendRewardPool(newEndBlock, rewardPerBlock, rewardsPoolAddress),"onlyOwner:: The caller is not the owner")
                })

           
            describe('Withdrawing rewards', async function () {
			

                beforeEach(async () => {
					let rewardsPoolLength = await RewardsPoolFactoryInstance.getRewardsPoolNumber()
					let rewardsPoolAddress = await RewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )
                    lpContractInstance = await deployer.deploy(TestERC20, {}, amount);
					await lpContractInstance.mint(rewardsPoolAddress, "100000000000")
					utils.timeTravel(deployer.provider, 60 * 60)
                })

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

                it("Should withdraw leftover rewards", async () => {

                    let initialContractBalance = await lpContractInstance.balanceOf(RewardsPoolFactoryInstance.contractAddress);
                    let initialUserBalance = await lpContractInstance.balanceOf(aliceAccount.signer.address);

                    await RewardsPoolFactoryInstance.withdrawRewardsLeftovers(lpContractInstance.contractAddress);

                    let finalUserBalance = await lpContractInstance.balanceOf(aliceAccount.signer.address);
                    let finalContractBalance = await lpContractInstance.balanceOf(RewardsPoolFactoryInstance.contractAddress);

                    assert(finalContractBalance.eq(0), "Contract balance was not updated properly");
                    assert(finalUserBalance.eq(initialUserBalance.add(initialContractBalance)), "User balance was not updated properly");
				});
				
				
			});
			
			
        });
    });
});