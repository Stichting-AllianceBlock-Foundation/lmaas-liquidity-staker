const etherlime = require('etherlime-lib');
const ethers = require('ethers');

const FactoryJSON = require('../build/NonCompoundingRewardsPoolFactory.json')
const NCRPJSON = require('../build/NonCompoundingRewardsPool.json');
const TreasuryJSON = require('../build/Treasury.json');


// const etherscanAPIKey = 'J531BRU4FNGMNCD693FT6YS9TAM9TWS6QG';
const infuraAPIKey = '6cc519519e394bf787e6142617dbbcc3'

const Uniswap_Factory = "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"
const ALBT_Token = "0xd21913390c484d490d24f046da5329f1d778b75b"


const deploy = async (network, secret) => {

	const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraAPIKey);
	deployer.defaultOverrides = { gasLimit: 4700000, gasPrice: 3000000000 }

	console.log('===> deploying Treasury <===');
	const stakingRewardsFactory = await deployer.deploy(TreasuryJSON, {}, Uniswap_Factory, ALBT_Token);
	console.log('===> Treasury deployed <===\n');

	console.log(stakingRewardsFactory)
};

module.exports = {
	deploy
};
