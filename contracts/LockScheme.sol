// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

contract LockScheme {
    uint256 public lockPeriod; // The period of lock for this contract
    uint256 public rampUpPeriod; // The period since the beginning of the lock that additions can be considered the same position.Might be 0 for the 0% lock periods

    uint256 public bonusPercent;
    address public lmcContract; // The address of the lmc contract
}
