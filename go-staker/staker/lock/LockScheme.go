// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package lock

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// LockMetaData contains all meta data concerning the Lock contract.
var LockMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_lockPeriod\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"_rampUpPeriod\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"_bonusPercent\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"_lmcContract\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"bonus\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"isBonusForreied\",\"type\":\"bool\"}],\"name\":\"Exit\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_amountLocked\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_additionalReward\",\"type\":\"uint256\"}],\"name\":\"Lock\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"bonusPercent\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"exit\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"bonus\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"forfeitedBonuses\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"getUserAccruedReward\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"getUserBonus\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"bonus\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"getUserLockedStake\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"hasUserRampUpEnded\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"lmcContract\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_amountToLock\",\"type\":\"uint256\"}],\"name\":\"lock\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"lockPeriod\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"rampUpPeriod\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_rewards\",\"type\":\"uint256\"}],\"name\":\"updateUserAccruedRewards\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"userInfo\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"balance\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"accruedReward\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"lockInitialStakeBlock\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
}

// LockABI is the input ABI used to generate the binding from.
// Deprecated: Use LockMetaData.ABI instead.
var LockABI = LockMetaData.ABI

// Lock is an auto generated Go binding around an Ethereum contract.
type Lock struct {
	LockCaller     // Read-only binding to the contract
	LockTransactor // Write-only binding to the contract
	LockFilterer   // Log filterer for contract events
}

// LockCaller is an auto generated read-only Go binding around an Ethereum contract.
type LockCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// LockTransactor is an auto generated write-only Go binding around an Ethereum contract.
type LockTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// LockFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type LockFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// LockSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type LockSession struct {
	Contract     *Lock             // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// LockCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type LockCallerSession struct {
	Contract *LockCaller   // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// LockTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type LockTransactorSession struct {
	Contract     *LockTransactor   // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// LockRaw is an auto generated low-level Go binding around an Ethereum contract.
type LockRaw struct {
	Contract *Lock // Generic contract binding to access the raw methods on
}

// LockCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type LockCallerRaw struct {
	Contract *LockCaller // Generic read-only contract binding to access the raw methods on
}

// LockTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type LockTransactorRaw struct {
	Contract *LockTransactor // Generic write-only contract binding to access the raw methods on
}

