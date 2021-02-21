// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

abstract contract StakeLock {

	uint256 public lockEndBlock;

	function setLockEnd(uint256 _lockEndBlock) internal {
		require(_lockEndBlock > block.number, "setLockEnd::Lock end needs to be in the future");
		require(lockEndBlock == 0, "setLockEnd::Lock end was already set");
		lockEndBlock = _lockEndBlock;
	}

	modifier onlyUnlocked() {
		require(block.number > lockEndBlock, "onlyUnlocked::cannot perform this action until the end of the lock");
		_;
	}

}