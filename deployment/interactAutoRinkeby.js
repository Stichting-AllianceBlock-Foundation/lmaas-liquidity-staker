const etherlime = require("etherlime-lib");
const ethers = require("ethers");
const CompoundingRewardsPoolStaker = require("../build/CompoundingRewardsPoolStaker.json");
const TestERC20 = require("../build/TestERC20.json");
// Addresses
const rewardsPoolStakerAddress = "0xd8ba72268633ffd9ca499c7124a2a498fdadb97e";
const infuraApiKey = "df77c40c85ac442595b6be7d84ba2024";
const deploy = async (network, secret) => {
  const { parseEther } = ethers.utils;
  // Get Deployer and Wallet
  const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraApiKey);
  const wallet = new ethers.Wallet(secret, deployer.provider);
  // Get Staking Token
  const stakerInstance = new ethers.Contract(
    rewardsPoolStakerAddress,
    CompoundingRewardsPoolStaker.abi,
    wallet,
  );
  console.log("Refreshing auto stake...");
  const tx = await stakerInstance.refreshAutoStake();
  await tx.wait;
};
module.exports = {
  deploy,
};