const ethers = require('ethers');
const {
	Token,
	WETH,
	Fetcher,
	Route,
	Trade,
	TokenAmount,
	TradeType,
	Percent
} = require('@uniswap/sdk')
const BigNumber = require('bignumber.js');
const math = require('./mathUtils.js')
const uniswapRouterABI = require('./UniswapRouterABI.json');
const balancerBPoolContractABI = require('./BalancerBPoolABI.json')
const ERC20ABI = require('./ERC20.json')
const stakingRewaradsContractABI = require('./StakingRewards.json');
const BALANCE_BUFFER = 0.01;

const uniswapV2RouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

class ALBTStakerSDK {

	constructor(provider, contractsConfig, debug) {
		this.provider = provider;
		this.contractsConfig = contractsConfig;
		this.debug = debug;
	}

	async getUniswapPairOtherTokenAmount(tokenAName, tokenBName, tokenAAmount) {
		const network = await this.provider.getNetwork()
		if (this.debug) {
			console.log(network);
		}

		const tokenA = await this._getUniswapTokenByName(tokenAName);
		const tokenB = await this._getUniswapTokenByName(tokenBName);

		const pair = await Fetcher.fetchPairData(tokenB, tokenA)
		const route = new Route([pair], tokenA)

		const trade = new Trade(route, new TokenAmount(tokenA, tokenAAmount), TradeType.EXACT_INPUT)

		if (this.debug) {
			console.log("Execution Price:", trade.executionPrice.toSignificant(6))
		}

		return {
			tokenAmount: trade.outputAmount.toFixed().toString(),
			tokenInfo: tokenB
		}; // TODO Non HR output amount ?
	}

	async getUniswapRouterTokenApproval(wallet, tokenName) {
		if (this.isETH(tokenName)) {
			return ethers.constants.MaxUint256
		}
		const token = await this._getUniswapTokenByName(tokenName);
		const tokenContract = new ethers.Contract(token.address, ERC20ABI, wallet);
		return tokenContract.allowance(wallet.address, uniswapV2RouterAddress)
	}

	async approveUniswapRouterForToken(wallet, tokenName) {
		if (this.isETH(tokenName)) {
			throw new Error("No need to approve for ETH")
		}
		const token = await this._getUniswapTokenByName(tokenName);
		const tokenContract = new ethers.Contract(token.address, ERC20ABI, wallet);
		return tokenContract.approve(uniswapV2RouterAddress, ethers.constants.MaxUint256)
	}

	async addUniswapLiquidity(wallet, tokenAName, tokenBName, tokenAAmount, tokenBAmount) {

		const routerContract = new ethers.Contract(uniswapV2RouterAddress, uniswapRouterABI, wallet)

		// Default Slippage is 0.5%
		const tokenAAmountBN = ethers.utils.bigNumberify(tokenAAmount);
		const tokenAAmountBNSlip = tokenAAmountBN.mul(50).div(10000)
		const tokenAAmountMinBN = tokenAAmountBN.sub(tokenAAmountBNSlip)

		const tokenBAmountBN = ethers.utils.bigNumberify(tokenBAmount);
		const tokenBAmountBNSlip = tokenBAmountBN.mul(50).div(10000)
		const tokenBAmountMinBN = tokenBAmountBN.sub(tokenBAmountBNSlip)


		console.log("Token A", tokenAAmountBN.toString(), tokenAAmountMinBN.toString())
		console.log("Token B", tokenBAmountBN.toString(), tokenBAmountMinBN.toString())

		const deadline = Math.floor(Date.now() / 1000) + (60 * 60)

		let transaction;

		if (this.isETH(tokenAName)) {

			const tokenB = await this._getUniswapTokenByName(tokenBName);
			console.log(tokenB)
			console.log(tokenBAmountBN.toString())
			transaction = await routerContract.addLiquidityETH(tokenB.address, tokenBAmountBN, tokenBAmountMinBN, tokenAAmountMinBN, wallet.address, deadline, {
				value: tokenAAmountBN
			})

		} else {
			const tokenA = await this._getUniswapTokenByName(tokenAName);
			const tokenB = await this._getUniswapTokenByName(tokenBName);
			transaction = await routerContract.addLiquidity(tokenA.address, tokenB.address, tokenAAmountBN, tokenBAmountBN, tokenAAmountMinBN, tokenBAmountMinBN, wallet.address, deadline);
		}

		return transaction;
	}

