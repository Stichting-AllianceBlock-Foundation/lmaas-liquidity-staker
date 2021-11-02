const etherlime = require("etherlime-lib");
const ethers = require("ethers");

const { parseEther, formatEther } = ethers.utils;

const TestERC20 = require("../build/TestERC20.json");
const LMCFactory = require("../build/LiquidityMiningCampaignFactory.json");
const LockScheme = require("../build/LockScheme.json");
const PercentageCalculator = require("../build/PercentageCalculator.json");

// CONTSANTS
const BLOCKS_PER_DAY = {
  rinkeby: 6646,
  polygon: 43200,
  avalanche: 4320,
};

const BLOCKS_PER_MINUTE = 5;
const BLOCKS_PER_HOUR = 276;

// Addresses
const rewardAddresses = {
  rinkeby: {
    TALBT: "0x1DFD95eb75A7486945D366a0bC0b937F0AAa526F",
  },
  bsc: {
    bALBT: "0x666e672B2Ada59979Fc4dB7AF9A4710E0E4D51E6",
  },
  polygon: {
    TUSDT: "0xd944F35CD2552c4a9e51815f6F61De3B33aFbcE6",
    TWETH: "0xc66fB941E3C089957247FB2b8e13cE25C8413F9e",
    TADA: "0x239BBacd8b83DEe4d0d69347764DCC092E3C3E01",
  },
  avalanche: {
    TUSDT: "0x4B313260c2Fb2E69212C182FF8BF311a18232f1d",
    TWETH: "0x8fb4C0f738af28797EE06C86836Ad8b237677251",
  },
};

const poolAddresses = {
  rinkeby: {
    uniswap: {
      "ETH-TALBT": "0x0Bd2f8af9f5E5BE43B0DA90FE00A817e538B9306",
      "ALBT-USDT": "0x91f4ee172CA9f66A91F9111182Ac31DfDB65851F",
    },
    balancer: {
      "ETH-ALBT": "0x5e9E09D7b756A821144c85397607ca4B0a02D1CE",
      "ALBT-USDT": "0x80D582FC5608e76a764611CD9aDa8FF2518B05cA",
      "ETH-ALBT-USDT": "0xFEf9609553541C983B779070469F106Ce1A0Aa71",
    },
  },
  bsc: {
    pancakeswap: {
      "BNB-bALBT": "0xd954551853F55deb4Ae31407c423e67B1621424A",
    },
  },
  polygon: {
    quickswap: {
      "TUSDT-TWETH": "0xd22f4aff8e7184ff0b9c6bea7f2842caaebb3c38",
    },
  },
  avalanche: {
    pangolin: {
      "TUSDT-TWETH": "0x2195a6c995ab53bdc684d327ad802feed4bd213b",
    },
  },
};

const percentageCalculatorAddress = {
  rinkeby: "0x67994e7a60c29c68d5F35804Bd658f2AAa491775",
  polygon: "0xc4fA9b789a0E4100e6b34ab331BA96bcCFC613ae",
  avalanche: "0x5A6a7d9fb176ca2B911E7862319f857B2F8CF03b",
};

// Set this address for wrapping
const LMCFactoryAddress = "";
const infuraApiKey = "40c2813049e44ec79cb4d7e0d18de173";

const logTx = async tx => {
  console.log(`Hash: ${tx.hash}`);
  const txResult = await tx.wait();
  if (txResult.status === 1) {
    console.log("\x1b[32m%s\x1b[0m", "Transaction successful!");
    console.log("");
  } else {
    console.log("\x1b[31m%s\x1b[0m", "Something bad happened :(");
    console.log("");
  }
};

