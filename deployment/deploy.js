const etherlime = require('etherlime-lib');
const ethers = require('ethers');

const StakingRewardsFactoryJSON = require('../build/StakingRewardsFactory.json');
const StakingRewardsJSON = require('../build/StakingRewards.json')

const etherscanAPIKey = 'J531BRU4FNGMNCD693FT6YS9TAM9TWS6QG';
const infuraAPIKey = 'df77c40c85ac442595b6be7d84ba2024'

const ETH_ALBT_stakingToken = "0xe5c5227d8105d8d5f26ff3634eb52e2d7cc15b50";
const USDT_ALBT_stakingToken = "0x1cd926f3e12f7b6c2833fbe7277ac53d529a794e";
const ABLT_rewardToken = "0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0";


const deploy = async (network, secret) => {

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraAPIKey);
	deployer.setVerifierApiKey(etherscanAPIKey);

	const {
		timestamp: now
	} = await deployer.provider.getBlock('latest');
	genesisTime = now + 60;

	const day = 60 * 60 * 24;
	const reward = ethers.utils.parseEther("300000");

	console.log('===> deploying STAKING REWARDS FACTORY <===');
	const stakingRewardsFactory = await deployer.deployAndVerify("etherscan", StakingRewardsFactoryJSON, {}, genesisTime);
	console.log('===> STAKING REWARDS FACTORY deployed <===\n');

	console.log('===> deploying STAKING REWARDS Uniswap ETH/ALBT 70K/70K <===');
	let deployStaking_UNISWAP_ETH_ALBT = await stakingRewardsFactory.deploy(
		ETH_ALBT_stakingToken,
		[ABLT_rewardToken],
		[reward],
		day * 30
	);
	let staking_UNISWAP_ETH_ALBT = await deployStaking_UNISWAP_ETH_ALBT.wait()
	console.log(staking_UNISWAP_ETH_ALBT)
	console.log('===> STAKING REWARDS Uniswap ETH/ALBT 70K/70K deployed <===\n');

	console.log('===> deploying STAKING REWARDS Uniswap USDT/ALBT 60K/60K <===');
	let deployStaking_UNISWAP_USDT_ALBT = await stakingRewardsFactory.deploy(
		USDT_ALBT_stakingToken,
		[ABLT_rewardToken],
		[reward],
		day * 30
	);
	let staking_UNISWAP_USDT_ALBT = await deployStaking_UNISWAP_USDT_ALBT.wait()
	console.log(staking_UNISWAP_USDT_ALBT)
	console.log('===> STAKING REWARDS Uniswap USDT/ALBT 60K/60K deployed <===\n');
};

module.exports = {
	deploy
};
