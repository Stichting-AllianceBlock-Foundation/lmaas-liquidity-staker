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
const { EXIT_FEE } = require('./mathUtils.js');
const BALANCE_BUFFER = 0.01;
const multiplier = (1 - BALANCE_BUFFER);
const bigTen = new BigNumber(10);
const deadline = Math.floor(Date.now() / 1000) + (60 * 60)
const week = 60 * 60 * 24 * 7

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
		const tokenAAmountMinBN = this._calculateUniswapSlippage(tokenAAmount)
		const tokenBAmountMinBN = this._calculateUniswapSlippage(tokenBAmount)

		if (this.debug) {
			console.log("Token A", tokenAAmountBN.toString(), tokenAAmountMinBN.toString())
			console.log("Token B", tokenBAmountBN.toString(), tokenBAmountMinBN.toString())
		}

		let transaction;

		if (this.isETH(tokenAName)) {

			const tokenB = await this._getUniswapTokenByName(tokenBName);
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

	async removeUniswapLiquidity(wallet,tokenAName, tokenBName, tokenAAmount, tokenBAmount, liquidity ) {
		const routerContract = new ethers.Contract(uniswapV2RouterAddress, uniswapRouterABI, wallet)

			// Default Slippage is 0.5%
		const tokenAAmountMinBN = this._calculateUniswapSlippage(tokenAAmount)
		const tokenBAmountMinBN = this._calculateUniswapSlippage(tokenBAmount)
		const liquidityBN = ethers.utils.bigNumberify(liquidity);

		if (this.isETH(tokenAName)) {

			const tokenB = await this._getUniswapTokenByName(tokenBName);
			transaction = await routerContract.removeLiquidityETH(tokenB.address, liquidityBN, tokenBAmountMinBN, tokenAAmountMinBN, wallet.address, deadline)

		} else {
			const tokenA = await this._getUniswapTokenByName(tokenAName);
			const tokenB = await this._getUniswapTokenByName(tokenBName);
			transaction = await routerContract.removeLiquidity(tokenA.address, tokenB.address,liquidityBN, tokenAAmountMinBN, tokenBAmountMinBN, wallet.address, deadline);
		}
		return transaction;
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
		let minPoolAMountOut = this._calculatePoolAmount(poolTokens);
		minPoolAMountOut = minPoolAMountOut.integerValue(BigNumber.ROUND_UP)
		let transaction = await poolContract.joinswapExternAmountIn(tokenAddress, tokenAmountInBN, minPoolAMountOut.toString());

		return transaction;
	}

	async removeBalancerLiquidity(wallet, tokenAddress, tokenAmountOut, poolAddress) {

		const poolContract = new ethers.Contract(poolAddress, balancerBPoolContractABI, wallet);
		const tokenAmountOutBN = ethers.utils.bigNumberify(tokenAmountOut);

		const tokenAmount = await this._calculateTokenAmountOut(tokenAmountOut,tokenAddress,wallet,poolAddress);
		let poolAMountOut = await this._calculatePoolAmount(tokenAmount);
		poolAMountOut = poolAMountOut.integerValue(BigNumber.ROUND_UP)
		let transaction = await poolContract.exitswapPoolAmountIn(tokenAddress, tokenAmountOutBN, poolAMountOut.toString());
		return transaction
	}


	async getBPoolBalance(wallet, poolAddress) {
		const poolContract = new ethers.Contract(poolAddress, balancerBPoolContractABI, wallet);

		return poolContract.balanceOf(wallet.address)
	}

	async approveToken(wallet, tokenAddress, spenderAddress) {

		const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
		return tokenContract.approve(spenderAddress, ethers.constants.MaxUint256)
	}

	async getAllowance(wallet, tokenAddress, spenderAddress) {
		const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
		return tokenContract.allowance(wallet.address, spenderAddress)
	}

	async stake(wallet, rewardsContractAddress, amountToStake, ) {
		const stakingRewardsContract = new ethers.Contract(rewardsContractAddress, stakingRewaradsContractABI, wallet);
		
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
	//TODO
	async calculateCustomerWeeklyReward(wallet, tokenAddress) {
	const stakingRewardsContract = new ethers.Contract(tokenAddress, stakingRewaradsContractABI, wallet);
	const rewardRate = await stakingRewardsContract.rewardRate();
	const stakedAmount = await stakingRewardsContract.balanceOf(wallet.address);
	const totalStakedAmount = await stakingRewardsContract.totalSupply();

	const multiplier = stakedAmount.mul(rewardRate)
	const individualRewardRate = multiplier.div(totalStakedAmount)

	return individualRewardRate.mul(week);

	}
	//TODO
	async calculateWeeklyAPY() {

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

	_calculatePoolAmount(tokenAmount) {

		return tokenAmount.times(multiplier);
	}
 
	async _calculatePoolTokens(tokenAmountIn, tokenAddress, wallet, poolAddress) {

		//Getting necessary values
		let {tokenBalance,tokenWeight,poolSupply,totalWeight,swapFee,tokenAmountBN} = await this._getPoolContractInfo(tokenAmountIn, tokenAddress, wallet, poolAddress)

		//Calculating the poolTokens	
		const normalizedWeight = math.bdiv(tokenWeight, totalWeight);
		const tempWeight = math.BONE.minus(normalizedWeight);
		const zaz = math.bmul(tempWeight, swapFee);
		const multiplier = math.BONE.minus(zaz);
		const tokenAmountInAfterFee = math.bmul(tokenAmountBN, multiplier);
		const newTokenBalanceIn = tokenBalance.plus(tokenAmountInAfterFee);
		const tokenInRatio = math.bdiv(newTokenBalanceIn, tokenBalance);
		const poolRatio = math.bpow(tokenInRatio, normalizedWeight);
		const newPoolSupply = math.bmul(poolRatio, poolSupply);
		const poolAmountOut = newPoolSupply.minus(poolSupply);

		return poolAmountOut;
	}

	async _calculateTokenAmountOut(tokenAmount, tokenAddress, wallet, poolAddress) {
	

		let {tokenBalance,tokenWeight,poolSupply,totalWeight,swapFee,tokenAmountBN} = await this._getPoolContractInfo(tokenAmount, tokenAddress, wallet, poolAddress)
		const normalizedWeight = math.bdiv(tokenWeight, totalWeight);
		const multiplier = math.BONE.minus(EXIT_FEE);
		const poolAmountInAfterExitFee = math.bmul(tokenAmountBN,multiplier);
		const newPoolSupply = poolSupply.minus(poolAmountInAfterExitFee);
		const poolRatio = math.bdiv(newPoolSupply,poolSupply);

		const tempWeight = math.bdiv(math.BONE, normalizedWeight);
		const tokenOutRatio = math.bpow(poolRatio,tempWeight);
		const newTokenBalanceOut = math.bmul(tokenOutRatio,tokenBalance);

		const tokenAmountOutBeforeSwapFee = tokenBalance.minus(newTokenBalanceOut);
		const tokenMultiplier = math.BONE.minus(normalizedWeight);
		const zaz = math.bmul(tokenMultiplier,swapFee);
		const newZaz = math.BONE.minus(zaz);
		const tokenAmountOut = math.bmul(tokenAmountOutBeforeSwapFee,newZaz);
		return tokenAmountOut;
	}

	async _getPoolContractInfo(tokenAmount, tokenAddress,wallet,poolAddress) {

		const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
		const poolContract = new ethers.Contract(poolAddress, balancerBPoolContractABI, wallet);

		let tokenBalance = await tokenContract.balanceOf(poolAddress);
		let tokenWeight = await poolContract.getDenormalizedWeight(tokenAddress);
		let poolSupply = await poolContract.totalSupply();
		let totalWeight = await poolContract.getTotalDenormalizedWeight();
		let swapFee = await poolContract.getSwapFee();
		let tokenAmountBN = new BigNumber(tokenAmount)

		tokenWeight = new BigNumber(tokenWeight.toString())
		totalWeight = new BigNumber(totalWeight.toString())
		tokenBalance = new BigNumber(tokenBalance.toString())
		poolSupply = new BigNumber(poolSupply.toString())
		swapFee = new BigNumber(swapFee.toString())
	
		return {tokenBalance,tokenWeight,poolSupply,totalWeight,swapFee,tokenAmountBN}
	}
	// Default Slippage is 0.5%
	_calculateUniswapSlippage(tokenAmount) {

		const tokenAmountBN = ethers.utils.bigNumberify(tokenAmount);
		const tokenAmountBNSlip = tokenAmountBN.mul(50).div(10000)
		const tokenAmountMinBN = tokenAmountBN.sub(tokenAmountBNSlip)

		return tokenAmountMinBN;
	}

}

module.exports = ALBTStakerSDK