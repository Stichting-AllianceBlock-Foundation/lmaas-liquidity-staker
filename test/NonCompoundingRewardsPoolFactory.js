const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const NonCompoundingRewardsPoolFactory = require('../build/NonCompoundingRewardsPoolFactory.json');
const TestERC20 = require('../build/TestERC20.json');
const RewardsPoolBase = require('../build/RewardsPoolBase.json');
const { mineBlock } = require('./utils')

describe('NonCompoundingRewardsPoolFactory', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
    let deployer;
    let NonCompoundingRewardsPoolFactoryInstance;
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
        NonCompoundingRewardsPoolFactoryInstance = await deployer.deploy(NonCompoundingRewardsPoolFactory, {});
    });

    it('should deploy valid rewards pool factory contract', async () => {
        assert.isAddress(NonCompoundingRewardsPoolFactoryInstance.contractAddress, "The NonCompoundingRewardsPoolFactory contract was not deployed");

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
                await rewardTokensInstances[i].transfer(NonCompoundingRewardsPoolFactoryInstance.contractAddress, amountToTransfer);
            }
            await NonCompoundingRewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses, rewardPerBlock, stakeLimit, 10, stakeLimit);

            const firstRewardsPool = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools(0);
			const RewardsPoolContract = await etherlime.ContractAt(RewardsPoolBase, firstRewardsPool);
			const stakingToken = await  RewardsPoolContract.stakingToken(); 

			assert.strictEqual(stakingTokenAddress.toLowerCase(), stakingToken.toLowerCase(), "The saved staking token was not the same as the inputted one");
            assert.isAddress(firstRewardsPool, "The staking reward contract was not deployed");
        });

        it('Should deploy the rewards pool contract with the correct data', async() => {
			
			
            for (i = 0; i < rewardTokensAddresses.length; i++) {
                await rewardTokensInstances[i].transfer(NonCompoundingRewardsPoolFactoryInstance.contractAddress, amountToTransfer);
            }
            await NonCompoundingRewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock, stakeLimit, 10, stakeLimit);
			let rewardsPoolLength = await NonCompoundingRewardsPoolFactoryInstance.getRewardsPoolNumber()
			let rewardsPoolAddress = await NonCompoundingRewardsPoolFactoryInstance.rewardsPools((rewardsPoolLength - 1) )

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
        });

        it('Should fail on deploying not from owner', async () => {
            await assert.revert(NonCompoundingRewardsPoolFactoryInstance.from(bobAccount).deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock, stakeLimit, 10, stakeLimit));
        });

        it('Should fail on deploying with zero address as staking token', async () => {
            await assert.revertWith(NonCompoundingRewardsPoolFactoryInstance.deploy(ethers.constants.AddressZero, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock, stakeLimit, 10, stakeLimit), "NonCompoundingRewardsPoolFactory::deploy: Staking token address can't be zero address");
        });
     

        it('Should fail on deploying with empty token and reward arrays', async () => {
            const errorString = "NonCompoundingRewardsPoolFactory::deploy: RewardsTokens array could not be empty"
            const errorStringMatchingSizes = "NonCompoundingRewardsPoolFactory::deploy: RewardsTokens and RewardPerBlock should have a matching sizes"
            await assert.revertWith(NonCompoundingRewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, [],rewardPerBlock, stakeLimit, 10, stakeLimit), errorString);
            await assert.revertWith(NonCompoundingRewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,[], stakeLimit, 10, stakeLimit), errorStringMatchingSizes);
        });

        it('Should fail if the reward amount is not greater than zero', async () => {
            const errorString = "NonCompoundingRewardsPoolFactory::deploy: Reward token address could not be invalid"
            await assert.revertWith(NonCompoundingRewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, [ethers.constants.AddressZero],rewardPerBlock, stakeLimit, 10, stakeLimit), errorString);
        });

        it('Should fail if the reward token amount is invalid address', async () => {
            const errorString = "NonCompoundingRewardsPoolFactory::deploy: Reward per block must be greater than zero"
            await assert.revertWith(NonCompoundingRewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,[0], stakeLimit, 10, stakeLimit), errorString);
        });

        it('Should fail on deploying with no stake limit', async () => {
            await assert.revertWith(NonCompoundingRewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock, 0, 10, stakeLimit), "NonCompoundingRewardsPoolFactory::deploy: Stake limit must be more than 0");
        });

        it('Should fail on deploying with wrong throttle params', async () => {
            await assert.revertWith(NonCompoundingRewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock, stakeLimit, 0, stakeLimit), "NonCompoundingRewardsPoolFactory::deploy: Throttle round blocks must be more than 0");
            await assert.revertWith(NonCompoundingRewardsPoolFactoryInstance.deploy(stakingTokenAddress, startBlock, endBlock, rewardTokensAddresses,rewardPerBlock, stakeLimit, 10, 0), "NonCompoundingRewardsPoolFactory::deploy: Throttle round cap must be more than 0");
        });

    });
});