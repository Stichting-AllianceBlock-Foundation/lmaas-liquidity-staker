// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./interfaces/IRewardsPoolBase.sol";

abstract contract AbstractPoolsFactory {
    using SafeMath for uint256;

    /** @dev all rewards pools
     */
    address[] public rewardsPools;
    address public owner;
    address internal pendingOwner;

    event ownershipTransferProposed(address indexed _oldOwner, address indexed _newOwner);
    event ownershipTransferred(address indexed _newOwner);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "onlyOwner:: The caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0x0), "Cannot set owner to 0 address");
        pendingOwner = newOwner;
        emit ownershipTransferProposed(msg.sender, owner);
    }

    function acceptOwnership() public {
        require(msg.sender == pendingOwner, "Sender is different from proposed owner");

        owner = pendingOwner;
        emit ownershipTransferred(owner);
    }

    /** @dev Returns the total number of rewards pools.
     */
    function getRewardsPoolNumber() public view returns (uint256) {
        return rewardsPools.length;
    }

    /** @dev Helper function to calculate how much tokens should be transffered to a rewards pool.
     */
    function calculateRewardsAmount(
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _rewardPerBlock
    ) public pure returns (uint256) {
        require(
            _rewardPerBlock > 0,
            "calculateRewardsAmount:: Rewards per block must be greater than zero"
        );

        uint256 rewardsPeriod = _endBlock.sub(_startBlock);

        return _rewardPerBlock.mul(rewardsPeriod);
    }

    /** @dev Triggers the withdrawal of LP rewards from the rewards pool contract to the given recipient address
	 * @param rewardsPoolAddress The address of the token being staked
	 * @param recipient The address to whom the rewards will be trasferred
	 * @param lpTokenContract The address of the rewards contract
	 */
	function withdrawLPRewards(
		address rewardsPoolAddress,
		address recipient,
		address lpTokenContract
	) external onlyOwner {
		require(
			rewardsPoolAddress != address(0),
			"startStaking:: not deployed"
		);
		IRewardsPoolBase pool = IRewardsPoolBase(rewardsPoolAddress);
		pool.withdrawLPRewards(recipient, lpTokenContract);
	}
}
