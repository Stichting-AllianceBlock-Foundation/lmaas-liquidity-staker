// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;

contract RewardsDistributionRecipient {
    address public rewardsDistributor;

    function start() external;

    modifier onlyRewardsDistributor() {
        require(msg.sender == rewardsDistributor, "Caller is not RewardsDistribution contract");
        _;
    }
}