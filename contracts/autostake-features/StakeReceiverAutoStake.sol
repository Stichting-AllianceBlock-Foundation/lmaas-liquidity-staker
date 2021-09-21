// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../interfaces/IERC20Detailed.sol";
import "./../SafeERC20Detailed.sol";
import "./AutoStake.sol";
import "./../StakeReceiver.sol";

abstract contract StakeReceiverAutoStake is AutoStake, StakeReceiver {
	using SafeMath for uint256;

	function delegateStake(address staker, uint256 stake) virtual override public {
		require(stake > 0, "SRAS:Err01");
		require(staker != address(0x0), "SRAS:Err02");
		_stake(stake, staker, false);
	}
}