	//TODO
	async removeUniswapLiquidity(wallet, ) {

	}

	async getBalance(wallet, tokenName) {
		if (this.isETH(tokenName)) {
			return wallet.getBalance()
		}

		const token = await this._getUniswapTokenByName(tokenName);
		const tokenContract = new ethers.Contract(token.address, ERC20ABI, wallet)

		const walletAddress = await wallet.getAddress();

		return tokenContract.balanceOf(walletAddress)
	}

	async getUniswapPoolTokenBalance(wallet, tokenAName, tokenBName) {
		const poolTokenAddress = this._getUniswapPairPoolToken(tokenAName, tokenBName);
		const tokenContract = new ethers.Contract(poolTokenAddress, ERC20ABI, wallet)

		const walletAddress = await wallet.getAddress();

		return tokenContract.balanceOf(walletAddress)
	}

	async addBalancerLiquidity(wallet, tokenAddress, tokenAmountIn, poolAddress) {
		const poolContract = new ethers.Contract(poolAddress, balancerBPoolContractABI, wallet);


		const tokenAmountInBN = ethers.utils.bigNumberify(tokenAmountIn);
		const tokenAmountBNSlip = tokenAmountInBN.mul(50).div(10000);

		const poolTokens = await this._calculatePoolTokens(tokenAmountIn, tokenAddress, wallet, poolAddress)
		const minPoolAMountOut = this._calculateMinAmountOut(poolTokens);
		let transaction = await poolContract.joinswapExternAmountIn(tokenAddress, tokenAmountInBN, minPoolAMountOut);

		return transaction;
	}

	//TODO add max pool amount it
	async removeBalancerLiquidity(wallet, tokenAddress, tokenAmountOut, maxPoolAmountIn) {

		const poolContract = new ethers.Contract(poolAddress, balancerBPoolContractABI, wallet);
		const tokenAmountOutBN = ethers.utils.bigNumberify(tokenAmountOut);

		let transaction = await poolContract.exitswapExternAmountOut(tokenAddress, tokenAmountOutBN, maxPoolAmountIn);
		return transaction
	}


	async getBPoolBalance(wallet, poolAddress) {
		const poolContract = new ethers.Contract(poolAddress, balancerBPoolContractABI, wallet);

		return poolContract.balanceOf(wallet.address)
	}

	async approveToken(wallet, tokenAddress, poolAddress) {

		const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
		return tokenContract.approve(poolAddress, ethers.constants.MaxUint256)
	}

	async getBalancerPoolAllowance(wallet, tokenAddress, poolAddress) {
		const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
		return tokenContract.allowance(wallet.address, poolAddress)
	}

	async stake(wallet, rewardsContractAddress, amountToStake, tokenAddress) {
		const stakingRewardsContract = new ethers.Contract(rewardsContractAddress, stakingRewaradsContractABI, wallet);
		const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);

