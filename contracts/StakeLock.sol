// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

abstract contract StakeLock {

	uint256 public immutable lockEndTimestamp;

	constructor(uint256 _lockEndTimestamp) public {
		require(_lockEndTimestamp > block.timestamp, "setLockEnd::Lock end needs to be in the future");
		lockEndTimestamp = _lockEndTimestamp;
	}



	modifier onlyUnlocked() {
		require(block.timestamp > lockEndTimestamp, "onlyUnlocked::cannot perform this action until the end of the lock");
		_;
	}

}