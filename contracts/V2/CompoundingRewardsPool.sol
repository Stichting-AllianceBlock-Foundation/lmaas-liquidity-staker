// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../RewardsPoolBase.sol";
import "./../pool-features/OneStakerFeature.sol";
import "./../interfaces/IERC20Detailed.sol";
import "./libraries/Calculator.sol";

contract CompoundingRewardsPool is RewardsPoolBase, OneStakerFeature {
    using SafeERC20Detailed for IERC20Detailed;
    uint256 public amountTransferred;
    uint256 public totalRewards;

    event AdditioanalRewardsAdded(address indexed _sender, uint256 _rewardsAmount);

    constructor(
        IERC20Detailed _stakingToken,
        uint256 _startBlock,
        uint256 _endBlock,
        address[] memory _rewardsTokens,
        uint256[] memory _rewardPerBlock,
        uint256 _stakeLimit,
        address _staker,
        address _externalRewardToken,
        uint256 _contractStakeLimit,
        uint256 _initialAmountToTransfer
    )
        public
        RewardsPoolBase(
            _stakingToken,
            _startBlock,
            _endBlock,
            _rewardsTokens,
            _rewardPerBlock,
            _stakeLimit,
            _contractStakeLimit
        )
        OneStakerFeature(_staker)
    {
        amountTransferred = _initialAmountToTransfer;
        totalRewards = Calculator.calculateRewardsAmount(_startBlock, _endBlock, _rewardPerBlock[0]);
    }

    function stake(uint256 _tokenAmount) public override(RewardsPoolBase, OneStakerFeature) {
        OneStakerFeature.stake(_tokenAmount);
    }

    function addMoreRewards(address rewardsToken, uint256 _tokenAmount) public {
        amountTransferred = amountTransferred.add(_tokenAmount);
        /** 
          @dev We don't need to make the check for require of allowance, because
          safeTransferFrom already do that. 
        **/
        IERC20Detailed(rewardsToken).safeTransferFrom(msg.sender, address(this), _tokenAmount);
        emit AdditioanalRewardsAdded(msg.sender, _tokenAmount);
    }
}
