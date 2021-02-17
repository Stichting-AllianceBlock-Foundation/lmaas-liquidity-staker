// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

abstract contract RewardsDistributionRecipient {
    address public rewardsDistributor;

    function start() external virtual;

    modifier onlyRewardsDistributor() {
        require(
            msg.sender == rewardsDistributor,
            "Caller is not RewardsDistribution contract"
        );
        _;
    }
}
