// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

abstract contract StakeReceiver {

	function delegateStake(address staker, uint256 stake) virtual public;

}