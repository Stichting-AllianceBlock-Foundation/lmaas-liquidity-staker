// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;

contract RewardsDistributionRecipient {
    address public rewardsDistributor;

    function start(address[] calldata _rewardsTokens, uint256[] calldata _rewardsAmounts) external;

    modifier onlyRewardsDistributor() {
        require(msg.sender == rewardsDistributor, "Caller is not RewardsDistribution contract");
        _;
    }
}