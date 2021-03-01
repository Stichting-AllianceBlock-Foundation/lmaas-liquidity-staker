const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const LMCFactory = require('../build/LiquidityMiningCampaignFactory.json');
const LMC = require('../build/LiquidityMiningCampaign.json');
const TestERC20 = require('../build/TestERC20.json');
const RewardsPoolBase = require('../build/RewardsPoolBase.json');
const { mineBlock } = require('./utils')
const NonCompoundingRewardsPool = require('../build/NonCompoundingRewardsPool.json');

describe.only('LMC Factory', () => { // These tests must be skipped for coverage as coverage does not support optimizations
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let treasury = accounts[8];
    let deployer;
    let LMCFactoryInstance;
    let stakingTokenInstance;
    let stakingTokenAddress;
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
	let NonCompoundingRewardsPoolInstance;
    

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
		startBlock = currentBlock.number + 10;
		endBlock = startBlock + 20;
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
            await LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock, stakeLimit);

            const lmcContract = await LMCFactoryInstance.rewardsPools(0);
			const LMCInstance = await etherlime.ContractAt(LMC, lmcContract);
			const stakingToken = await LMCInstance.stakingToken(); 

			assert.strictEqual(stakingTokenAddress.toLowerCase(), stakingToken.toLowerCase(), "The saved staking token was not the same as the inputted one");
            assert.isAddress(lmcContract, "The lmc contract was not deployed");
        });

        it('Should fail on deploying not from owner', async () => {
            await assert.revert(LMCFactoryInstance.from(bobAccount).deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock, stakeLimit));
        });

        it('Should fail on deploying with zero address as staking token', async () => {
            await assert.revertWith(LMCFactoryInstance.deploy(ethers.constants.AddressZero, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock, stakeLimit), "LiquidityMiningCampaignFactory::deploy: Staking token address can't be zero address");
        });
     
        it('Should fail if the reward per block array is empty', async () => {
            const errorString = "LiquidityMiningCampaignFactory::deploy: Reward per block must be more than 0"
            await assert.revertWith(LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, [], stakeLimit), errorString);
        });

        it('Should fail on zero stake limit', async () => {
            await assert.revertWith(LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock, 0), "LiquidityMiningCampaignFactory::deploy: Stake limit must be more than 0");
        });


        it('Should fail the rewards pool array is empty', async () => {
            await assert.revertWith(LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, [], rewardPerBlock, stakeLimit), "LiquidityMiningCampaignFactory::deploy: RewardsTokens array could not be empty");
        });
		it('Should fail the rewards pool array and rewards amount arrays are with diffferent length ', async () => {
			rewardPerBlock.push(bOne)
            await assert.revertWith(LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock, stakeLimit), "LiquidityMiningCampaignFactory::deploy: RewardsTokens and RewardPerBlock should have a matching sizes");
        });
		it('Should fail the rewards has 0 in the array ', async () => {
			let rewardZero = [0]
            await assert.revertWith(LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardZero, stakeLimit), "LiquidityMiningCampaignFactory::deploy: Reward per block must be greater than zero");
        });

        describe('Whitelisting', async function () {

            beforeEach(async () => {
                await stakingTokenInstance.mint(LMCFactoryInstance.contractAddress, amount);
                await LMCFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock, stakeLimit)
                const lmcAddress = await LMCFactoryInstance.rewardsPools(0);
                lmcInstance = await etherlime.ContractAt(lmcAddress, LMC);
          
				let lockScheme = []
				LockSchemeInstance = await deployer.deploy(LockScheme, libraries, lockBlock, rampUpBlock, bonusPercet, lmcInstance.contractAddress);
				lockScheme.push(LockSchemeInstance.contractAddress);
		
				await lmcInstance.setLockSchemes(lockScheme);
				await rewardTokensInstances[0].mint(lmcInstance.contractAddress,amount);
				let externalRewardsTokenInstance = await deployer.deploy(TestERC20, {}, amount);
				await externalRewardsTokenInstance.mint(treasury.signer.address, amount);
	
				externalRewardsTokenAddress = externalRewardsTokenInstance.contractAddress;

				NonCompoundingRewardsPoolInstance = await deployer.deploy(
					NonCompoundingRewardsPool,
					{},
					rewardTokensAddresses[0],
					startBlock+2,
					endBlock+2,
					rewardTokensAddresses,
					rewardPerBlock,
					stakeLimit,
					throttleRoundBlocks,
					throttleRoundCap,
					treasury.signer.address,
					externalRewardsTokenAddress
				);

				
				await stakingTokenInstance.approve(LockSchemeInstance.contractAddress, amount);
				await stakingTokenInstance.approve(NewLmcInstance.contractAddress, amount);

				await lmcInstance.stakeAndLock(bTen,LockSchemeInstance.contractAddress);
			});

            it('Should fail transfer if receiver not whitelisted', async () => {
                await assert.revertWith(lmcInstance.exitAndStake(receiver.contractAddress), "exitAndTransfer::receiver is not whitelisted");
            });

            it('Should successfully exit and transfer if receiver whitelisted', async () => {
             

                await LMCFactoryInstance.enableReceivers(lmcInstance.contractAddress, [NonCompoundingRewardsPoolInstance.contractAddress]);
                await lmcInstance.exitAndStake(NonCompoundingRewardsPoolInstance.contractAddress);

				let totalStakedAmount = await NonCompoundingRewardsPoolInstance.totalStaked()
				assert(totalStakedAmount.gt(0), "Total Staked amount is not correct");
            });

            it('Should fail whitelisting if called with wrong params', async () => {
                await assert.revertWith(LMCFactoryInstance.enableReceivers(ethers.constants.AddressZero, [receiver.contractAddress]), "enableReceivers::Transferer cannot be 0");
                await assert.revertWith(LMCFactoryInstance.enableReceivers(lmcInstance.contractAddress, [ethers.constants.AddressZero]), "enableReceivers::Receiver cannot be 0");
            });

            it('Should fail whitelisting if not called by the owner', async () => {
                await assert.revertWith(LMCFactoryInstance.from(bobAccount.signer).enableReceivers(lmcInstance.contractAddress, [NonCompoundingRewardsPoolInstance.contractAddress]), "onlyOwner:: The caller is not the owner");
            });
        });

    });

    
});