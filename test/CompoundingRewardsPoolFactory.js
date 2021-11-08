const ethers = require("ethers");
const etherlime = require("etherlime-lib");
const CompoundingRewardsPoolStaker = require("../build/CompoundingRewardsPoolStaker.json");
const CompoundingRewardsPool = require("../build/CompoundingRewardsPool.json");
const CompoundingRewardsPoolFactory = require("../build/CompoundingRewardsPoolFactory.json");
const TestERC20 = require("../build/TestERC20.json");
const RewardsPoolBase = require("../build/RewardsPoolBase.json");
const { mineBlock } = require("./utils");

describe.only("CompoundingRewardsPoolFactory", () => {
  // These tests must be skipped for coverage as coverage does not support optimizations
  let aliceAccount = accounts[3];
  let bobAccount = accounts[4];
  let carolAccount = accounts[5];
  let treasury = accounts[8];
  let deployer;
  let CompoundingRewardsPoolFactoryInstance;
  let stakingTokenInstance;
  let stakingTokenAddress;
  let rewardPerBlock;
  let startBlock;
  let endBlock;
  let rewardAmounts;
  const duration = 60 * 24 * 60 * 60; // 60 days in seconds
  const rewardTokensCount = 1; // 5 rewards tokens for tests
  const amount = ethers.utils.parseEther("5184000");
  const stakeLimit = amount;
  const contractStakeLimit = amount;
  const amountToTransfer = ethers.utils.parseEther("10000");
  const bOne = ethers.utils.parseEther("1");
  const standardStakingAmount = ethers.utils.parseEther("5"); // 5 tokens

  let startTimestmap;
  let endTimestamp;

  const virtualBlocksTime = 10; // 10s == 10000ms
  const oneMinute = 60;

  const setupRewardsPoolParameters = async (deployer) => {
    const currentBlock = await deployer.provider.getBlock("latest");
    startTimestmap = currentBlock.timestamp + oneMinute;
    endTimestamp = startTimestmap + oneMinute * 2;
    endBlock = Math.trunc(endTimestamp / virtualBlocksTime);
  };

  beforeEach(async () => {
    // const defaultConfigs = {
    //   gasPrice: 20000000000,
    //   gasLimit: 260000000,
    //   chainId: 0, // Suitable for deploying on private networks like Quorum
    // };
    deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);
    // deployer.setDefaultOverrides(defaultConfigs);

    externalRewardsTokenInstance = await deployer.deploy(
      TestERC20,
      {},
      ethers.utils.parseEther("300000")
    );
    externalRewardsTokenAddress = externalRewardsTokenInstance.contractAddress;

    await setupRewardsPoolParameters(deployer);
    CompoundingRewardsPoolFactoryInstance = await deployer.deploy(
      CompoundingRewardsPoolFactory,
      {}
    );
  });

  it("should deploy valid rewards pool factory contract", async () => {
    assert.isAddress(
      CompoundingRewardsPoolFactoryInstance.contractAddress,
      "The CompoundingRewardsPoolFactory contract was not deployed"
    );
  });

  describe("Deploying CompoundingStaker and CompoundingRewardsPoolFactory", async function () {
    beforeEach(async () => {
      stakingTokenInstance = await deployer.deploy(
        TestERC20,
        {},
        ethers.utils.parseEther("300000")
      );
      stakingTokenAddress = stakingTokenInstance.contractAddress;
    });

    it("Should deploy base rewards pool successfully", async () => {
      await stakingTokenInstance.mint(
        CompoundingRewardsPoolFactoryInstance.contractAddress,
        amount
      );
      await CompoundingRewardsPoolFactoryInstance.deploy(
        stakingTokenAddress,
        startTimestmap,
        endTimestamp,
        bOne,
        standardStakingAmount,
        20,
        standardStakingAmount,
        contractStakeLimit,
        virtualBlocksTime
      );

      const firstStakerContract = await CompoundingRewardsPoolFactoryInstance.rewardsPools(
        0
      );
      const StakerContract = await etherlime.ContractAt(
        CompoundingRewardsPoolStaker,
        firstStakerContract
      );
      const stakingToken = await StakerContract.stakingToken();
      const rewardPool = await StakerContract.rewardPool();
      const rewardsPoolContract = await etherlime.ContractAt(
        CompoundingRewardsPool,
        rewardPool
      );
      const staker = await rewardsPoolContract.staker();

      assert.strictEqual(
        stakingTokenAddress.toLowerCase(),
        stakingToken.toLowerCase(),
        "The saved staking token was not the same as the inputted one"
      );
      assert.isAddress(
        firstStakerContract,
        "The staking reward contract was not deployed"
      );
      assert.strictEqual(
        staker,
        firstStakerContract,
        "The staker of the pool was not the staker contract"
      );
    });

    it("Should fail on deploying not from owner", async () => {
      await assert.revert(
        CompoundingRewardsPoolFactoryInstance.from(bobAccount).deploy(
          stakingTokenAddress,
          startTimestmap,
          endTimestamp,
          bOne,
          stakeLimit,
          5,
          stakeLimit,
          contractStakeLimit,
          virtualBlocksTime
        )
      );
    });

    it("Should fail on deploying with zero address as staking token", async () => {
      await assert.revertWith(
        CompoundingRewardsPoolFactoryInstance.deploy(
          ethers.constants.AddressZero,
          startTimestmap,
          endTimestamp,
          bOne,
          stakeLimit,
          5,
          stakeLimit,
          contractStakeLimit,
          virtualBlocksTime
        ),
        "CompoundingRewardsPoolFactory::deploy: Staking token address can't be zero address"
      );
    });

    it("Should fail if the reward amount is not greater than zero", async () => {
      const errorString =
        "CompoundingRewardsPoolFactory::deploy: Reward per block must be more than 0";
      await assert.revertWith(
        CompoundingRewardsPoolFactoryInstance.deploy(
          stakingTokenAddress,
          startTimestmap,
          endTimestamp,
          0,
          standardStakingAmount,
          20,
          standardStakingAmount,
          contractStakeLimit,
          virtualBlocksTime
        ),
        errorString
      );
    });

    it("Should fail on zero stake limit", async () => {
      await assert.revertWith(
        CompoundingRewardsPoolFactoryInstance.deploy(
          stakingTokenAddress,
          startTimestmap,
          endTimestamp,
          bOne,
          0,
          20,
          standardStakingAmount,
          contractStakeLimit,
          virtualBlocksTime
        ),
        "CompoundingRewardsPoolFactory::deploy: Stake limit must be more than 0"
      );
    });

    it("Should fail on zero throttle rounds or cap", async () => {
      await assert.revertWith(
        CompoundingRewardsPoolFactoryInstance.deploy(
          stakingTokenAddress,
          startTimestmap,
          endTimestamp,
          bOne,
          standardStakingAmount,
          0,
          standardStakingAmount,
          contractStakeLimit,
          virtualBlocksTime
        ),
        "CompoundingRewardsPoolFactory::deploy: Throttle round blocks must be more than 0"
      );
      await assert.revertWith(
        CompoundingRewardsPoolFactoryInstance.deploy(
          stakingTokenAddress,
          startTimestmap,
          endTimestamp,
          bOne,
          standardStakingAmount,
          20,
          0,
          contractStakeLimit,
          virtualBlocksTime
        ),
        "CompoundingRewardsPoolFactory::deploy: Throttle round cap must be more than 0"
      );
    });

    it("Should fail if not enough reward is sent", async () => {
      await stakingTokenInstance.mint(
        CompoundingRewardsPoolFactoryInstance.contractAddress,
        1
      );
      await assert.revertWith(
        CompoundingRewardsPoolFactoryInstance.deploy(
          stakingTokenAddress,
          startTimestmap,
          endTimestamp,
          bOne,
          standardStakingAmount,
          20,
          standardStakingAmount,
          contractStakeLimit,
          virtualBlocksTime
        ),
        "SafeERC20: low-level call failed"
      );
    });

    describe("Whitelisting", async function () {
      let transferer;
      let receiver;
      beforeEach(async () => {
        await stakingTokenInstance.mint(
          CompoundingRewardsPoolFactoryInstance.contractAddress,
          amount
        );
        await CompoundingRewardsPoolFactoryInstance.deploy(
          stakingTokenAddress,
          startTimestmap,
          endTimestamp,
          bOne,
          standardStakingAmount,
          20,
          standardStakingAmount,
          contractStakeLimit,
          virtualBlocksTime
        );
        await CompoundingRewardsPoolFactoryInstance.deploy(
          stakingTokenAddress,
          startTimestmap,
          endTimestamp + 10,
          bOne,
          standardStakingAmount,
          20,
          standardStakingAmount,
          contractStakeLimit,
          virtualBlocksTime
        );
        const transfererAddress = await CompoundingRewardsPoolFactoryInstance.rewardsPools(
          0
        );
        const receiverAddress = await CompoundingRewardsPoolFactoryInstance.rewardsPools(
          1
        );
        transferer = await etherlime.ContractAt(
          CompoundingRewardsPoolStaker,
          transfererAddress
        );
        receiver = await etherlime.ContractAt(
          CompoundingRewardsPoolStaker,
          receiverAddress
        );

        const currentBlock = await deployer.provider.getBlock("latest");
        const blocksDelta = endBlock - currentBlock.number;

        for (let i = 0; i < blocksDelta; i++) {
          await mineBlock(deployer.provider);
        }
      });

      it("Should fail transfer if receiver not whitelisted", async () => {
        await assert.revertWith(
          transferer.exitAndTransfer(receiver.contractAddress),
          "exitAndTransfer::receiver is not whitelisted"
        );
      });

      it("Should successfully exit and transfer if receiver whitelisted", async () => {
        const transfererSharesBefore = await transferer.totalShares();
        const receiverSharesBefore = await receiver.totalShares();

        await CompoundingRewardsPoolFactoryInstance.enableReceivers(
          transferer.contractAddress,
          [receiver.contractAddress]
        );
        await transferer.exitAndTransfer(receiver.contractAddress);

        const transfererSharesAfter = await transferer.totalShares();
        const receiverSharesAfter = await receiver.totalShares();

        assert(
          transfererSharesBefore.eq(receiverSharesAfter),
          "Shares were not tranferred correctly"
        );
        assert(
          receiverSharesBefore.eq(transfererSharesAfter),
          "Shares were cleared correctly"
        );
      });

      it("Should fail whitelisting if called with wrong params", async () => {
        await assert.revertWith(
          CompoundingRewardsPoolFactoryInstance.enableReceivers(
            ethers.constants.AddressZero,
            [receiver.contractAddress]
          ),
          "enableReceivers::Transferer cannot be 0"
        );
        await assert.revertWith(
          CompoundingRewardsPoolFactoryInstance.enableReceivers(
            transferer.contractAddress,
            [ethers.constants.AddressZero]
          ),
          "enableReceivers::Receiver cannot be 0"
        );
      });

      it("Should fail whitelisting if not called by the owner", async () => {
        await assert.revertWith(
          CompoundingRewardsPoolFactoryInstance.from(
            bobAccount.signer
          ).enableReceivers(transferer.contractAddress, [
            receiver.contractAddress,
          ]),
          "onlyOwner:: The caller is not the owner"
        );
      });
    });
  });
});
