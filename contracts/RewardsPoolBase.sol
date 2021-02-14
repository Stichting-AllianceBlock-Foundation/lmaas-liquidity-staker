// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC20Detailed.sol";
import "./SafeERC20Detailed.sol";

contract RewardsPoolBase is ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20Detailed for IERC20Detailed;

    uint256 public totalStaked;
    uint256[] public rewardPerBlock;
    address[] public rewardsTokens;
    IERC20Detailed public stakingToken;
    uint256 public startBlock;
    uint256 public endBlock;
    uint256 public lastRewardBlock;
    uint256[] public accumulatedRewardMultiplier;

    struct UserInfo {
        uint256 firstStakedBlockNumber;
        uint256 amountStaked; // How many tokens the user has staked.
        uint256[] rewardDebt; //
        uint256[] tokensOwed; // How many tokens the contract owes to the user.
    }

    mapping(address => UserInfo) public userInfo;

    event Staked(address indexed user, uint256 amount);

    // TODO add end block
    constructor(
        IERC20Detailed _stakingToken,
        uint256 _startBlock,
        uint256 _endBlock,
        address[] memory _rewardsTokens,
        uint256[] memory _rewardPerBlock
    ) public {
        require(
            address(_stakingToken) != address(0),
            "Invalid staking token address"
        );
        require(
            _rewardPerBlock.length > 0,
            "Token rewards are not provided"
        );
        require(_rewardsTokens.length > 0, "Rewards tokens are not provided");
        require(
            _startBlock > _getBlock(),
            "The starting block must be in the future."
        );
        require(
            _endBlock > _getBlock(),
            "The end block must be in the future."
        );
        require(
            _rewardPerBlock.length == _rewardsTokens.length,
            "Rewards per block and rewards tokens must be with the same length."
        );

        stakingToken = _stakingToken;
        rewardPerBlock = _rewardPerBlock;
        startBlock = _startBlock;
        endBlock = _endBlock;
        rewardsTokens = _rewardsTokens;
        lastRewardBlock = startBlock;
        for (uint256 i = 0; i < rewardsTokens.length; i++) {
            accumulatedRewardMultiplier.push(0);
        }
        
    }

    modifier onlyInsideBlockBounds() {
        uint256 currentBlock = _getBlock();
        require(currentBlock > startBlock, "Stake::Staking has not yet started");
        require(currentBlock <= endBlock, "Stake::Staking has finished");
        _;
    }

    function stake(uint256 _tokenAmount) external nonReentrant onlyInsideBlockBounds {
        require(_tokenAmount > 0, "Stake::Cannot stake 0");

        UserInfo storage user = userInfo[msg.sender];

        // if no amount has been staked this is considered the initial stake
        if (user.amountStaked == 0) {
            onInitialStake(msg.sender);
        }

        updateRewardMultipliers(); // Update the accumulated multipliers for everyone
        updateUserAccruedReward(msg.sender); // Update the accrued reward for this specific user

        user.amountStaked = user.amountStaked.add(_tokenAmount);
        totalStaked = totalStaked.add(_tokenAmount);
        stakingToken.safeTransferFrom(
            address(msg.sender),
            address(this),
            _tokenAmount
        );

        for (uint256 i = 0; i < rewardsTokens.length; i++) {
            uint256 totalDebt = user.amountStaked.mul(accumulatedRewardMultiplier[i]).div(1e18); // Update user reward debt for each token
            user.rewardDebt[i] = totalDebt;
        }
        emit Staked(msg.sender, _tokenAmount);
    }

    /**
        @dev Execute logic on initial stake of the user.
        Could be overriden if needed by the later contracts.
        @param _userAddress the address of the user
     */
    function onInitialStake(address _userAddress) internal { 
        UserInfo storage user = userInfo[_userAddress];
        user.firstStakedBlockNumber = _getBlock();
    }

    /**
        @dev updates the accumulated reward multipliers for everyone and each token
     */
    function updateRewardMultipliers() public {
        if (_getBlock() <= lastRewardBlock) {
            return;
        }

        if (totalStaked == 0) {
            lastRewardBlock = _getBlock();
            return;
        }

        uint256 blocksSinceLastReward = _getBlock().sub(lastRewardBlock);

        for (uint256 i = 0; i < rewardsTokens.length; i++) {
            uint256 newReward = blocksSinceLastReward.mul(rewardPerBlock[i]); // Get newly accumulated reward
            uint256 rewardMultiplierIncrease = newReward.mul(1e18).div(totalStaked); // Calculate the multiplier increase
            accumulatedRewardMultiplier[i] = accumulatedRewardMultiplier[i].add(rewardMultiplierIncrease); // Add the multiplier increase to the accumulated multiplier
        }
        lastRewardBlock = _getBlock();
    }

    /**
        @dev updates the accumulated reward for the user with the _userAddress address
        @param _userAddress the address of the updated user
     */
    function updateUserAccruedReward(address _userAddress) internal {
        UserInfo storage user = userInfo[_userAddress];

        initialiseUserRewardDebt(_userAddress);
        initialiseUserTokensOwed(_userAddress);

        if (user.amountStaked == 0) {
            return;
        }
        for (uint256 tokenIndex = 0; tokenIndex < rewardsTokens.length; tokenIndex++) {
            updateUserRewardForToken(_userAddress, tokenIndex);
        }
    }

    /**
        @dev initialises the tokensOwed array for the user
        @param _userAddress the address of the user
     */
    function initialiseUserTokensOwed(address _userAddress) internal {
        UserInfo storage user = userInfo[_userAddress];

        if (user.tokensOwed.length == rewardsTokens.length) { // Already initialised
            return;
        }
        for (uint256 i = user.tokensOwed.length; i < rewardsTokens.length; i++) {
            user.tokensOwed.push(0);
        }
    }

    /**
        @dev initialises the rewardDebt array for the user
        @param _userAddress the address of the user
     */
    function initialiseUserRewardDebt(address _userAddress) internal {
        UserInfo storage user = userInfo[_userAddress];

        if (user.rewardDebt.length == rewardsTokens.length) { // Allready initialised
            return;
        }
        for (uint256 i = user.rewardDebt.length; i < rewardsTokens.length; i++) {
            user.rewardDebt.push(0);
        }
    }

    /**
        @dev calculates and updates the current user rewardDebt. Accrues accumulated reward.
        @param _userAddress the address of the user
     */
    function updateUserRewardForToken(address _userAddress, uint256 tokenIndex) internal {
        UserInfo storage user = userInfo[_userAddress];
        uint256 totalDebt = user.amountStaked.mul(accumulatedRewardMultiplier[tokenIndex]).div(1e18);
        uint256 pendingDebt = totalDebt.sub(user.rewardDebt[tokenIndex]);
        if (pendingDebt > 0) {
            user.tokensOwed[tokenIndex] = user.tokensOwed[tokenIndex].add(pendingDebt);
            user.rewardDebt[tokenIndex] = totalDebt;
        }
    }

    function _getBlock() internal view virtual returns (uint256) {
        return block.number;
    }

    function hasStakingStarted() public view returns(bool) {
        return (_getBlock() >= startBlock);
    }

    function getUserRewardDebt(address _userAddress, uint256 _index)
        public
        view
        returns (uint256)
    {
        require(_userAddress != address(0), "Invalid user address");
        UserInfo storage user = userInfo[_userAddress];
        return user.rewardDebt[_index];
    }

    function getUserOwedTokens(address _userAddress, uint256 _index)
        public
        view
        returns (uint256)
    {
        require(_userAddress != address(0), "Invalid user address");
        UserInfo storage user = userInfo[_userAddress];
        return user.tokensOwed[_index];
    }

    /**
        @dev Simulate all conditions in order to calculate the calculated reward at the moment
        @param _userAddress the address of the user
        @param tokenIndex the index of the reward token you are interested
     */
    function getUserAccumulatedReward(address _userAddress, uint256 tokenIndex) public view returns(uint256) {
        uint256 blocksSinceLastReward = _getBlock().sub(lastRewardBlock); // Overflow makes sure this is not called too early

        uint256 newReward = blocksSinceLastReward.mul(rewardPerBlock[tokenIndex]); // Get newly accumulated reward
        uint256 rewardMultiplierIncrease = newReward.mul(1e18).div(totalStaked); // Calculate the multiplier increase
        uint256 currentMultiplier = accumulatedRewardMultiplier[tokenIndex].add(rewardMultiplierIncrease); // Simulate the multiplier increase to the accumulated multiplier

        UserInfo storage user = userInfo[_userAddress];

        uint256 totalDebt = user.amountStaked.mul(currentMultiplier).div(1e18); // Simulate the current debt
        uint256 pendingDebt = totalDebt.sub(user.rewardDebt[tokenIndex]); // Simulate the pending debt
        return user.tokensOwed[tokenIndex].add(pendingDebt);
    }

    function getUserTokensOwedLength(address _userAddress)
        public
        view
        returns (uint256)
    {
        require(_userAddress != address(0), "Invalid user address");
        UserInfo storage user = userInfo[_userAddress];
        return user.tokensOwed.length;
    }

    function getUserRewardDebtLength(address _userAddress)
        public
        view
        returns (uint256)
    {
        require(_userAddress != address(0), "Invalid user address");
        UserInfo storage user = userInfo[_userAddress];
        return user.rewardDebt.length;
    }

    // TODO add logic for reward per block manipulation
    // TODO add logic for extension
}