const deploy = async (network, secret, etherscanApiKey) => {
  const deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraApiKey);

  const wallet = new ethers.Wallet(secret, deployer.provider);

  // Set addresses by network
  const rewardTokensAddresses = [rewardAddresses[network]["TALBT"]];

  // Set reward rate
  const rewardsPerBlock = rewardTokensAddresses.map(el => parseEther("0.1"));
  const amountReward = parseEther("3000000000");

  const gasPrice = { gasPrice: 20000000000 };

  // Deploy LMC Factory
  let LMCFactoryInstance;

  // Check for deployed Factory
  if (LMCFactoryAddress !== "") {
    LMCFactoryInstance = deployer.wrapDeployedContract(LMCFactory, LMCFactoryAddress, wallet);
  } else {
    LMCFactoryInstance = await deployer.deploy(LMCFactory, {});
  }

  // Set Transfered and receiver
  // let enable = await LMCFactoryInstance.enableReceivers("0xAF38aD58d5145ceb66c66D4F33466eAF2ECf1353", ["0x0b0519b4af1355dc72e2a7567c13883a88c715d0"])
  // await logTx(enable)
  // return

  // Deploy Percentage Calculator if not deployed
  let percentageCalculator;

  if (percentageCalculatorAddress[network] === "") {
    // Deploy Calculator
    percentageCalculator = await deployer.deploy(PercentageCalculator);
  }

  // Mint reward tokens
  console.log(``);
  console.log(`Mint reward tokens for Factory LMC`);
  for (let i = 0; i < rewardTokensAddresses.length; i++) {
    // Get Reward Token Instance
    const rewardTokensInstance = new ethers.Contract(
      rewardTokensAddresses[i],
      TestERC20.abi,
      wallet,
    );

    let mint = await rewardTokensInstance.mint(LMCFactoryInstance.contractAddress, amountReward);
    await logTx(mint);
  }

  // LMC settings
  const protocol = "uniswap";
  const pair = "ETH-TALBT";

  const poolAddress = poolAddresses[network][protocol][pair];
  const currentBlock = await deployer.provider.getBlock("latest");
  const startBlock = currentBlock.number + BLOCKS_PER_MINUTE * 3;
  const endBlock = startBlock + BLOCKS_PER_DAY[network] * 30;

  const stakeLimit = parseEther("100000");
  const contractStakeLimit = parseEther("100000000000");

  // Deploy LMC
  console.log(``);
  console.log(`Deploy LMC:`);
  let tx = await LMCFactoryInstance.deploy(
    poolAddress,
    startBlock,
    endBlock,
    rewardTokensAddresses,
    rewardsPerBlock,
    rewardTokensAddresses[0],
    stakeLimit,
    contractStakeLimit,
  );
  await logTx(tx);

  // Get Rewards Pool number
  const rewardsPoolsLength = await LMCFactoryInstance.getRewardsPoolNumber();
  const LMCAddress = await LMCFactoryInstance.rewardsPools(rewardsPoolsLength - 1);

  // Scheme settings
  const libraries = {
    PercentageCalculator:
      percentageCalculatorAddress[network] === ""
        ? percentageCalculator.contractAddress
        : percentageCalculatorAddress[network],
  };

  const lockSchemesSettings = [
    {
      title: "NO-LOCK",
      bonusPermile: 0,
      lockBlock: BLOCKS_PER_DAY[network] * 30,
      rampUpBlock: BLOCKS_PER_DAY[network] * 30 - 1,
    },
  ];

  // Deploy Lock Schemes
  console.log(``);
  console.log(`Deploy Lock Schemes for ${LMCAddress}::`);

  const lockSchemеs = [];

  for (let i = 0; i < lockSchemesSettings.length; i++) {
    // Deploy Lock Scheme
    let LSCInstance = await deployer.deploy(
      LockScheme,
      libraries,
      lockSchemesSettings[i].lockBlock,
      lockSchemesSettings[i].rampUpBlock,
      lockSchemesSettings[i].bonusPermile,
      LMCAddress,
    );

    lockSchemеs.push(LSCInstance.contractAddress);
  }

  // Set Lock Scheme
  tx = await LMCFactoryInstance.setLockSchemesToLMC(lockSchemеs, LMCAddress);
  await logTx(tx);

  console.log(`
"${pair}": "${LMCAddress}",
  `);

  console.log(`"${pair}": {`);
  lockSchemesSettings.forEach((item, i) => {
    console.log(`    "${item.title}": "${lockSchemеs[i]}",`);
  });
  console.log(`},`);

  // Set Transfered and receiver
  // let tx = await LMCFactoryInstance.enableReceivers("0xEFc4CE3a9b60BDd73a70B1916402fEE698B6aa61", ["0xF5D7fe0BAffaA7978B4799Bf26C50285E709B8c1"]);
  // await logTx(mint);
};

module.exports = {
  deploy,
};