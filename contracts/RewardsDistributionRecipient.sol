// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract RewardsDistributionRecipient {
    address public rewardsDistribution;

    function start(address[] calldata _rewardsTokens, uint256[] calldata _rewardsAmounts) external;

    modifier onlyRewardsDistribution() {
        require(msg.sender == rewardsDistribution, "Caller is not RewardsDistribution contract");
        _;
    }
}