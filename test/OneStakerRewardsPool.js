const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const OneStakerRewardsPool = require('../build/OneStakerRewardsPoolMock.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')

describe('OneStakerRewardsPool', () => {
    let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
    let carolAccount = accounts[5];
	let staker = aliceAccount;
    let deployer;

    let OneStakerRewardsPoolInstance;
    let stakingTokenAddress;

    let rewardTokensInstances;
    let rewardTokensAddresses;
	let rewardPerBlock;

	let startBlock;
	let endBlock;


    const rewardTokensCount = 1; // 5 rewards tokens for tests
    const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const stakeLimit = ethers.constants.MaxUint256;
	const bOne = ethers.utils.parseEther("1");
	const standardStakingAmount = ethers.utils.parseEther('5') // 5 tokens
	const contractStakeLimit = ethers.utils.parseEther('10') // 10 tokens


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
		startBlock = currentBlock.number + 5;
		endBlock = startBlock + 20;

	}

    beforeEach(async () => {
		deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
		
		
		stakingTokenInstance = await deployer.deploy(TestERC20, {}, amount);
		await stakingTokenInstance.mint(aliceAccount.signer.address,amount);
		await stakingTokenInstance.mint(bobAccount.signer.address,amount);
		

        stakingTokenAddress = stakingTokenInstance.contractAddress;

        await setupRewardsPoolParameters(deployer)

        OneStakerRewardsPoolInstance = await deployer.deploy(
            OneStakerRewardsPool,
            {},
            stakingTokenAddress,
			startBlock,
			endBlock,
            rewardTokensAddresses,
            rewardPerBlock,
			stakeLimit,
			staker.signer.address,
			contractStakeLimit
		);

		await rewardTokensInstances[0].mint(OneStakerRewardsPoolInstance.contractAddress,amount);
	});

	it("Should deploy the OneStakerRewardsPool properly", async() => {
		assert.isAddress(OneStakerRewardsPoolInstance.contractAddress, "The OneStakerRewardsPool contract was not deployed");
		const stakerAddress = await OneStakerRewardsPoolInstance.staker();

		assert.equal(stakerAddress, staker.signer.address, "The saved staker address");

	});

	describe("Staking", function() {

		beforeEach(async () => {
			await stakingTokenInstance.approve(OneStakerRewardsPoolInstance.contractAddress, standardStakingAmount);
			await stakingTokenInstance.from(bobAccount.signer).approve(OneStakerRewardsPoolInstance.contractAddress, standardStakingAmount);
			const currentBlock = await deployer.provider.getBlock('latest');
			const blocksDelta = (startBlock-currentBlock.number);

			for (let i=0; i<blocksDelta; i++) {
				await mineBlock(deployer.provider);
			}
		});

		it("Should successfully stake and accumulate reward", async() => {
				
			await OneStakerRewardsPoolInstance.from(staker.signer).stake(standardStakingAmount);
			const totalStakedAmount = await OneStakerRewardsPoolInstance.totalStaked();
			const userInfo = await OneStakerRewardsPoolInstance.userInfo(aliceAccount.signer.address)
			const userRewardDebt = await OneStakerRewardsPoolInstance.getUserRewardDebt(aliceAccount.signer.address, 0);
			const userOwedToken = await OneStakerRewardsPoolInstance.getUserOwedTokens(aliceAccount.signer.address, 0);

			assert(totalStakedAmount.eq(standardStakingAmount), "The stake was not successful")
			assert(userInfo.amountStaked.eq(standardStakingAmount), "User's staked amount is not correct")
			assert(userInfo.firstStakedBlockNumber.eq(startBlock+1), "User's first block is not correct")
			assert(userRewardDebt.eq(0), "User's reward debt is not correct")
			assert(userOwedToken.eq(0), "User's reward debt is not correct")

			await mineBlock(deployer.provider);

			const accumulatedReward = await OneStakerRewardsPoolInstance.getUserAccumulatedReward(staker.signer.address, 0);
			assert(accumulatedReward.eq(bOne), "The reward accrued was not 1 token");
		})

		it("Should fail if amount to stake is not greater than zero", async() => {
			await assert.revertWith(OneStakerRewardsPoolInstance.from(bobAccount.signer).stake(standardStakingAmount), "onlyStaker::incorrect staker");
		})

	})


});