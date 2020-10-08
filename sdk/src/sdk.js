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
const uniswapRouterABI = require('./UniswapRouterABI.json');
const uniswapLiquidityPoolTokenABI = require('./UniswapLiquidityPoolTokenABI.json')
const balancerBPoolContractABI = require('./BalancerBPoolABI.json')
const ERC20ABI = require('./ERC20.json')

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
		const tokenContract = new ethers.Contract(token.address, uniswapLiquidityPoolTokenABI, wallet);
		return tokenContract.allowance(wallet.address, uniswapV2RouterAddress)
	}

	async approveUniswapRouterForToken(wallet, tokenName) {
		if (this.isETH(tokenName)) {
			throw new Error("No need to approve for ETH")
		}
		const token = await this._getUniswapTokenByName(tokenName);
		const tokenContract = new ethers.Contract(token.address, uniswapLiquidityPoolTokenABI, wallet);
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

	async getBalance(wallet, tokenName) {
		if (this.isETH(tokenName)) {
			return wallet.getBalance()
		}

		const token = await this._getUniswapTokenByName(tokenName);
		const tokenContract = new ethers.Contract(token.address, uniswapLiquidityPoolTokenABI, wallet)

		const walletAddress = await wallet.getAddress();

		return tokenContract.balanceOf(walletAddress)
	}

	async getUniswapPoolTokenBalance(wallet, tokenAName, tokenBName) {
		const poolTokenAddress = this._getUniswapPairPoolToken(tokenAName, tokenBName);
		const tokenContract = new ethers.Contract(poolTokenAddress, uniswapLiquidityPoolTokenABI, wallet)

		const walletAddress = await wallet.getAddress();

		return tokenContract.balanceOf(walletAddress)
	}

	async addBalancerLiquidity(wallet, tokenAddress, tokenAmountIn, poolAddress) {
		const poolContract = new ethers.Contract(poolAddress, balancerBPoolContractABI, wallet)

		const tokenAmountInBN = ethers.utils.bigNumberify(tokenAmountIn)
		const tokenAmountBNSlip = tokenAmountInBN.mul(50).div(10000)
		const minPoolAmountOutBN = tokenAmountBNSlip.sub(tokenAmountBNSlip)

		let transaction = await poolContract.joinswapExternAmountIn(tokenAddress, tokenAmountInBN, minPoolAmountOutBN)

		return transaction;
	}

	async getBPoolBalance(wallet, poolAddress) {
		const poolContract = new ethers.Contract(poolAddress, balancerBPoolContractABI, wallet)

		return poolContract.balanceOf(wallet.address)
	}

	async approveToken(wallet, tokenAddress, poolAddress) {

		const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet)
		return tokenContract.approve(poolAddress, ethers.constants.MaxUint256)
	}

	async getBalancerPoolAllowance(wallet,tokenAddress, poolAddress) {
		const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet)
		return tokenContract.allowance(wallet.address, poolAddress)
	}

	// --- Internal functions ---

	isETH(tokenName) {
		return tokenName == 'ETH'
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


}

module.exports = ALBTStakerSDK