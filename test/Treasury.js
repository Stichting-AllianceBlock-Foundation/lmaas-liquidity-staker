const ethers = require('ethers');
const etherlime = require('etherlime-lib');
const NonCompoundingRewardsPool = require('../build/NonCompoundingRewardsPool.json');
const UniswapV2RouterMock = require('../build/UniswapV2RouterMock.json');
const Treasury = require('../build/Treasury.json');
const TestERC20 = require('../build/TestERC20.json');
const { mineBlock } = require('./utils')


describe('Treasury', () => {

	let aliceAccount = accounts[3];
	let bobAccount = accounts[4];
	let carolAccount = accounts[5];
	let treasury = accounts[8];
	let deployer;

	let NonCompoundingRewardsPoolInstance;
	let stakingTokenAddress;
	let externalRewardsTokenAddress;
	let stakingTokenOneInstance;
	let stakingTokenTwoInstance;
	let externalRewardsTokenInstance;

	let rewardTokensInstances;
	let rewardTokensAddresses;
	let rewardPerBlock;

	let startBlock;
	let endBlock;
	let throttleRoundBlocks = 10;
	let throttleRoundCap = ethers.utils.parseEther("1");


	const rewardTokensCount = 1; // 5 rewards tokens for tests
	const day = 60 * 24 * 60;
	const amount = ethers.utils.parseEther("5184000");
	const stakeLimit = amount;
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
			let parsedReward = await ethers.utils.parseEther(`${i + 1}`);
			rewardPerBlock.push(parsedReward);
		}

		const currentBlock = await deployer.provider.getBlock('latest');
		startBlock = currentBlock.number + 5;
		endBlock = startBlock + 100;

	}

	const stake = async (_throttleRoundBlocks, _throttleRoundCap, stakingTokenContract,  treasuryContract) => {
		await setupRewardsPoolParameters(deployer)
		const instance = await deployer.deploy(
			NonCompoundingRewardsPool,
			{},
			stakingTokenContract.contractAddress,
			startBlock,
			endBlock,
			rewardTokensAddresses,
			rewardPerBlock,
			stakeLimit,
			_throttleRoundBlocks,
			_throttleRoundCap,
			treasuryContract.contractAddress,
			externalRewardsTokenAddress,
			contractStakeLimit
		);

		const reward = rewardPerBlock[0].mul(endBlock-startBlock);

		await rewardTokensInstances[0].mint(instance.contractAddress, reward);

		await stakingTokenContract.approve(instance.contractAddress, standardStakingAmount);
		await stakingTokenContract.from(bobAccount.signer).approve(instance.contractAddress, standardStakingAmount);
		let currentBlock = await deployer.provider.getBlock('latest');
		let blocksDelta = (startBlock - currentBlock.number);

		for (let i = 0; i < blocksDelta; i++) {
			await mineBlock(deployer.provider);
		}
		await instance.stake(standardStakingAmount);

		return instance;


	}

	xdescribe("Interaction Mechanics", async function () {

		let instanceOne;
		let instanceTwo;
		let treasuryInstance;
		let uniswapRouterMock;

		beforeEach(async () => {
			deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);

			uniswapRouterMock = await deployer.deploy(UniswapV2RouterMock, {});
			stakingTokenOneInstance = await deployer.deploy(TestERC20, {}, amount);

			await stakingTokenOneInstance.mint(aliceAccount.signer.address, amount);
			await stakingTokenOneInstance.mint(bobAccount.signer.address, amount);

			stakingTokenTwoInstance = await deployer.deploy(TestERC20, {}, amount);

			await stakingTokenTwoInstance.mint(aliceAccount.signer.address, amount);
			await stakingTokenTwoInstance.mint(bobAccount.signer.address, amount);

			externalRewardsTokenInstance = await deployer.deploy(TestERC20, {}, amount);
			await externalRewardsTokenInstance.mint(treasury.signer.address, amount);

			externalRewardsTokenAddress = externalRewardsTokenInstance.contractAddress;

			treasuryInstance = await deployer.deploy(Treasury, {}, uniswapRouterMock.contractAddress, externalRewardsTokenAddress);

			instanceOne = await stake(throttleRoundBlocks, throttleRoundCap, stakingTokenOneInstance, treasuryInstance);
			instanceTwo = await stake(throttleRoundBlocks, throttleRoundCap, stakingTokenTwoInstance, treasuryInstance);
		});

		it("Should withdraw liquidity", async () => {
			const balanceOneBefore = await stakingTokenOneInstance.balanceOf(instanceOne.contractAddress);
			const balanceTwoBefore = await stakingTokenTwoInstance.balanceOf(instanceTwo.contractAddress);
			await treasuryInstance.withdrawLiquidity([instanceOne.contractAddress, instanceTwo.contractAddress], [bOne, bOne.mul(2)]);
			const balanceOneAfter = await stakingTokenOneInstance.balanceOf(instanceOne.contractAddress);
			const balanceTwoAfter = await stakingTokenTwoInstance.balanceOf(instanceTwo.contractAddress);

			const treasuryBalanceOne = await stakingTokenOneInstance.balanceOf(treasuryInstance.contractAddress);
			const treasuryBalanceTwo = await stakingTokenTwoInstance.balanceOf(treasuryInstance.contractAddress);

			assert(balanceOneBefore.eq(balanceOneAfter.add(bOne)), "The liquidity was not drawn");
			assert(balanceTwoBefore.eq(balanceTwoAfter.add(bOne.mul(2))), "The liquidity was not drawn");
			assert(treasuryBalanceOne.eq(bOne), "The liquidity was not drawn");
			assert(treasuryBalanceTwo.eq(bOne.mul(2)), "The liquidity was not drawn");
		})

		it("Should provide liquidity to Uniswap", async () => {
			await treasuryInstance.withdrawLiquidity([instanceOne.contractAddress, instanceTwo.contractAddress], [bOne, bOne.mul(2)]);
			const balanceBefore = await stakingTokenOneInstance.balanceOf(treasuryInstance.contractAddress);
			const balanceTwoBefore = await stakingTokenTwoInstance.balanceOf(treasuryInstance.contractAddress);
			await treasuryInstance.addUniswapLiquidity(stakingTokenOneInstance.contractAddress, stakingTokenTwoInstance.contractAddress, bOne, bOne, bOne, bOne, 0);
			const balanceAfter = await stakingTokenOneInstance.balanceOf(treasuryInstance.contractAddress);
			const balanceTwoAfter = await stakingTokenTwoInstance.balanceOf(treasuryInstance.contractAddress);

			const lpTokenContractAddress = await uniswapRouterMock.lpToken();
			const lpTokenInstance = await etherlime.ContractAt(TestERC20, lpTokenContractAddress);

			const lpTokenBalance = await lpTokenInstance.balanceOf(treasuryInstance.contractAddress);

			assert(balanceAfter.eq(balanceBefore.sub(bOne)), "The liquidity was not provided");
			assert(balanceTwoAfter.eq(balanceTwoBefore.sub(bOne)), "The liquidity was not provided");
			assert(lpTokenBalance.eq(bOne), "The liquidity tokens were not provided");
		})

		it("Should remove liquidity from Uniswap", async () => {
			await treasuryInstance.withdrawLiquidity([instanceOne.contractAddress, instanceTwo.contractAddress], [bOne, bOne.mul(2)]);
			await treasuryInstance.addUniswapLiquidity(stakingTokenOneInstance.contractAddress, stakingTokenTwoInstance.contractAddress, bOne, bOne, bOne, bOne, 0);

			const lpTokenContractAddress = await uniswapRouterMock.lpToken();

			await treasuryInstance.removeUniswapLiquidity(stakingTokenOneInstance.contractAddress, stakingTokenTwoInstance.contractAddress, lpTokenContractAddress, bOne, bOne, bOne, 0);

			const balanceAfter = await stakingTokenOneInstance.balanceOf(treasuryInstance.contractAddress);
			const balanceTwoAfter = await stakingTokenTwoInstance.balanceOf(treasuryInstance.contractAddress);

			assert(balanceAfter.eq(bOne), "The liquidity was not returned");
			assert(balanceTwoAfter.eq(bOne.mul(2)), "The liquidity was not returned");
		})

		it("Should withdraw some tokens", async () => {
			await treasuryInstance.withdrawLiquidity([instanceOne.contractAddress, instanceTwo.contractAddress], [bOne, bOne.mul(2)]);
			await treasuryInstance.addUniswapLiquidity(stakingTokenOneInstance.contractAddress, stakingTokenTwoInstance.contractAddress, bOne, bOne, bOne, bOne, 0);

			const lpTokenContractAddress = await uniswapRouterMock.lpToken();
			await treasuryInstance.removeUniswapLiquidity(stakingTokenOneInstance.contractAddress, stakingTokenTwoInstance.contractAddress, lpTokenContractAddress, bOne, bOne, bOne, 0);

			const ownerBalanceBefore = await stakingTokenTwoInstance.balanceOf(aliceAccount.signer.address);

			await treasuryInstance.withdrawToken(stakingTokenTwoInstance.contractAddress, bOne);

			const balanceAfter = await stakingTokenOneInstance.balanceOf(treasuryInstance.contractAddress);
			const balanceTwoAfter = await stakingTokenTwoInstance.balanceOf(treasuryInstance.contractAddress);
			const ownerBalanceAfter = await stakingTokenTwoInstance.balanceOf(aliceAccount.signer.address);

			assert(balanceAfter.eq(bOne), "The liquidity was drawn but should not have");
			assert(balanceTwoAfter.eq(bOne), "The liquidity was not withdrawn");
			assert(ownerBalanceAfter.eq(ownerBalanceBefore.add(bOne)), "The owner liquidity did not increase");
		})

		it("Return liquidity without external reward", async () => {
			await treasuryInstance.withdrawLiquidity([instanceOne.contractAddress, instanceTwo.contractAddress], [bOne, bOne.mul(2)]);
			await treasuryInstance.addUniswapLiquidity(stakingTokenOneInstance.contractAddress, stakingTokenTwoInstance.contractAddress, bOne, bOne, bOne, bOne, 0);

			const lpTokenContractAddress = await uniswapRouterMock.lpToken();
			await treasuryInstance.removeUniswapLiquidity(stakingTokenOneInstance.contractAddress, stakingTokenTwoInstance.contractAddress, lpTokenContractAddress, bOne, bOne, bOne, 0);

			const balanceOneBefore = await stakingTokenOneInstance.balanceOf(instanceOne.contractAddress);
			const balanceTwoBefore = await stakingTokenTwoInstance.balanceOf(instanceTwo.contractAddress);

			await treasuryInstance.returnLiquidity([instanceOne.contractAddress, instanceTwo.contractAddress], [0, 0]);

			const balanceTreasuryAfter = await stakingTokenOneInstance.balanceOf(treasuryInstance.contractAddress);
			const balanceTreasuryTwoAfter = await stakingTokenTwoInstance.balanceOf(treasuryInstance.contractAddress);

			assert(balanceTreasuryAfter.eq(0), "The liquidity taken from the treasury");
			assert(balanceTreasuryTwoAfter.eq(0), "The liquidity was not taken from the treasury");

			const balanceOneAfter = await stakingTokenOneInstance.balanceOf(instanceOne.contractAddress);
			const balanceTwoAfter = await stakingTokenTwoInstance.balanceOf(instanceTwo.contractAddress);

			assert(balanceOneAfter.eq(balanceOneBefore.add(bOne)), "The liquidity was not returned to the first contract");
			assert(balanceTwoAfter.eq(balanceTwoBefore.add(bOne.mul(2))), "TThe liquidity was not returned to the second contract");
		})

		it("Return liquidity without external reward", async () => {
			await externalRewardsTokenInstance.mint(treasuryInstance.contractAddress, bOne.mul(10));
			await treasuryInstance.withdrawLiquidity([instanceOne.contractAddress, instanceTwo.contractAddress], [bOne, bOne.mul(2)]);
			await treasuryInstance.addUniswapLiquidity(stakingTokenOneInstance.contractAddress, stakingTokenTwoInstance.contractAddress, bOne, bOne, bOne, bOne, 0);

			const lpTokenContractAddress = await uniswapRouterMock.lpToken();
			await treasuryInstance.removeUniswapLiquidity(stakingTokenOneInstance.contractAddress, stakingTokenTwoInstance.contractAddress, lpTokenContractAddress, bOne, bOne, bOne, 0);

			const balanceOneBefore = await stakingTokenOneInstance.balanceOf(instanceOne.contractAddress);
			const balanceTwoBefore = await stakingTokenTwoInstance.balanceOf(instanceTwo.contractAddress);

			await treasuryInstance.returnLiquidity([instanceOne.contractAddress, instanceTwo.contractAddress], [bOne.mul(3), bOne.mul(4)]);

			const balanceTreasuryAfter = await stakingTokenOneInstance.balanceOf(treasuryInstance.contractAddress);
			const balanceTreasuryTwoAfter = await stakingTokenTwoInstance.balanceOf(treasuryInstance.contractAddress);

			assert(balanceTreasuryAfter.eq(0), "The liquidity taken from the treasury");
			assert(balanceTreasuryTwoAfter.eq(0), "The liquidity was not taken from the treasury");

			const balanceOneAfter = await stakingTokenOneInstance.balanceOf(instanceOne.contractAddress);
			const balanceTwoAfter = await stakingTokenTwoInstance.balanceOf(instanceTwo.contractAddress);

			assert(balanceOneAfter.eq(balanceOneBefore.add(bOne)), "The liquidity was not returned to the first contract");
			assert(balanceTwoAfter.eq(balanceTwoBefore.add(bOne.mul(2))), "TThe liquidity was not returned to the second contract");

			const externalTokenBalanceOne = await externalRewardsTokenInstance.balanceOf(instanceOne.contractAddress);
			const externalTokenBalanceTwo = await externalRewardsTokenInstance.balanceOf(instanceTwo.contractAddress);

			assert(externalTokenBalanceOne.eq(bOne.mul(3)), "The external reward was not given to the first contract");
			assert(externalTokenBalanceTwo.eq(bOne.mul(4)), "TThe external reward was not given to the second contract");
		})

	})

});