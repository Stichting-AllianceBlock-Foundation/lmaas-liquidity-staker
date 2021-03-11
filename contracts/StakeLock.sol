// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

abstract contract StakeLock {

	uint256 public immutable lockEndBlock;

	constructor(uint256 _lockEndBlock) public {
		require(_lockEndBlock > block.number, "setLockEnd::Lock end needs to be in the future");
		lockEndBlock = _lockEndBlock;
	}



	modifier onlyUnlocked() {
		require(block.number > lockEndBlock, "onlyUnlocked::cannot perform this action until the end of the lock");
		_;
	}

}