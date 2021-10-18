// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../autostake-features/StakeTransfererAutoStake.sol";

contract AutoStakeTransfererMock is StakeTransfererAutoStake {
	constructor(address token, uint256 _throttleRoundBlocks, uint256 _throttleRoundCap, uint256 stakeEnd, uint256 _virtualBlockTime) public AutoStake(token, _throttleRoundBlocks, _throttleRoundCap, stakeEnd, _virtualBlockTime) {
	}
}