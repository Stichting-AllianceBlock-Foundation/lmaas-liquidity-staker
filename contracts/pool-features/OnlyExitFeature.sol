// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../RewardsPoolBase.sol";

abstract contract OnlyExitFeature is RewardsPoolBase {


	//Without the passed argument the function is not overriden
	function withdraw(uint256 _tokenAmount) public override virtual {
		revert("OnlyExitFeature::cannot withdraw from this contract. Only exit.");
	}

	function claim() public override virtual {
		revert("OnlyExitFeature::cannot claim from this contract. Only exit.");
	}

}