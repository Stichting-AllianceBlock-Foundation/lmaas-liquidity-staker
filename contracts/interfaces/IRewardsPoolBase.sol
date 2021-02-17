// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IRewardsPoolBase{
 
	//View
	function getUserRewardDebt(address _userAddress, uint256 _index) external view;
	function getUserOwedTokens(address _userAddress, uint256 _index) external view;
	function getUserAccumulatedReward(address _userAddress, uint256 tokenIndex)external view returns (uint256);
	function getUserTokensOwedLength(address _userAddress) external view returns (uint256);
	function getUserRewardDebtLength(address _userAddress) external view returns (uint256);
	function calculateRewardsAmount(uint256 _startBlock, uint256 _endBlock, uint256 _rewardPerBlock) external pure returns (uint256);

	function updateRewardMultipliers() external;
	function initialiseUserTokensOwed(address _userAddress) external;
	function updateUserAccruedReward(address _userAddress) external;

	//Public/external
	function stake(uint256 _tokenAmount) external;
    function withdraw(uint256 _tokenAmount) external;
    function claim() external;
    function exit() external;
	function extend(uint256 _endBlock, uint256[] memory _rewardsPerBlock) external virtual;
}