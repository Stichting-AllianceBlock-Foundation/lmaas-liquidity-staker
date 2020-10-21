const ethers = require('ethers');
const ALBTStakerSDK = require('./../src/sdk');
const BigNumber = require('bignumber.js');

const contractsConfig = {
	uniswap: {
		pairs: [
			"ETH-DAI",
			"WETH-DAI",
			"ETH-USDC",
			"WETH-USDC",
			"ETH-UNI",
			"WETH-UNI",
			"UNI-DAI",
			"UNI-USDC"
		],
		poolTokens: {
			"ETH-DAI": "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
			"WETH-DAI": "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
			"ETH-USDC": "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
			"WETH-USDC": "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
			"ETH-UNI": "0xd3d2e2692501a5c9ca623199d38826e513033a17",
			"WETH-UNI": "0xd3d2e2692501a5c9ca623199d38826e513033a17",
			"UNI-DAI": "0xf00e80f0de9aea0b33aa229a4014572777e422ee",
			"UNI-USDC": "0xebfb684dd2b01e698ca6c14f10e4f289934a54d6"
		},
		rewardContracts: {
			"ETH-DAI": "0xa1484C3aa22a66C62b77E0AE78E15258bd0cB711"
		},
	},
	tokenContracts: {
		"WETH": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
		"DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
		"UNI": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
		"USDC": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
	},
	balancer: {
		poolContracts: {
			"DAI-ETH": "0x99e582374015c1d2f3c0f98d0763b4b1145772b7"
		}
	}
}

