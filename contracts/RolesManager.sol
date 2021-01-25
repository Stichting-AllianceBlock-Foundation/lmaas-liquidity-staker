
pragma solidity 0.5.16;

import "openzeppelin-solidity-2.3.0/contracts/ownership/Ownable.sol";


/**
 * @title RolesManager
 * @dev Manages roles of accounts.
 */
contract RolesManager is Ownable {

    mapping(address => bool) private admins;
    mapping(address => bool) private operators;

    event RolesStatusModified(
        address indexed executor,
        address[] user,
        string role,
        bool status
    );

    /**
     * @dev Throws if the sender is not an admin.
     */
    modifier onlyAdmin() {
        require(
            isAdmin(msg.sender),
            "RolesManager: the caller is not an admin "
        );
        _;
    }

     /**
     * @dev Throws if the sender is not an operator.
     */
    modifier onlyOperator() {
        require(
            isOperator(msg.sender),
            "RolesManager: the caller is not an operator "
        );
        _;
    }

    /**
     * @dev Adds/Removes admin roles.
     * @param _users The target accounts.
     * @param _isAdmin Grants/Revokes admin roles.
     */
    function setAdminRole(address[] memory _users, bool _isAdmin)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < _users.length; i++) {
            require(
                _users[i] != address(0),
                "RolesManager: user is the zero address"
            );
            admins[_users[i]] = _isAdmin;
        }
        emit RolesStatusModified(msg.sender, _users, "admin", _isAdmin);
    }

        /**
     * @dev Adds/Removes operators roles.
     * @param _users The target accounts.
     * @param _isOperator Grants/Revokes operator roles.
     */
    function setOperatorRole(address[] memory _users, bool _isOperator)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < _users.length; i++) {
            require(
                _users[i] != address(0),
                "RolesManager: user is the zero address"
            );
            operators[_users[i]] = _isOperator;
        }
        emit RolesStatusModified(msg.sender, _users, "operator", _isOperator);
    }

    /**
     * @dev Checks if an account is admnin.
     * @param _user The target account.
     */
    function isAdmin(address _user) public view returns (bool) {
        return admins[_user];
    }

      /**
     * @dev Checks if an account is operator.
     * @param _user The target account.
     */
    function isOperator(address _user) public view returns (bool) {
        return operators[_user];
    }
}