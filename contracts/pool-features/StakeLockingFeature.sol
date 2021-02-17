// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../RewardsPoolBase.sol";
import "./OnlyExitFeature.sol";

abstract contract StakeLockingFeature is OnlyExitFeature {

	modifier onlyUnlocked() {
		require(block.number > endBlock, "onlyUnlocked::cannot perform this action until the end of the campaign");
		_;
	}

	function exit() public virtual override(RewardsPoolBase) onlyUnlocked {
		RewardsPoolBase.exit();
	}

}