const run = async () => {

	// Setting up the test
	// This is the pair tokens that we are going to pool
	const tokenA = 'ETH'
	const tokenB = 'DAI'

	const tokenAAmount = ethers.utils.parseEther('0.01').toString(10) // We only know one of the amounts we want to pool and the other one will be calculated

	// Set up the provider. With Metamask it would be Web3Provider
	// const mainnetProvider = new ethers.providers.InfuraProvider(1, '40c2813049e44ec79cb4d7e0d18de173')
	const localProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545') // Using local provider in order not to spend money	

	// Set up the sdk
	const sdk = new ALBTStakerSDK(localProvider, contractsConfig, true)

	// Set up the user wallet
	let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, localProvider)

	const tokenABalance = await sdk.getBalance(wallet, tokenA);
	console.log(tokenABalance.toString())
	if (tokenABalance.lt(tokenAAmount)) {
		throw new Error(`Not enough ${tokenA} for this liquidity provision`)
	}

	// Get the amount of token B based on how much you input for token A
	const tokenBAmountInfo = await sdk.getUniswapPairOtherTokenAmount(tokenA, tokenB, tokenAAmount)
	console.log("Counter token info", tokenBAmountInfo)

	// Parse it into "wei"
	const tokenBAmount = ethers.utils.parseUnits(tokenBAmountInfo.tokenAmount, tokenBAmountInfo.tokenInfo.decimals).toString()

	// Check if you have enough balance
	const tokenBBalance = await sdk.getBalance(wallet, tokenB);
	if (tokenBBalance.lt(tokenBAmount)) {
		throw new Error(`Not enough ${tokenB} for this liquidity provision`)
	}

	// Get how many Liquidity pool tokens do you have now
	const LPTokensBefore = await sdk.getUniswapPoolTokenBalance(wallet, tokenA, tokenB);
	console.log("Liqudity Pool Tokens before addition", ethers.utils.formatEther(LPTokensBefore.toString(10)))

	// Check if you have enough approval for tokenA
	const tokenAApproval = await sdk.getUniswapRouterTokenApproval(wallet, tokenA);

	console.log(`${tokenA} Approval`, tokenAApproval.toString(10))

	// Approving if no enough approval for the liquidity provision
	if (tokenAApproval.lt(tokenAAmount)) {
		console.log(`Not enough approval for ${tokenA}`);
		const approveTransaction = await sdk.approveUniswapRouterForToken(wallet, tokenA);
		console.log("Approval Transaction", approveTransaction.hash)
		const approveReceipt = await approveTransaction.wait();
		console.log("Approval transaction status", approveReceipt.status); // should be 1
	}

	// Check if you have enough approval for tokenB
	const tokenBApproval = await sdk.getUniswapRouterTokenApproval(wallet, tokenB);

	console.log(`${tokenB} Approval`, tokenBApproval.toString(10))

	// Approving if no enough approval for the liquidity provision
	if (tokenBApproval.lt(tokenBAmount)) {
		console.log(`Not enough approval for ${tokenB}`);
		const approveTransaction = await sdk.approveUniswapRouterForToken(wallet, tokenB);
		console.log("Approval Transaction", approveTransaction.hash)
		const approveReceipt = await approveTransaction.wait();
		console.log("Approval transaction status", approveReceipt.status); // should be 1
	}

	// Providing Uniswap Liquidity
	const transaction = await sdk.addUniswapLiquidity(wallet, tokenA, tokenB, tokenAAmount, tokenBAmount)

	console.log("Add liqudity transaction", transaction.hash)

	const receipt = await transaction.wait();
	console.log("Add liquidity transaction status", receipt.status); // should be 1

	// Checking the new LP Tokens balance
	const LPTokensAfter = await sdk.getUniswapPoolTokenBalance(wallet, tokenA, tokenB);
	console.log("Liqudity Pool Tokens after addition", ethers.utils.formatEther(LPTokensAfter.toString(10)))

	// Staking LP Tokens
	const stakeTokenA = "ETH"
	const stakeTokenB = "DAI"
	const stakingPool = `${stakeTokenA}-${stakeTokenB}`

	const amountToStake = ethers.utils.parseEther('0.1')

	const stake = await sdk.stake(wallet, contractsConfig.uniswap.rewardContracts[stakingPool], amountToStake, "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11")
	console.log('Stake transaction', stake.hash)

	//Getting Pool reward
	const rewardRate = await sdk.getPoolRate(wallet, contractsConfig.uniswap.rewardContracts[stakingPool])
	console.log("The Pool reward rate", ethers.utils.formatEther(rewardRate.toString()))

	const currentReward = await sdk.getCurrentReward(wallet, contractsConfig.uniswap.rewardContracts[stakingPool])
	// const currentRewardBN = ethers.utils.bigNumberify(currentReward);
	const currentRewardBN = ethers.utils.parseEther(currentReward)
	console.log("Current Rewards of user", currentReward);

	//Claim rewards
	let balanceBeforeClaim = await sdk.getStakingTokensBalance(wallet, contractsConfig.tokenContracts["UNI"]);
	let balanceBeforeClaimBN = ethers.utils.parseEther(balanceBeforeClaim)
	console.log("Balance before Claim", balanceBeforeClaim)

	const claimReward = await sdk.claimRewards(wallet, contractsConfig.uniswap.rewardContracts[stakingPool])
	console.log("Claim rewards transaction", claimReward.hash)
	claimReward.wait();

	let balanceAfterClaim = await sdk.getStakingTokensBalance(wallet, contractsConfig.tokenContracts["UNI"]);
	let balanceAfterClaimBN = ethers.utils.parseEther(balanceAfterClaim)
	console.log("Balance after Claim", balanceAfterClaim.toString())

	if (!balanceAfterClaimBN.gt(balanceBeforeClaimBN)) {
		console.log("Usuccessful Claim")
	}
	
	//Withdraw
	balanceBeforeClaim = await sdk.getStakingTokensBalance(wallet, contractsConfig.tokenContracts["UNI"]);
	balanceBeforeClaimBN = ethers.utils.parseEther(balanceBeforeClaim)

	let withdraw = await sdk.withdraw(wallet,contractsConfig.uniswap.rewardContracts[stakingPool])
	console.log("Withdraw transaction", withdraw.hash)
	withdraw.wait();

	

	balanceAfterClaim = await sdk.getStakingTokensBalance(wallet, contractsConfig.tokenContracts["UNI"]);
	balanceAfterClaimBN = ethers.utils.parseEther(balanceAfterClaim)

	if (!balanceAfterClaimBN.gt(balanceBeforeClaimBN)) {
		console.log("Usuccessful withdraw")
	}

	// Providing Balancer DAI Liquidity

	const balancerTokenA = "DAI"
	const balancerTokenB = "ETH"
	const balancerPool = `${balancerTokenA}-${balancerTokenB}`

	const allowanceTx = await sdk.getBalancerPoolAllowance(wallet, contractsConfig.tokenContracts.DAI, contractsConfig.balancer.poolContracts[balancerPool])
	console.log("Allowance:", allowanceTx.toString())
	let tokenAmounBN = ethers.utils.bigNumberify(tokenAAmount)

	if (allowanceTx.lt(tokenAmounBN)) {

		const approveTx = await sdk.approveToken(wallet, contractsConfig.tokenContracts.DAI, contractsConfig.balancer.poolContracts[balancerPool])
		console.log("Approving pool for token. Tx hash: ", approveTx.hash)

		let approveTxReceipt = await approveTx.wait();
		console.log("Result from approving -", approveTxReceipt.status)

	}

	const addLiquidity = await sdk.addBalancerLiquidity(wallet, contractsConfig.tokenContracts.DAI, tokenAAmount, contractsConfig.balancer.poolContracts[balancerPool])
	console.log("Add Liquidity Tx hash:", addLiquidity.hash)

	const poolBalance = await sdk.getBPoolBalance(wallet, contractsConfig.balancer.poolContracts[balancerPool])
	console.log("BAL balance: ", poolBalance.toString())

	
	const removeLiquidity = await sdk.removeBalancerLiquidity(wallet,contractsConfig.tokenContracts.DAI,tokenAAmount,contractsConfig.balancer.poolContracts[balancerPool] )
	console.log("Remove Liquidity Tx hash:", removeLiquidity.hash)

}

run()