// NewLock creates a new instance of Lock, bound to a specific deployed contract.
func NewLock(address common.Address, backend bind.ContractBackend) (*Lock, error) {
	contract, err := bindLock(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Lock{LockCaller: LockCaller{contract: contract}, LockTransactor: LockTransactor{contract: contract}, LockFilterer: LockFilterer{contract: contract}}, nil
}

// NewLockCaller creates a new read-only instance of Lock, bound to a specific deployed contract.
func NewLockCaller(address common.Address, caller bind.ContractCaller) (*LockCaller, error) {
	contract, err := bindLock(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &LockCaller{contract: contract}, nil
}

// NewLockTransactor creates a new write-only instance of Lock, bound to a specific deployed contract.
func NewLockTransactor(address common.Address, transactor bind.ContractTransactor) (*LockTransactor, error) {
	contract, err := bindLock(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &LockTransactor{contract: contract}, nil
}

// NewLockFilterer creates a new log filterer instance of Lock, bound to a specific deployed contract.
func NewLockFilterer(address common.Address, filterer bind.ContractFilterer) (*LockFilterer, error) {
	contract, err := bindLock(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &LockFilterer{contract: contract}, nil
}

// bindLock binds a generic wrapper to an already deployed contract.
func bindLock(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(LockABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Lock *LockRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Lock.Contract.LockCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Lock *LockRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Lock.Contract.LockTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Lock *LockRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Lock.Contract.LockTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Lock *LockCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Lock.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Lock *LockTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Lock.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Lock *LockTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Lock.Contract.contract.Transact(opts, method, params...)
}

// BonusPercent is a free data retrieval call binding the contract method 0xbecf3add.
//
// Solidity: function bonusPercent() view returns(uint256)
func (_Lock *LockCaller) BonusPercent(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Lock.contract.Call(opts, &out, "bonusPercent")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// BonusPercent is a free data retrieval call binding the contract method 0xbecf3add.
//
// Solidity: function bonusPercent() view returns(uint256)
func (_Lock *LockSession) BonusPercent() (*big.Int, error) {
	return _Lock.Contract.BonusPercent(&_Lock.CallOpts)
}

// BonusPercent is a free data retrieval call binding the contract method 0xbecf3add.
//
// Solidity: function bonusPercent() view returns(uint256)
func (_Lock *LockCallerSession) BonusPercent() (*big.Int, error) {
	return _Lock.Contract.BonusPercent(&_Lock.CallOpts)
}

// ForfeitedBonuses is a free data retrieval call binding the contract method 0xa94d1f50.
//
// Solidity: function forfeitedBonuses() view returns(uint256)
func (_Lock *LockCaller) ForfeitedBonuses(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Lock.contract.Call(opts, &out, "forfeitedBonuses")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// ForfeitedBonuses is a free data retrieval call binding the contract method 0xa94d1f50.
//
// Solidity: function forfeitedBonuses() view returns(uint256)
func (_Lock *LockSession) ForfeitedBonuses() (*big.Int, error) {
	return _Lock.Contract.ForfeitedBonuses(&_Lock.CallOpts)
}

// ForfeitedBonuses is a free data retrieval call binding the contract method 0xa94d1f50.
//
// Solidity: function forfeitedBonuses() view returns(uint256)
func (_Lock *LockCallerSession) ForfeitedBonuses() (*big.Int, error) {
	return _Lock.Contract.ForfeitedBonuses(&_Lock.CallOpts)
}

// GetUserAccruedReward is a free data retrieval call binding the contract method 0x83a43772.
//
// Solidity: function getUserAccruedReward(address _userAddress) view returns(uint256)
func (_Lock *LockCaller) GetUserAccruedReward(opts *bind.CallOpts, _userAddress common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Lock.contract.Call(opts, &out, "getUserAccruedReward", _userAddress)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserAccruedReward is a free data retrieval call binding the contract method 0x83a43772.
//
// Solidity: function getUserAccruedReward(address _userAddress) view returns(uint256)
func (_Lock *LockSession) GetUserAccruedReward(_userAddress common.Address) (*big.Int, error) {
	return _Lock.Contract.GetUserAccruedReward(&_Lock.CallOpts, _userAddress)
}

// GetUserAccruedReward is a free data retrieval call binding the contract method 0x83a43772.
//
// Solidity: function getUserAccruedReward(address _userAddress) view returns(uint256)
func (_Lock *LockCallerSession) GetUserAccruedReward(_userAddress common.Address) (*big.Int, error) {
	return _Lock.Contract.GetUserAccruedReward(&_Lock.CallOpts, _userAddress)
}

// GetUserBonus is a free data retrieval call binding the contract method 0xff3fa15b.
//
// Solidity: function getUserBonus(address _userAddress) view returns(uint256 bonus)
func (_Lock *LockCaller) GetUserBonus(opts *bind.CallOpts, _userAddress common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Lock.contract.Call(opts, &out, "getUserBonus", _userAddress)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserBonus is a free data retrieval call binding the contract method 0xff3fa15b.
//
// Solidity: function getUserBonus(address _userAddress) view returns(uint256 bonus)
func (_Lock *LockSession) GetUserBonus(_userAddress common.Address) (*big.Int, error) {
	return _Lock.Contract.GetUserBonus(&_Lock.CallOpts, _userAddress)
}

// GetUserBonus is a free data retrieval call binding the contract method 0xff3fa15b.
//
// Solidity: function getUserBonus(address _userAddress) view returns(uint256 bonus)
func (_Lock *LockCallerSession) GetUserBonus(_userAddress common.Address) (*big.Int, error) {
	return _Lock.Contract.GetUserBonus(&_Lock.CallOpts, _userAddress)
}

// GetUserLockedStake is a free data retrieval call binding the contract method 0x22b0039a.
//
// Solidity: function getUserLockedStake(address _userAddress) view returns(uint256)
func (_Lock *LockCaller) GetUserLockedStake(opts *bind.CallOpts, _userAddress common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Lock.contract.Call(opts, &out, "getUserLockedStake", _userAddress)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserLockedStake is a free data retrieval call binding the contract method 0x22b0039a.
//
// Solidity: function getUserLockedStake(address _userAddress) view returns(uint256)
func (_Lock *LockSession) GetUserLockedStake(_userAddress common.Address) (*big.Int, error) {
	return _Lock.Contract.GetUserLockedStake(&_Lock.CallOpts, _userAddress)
}

// GetUserLockedStake is a free data retrieval call binding the contract method 0x22b0039a.
//
// Solidity: function getUserLockedStake(address _userAddress) view returns(uint256)
func (_Lock *LockCallerSession) GetUserLockedStake(_userAddress common.Address) (*big.Int, error) {
	return _Lock.Contract.GetUserLockedStake(&_Lock.CallOpts, _userAddress)
}

// HasUserRampUpEnded is a free data retrieval call binding the contract method 0xf884b5c9.
//
// Solidity: function hasUserRampUpEnded(address _userAddress) view returns(bool)
func (_Lock *LockCaller) HasUserRampUpEnded(opts *bind.CallOpts, _userAddress common.Address) (bool, error) {
	var out []interface{}
	err := _Lock.contract.Call(opts, &out, "hasUserRampUpEnded", _userAddress)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// HasUserRampUpEnded is a free data retrieval call binding the contract method 0xf884b5c9.
//
// Solidity: function hasUserRampUpEnded(address _userAddress) view returns(bool)
func (_Lock *LockSession) HasUserRampUpEnded(_userAddress common.Address) (bool, error) {
	return _Lock.Contract.HasUserRampUpEnded(&_Lock.CallOpts, _userAddress)
}

// HasUserRampUpEnded is a free data retrieval call binding the contract method 0xf884b5c9.
//
// Solidity: function hasUserRampUpEnded(address _userAddress) view returns(bool)
func (_Lock *LockCallerSession) HasUserRampUpEnded(_userAddress common.Address) (bool, error) {
	return _Lock.Contract.HasUserRampUpEnded(&_Lock.CallOpts, _userAddress)
}

// LmcContract is a free data retrieval call binding the contract method 0x7005e21f.
//
// Solidity: function lmcContract() view returns(address)
func (_Lock *LockCaller) LmcContract(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Lock.contract.Call(opts, &out, "lmcContract")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// LmcContract is a free data retrieval call binding the contract method 0x7005e21f.
//
// Solidity: function lmcContract() view returns(address)
func (_Lock *LockSession) LmcContract() (common.Address, error) {
	return _Lock.Contract.LmcContract(&_Lock.CallOpts)
}

// LmcContract is a free data retrieval call binding the contract method 0x7005e21f.
//
// Solidity: function lmcContract() view returns(address)
func (_Lock *LockCallerSession) LmcContract() (common.Address, error) {
	return _Lock.Contract.LmcContract(&_Lock.CallOpts)
}

// LockPeriod is a free data retrieval call binding the contract method 0x3fd8b02f.
//
// Solidity: function lockPeriod() view returns(uint256)
func (_Lock *LockCaller) LockPeriod(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Lock.contract.Call(opts, &out, "lockPeriod")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// LockPeriod is a free data retrieval call binding the contract method 0x3fd8b02f.
//
// Solidity: function lockPeriod() view returns(uint256)
func (_Lock *LockSession) LockPeriod() (*big.Int, error) {
	return _Lock.Contract.LockPeriod(&_Lock.CallOpts)
}

// LockPeriod is a free data retrieval call binding the contract method 0x3fd8b02f.
//
// Solidity: function lockPeriod() view returns(uint256)
func (_Lock *LockCallerSession) LockPeriod() (*big.Int, error) {
	return _Lock.Contract.LockPeriod(&_Lock.CallOpts)
}

// RampUpPeriod is a free data retrieval call binding the contract method 0xd1079111.
//
// Solidity: function rampUpPeriod() view returns(uint256)
func (_Lock *LockCaller) RampUpPeriod(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Lock.contract.Call(opts, &out, "rampUpPeriod")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// RampUpPeriod is a free data retrieval call binding the contract method 0xd1079111.
//
// Solidity: function rampUpPeriod() view returns(uint256)
func (_Lock *LockSession) RampUpPeriod() (*big.Int, error) {
	return _Lock.Contract.RampUpPeriod(&_Lock.CallOpts)
}

// RampUpPeriod is a free data retrieval call binding the contract method 0xd1079111.
//
// Solidity: function rampUpPeriod() view returns(uint256)
func (_Lock *LockCallerSession) RampUpPeriod() (*big.Int, error) {
	return _Lock.Contract.RampUpPeriod(&_Lock.CallOpts)
}

// UserInfo is a free data retrieval call binding the contract method 0x1959a002.
//
// Solidity: function userInfo(address ) view returns(uint256 balance, uint256 accruedReward, uint256 lockInitialStakeBlock)
func (_Lock *LockCaller) UserInfo(opts *bind.CallOpts, arg0 common.Address) (struct {
	Balance               *big.Int
	AccruedReward         *big.Int
	LockInitialStakeBlock *big.Int
}, error) {
	var out []interface{}
	err := _Lock.contract.Call(opts, &out, "userInfo", arg0)

	outstruct := new(struct {
		Balance               *big.Int
		AccruedReward         *big.Int
		LockInitialStakeBlock *big.Int
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.Balance = *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	outstruct.AccruedReward = *abi.ConvertType(out[1], new(*big.Int)).(**big.Int)
	outstruct.LockInitialStakeBlock = *abi.ConvertType(out[2], new(*big.Int)).(**big.Int)

	return *outstruct, err

}

// UserInfo is a free data retrieval call binding the contract method 0x1959a002.
//
// Solidity: function userInfo(address ) view returns(uint256 balance, uint256 accruedReward, uint256 lockInitialStakeBlock)
func (_Lock *LockSession) UserInfo(arg0 common.Address) (struct {
	Balance               *big.Int
	AccruedReward         *big.Int
	LockInitialStakeBlock *big.Int
}, error) {
	return _Lock.Contract.UserInfo(&_Lock.CallOpts, arg0)
}

// UserInfo is a free data retrieval call binding the contract method 0x1959a002.
//
// Solidity: function userInfo(address ) view returns(uint256 balance, uint256 accruedReward, uint256 lockInitialStakeBlock)
func (_Lock *LockCallerSession) UserInfo(arg0 common.Address) (struct {
	Balance               *big.Int
	AccruedReward         *big.Int
	LockInitialStakeBlock *big.Int
}, error) {
	return _Lock.Contract.UserInfo(&_Lock.CallOpts, arg0)
}

// Exit is a paid mutator transaction binding the contract method 0xb42652e9.
//
// Solidity: function exit(address _userAddress) returns(uint256 bonus)
func (_Lock *LockTransactor) Exit(opts *bind.TransactOpts, _userAddress common.Address) (*types.Transaction, error) {
	return _Lock.contract.Transact(opts, "exit", _userAddress)
}

// Exit is a paid mutator transaction binding the contract method 0xb42652e9.
//
// Solidity: function exit(address _userAddress) returns(uint256 bonus)
func (_Lock *LockSession) Exit(_userAddress common.Address) (*types.Transaction, error) {
	return _Lock.Contract.Exit(&_Lock.TransactOpts, _userAddress)
}

// Exit is a paid mutator transaction binding the contract method 0xb42652e9.
//
// Solidity: function exit(address _userAddress) returns(uint256 bonus)
func (_Lock *LockTransactorSession) Exit(_userAddress common.Address) (*types.Transaction, error) {
	return _Lock.Contract.Exit(&_Lock.TransactOpts, _userAddress)
}

// Lock is a paid mutator transaction binding the contract method 0x282d3fdf.
//
// Solidity: function lock(address _userAddress, uint256 _amountToLock) returns()
func (_Lock *LockTransactor) Lock(opts *bind.TransactOpts, _userAddress common.Address, _amountToLock *big.Int) (*types.Transaction, error) {
	return _Lock.contract.Transact(opts, "lock", _userAddress, _amountToLock)
}

// Lock is a paid mutator transaction binding the contract method 0x282d3fdf.
//
// Solidity: function lock(address _userAddress, uint256 _amountToLock) returns()
func (_Lock *LockSession) Lock(_userAddress common.Address, _amountToLock *big.Int) (*types.Transaction, error) {
	return _Lock.Contract.Lock(&_Lock.TransactOpts, _userAddress, _amountToLock)
}

// Lock is a paid mutator transaction binding the contract method 0x282d3fdf.
//
// Solidity: function lock(address _userAddress, uint256 _amountToLock) returns()
func (_Lock *LockTransactorSession) Lock(_userAddress common.Address, _amountToLock *big.Int) (*types.Transaction, error) {
	return _Lock.Contract.Lock(&_Lock.TransactOpts, _userAddress, _amountToLock)
}

// UpdateUserAccruedRewards is a paid mutator transaction binding the contract method 0x8c6cf611.
//
// Solidity: function updateUserAccruedRewards(address _userAddress, uint256 _rewards) returns()
func (_Lock *LockTransactor) UpdateUserAccruedRewards(opts *bind.TransactOpts, _userAddress common.Address, _rewards *big.Int) (*types.Transaction, error) {
	return _Lock.contract.Transact(opts, "updateUserAccruedRewards", _userAddress, _rewards)
}

// UpdateUserAccruedRewards is a paid mutator transaction binding the contract method 0x8c6cf611.
//
// Solidity: function updateUserAccruedRewards(address _userAddress, uint256 _rewards) returns()
func (_Lock *LockSession) UpdateUserAccruedRewards(_userAddress common.Address, _rewards *big.Int) (*types.Transaction, error) {
	return _Lock.Contract.UpdateUserAccruedRewards(&_Lock.TransactOpts, _userAddress, _rewards)
}

// UpdateUserAccruedRewards is a paid mutator transaction binding the contract method 0x8c6cf611.
//
// Solidity: function updateUserAccruedRewards(address _userAddress, uint256 _rewards) returns()
func (_Lock *LockTransactorSession) UpdateUserAccruedRewards(_userAddress common.Address, _rewards *big.Int) (*types.Transaction, error) {
	return _Lock.Contract.UpdateUserAccruedRewards(&_Lock.TransactOpts, _userAddress, _rewards)
}

// LockExitIterator is returned from FilterExit and is used to iterate over the raw logs and unpacked data for Exit events raised by the Lock contract.
type LockExitIterator struct {
	Event *LockExit // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *LockExitIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(LockExit)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(LockExit)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *LockExitIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *LockExitIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// LockExit represents a Exit event raised by the Lock contract.
type LockExit struct {
	UserAddress     common.Address
	Bonus           *big.Int
	IsBonusForreied bool
	Raw             types.Log // Blockchain specific contextual infos
}

// FilterExit is a free log retrieval operation binding the contract event 0x50b652bf9592103738226e458011e77a50cee8c4d8cd0fb5191b13e7404cbc8d.
//
// Solidity: event Exit(address indexed _userAddress, uint256 bonus, bool isBonusForreied)
func (_Lock *LockFilterer) FilterExit(opts *bind.FilterOpts, _userAddress []common.Address) (*LockExitIterator, error) {

	var _userAddressRule []interface{}
	for _, _userAddressItem := range _userAddress {
		_userAddressRule = append(_userAddressRule, _userAddressItem)
	}

	logs, sub, err := _Lock.contract.FilterLogs(opts, "Exit", _userAddressRule)
	if err != nil {
		return nil, err
	}
	return &LockExitIterator{contract: _Lock.contract, event: "Exit", logs: logs, sub: sub}, nil
}

// WatchExit is a free log subscription operation binding the contract event 0x50b652bf9592103738226e458011e77a50cee8c4d8cd0fb5191b13e7404cbc8d.
//
// Solidity: event Exit(address indexed _userAddress, uint256 bonus, bool isBonusForreied)
func (_Lock *LockFilterer) WatchExit(opts *bind.WatchOpts, sink chan<- *LockExit, _userAddress []common.Address) (event.Subscription, error) {

	var _userAddressRule []interface{}
	for _, _userAddressItem := range _userAddress {
		_userAddressRule = append(_userAddressRule, _userAddressItem)
	}

	logs, sub, err := _Lock.contract.WatchLogs(opts, "Exit", _userAddressRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(LockExit)
				if err := _Lock.contract.UnpackLog(event, "Exit", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseExit is a log parse operation binding the contract event 0x50b652bf9592103738226e458011e77a50cee8c4d8cd0fb5191b13e7404cbc8d.
//
// Solidity: event Exit(address indexed _userAddress, uint256 bonus, bool isBonusForreied)
func (_Lock *LockFilterer) ParseExit(log types.Log) (*LockExit, error) {
	event := new(LockExit)
	if err := _Lock.contract.UnpackLog(event, "Exit", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// LockLockIterator is returned from FilterLock and is used to iterate over the raw logs and unpacked data for Lock events raised by the Lock contract.
type LockLockIterator struct {
	Event *LockLock // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *LockLockIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(LockLock)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(LockLock)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *LockLockIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *LockLockIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// LockLock represents a Lock event raised by the Lock contract.
type LockLock struct {
	UserAddress      common.Address
	AmountLocked     *big.Int
	AdditionalReward *big.Int
	Raw              types.Log // Blockchain specific contextual infos
}

// FilterLock is a free log retrieval operation binding the contract event 0x49eaf4942f1237055eb4cfa5f31c9dfe50d5b4ade01e021f7de8be2fbbde557b.
//
// Solidity: event Lock(address indexed _userAddress, uint256 _amountLocked, uint256 _additionalReward)
func (_Lock *LockFilterer) FilterLock(opts *bind.FilterOpts, _userAddress []common.Address) (*LockLockIterator, error) {

	var _userAddressRule []interface{}
	for _, _userAddressItem := range _userAddress {
		_userAddressRule = append(_userAddressRule, _userAddressItem)
	}

	logs, sub, err := _Lock.contract.FilterLogs(opts, "Lock", _userAddressRule)
	if err != nil {
		return nil, err
	}
	return &LockLockIterator{contract: _Lock.contract, event: "Lock", logs: logs, sub: sub}, nil
}

// WatchLock is a free log subscription operation binding the contract event 0x49eaf4942f1237055eb4cfa5f31c9dfe50d5b4ade01e021f7de8be2fbbde557b.
//
// Solidity: event Lock(address indexed _userAddress, uint256 _amountLocked, uint256 _additionalReward)
func (_Lock *LockFilterer) WatchLock(opts *bind.WatchOpts, sink chan<- *LockLock, _userAddress []common.Address) (event.Subscription, error) {

	var _userAddressRule []interface{}
	for _, _userAddressItem := range _userAddress {
		_userAddressRule = append(_userAddressRule, _userAddressItem)
	}

	logs, sub, err := _Lock.contract.WatchLogs(opts, "Lock", _userAddressRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(LockLock)
				if err := _Lock.contract.UnpackLog(event, "Lock", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseLock is a log parse operation binding the contract event 0x49eaf4942f1237055eb4cfa5f31c9dfe50d5b4ade01e021f7de8be2fbbde557b.
//
// Solidity: event Lock(address indexed _userAddress, uint256 _amountLocked, uint256 _additionalReward)
func (_Lock *LockFilterer) ParseLock(log types.Log) (*LockLock, error) {
	event := new(LockLock)
	if err := _Lock.contract.UnpackLog(event, "Lock", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
