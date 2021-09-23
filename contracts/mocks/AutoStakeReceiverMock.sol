// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../autostake-features/StakeReceiverAutoStake.sol";

contract AutoStakeReceiverMock is StakeReceiverAutoStake {
	constructor(address token, uint256 _throttleRoundBlocks, uint256 _throttleRoundCap, uint256 stakeEnd, uint256 _contractStakeLimit) public AutoStake(token, _throttleRoundBlocks, _throttleRoundCap, stakeEnd, _contractStakeLimit) {
	}
}