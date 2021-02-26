// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./../interfaces/IUniswapV2Router.sol";
import "./../SafeERC20Detailed.sol";
import "./../interfaces/IERC20Detailed.sol";
import "./../TestERC20.sol";


contract UniswapV2RouterMock is IUniswapV2Router {
	using SafeERC20Detailed for IERC20Detailed;

	address public lpToken;

	constructor() public {
		lpToken = address(new TestERC20(uint256(-1)));
	}

	function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external override returns (uint amountA, uint amountB, uint liquidity) {
		IERC20Detailed(tokenA).safeTransferFrom(msg.sender, address(this), amountADesired);
		IERC20Detailed(tokenB).safeTransferFrom(msg.sender, address(this), amountBDesired);
		IERC20Detailed(lpToken).safeTransfer(msg.sender, 10**18);
	}
    
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external override returns (uint amountA, uint amountB) {
		IERC20Detailed(lpToken).safeTransferFrom(msg.sender, address(this), liquidity);
		IERC20Detailed(tokenA).safeTransfer(msg.sender, amountAMin);
		IERC20Detailed(tokenB).safeTransfer(msg.sender, amountBMin);
	}
}