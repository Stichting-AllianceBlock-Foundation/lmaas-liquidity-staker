// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

abstract contract StakeTransferer {

	mapping(address => bool) public receiversWhitelist;

	function setReceiverWhitelisted(address receiver, bool whitelisted) virtual public {
		receiversWhitelist[receiver] = whitelisted;
	}

	modifier onlyWhitelistedReceiver(address receiver) {
		require(receiversWhitelist[receiver], "exitAndTransfer::receiver is not whitelisted");
		_;
	}

	function exitAndTransfer(address transferTo) virtual public {
		
	}

}