// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./interfaces/IERC20Detailed.sol";
import "./SafeERC20Detailed.sol";
import "./RewardsPoolBase.sol";

contract RewardsPoolFactory is Ownable {
    using SafeMath for uint256;
    using SafeERC20Detailed for IERC20Detailed;

    /** @dev all rewards pools
     */
    address[] public rewardsPools;

    event RewardsPoolDeployed(
        address indexed rewardsPoolAddress,
        address indexed stakingToken
    );

    /* ========== Permissioned FUNCTIONS ========== */

    /** @dev Deploy a reward pool base contract for the staking token, with the given parameters.
     * @param _stakingToken The address of the token being staked
     * @param _startBlock The start block of the rewards pool
     * @param _endBlock The end block of the rewards pool
     * @param _rewardsTokens The addresses of the tokens the rewards will be paid in
     * @param _rewardPerBlock Rewards per block
     */
    function deploy(
        address _stakingToken,
        uint256 _startBlock,
        uint256 _endBlock,
        address[] memory _rewardsTokens,
        uint256[] memory _rewardPerBlock
    ) external onlyOwner {
        require(
            _stakingToken != address(0),
            "RewardsPoolFactory::deploy: Staking token address can't be zero address"
        );
        require(
            _rewardsTokens.length != 0,
            "RewardsPoolFactory::deploy: RewardsTokens array could not be empty"
        );
        require(
            _rewardsTokens.length == _rewardPerBlock.length,
            "RewardsPoolFactory::deploy: RewardsTokens and RewardPerBlock should have a matching sizes"
        );

        for (uint256 i = 0; i < _rewardsTokens.length; i++) {
            require(
                _rewardsTokens[i] != address(0),
                "RewardsPoolFactory::deploy: Reward token address could not be invalid"
            );
            require(
                _rewardPerBlock[i] != 0,
                "RewardsPoolFactory::deploy: Reward per block must be greater than zero"
            );
        }

        address rewardsPoolBase =
            address(
                new RewardsPoolBase(
                    IERC20Detailed(_stakingToken),
                    _startBlock,
                    _endBlock,
                    _rewardsTokens,
                    _rewardPerBlock
                )
            );

        for (uint256 i = 0; i < _rewardsTokens.length; i++) {
            uint256 rewardsAmount =
                calculateRewardsAmount(
                    _startBlock,
                    _endBlock,
                    _rewardPerBlock[i]
                );
            IERC20Detailed(_rewardsTokens[i]).safeTransfer(
                rewardsPoolBase,
                rewardsAmount
            );
        }
        rewardsPools.push(rewardsPoolBase);

        emit RewardsPoolDeployed(rewardsPoolBase, _stakingToken);
    }

    /** @dev Function that will extend the rewards period, but not change the reward rate, for a given staking contract.
     * @param _endBlock The new endblock for the rewards pool.
     * @param _rewardsPerBlock Rewards per block .
     * @param _rewardsTokens The addresses of the tokens the rewards will be paid in.
     * @param _rewardsPoolAddress The address of the RewardsPoolBase contract.
     */
    function extendRewardPool(
        uint256 _endBlock,
        uint256[] memory _rewardsPerBlock,
        address[] memory _rewardsTokens,
        address _rewardsPoolAddress
    ) external onlyOwner {
        RewardsPoolBase(_rewardsPoolAddress).extend(
            _endBlock,
            _rewardsPerBlock
        );

        for (uint256 i = 0; i < _rewardsPerBlock.length; i++) {
            uint256 rewardAmount =
                calculateRewardsAmount(
                    block.number,
                    _endBlock,
                    _rewardsPerBlock[i]
                );
            uint256 currentRewardsAmount =
                IERC20Detailed(_rewardsTokens[i]).balanceOf(
                    _rewardsPoolAddress
                );

            uint256 rewardsToTransfer = rewardAmount.sub(currentRewardsAmount);

            IERC20Detailed(_rewardsTokens[i]).safeTransfer(
                _rewardsPoolAddress,
                rewardsToTransfer
            );
        }
    }


    //TODO: Refactor the withdraw function, add it into the rewards base pool
    /** @dev Triggers the withdrawal of LP rewards from the rewards pool contract to the given recipient address
     * @param rewardsPoolAddress The address of the token being staked
     * @param recipient The address to whom the rewards will be trasferred
     * @param lpTokenContract The address of the rewards contract
     */
    function withdrawLPRewards(
        address rewardsPoolAddress,
        address recipient,
        address lpTokenContract
    ) external onlyOwner {
        require(
            rewardsPoolAddress != address(0),
            "RewardsPoolFactory::startStaking: not deployed"
        );
        // RewardsPoolBase srInstance = RewardsPoolBase(rewardsPoolAddress);
        // srInstance.withdrawLPRewards(recipient, lpTokenContract);
    }

    /** @dev Returns the total number of rewards pools.
     */
    function getRewardsPoolNumber() public view returns (uint256) {
        return rewardsPools.length;
    }

    /** @dev Helper function to calculate how much tokens should be transffered to a rewards pool.
     */
    function calculateRewardsAmount(
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _rewardPerBlock
    ) internal returns (uint256) {
        require(
            _rewardPerBlock > 0,
            "RewardsPoolFactory::calculateRewardsAmount: Rewards per block must be greater than zero"
        );

        uint256 rewardsPeriod = _endBlock.sub(_startBlock);

        return _rewardPerBlock.mul(rewardsPeriod);
    }
}
