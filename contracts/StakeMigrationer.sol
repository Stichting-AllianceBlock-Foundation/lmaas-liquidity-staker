// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

abstract contract StakeMigrationer {

	function _stakeAndLock(address staker, uint256 stake, address lockScheme,bool chargeStaker) virtual public;

}