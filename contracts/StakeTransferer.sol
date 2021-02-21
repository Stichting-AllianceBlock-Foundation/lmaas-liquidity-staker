// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

abstract contract StakeTransferer {

	function exitAndTransfer(address transferTo) virtual public;

}