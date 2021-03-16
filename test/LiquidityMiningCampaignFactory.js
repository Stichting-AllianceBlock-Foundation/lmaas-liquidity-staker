const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const LMCFactory = require('../build/LiquidityMiningCampaignFactory.json');
const LMC = require('../build/LiquidityMiningCampaign.json');
const TestERC20 = require('../build/TestERC20.json');
const RewardsPoolBase = require('../build/RewardsPoolBase.json');
const { mineBlock } = require('./utils')
const NonCompoundingRewardsPool = require('../build/NonCompoundingRewardsPool.json');
const LockScheme = require('../build/LockScheme.json');
const PercentageCalculator = require('../build/PercentageCalculator.json')

describe('LMC Factory', () => { // These tests must be skipped for coverage as coverage does not support optimizations
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let treasury = accounts[8];
    let deployer;
    let LMCFactoryInstance;
    let stakingTokenInstance;
    let stakingTokenAddress;
	let NonCompoundingRewardsPoolInstance;
    let rewardPerBlock;
    let startBlock;
    let endBlock;
    let rewardAmounts;

    const duration = 60 * 24 * 60 * 60; // 60 days in seconds
    const rewardTokensCount = 1; // 5 rewards tokens for tests
    const amount = ethers.utils.parseEther("5184000");
    const stakeLimit = amount;
    const amountToTransfer = ethers.utils.parseEther("10000");
    const bOne = ethers.utils.parseEther("1");
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens
	let throttleRoundBlocks = 10;
	let throttleRoundCap = ethers.utils.parseEther("1");
	const bTen = ethers.utils.parseEther("10")
	const bonusPercet = 10000 // In thousands
    const contractStakeLimit = amount
    

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
		startBlock = currentBlock.number + 15;
		endBlock = startBlock + 20;
		rampUpBlock =  20;
		lockBlock =  30;
	}

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
	
    
        await setupRewardsPoolParameters(deployer)
        LMCFactoryInstance = await deployer.deploy(LMCFactory, {});
    });

    it('should deploy valid rewards pool factory contract', async () => {
        assert.isAddress(LMCFactoryInstance.contractAddress, "The LMCFactory contract was not deployed");
    });

    describe('Deploying Liquidity Mining Campagin', async function () {
        
        beforeEach(async () => {
            stakingTokenInstance = await deployer.deploy(TestERC20, {}, ethers.utils.parseEther("300000"));
            stakingTokenAddress = stakingTokenInstance.contractAddress;

        });

        it('Should deploy the lmc successfully', async () => {
            await stakingTokenInstance.mint(LMCFactoryInstance.contractAddress, amount);
			await rewardTokensInstances[0].mint(LMCFactoryInstance.contractAddress, amount)
            await LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock,rewardTokensAddresses[0], stakeLimit, contractStakeLimit);

            const lmcContract = await LMCFactoryInstance.rewardsPools(0);
			const LMCInstance = await etherlime.ContractAt(LMC, lmcContract);
			const stakingToken = await LMCInstance.stakingToken(); 

			assert.strictEqual(stakingTokenAddress.toLowerCase(), stakingToken.toLowerCase(), "The saved staking token was not the same as the inputted one");
            assert.isAddress(lmcContract, "The lmc contract was not deployed");
        });

        it('Should fail on deploying not from owner', async () => {
            await assert.revert(LMCFactoryInstance.from(bobAccount).deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock,rewardTokensAddresses[0], stakeLimit, contractStakeLimit));
        });

        it('Should fail on deploying with zero address as staking token', async () => {
            await assert.revertWith(LMCFactoryInstance.deploy(ethers.constants.AddressZero, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock,rewardTokensAddresses[0], stakeLimit, contractStakeLimit), "LiquidityMiningCampaignFactory::deploy: Staking token address can't be zero address");
        });
     
        it('Should fail on zero stake limit', async () => {
            await assert.revertWith(LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock,rewardTokensAddresses[0], 0, contractStakeLimit), "LiquidityMiningCampaignFactory::deploy: Stake limit must be more than 0");
        });

        it('Should fail the rewards pool array is empty', async () => {
            await assert.revertWith(LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, [], rewardPerBlock,rewardTokensAddresses[0], stakeLimit, contractStakeLimit), "LiquidityMiningCampaignFactory::deploy: RewardsTokens array could not be empty");
        });
		it('Should fail the rewards pool array and rewards amount arrays are with diffferent length ', async () => {
			rewardPerBlock.push(bOne)
            await assert.revertWith(LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock,rewardTokensAddresses[0], stakeLimit, contractStakeLimit), "LiquidityMiningCampaignFactory::deploy: RewardsTokens and RewardPerBlock should have a matching sizes");
        });
		it('Should fail the rewards has 0 in the array ', async () => {
			let rewardZero = [0]
            await assert.revertWith(LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardZero,rewardTokensAddresses[0], stakeLimit, contractStakeLimit), "LiquidityMiningCampaignFactory::deploy: Reward per block must be greater than zero");
        });

        describe('Whitelisting', async function () {

            beforeEach(async () => {
				await rewardTokensInstances[0].mint(LMCFactoryInstance.contractAddress, amount)
                await LMCFactoryInstance.deploy(stakingTokenInstance.contractAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock, rewardTokensAddresses[0], stakeLimit, contractStakeLimit)
				
				const percentageCalculator = await deployer.deploy(PercentageCalculator);
				libraries = {
					PercentageCalculator: percentageCalculator.contractAddress
				}

                const lmcAddress = await LMCFactoryInstance.rewardsPools(0);
			
                lmcInstance = await etherlime.ContractAt(LMC, lmcAddress);

				let lockScheme = []
				LockSchemeInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, lmcInstance.contractAddress);
				lockScheme.push(LockSchemeInstance.contractAddress);
				
				
				await stakingTokenInstance.mint(lmcInstance.contractAddress, amount);
				await LMCFactoryInstance.setLockSchemesToLMC(lockScheme,lmcInstance.contractAddress);

				await rewardTokensInstances[0].mint(lmcInstance.contractAddress,amount);
				let externalRewardsTokenInstance = await deployer.deploy(TestERC20, {}, amount);
				
				await externalRewardsTokenInstance.mint(treasury.signer.address, amount);
				externalRewardsTokenAddress = externalRewardsTokenInstance.contractAddress;

				NonCompoundingRewardsPoolInstance = await deployer.deploy(
					NonCompoundingRewardsPool,
					{},
					rewardTokensAddresses[0],
					startBlock+5,
					endBlock+10,
					rewardTokensAddresses,
					rewardPerBlock,
					stakeLimit,
					throttleRoundBlocks,
					throttleRoundCap,
					treasury.signer.address,
					externalRewardsTokenAddress, 
                    contractStakeLimit
				);

				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await stakingTokenInstance.approve(lmcInstance.contractAddress, amount);
				await stakingTokenInstance.approve(LMCFactoryInstance.contractAddress, amount);

				await lmcInstance.from(aliceAccount.signer.address).stakeAndLock(bTen,LockSchemeInstance.contractAddress);
				let staked = await lmcInstance.totalStaked();
			});

            it('Should fail transfer if receiver not whitelisted', async () => {
                await assert.revertWith(lmcInstance.exitAndStake(treasury.signer.address), "exitAndTransfer::receiver is not whitelisted");
            });

            it('Should successfully exit and transfer if receiver whitelisted', async () => {
				
				currentBlock = await deployer.provider.getBlock('latest');
				const blocksDelta2 = (endBlock-currentBlock.number);

				for (let i=0; i<blocksDelta2; i++) {
					await mineBlock(deployer.provider);
				}

                await LMCFactoryInstance.enableReceivers(lmcInstance.contractAddress, [NonCompoundingRewardsPoolInstance.contractAddress]);
                await lmcInstance.from(aliceAccount.signer.address).exitAndStake(NonCompoundingRewardsPoolInstance.contractAddress);

				let totalStakedAmount = await NonCompoundingRewardsPoolInstance.totalStaked()
				assert(totalStakedAmount.gt(0), "Total Staked amount is not correct");
            });

            it('Should fail whitelisting if called with wrong params', async () => {
                await assert.revertWith(LMCFactoryInstance.enableReceivers(ethers.constants.AddressZero, [treasury.signer.address]), "enableReceivers::Transferer cannot be 0");
                await assert.revertWith(LMCFactoryInstance.enableReceivers(lmcInstance.contractAddress, [ethers.constants.AddressZero]), "enableReceivers::Receiver cannot be 0");
            });

            it('Should fail whitelisting if not called by the owner', async () => {
                await assert.revertWith(LMCFactoryInstance.from(bobAccount.signer).enableReceivers(lmcInstance.contractAddress, [NonCompoundingRewardsPoolInstance.contractAddress]), "onlyOwner:: The caller is not the owner");
            });
        });

		describe('Extending Rewards', async function () {
            beforeEach(async () => {
                for (i = 0; i < rewardTokensAddresses.length; i++) {
                    await rewardTokensInstances[i].transfer(LMCFactoryInstance.contractAddress, amountToTransfer);
                }
                await LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock, rewardTokensAddresses[0], stakeLimit, contractStakeLimit);
            });

            const calculateRewardsAmount = async (startBlock, endBlock, rewardsPerBlock) => {
                let rewardsPeriod = endBlock - startBlock;
                let rewardsAmount = rewardsPerBlock*(rewardsPeriod)
                let amount = await ethers.utils.bigNumberify(rewardsAmount.toString());
                return amount
             }
                it("Should extend the rewards pool successfully with the same rate", async () => {

					let rewardsPoolLength = await LMCFactoryInstance.getRewardsPoolNumber()
					let lmcAddress = await LMCFactoryInstance.rewardsPools((rewardsPoolLength - 1))
                    const LmcContract = await etherlime.ContractAt(LMC, lmcAddress);
                    const rewardTokenInstance = rewardTokensInstances[0];
                    let rewardsBalanceInitial = await rewardTokenInstance.balanceOf(LmcContract.contractAddress)

                    let currentBlock = await deployer.provider.getBlock('latest');
                    let blocksDelta = (endBlock-currentBlock.number);

                    while (blocksDelta > 10) {
                        await mineBlock(deployer.provider);
                        currentBlock = await deployer.provider.getBlock('latest');
                        blocksDelta = (endBlock-currentBlock.number);
                    }
                    let initialEndBlock = await LmcContract.endBlock();
                    let blockExtension = 20
                    let newEndBlock = initialEndBlock.add(blockExtension)
                    for (i = 0; i < rewardTokensCount; i++) {
                        let amount = rewardPerBlock[i].mul(blockExtension)
                        await rewardTokensInstances[i].transfer(LMCFactoryInstance.contractAddress, amount);
                    }
                    currentBlock = await deployer.provider.getBlock('latest');
                    await LMCFactoryInstance.extendRewardPool(newEndBlock, rewardPerBlock, lmcAddress);
				   
                    let rewardsBalanceFinal = await rewardTokenInstance.balanceOf(LmcContract.contractAddress)
                    let finalEndBlock = await LmcContract.endBlock();
                    let finalRewardPerBlock = await LmcContract.rewardPerBlock(0);
                    let amountToTransfer = rewardPerBlock[0].mul(blockExtension)

                    assert(finalEndBlock.eq(newEndBlock), "The endblock is different");
                    assert(finalRewardPerBlock.eq(rewardPerBlock[0]), "The rewards amount is not correct");
                    assert(rewardsBalanceFinal.eq((rewardsBalanceInitial.add(amountToTransfer))), "The transfered amount is not correct")

                });

                it("Should extend the rewards pool successfully with the half of the rate", async () => {

					let rewardsPoolLength = await LMCFactoryInstance.getRewardsPoolNumber()
					let lmcAddress = await LMCFactoryInstance.rewardsPools((rewardsPoolLength - 1))
                    const LmcContract = await etherlime.ContractAt(RewardsPoolBase, lmcAddress);
                    const rewardTokenInstance = rewardTokensInstances[0];
                    let rewardsBalanceInitial = await rewardTokenInstance.balanceOf(LmcContract.contractAddress)

                    let currentBlock = await deployer.provider.getBlock('latest');
                    let blocksDelta = (endBlock-currentBlock.number);

                    while (blocksDelta > 11) {
                        await mineBlock(deployer.provider);
                        currentBlock = await deployer.provider.getBlock('latest');
                        blocksDelta = (endBlock-currentBlock.number);
                    }
                    let initialEndBlock = await LmcContract.endBlock();
                    let blockExtension = 10
                    let newEndBlock = initialEndBlock.add(blockExtension)
                    currentBlock = await deployer.provider.getBlock('latest');


                    let newRewardPerBlock = []
                    for (i = 0; i < rewardTokensCount; i++) {
                        let newSingleReward = rewardPerBlock[i].div(2)
                        newRewardPerBlock.push(newSingleReward)
          
                    }
                    await LMCFactoryInstance.extendRewardPool(newEndBlock, newRewardPerBlock, lmcAddress);

                    let rewardsBalanceFinal = await rewardTokenInstance.balanceOf(LmcContract.contractAddress)
                    let finalEndBlock = await LmcContract.endBlock();
                    let finalRewardPerBlock = await LmcContract.rewardPerBlock(0);

                    assert(finalEndBlock.eq(newEndBlock), "The endblock is different");
                    assert(finalRewardPerBlock.eq(newRewardPerBlock[0]), "The rewards amount is not correct");
                    assert(rewardsBalanceFinal.eq((rewardsBalanceInitial)), "The transfered amount is not correct")

                });


                it("Should extend the rewards pool successfully with the of the lower rate and return some money", async () => {

					let rewardsPoolLength = await LMCFactoryInstance.getRewardsPoolNumber()
					let lmcAddress = await LMCFactoryInstance.rewardsPools((rewardsPoolLength - 1))
                    const LMCInstance = await etherlime.ContractAt(LMC, lmcAddress);
                    const rewardTokenInstance = rewardTokensInstances[0];
                    let rewardsBalanceInitial = await rewardTokenInstance.balanceOf(LMCInstance.contractAddress)
                    let factoryBalanceInitial = await rewardTokenInstance.balanceOf(LMCFactoryInstance.contractAddress)

                    let currentBlock = await deployer.provider.getBlock('latest');
                    let blocksDelta = (endBlock-currentBlock.number);

                    while (blocksDelta > 11) {
                        await mineBlock(deployer.provider);
                        currentBlock = await deployer.provider.getBlock('latest');
                        blocksDelta = (endBlock-currentBlock.number);
                    }
                    let initialEndBlock = await LMCInstance.endBlock();
                    let blockExtension = 10
                    let newEndBlock = initialEndBlock.add(blockExtension)
                    currentBlock = await deployer.provider.getBlock('latest');
                    let amountToTransfer = []
                    let newRewardPerBlock = []

                    for (i = 0; i < rewardTokensCount; i++) {
                        let newSingleReward = rewardPerBlock[i].div(5)
                        newRewardPerBlock.push(newSingleReward)
                        let currentRemainingReward = await calculateRewardsAmount((currentBlock.number +1),endBlock.toString(),rewardPerBlock[i].toString())
                        let newRemainingReward = await calculateRewardsAmount((currentBlock.number+1) ,newEndBlock.toString(),newSingleReward.toString())

                        amountToTransfer.push(currentRemainingReward.sub(newRemainingReward))
                    }
                    await LMCFactoryInstance.extendRewardPool(newEndBlock, newRewardPerBlock, lmcAddress);
                    let rewardsBalanceFinal = await rewardTokenInstance.balanceOf(lmcAddress)
                    let factoryBalanceFinal = await rewardTokenInstance.balanceOf(LMCFactoryInstance.contractAddress)
                    let finalEndBlock = await LMCInstance.endBlock();
                    let finalRewardPerBlock = await LMCInstance.rewardPerBlock(0);
                    
                    assert(finalEndBlock.eq(newEndBlock), "The endblock is different");
                    assert(finalRewardPerBlock.eq(newRewardPerBlock[0]), "The rewards amount is not correct");
                    assert(rewardsBalanceFinal.eq((rewardsBalanceInitial.sub(amountToTransfer[0]))), "The transfered amount is not correct")
                    assert(factoryBalanceFinal.eq((factoryBalanceInitial.add(amountToTransfer[0]))), "The amount is not transferred to the factory")

                });

                it("Should fail trying to extend from not owner", async() => {
                    let rewardsPoolAddress = await LMCFactoryInstance.rewardsPools(0)
                    let newEndBlock = endBlock + 10
                    await assert.revertWith(LMCFactoryInstance.from(bobAccount.signer.address).extendRewardPool(newEndBlock, rewardPerBlock, rewardsPoolAddress),"onlyOwner:: The caller is not the owner")
                })
			});
    });

});