		let approve = await tokenContract.approve(rewardsContractAddress, amountToStake);
		console.log("Approve before staking", approve.hash)
		const amountToStakeBN = new ethers.utils.bigNumberify(amountToStake);
		let transaction = await stakingRewardsContract.stake(amountToStakeBN);
		return transaction;
	}

	async claimRewards(wallet, rewardsContractAddress) {
		const stakingRewardsContract = new ethers.Contract(rewardsContractAddress, stakingRewaradsContractABI, wallet);

		let transaction = await stakingRewardsContract.getReward();
		return transaction;
	}

	async withdraw(wallet, rewardsContractAddress) {
		const stakingRewardsContract = new ethers.Contract(rewardsContractAddress, stakingRewaradsContractABI, wallet);

		let transaction = await stakingRewardsContract.exit();
		return transaction;
	}

	async getPoolRate(wallet, rewardsContractAddress) {
		const stakingRewardsContract = new ethers.Contract(rewardsContractAddress, stakingRewaradsContractABI, wallet);

		let rewardRate = stakingRewardsContract.rewardRate();
		return rewardRate;
	}

	async getCurrentReward(wallet, rewardsContractAddress) {
		const stakingRewardsContract = new ethers.Contract(rewardsContractAddress, stakingRewaradsContractABI, wallet);

		let currentReward = await stakingRewardsContract.earned(wallet.address);
		return ethers.utils.formatEther(currentReward.toString());
	}

	async getStakingTokensBalance(wallet, rewardsContractAddress) {
		const stakingRewardsContract = new ethers.Contract(rewardsContractAddress, stakingRewaradsContractABI, wallet);

		let balance = await stakingRewardsContract.balanceOf(wallet.address);
		return ethers.utils.formatEther(balance.toString());
	}

	async calculateCustomerWeeklyReward(wallet, tokenAddress) {

	}

	// --- Internal functions ---

	isETH(tokenName) {
		return tokenName == 'ETH'
	}

	isETHCheck(tokenA, tokenB) {
		return (tokenA == 'ETH' || tokenB == 'ETH')
	}

	async _getUniswapTokenByName(tokenName) {
		const network = await this.provider.getNetwork()
		const chainId = network.chainId;
		if (this.isETH(tokenName)) {
			return WETH[chainId]
		}

		const tokenAddress = this.contractsConfig.tokenContracts[tokenName];
		if (typeof tokenAddress == 'undefined') {
			throw new Error('No such token found in the configuration')
		}

		return Fetcher.fetchTokenData(chainId, tokenAddress)
	}


	_getUniswapPairPoolToken(tokenAName, tokenBName) {
		let poolTokenKey = `${tokenAName}-${tokenBName}`;
		let pairToken = this.contractsConfig.uniswap.poolTokens[poolTokenKey];
		if (typeof pairToken != 'undefined') {
			return pairToken
		}

		poolTokenKey = `${tokenBName}-${tokenAName}`;
		pairToken = this.contractsConfig.uniswap.poolTokens[poolTokenKey];
		if (typeof pairToken != 'undefined') {
			return pairToken
		}

		throw new Error('No such pair found')
	}

	_calculateMinAmountOut(poolTokens) {

		let multiplier = (1 - BALANCE_BUFFER);
		let amountOut = poolTokens.mul(multiplier);
		return amountOut
	}

	async _calculatePoolTokens(tokenAmountIn, tokenAddress, wallet, poolAddress) {
		const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
		const poolContract = new ethers.Contract(poolAddress, balancerBPoolContractABI, wallet);

		//Getting necessary values
		let tokenBalanceIn = await tokenContract.balanceOf(poolAddress);
		let tokenWeightIn = await poolContract.getDenormalizedWeight(tokenAddress);
		let poolSupply = await poolContract.totalSupply();
		let totalWeight = await poolContract.getTotalDenormalizedWeight();
		let swapFee = await poolContract.getSwapFee();
		let tokenAmounInBN = new BigNumber(tokenAmountIn)

		tokenWeightIn = new BigNumber(tokenWeightIn.toString())
		totalWeight = new BigNumber(totalWeight.toString())
		tokenBalanceIn = new BigNumber(tokenBalanceIn.toString())
		poolSupply = new BigNumber(poolSupply.toString())
		swapFee = new BigNumber(swapFee.toString())
		console.log(tokenAmountIn, "token in")


		//Calculating the poolTokens	

		const normalizedWeight = math.bdiv(tokenWeightIn, totalWeight);
		console.log("test")
		const tempWeight = math.BONE.minus(normalizedWeight);
		console.log("test")
		const zaz = math.bmul(tempWeight, swapFee);

		console.log("test")
		const multiplier = math.BONE.minus(zaz);
		console.log("test")
		const tokenAmountInAfterFee = math.bmul(tokenAmounInBN, multiplier);
		console.log("test")
		const newTokenBalanceIn = tokenBalanceIn.plus(tokenAmountInAfterFee);
		console.log("test")
		const tokenInRatio = math.bmul(newTokenBalanceIn, tokenBalanceIn);
		console.log("test4")
		console.log(tokenInRatio.toString())
		console.log(normalizedWeight.toString())
		const poolRatio = math.bpow(tokenInRatio, normalizedWeight);
		console.log("test3")
		const newPoolSupply = math.bmul(poolRatio, poolSupply);
		console.log("test2")
		const poolAmountOut = newPoolSupply.minus(poolSupply);
		console.log("test")

		console.log(poolAmountOut.toString())
		return poolAmountOut;
	}





}

module.exports = ALBTStakerSDK