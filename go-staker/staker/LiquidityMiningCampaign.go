// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package staker

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

// StakerMetaData contains all meta data concerning the Staker contract.
var StakerMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"contractIERC20Detailed\",\"name\":\"_stakingToken\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_startBlock\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"_endBlock\",\"type\":\"uint256\"},{\"internalType\":\"address[]\",\"name\":\"_rewardsTokens\",\"type\":\"address[]\"},{\"internalType\":\"uint256[]\",\"name\":\"_rewardPerBlock\",\"type\":\"uint256[]\"},{\"internalType\":\"address\",\"name\":\"_albtAddress\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_stakeLimit\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"_contractStakeLimit\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_bonusAmount\",\"type\":\"uint256\"}],\"name\":\"BonusTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"}],\"name\":\"Claimed\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"Exited\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"ExitedAndUnlocked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"newEndBlock\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256[]\",\"name\":\"newRewardsPerBlock\",\"type\":\"uint256[]\"}],\"name\":\"Extended\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"Staked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"_tokenAmount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"_lockScheme\",\"type\":\"address\"}],\"name\":\"StakedAndLocked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"rewardsAmount\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"}],\"name\":\"WithdrawLPRewards\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"Withdrawn\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"accumulatedRewardMultiplier\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"claim\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"contractStakeLimit\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"endBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"exit\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_stakePool\",\"type\":\"address\"}],\"name\":\"exitAndStake\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"transferTo\",\"type\":\"address\"}],\"name\":\"exitAndTransfer\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"exitAndUnlock\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_endBlock\",\"type\":\"uint256\"},{\"internalType\":\"uint256[]\",\"name\":\"_rewardsPerBlock\",\"type\":\"uint256[]\"},{\"internalType\":\"uint256[]\",\"name\":\"_currentRemainingRewards\",\"type\":\"uint256[]\"},{\"internalType\":\"uint256[]\",\"name\":\"_newRemainingRewards\",\"type\":\"uint256[]\"}],\"name\":\"extend\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getRewardTokensCount\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenIndex\",\"type\":\"uint256\"}],\"name\":\"getUserAccumulatedReward\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_index\",\"type\":\"uint256\"}],\"name\":\"getUserOwedTokens\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_index\",\"type\":\"uint256\"}],\"name\":\"getUserRewardDebt\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"getUserRewardDebtLength\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"getUserTokensOwedLength\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"hasStakingStarted\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"lastRewardBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"lockSchemes\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"lockSchemesExist\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"receiversWhitelist\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"rewardPerBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"rewardToken\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"rewardsPoolFactory\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"rewardsTokens\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address[]\",\"name\":\"_lockSchemes\",\"type\":\"address[]\"}],\"name\":\"setLockSchemes\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"receiver\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"whitelisted\",\"type\":\"bool\"}],\"name\":\"setReceiverWhitelisted\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_tokenAmount\",\"type\":\"uint256\"}],\"name\":\"stake\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_tokenAmount\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"_lockScheme\",\"type\":\"address\"}],\"name\":\"stakeAndLock\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"stakeLimit\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"stakingToken\",\"outputs\":[{\"internalType\":\"contractIERC20Detailed\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"startBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"totalStaked\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"updateRewardMultipliers\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"userAccruedRewards\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"userInfo\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"firstStakedBlockNumber\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"amountStaked\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_tokenAmount\",\"type\":\"uint256\"}],\"name\":\"withdraw\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"lpTokenContract\",\"type\":\"address\"}],\"name\":\"withdrawLPRewards\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
}

// StakerABI is the input ABI used to generate the binding from.
// Deprecated: Use StakerMetaData.ABI instead.
var StakerABI = StakerMetaData.ABI

// Staker is an auto generated Go binding around an Ethereum contract.
type Staker struct {
	StakerCaller     // Read-only binding to the contract
	StakerTransactor // Write-only binding to the contract
	StakerFilterer   // Log filterer for contract events
}

// StakerCaller is an auto generated read-only Go binding around an Ethereum contract.
type StakerCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StakerTransactor is an auto generated write-only Go binding around an Ethereum contract.
type StakerTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StakerFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type StakerFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StakerSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type StakerSession struct {
	Contract     *Staker           // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// StakerCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type StakerCallerSession struct {
	Contract *StakerCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// StakerTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type StakerTransactorSession struct {
	Contract     *StakerTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// StakerRaw is an auto generated low-level Go binding around an Ethereum contract.
type StakerRaw struct {
	Contract *Staker // Generic contract binding to access the raw methods on
}

// StakerCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type StakerCallerRaw struct {
	Contract *StakerCaller // Generic read-only contract binding to access the raw methods on
}

// StakerTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type StakerTransactorRaw struct {
	Contract *StakerTransactor // Generic write-only contract binding to access the raw methods on
}

// NewStaker creates a new instance of Staker, bound to a specific deployed contract.
func NewStaker(address common.Address, backend bind.ContractBackend) (*Staker, error) {
	contract, err := bindStaker(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Staker{StakerCaller: StakerCaller{contract: contract}, StakerTransactor: StakerTransactor{contract: contract}, StakerFilterer: StakerFilterer{contract: contract}}, nil
}

// NewStakerCaller creates a new read-only instance of Staker, bound to a specific deployed contract.
func NewStakerCaller(address common.Address, caller bind.ContractCaller) (*StakerCaller, error) {
	contract, err := bindStaker(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &StakerCaller{contract: contract}, nil
}

// NewStakerTransactor creates a new write-only instance of Staker, bound to a specific deployed contract.
func NewStakerTransactor(address common.Address, transactor bind.ContractTransactor) (*StakerTransactor, error) {
	contract, err := bindStaker(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &StakerTransactor{contract: contract}, nil
}

// NewStakerFilterer creates a new log filterer instance of Staker, bound to a specific deployed contract.
func NewStakerFilterer(address common.Address, filterer bind.ContractFilterer) (*StakerFilterer, error) {
	contract, err := bindStaker(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &StakerFilterer{contract: contract}, nil
}

// bindStaker binds a generic wrapper to an already deployed contract.
func bindStaker(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(StakerABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Staker *StakerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Staker.Contract.StakerCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Staker *StakerRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Staker.Contract.StakerTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Staker *StakerRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Staker.Contract.StakerTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Staker *StakerCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Staker.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Staker *StakerTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Staker.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Staker *StakerTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Staker.Contract.contract.Transact(opts, method, params...)
}

// AccumulatedRewardMultiplier is a free data retrieval call binding the contract method 0xfb58cad1.
//
// Solidity: function accumulatedRewardMultiplier(uint256 ) view returns(uint256)
func (_Staker *StakerCaller) AccumulatedRewardMultiplier(opts *bind.CallOpts, arg0 *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "accumulatedRewardMultiplier", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AccumulatedRewardMultiplier is a free data retrieval call binding the contract method 0xfb58cad1.
//
// Solidity: function accumulatedRewardMultiplier(uint256 ) view returns(uint256)
func (_Staker *StakerSession) AccumulatedRewardMultiplier(arg0 *big.Int) (*big.Int, error) {
	return _Staker.Contract.AccumulatedRewardMultiplier(&_Staker.CallOpts, arg0)
}

// AccumulatedRewardMultiplier is a free data retrieval call binding the contract method 0xfb58cad1.
//
// Solidity: function accumulatedRewardMultiplier(uint256 ) view returns(uint256)
func (_Staker *StakerCallerSession) AccumulatedRewardMultiplier(arg0 *big.Int) (*big.Int, error) {
	return _Staker.Contract.AccumulatedRewardMultiplier(&_Staker.CallOpts, arg0)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address _userAddress) view returns(uint256)
func (_Staker *StakerCaller) BalanceOf(opts *bind.CallOpts, _userAddress common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "balanceOf", _userAddress)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address _userAddress) view returns(uint256)
func (_Staker *StakerSession) BalanceOf(_userAddress common.Address) (*big.Int, error) {
	return _Staker.Contract.BalanceOf(&_Staker.CallOpts, _userAddress)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address _userAddress) view returns(uint256)
func (_Staker *StakerCallerSession) BalanceOf(_userAddress common.Address) (*big.Int, error) {
	return _Staker.Contract.BalanceOf(&_Staker.CallOpts, _userAddress)
}

// ContractStakeLimit is a free data retrieval call binding the contract method 0x03d1dae0.
//
// Solidity: function contractStakeLimit() view returns(uint256)
func (_Staker *StakerCaller) ContractStakeLimit(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "contractStakeLimit")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// ContractStakeLimit is a free data retrieval call binding the contract method 0x03d1dae0.
//
// Solidity: function contractStakeLimit() view returns(uint256)
func (_Staker *StakerSession) ContractStakeLimit() (*big.Int, error) {
	return _Staker.Contract.ContractStakeLimit(&_Staker.CallOpts)
}

// ContractStakeLimit is a free data retrieval call binding the contract method 0x03d1dae0.
//
// Solidity: function contractStakeLimit() view returns(uint256)
func (_Staker *StakerCallerSession) ContractStakeLimit() (*big.Int, error) {
	return _Staker.Contract.ContractStakeLimit(&_Staker.CallOpts)
}

// EndBlock is a free data retrieval call binding the contract method 0x083c6323.
//
// Solidity: function endBlock() view returns(uint256)
func (_Staker *StakerCaller) EndBlock(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "endBlock")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// EndBlock is a free data retrieval call binding the contract method 0x083c6323.
//
// Solidity: function endBlock() view returns(uint256)
func (_Staker *StakerSession) EndBlock() (*big.Int, error) {
	return _Staker.Contract.EndBlock(&_Staker.CallOpts)
}

// EndBlock is a free data retrieval call binding the contract method 0x083c6323.
//
// Solidity: function endBlock() view returns(uint256)
func (_Staker *StakerCallerSession) EndBlock() (*big.Int, error) {
	return _Staker.Contract.EndBlock(&_Staker.CallOpts)
}

// GetRewardTokensCount is a free data retrieval call binding the contract method 0x2d9e88e1.
//
// Solidity: function getRewardTokensCount() view returns(uint256)
func (_Staker *StakerCaller) GetRewardTokensCount(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "getRewardTokensCount")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetRewardTokensCount is a free data retrieval call binding the contract method 0x2d9e88e1.
//
// Solidity: function getRewardTokensCount() view returns(uint256)
func (_Staker *StakerSession) GetRewardTokensCount() (*big.Int, error) {
	return _Staker.Contract.GetRewardTokensCount(&_Staker.CallOpts)
}

// GetRewardTokensCount is a free data retrieval call binding the contract method 0x2d9e88e1.
//
// Solidity: function getRewardTokensCount() view returns(uint256)
func (_Staker *StakerCallerSession) GetRewardTokensCount() (*big.Int, error) {
	return _Staker.Contract.GetRewardTokensCount(&_Staker.CallOpts)
}

// GetUserAccumulatedReward is a free data retrieval call binding the contract method 0xdf9d777f.
//
// Solidity: function getUserAccumulatedReward(address _userAddress, uint256 tokenIndex) view returns(uint256)
func (_Staker *StakerCaller) GetUserAccumulatedReward(opts *bind.CallOpts, _userAddress common.Address, tokenIndex *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "getUserAccumulatedReward", _userAddress, tokenIndex)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserAccumulatedReward is a free data retrieval call binding the contract method 0xdf9d777f.
//
// Solidity: function getUserAccumulatedReward(address _userAddress, uint256 tokenIndex) view returns(uint256)
func (_Staker *StakerSession) GetUserAccumulatedReward(_userAddress common.Address, tokenIndex *big.Int) (*big.Int, error) {
	return _Staker.Contract.GetUserAccumulatedReward(&_Staker.CallOpts, _userAddress, tokenIndex)
}

// GetUserAccumulatedReward is a free data retrieval call binding the contract method 0xdf9d777f.
//
// Solidity: function getUserAccumulatedReward(address _userAddress, uint256 tokenIndex) view returns(uint256)
func (_Staker *StakerCallerSession) GetUserAccumulatedReward(_userAddress common.Address, tokenIndex *big.Int) (*big.Int, error) {
	return _Staker.Contract.GetUserAccumulatedReward(&_Staker.CallOpts, _userAddress, tokenIndex)
}

// GetUserOwedTokens is a free data retrieval call binding the contract method 0xce415302.
//
// Solidity: function getUserOwedTokens(address _userAddress, uint256 _index) view returns(uint256)
func (_Staker *StakerCaller) GetUserOwedTokens(opts *bind.CallOpts, _userAddress common.Address, _index *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "getUserOwedTokens", _userAddress, _index)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserOwedTokens is a free data retrieval call binding the contract method 0xce415302.
//
// Solidity: function getUserOwedTokens(address _userAddress, uint256 _index) view returns(uint256)
func (_Staker *StakerSession) GetUserOwedTokens(_userAddress common.Address, _index *big.Int) (*big.Int, error) {
	return _Staker.Contract.GetUserOwedTokens(&_Staker.CallOpts, _userAddress, _index)
}

// GetUserOwedTokens is a free data retrieval call binding the contract method 0xce415302.
//
// Solidity: function getUserOwedTokens(address _userAddress, uint256 _index) view returns(uint256)
func (_Staker *StakerCallerSession) GetUserOwedTokens(_userAddress common.Address, _index *big.Int) (*big.Int, error) {
	return _Staker.Contract.GetUserOwedTokens(&_Staker.CallOpts, _userAddress, _index)
}

// GetUserRewardDebt is a free data retrieval call binding the contract method 0xf27d0264.
//
// Solidity: function getUserRewardDebt(address _userAddress, uint256 _index) view returns(uint256)
func (_Staker *StakerCaller) GetUserRewardDebt(opts *bind.CallOpts, _userAddress common.Address, _index *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "getUserRewardDebt", _userAddress, _index)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserRewardDebt is a free data retrieval call binding the contract method 0xf27d0264.
//
// Solidity: function getUserRewardDebt(address _userAddress, uint256 _index) view returns(uint256)
func (_Staker *StakerSession) GetUserRewardDebt(_userAddress common.Address, _index *big.Int) (*big.Int, error) {
	return _Staker.Contract.GetUserRewardDebt(&_Staker.CallOpts, _userAddress, _index)
}

// GetUserRewardDebt is a free data retrieval call binding the contract method 0xf27d0264.
//
// Solidity: function getUserRewardDebt(address _userAddress, uint256 _index) view returns(uint256)
func (_Staker *StakerCallerSession) GetUserRewardDebt(_userAddress common.Address, _index *big.Int) (*big.Int, error) {
	return _Staker.Contract.GetUserRewardDebt(&_Staker.CallOpts, _userAddress, _index)
}

// GetUserRewardDebtLength is a free data retrieval call binding the contract method 0x0084c927.
//
// Solidity: function getUserRewardDebtLength(address _userAddress) view returns(uint256)
func (_Staker *StakerCaller) GetUserRewardDebtLength(opts *bind.CallOpts, _userAddress common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "getUserRewardDebtLength", _userAddress)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserRewardDebtLength is a free data retrieval call binding the contract method 0x0084c927.
//
// Solidity: function getUserRewardDebtLength(address _userAddress) view returns(uint256)
func (_Staker *StakerSession) GetUserRewardDebtLength(_userAddress common.Address) (*big.Int, error) {
	return _Staker.Contract.GetUserRewardDebtLength(&_Staker.CallOpts, _userAddress)
}

// GetUserRewardDebtLength is a free data retrieval call binding the contract method 0x0084c927.
//
// Solidity: function getUserRewardDebtLength(address _userAddress) view returns(uint256)
func (_Staker *StakerCallerSession) GetUserRewardDebtLength(_userAddress common.Address) (*big.Int, error) {
	return _Staker.Contract.GetUserRewardDebtLength(&_Staker.CallOpts, _userAddress)
}

// GetUserTokensOwedLength is a free data retrieval call binding the contract method 0xa1292aea.
//
// Solidity: function getUserTokensOwedLength(address _userAddress) view returns(uint256)
func (_Staker *StakerCaller) GetUserTokensOwedLength(opts *bind.CallOpts, _userAddress common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "getUserTokensOwedLength", _userAddress)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserTokensOwedLength is a free data retrieval call binding the contract method 0xa1292aea.
//
// Solidity: function getUserTokensOwedLength(address _userAddress) view returns(uint256)
func (_Staker *StakerSession) GetUserTokensOwedLength(_userAddress common.Address) (*big.Int, error) {
	return _Staker.Contract.GetUserTokensOwedLength(&_Staker.CallOpts, _userAddress)
}

// GetUserTokensOwedLength is a free data retrieval call binding the contract method 0xa1292aea.
//
// Solidity: function getUserTokensOwedLength(address _userAddress) view returns(uint256)
func (_Staker *StakerCallerSession) GetUserTokensOwedLength(_userAddress common.Address) (*big.Int, error) {
	return _Staker.Contract.GetUserTokensOwedLength(&_Staker.CallOpts, _userAddress)
}

// HasStakingStarted is a free data retrieval call binding the contract method 0x57b4f01f.
//
// Solidity: function hasStakingStarted() view returns(bool)
func (_Staker *StakerCaller) HasStakingStarted(opts *bind.CallOpts) (bool, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "hasStakingStarted")

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// HasStakingStarted is a free data retrieval call binding the contract method 0x57b4f01f.
//
// Solidity: function hasStakingStarted() view returns(bool)
func (_Staker *StakerSession) HasStakingStarted() (bool, error) {
	return _Staker.Contract.HasStakingStarted(&_Staker.CallOpts)
}

// HasStakingStarted is a free data retrieval call binding the contract method 0x57b4f01f.
//
// Solidity: function hasStakingStarted() view returns(bool)
func (_Staker *StakerCallerSession) HasStakingStarted() (bool, error) {
	return _Staker.Contract.HasStakingStarted(&_Staker.CallOpts)
}

// LastRewardBlock is a free data retrieval call binding the contract method 0xa9f8d181.
//
// Solidity: function lastRewardBlock() view returns(uint256)
func (_Staker *StakerCaller) LastRewardBlock(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "lastRewardBlock")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// LastRewardBlock is a free data retrieval call binding the contract method 0xa9f8d181.
//
// Solidity: function lastRewardBlock() view returns(uint256)
func (_Staker *StakerSession) LastRewardBlock() (*big.Int, error) {
	return _Staker.Contract.LastRewardBlock(&_Staker.CallOpts)
}

// LastRewardBlock is a free data retrieval call binding the contract method 0xa9f8d181.
//
// Solidity: function lastRewardBlock() view returns(uint256)
func (_Staker *StakerCallerSession) LastRewardBlock() (*big.Int, error) {
	return _Staker.Contract.LastRewardBlock(&_Staker.CallOpts)
}

// LockSchemes is a free data retrieval call binding the contract method 0xbb9c9eb4.
//
// Solidity: function lockSchemes(uint256 ) view returns(address)
func (_Staker *StakerCaller) LockSchemes(opts *bind.CallOpts, arg0 *big.Int) (common.Address, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "lockSchemes", arg0)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// LockSchemes is a free data retrieval call binding the contract method 0xbb9c9eb4.
//
// Solidity: function lockSchemes(uint256 ) view returns(address)
func (_Staker *StakerSession) LockSchemes(arg0 *big.Int) (common.Address, error) {
	return _Staker.Contract.LockSchemes(&_Staker.CallOpts, arg0)
}

// LockSchemes is a free data retrieval call binding the contract method 0xbb9c9eb4.
//
// Solidity: function lockSchemes(uint256 ) view returns(address)
func (_Staker *StakerCallerSession) LockSchemes(arg0 *big.Int) (common.Address, error) {
	return _Staker.Contract.LockSchemes(&_Staker.CallOpts, arg0)
}

// LockSchemesExist is a free data retrieval call binding the contract method 0x205acb31.
//
// Solidity: function lockSchemesExist(address ) view returns(bool)
func (_Staker *StakerCaller) LockSchemesExist(opts *bind.CallOpts, arg0 common.Address) (bool, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "lockSchemesExist", arg0)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// LockSchemesExist is a free data retrieval call binding the contract method 0x205acb31.
//
// Solidity: function lockSchemesExist(address ) view returns(bool)
func (_Staker *StakerSession) LockSchemesExist(arg0 common.Address) (bool, error) {
	return _Staker.Contract.LockSchemesExist(&_Staker.CallOpts, arg0)
}

// LockSchemesExist is a free data retrieval call binding the contract method 0x205acb31.
//
// Solidity: function lockSchemesExist(address ) view returns(bool)
func (_Staker *StakerCallerSession) LockSchemesExist(arg0 common.Address) (bool, error) {
	return _Staker.Contract.LockSchemesExist(&_Staker.CallOpts, arg0)
}

// ReceiversWhitelist is a free data retrieval call binding the contract method 0x363291dc.
//
// Solidity: function receiversWhitelist(address ) view returns(bool)
func (_Staker *StakerCaller) ReceiversWhitelist(opts *bind.CallOpts, arg0 common.Address) (bool, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "receiversWhitelist", arg0)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// ReceiversWhitelist is a free data retrieval call binding the contract method 0x363291dc.
//
// Solidity: function receiversWhitelist(address ) view returns(bool)
func (_Staker *StakerSession) ReceiversWhitelist(arg0 common.Address) (bool, error) {
	return _Staker.Contract.ReceiversWhitelist(&_Staker.CallOpts, arg0)
}

// ReceiversWhitelist is a free data retrieval call binding the contract method 0x363291dc.
//
// Solidity: function receiversWhitelist(address ) view returns(bool)
func (_Staker *StakerCallerSession) ReceiversWhitelist(arg0 common.Address) (bool, error) {
	return _Staker.Contract.ReceiversWhitelist(&_Staker.CallOpts, arg0)
}

// RewardPerBlock is a free data retrieval call binding the contract method 0x791f39cd.
//
// Solidity: function rewardPerBlock(uint256 ) view returns(uint256)
func (_Staker *StakerCaller) RewardPerBlock(opts *bind.CallOpts, arg0 *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "rewardPerBlock", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// RewardPerBlock is a free data retrieval call binding the contract method 0x791f39cd.
//
// Solidity: function rewardPerBlock(uint256 ) view returns(uint256)
func (_Staker *StakerSession) RewardPerBlock(arg0 *big.Int) (*big.Int, error) {
	return _Staker.Contract.RewardPerBlock(&_Staker.CallOpts, arg0)
}

// RewardPerBlock is a free data retrieval call binding the contract method 0x791f39cd.
//
// Solidity: function rewardPerBlock(uint256 ) view returns(uint256)
func (_Staker *StakerCallerSession) RewardPerBlock(arg0 *big.Int) (*big.Int, error) {
	return _Staker.Contract.RewardPerBlock(&_Staker.CallOpts, arg0)
}

// RewardToken is a free data retrieval call binding the contract method 0xf7c618c1.
//
// Solidity: function rewardToken() view returns(address)
func (_Staker *StakerCaller) RewardToken(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "rewardToken")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// RewardToken is a free data retrieval call binding the contract method 0xf7c618c1.
//
// Solidity: function rewardToken() view returns(address)
func (_Staker *StakerSession) RewardToken() (common.Address, error) {
	return _Staker.Contract.RewardToken(&_Staker.CallOpts)
}

// RewardToken is a free data retrieval call binding the contract method 0xf7c618c1.
//
// Solidity: function rewardToken() view returns(address)
func (_Staker *StakerCallerSession) RewardToken() (common.Address, error) {
	return _Staker.Contract.RewardToken(&_Staker.CallOpts)
}

// RewardsPoolFactory is a free data retrieval call binding the contract method 0x56409b81.
//
// Solidity: function rewardsPoolFactory() view returns(address)
func (_Staker *StakerCaller) RewardsPoolFactory(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "rewardsPoolFactory")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// RewardsPoolFactory is a free data retrieval call binding the contract method 0x56409b81.
//
// Solidity: function rewardsPoolFactory() view returns(address)
func (_Staker *StakerSession) RewardsPoolFactory() (common.Address, error) {
	return _Staker.Contract.RewardsPoolFactory(&_Staker.CallOpts)
}

// RewardsPoolFactory is a free data retrieval call binding the contract method 0x56409b81.
//
// Solidity: function rewardsPoolFactory() view returns(address)
func (_Staker *StakerCallerSession) RewardsPoolFactory() (common.Address, error) {
	return _Staker.Contract.RewardsPoolFactory(&_Staker.CallOpts)
}

// RewardsTokens is a free data retrieval call binding the contract method 0xb6d0dcd8.
//
// Solidity: function rewardsTokens(uint256 ) view returns(address)
func (_Staker *StakerCaller) RewardsTokens(opts *bind.CallOpts, arg0 *big.Int) (common.Address, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "rewardsTokens", arg0)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// RewardsTokens is a free data retrieval call binding the contract method 0xb6d0dcd8.
//
// Solidity: function rewardsTokens(uint256 ) view returns(address)
func (_Staker *StakerSession) RewardsTokens(arg0 *big.Int) (common.Address, error) {
	return _Staker.Contract.RewardsTokens(&_Staker.CallOpts, arg0)
}

// RewardsTokens is a free data retrieval call binding the contract method 0xb6d0dcd8.
//
// Solidity: function rewardsTokens(uint256 ) view returns(address)
func (_Staker *StakerCallerSession) RewardsTokens(arg0 *big.Int) (common.Address, error) {
	return _Staker.Contract.RewardsTokens(&_Staker.CallOpts, arg0)
}

// StakeLimit is a free data retrieval call binding the contract method 0x45ef79af.
//
// Solidity: function stakeLimit() view returns(uint256)
func (_Staker *StakerCaller) StakeLimit(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "stakeLimit")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// StakeLimit is a free data retrieval call binding the contract method 0x45ef79af.
//
// Solidity: function stakeLimit() view returns(uint256)
func (_Staker *StakerSession) StakeLimit() (*big.Int, error) {
	return _Staker.Contract.StakeLimit(&_Staker.CallOpts)
}

// StakeLimit is a free data retrieval call binding the contract method 0x45ef79af.
//
// Solidity: function stakeLimit() view returns(uint256)
func (_Staker *StakerCallerSession) StakeLimit() (*big.Int, error) {
	return _Staker.Contract.StakeLimit(&_Staker.CallOpts)
}

// StakingToken is a free data retrieval call binding the contract method 0x72f702f3.
//
// Solidity: function stakingToken() view returns(address)
func (_Staker *StakerCaller) StakingToken(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "stakingToken")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// StakingToken is a free data retrieval call binding the contract method 0x72f702f3.
//
// Solidity: function stakingToken() view returns(address)
func (_Staker *StakerSession) StakingToken() (common.Address, error) {
	return _Staker.Contract.StakingToken(&_Staker.CallOpts)
}

// StakingToken is a free data retrieval call binding the contract method 0x72f702f3.
//
// Solidity: function stakingToken() view returns(address)
func (_Staker *StakerCallerSession) StakingToken() (common.Address, error) {
	return _Staker.Contract.StakingToken(&_Staker.CallOpts)
}

// StartBlock is a free data retrieval call binding the contract method 0x48cd4cb1.
//
// Solidity: function startBlock() view returns(uint256)
func (_Staker *StakerCaller) StartBlock(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "startBlock")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// StartBlock is a free data retrieval call binding the contract method 0x48cd4cb1.
//
// Solidity: function startBlock() view returns(uint256)
func (_Staker *StakerSession) StartBlock() (*big.Int, error) {
	return _Staker.Contract.StartBlock(&_Staker.CallOpts)
}

// StartBlock is a free data retrieval call binding the contract method 0x48cd4cb1.
//
// Solidity: function startBlock() view returns(uint256)
func (_Staker *StakerCallerSession) StartBlock() (*big.Int, error) {
	return _Staker.Contract.StartBlock(&_Staker.CallOpts)
}

// TotalStaked is a free data retrieval call binding the contract method 0x817b1cd2.
//
// Solidity: function totalStaked() view returns(uint256)
func (_Staker *StakerCaller) TotalStaked(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "totalStaked")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// TotalStaked is a free data retrieval call binding the contract method 0x817b1cd2.
//
// Solidity: function totalStaked() view returns(uint256)
func (_Staker *StakerSession) TotalStaked() (*big.Int, error) {
	return _Staker.Contract.TotalStaked(&_Staker.CallOpts)
}

// TotalStaked is a free data retrieval call binding the contract method 0x817b1cd2.
//
// Solidity: function totalStaked() view returns(uint256)
func (_Staker *StakerCallerSession) TotalStaked() (*big.Int, error) {
	return _Staker.Contract.TotalStaked(&_Staker.CallOpts)
}

// UserAccruedRewards is a free data retrieval call binding the contract method 0x408651be.
//
// Solidity: function userAccruedRewards(address ) view returns(uint256)
func (_Staker *StakerCaller) UserAccruedRewards(opts *bind.CallOpts, arg0 common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "userAccruedRewards", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// UserAccruedRewards is a free data retrieval call binding the contract method 0x408651be.
//
// Solidity: function userAccruedRewards(address ) view returns(uint256)
func (_Staker *StakerSession) UserAccruedRewards(arg0 common.Address) (*big.Int, error) {
	return _Staker.Contract.UserAccruedRewards(&_Staker.CallOpts, arg0)
}

// UserAccruedRewards is a free data retrieval call binding the contract method 0x408651be.
//
// Solidity: function userAccruedRewards(address ) view returns(uint256)
func (_Staker *StakerCallerSession) UserAccruedRewards(arg0 common.Address) (*big.Int, error) {
	return _Staker.Contract.UserAccruedRewards(&_Staker.CallOpts, arg0)
}

// UserInfo is a free data retrieval call binding the contract method 0x1959a002.
//
// Solidity: function userInfo(address ) view returns(uint256 firstStakedBlockNumber, uint256 amountStaked)
func (_Staker *StakerCaller) UserInfo(opts *bind.CallOpts, arg0 common.Address) (struct {
	FirstStakedBlockNumber *big.Int
	AmountStaked           *big.Int
}, error) {
	var out []interface{}
	err := _Staker.contract.Call(opts, &out, "userInfo", arg0)

	outstruct := new(struct {
		FirstStakedBlockNumber *big.Int
		AmountStaked           *big.Int
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.FirstStakedBlockNumber = *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	outstruct.AmountStaked = *abi.ConvertType(out[1], new(*big.Int)).(**big.Int)

	return *outstruct, err

}

// UserInfo is a free data retrieval call binding the contract method 0x1959a002.
//
// Solidity: function userInfo(address ) view returns(uint256 firstStakedBlockNumber, uint256 amountStaked)
func (_Staker *StakerSession) UserInfo(arg0 common.Address) (struct {
	FirstStakedBlockNumber *big.Int
	AmountStaked           *big.Int
}, error) {
	return _Staker.Contract.UserInfo(&_Staker.CallOpts, arg0)
}

// UserInfo is a free data retrieval call binding the contract method 0x1959a002.
//
// Solidity: function userInfo(address ) view returns(uint256 firstStakedBlockNumber, uint256 amountStaked)
func (_Staker *StakerCallerSession) UserInfo(arg0 common.Address) (struct {
	FirstStakedBlockNumber *big.Int
	AmountStaked           *big.Int
}, error) {
	return _Staker.Contract.UserInfo(&_Staker.CallOpts, arg0)
}

// Claim is a paid mutator transaction binding the contract method 0x4e71d92d.
//
// Solidity: function claim() returns()
func (_Staker *StakerTransactor) Claim(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "claim")
}

// Claim is a paid mutator transaction binding the contract method 0x4e71d92d.
//
// Solidity: function claim() returns()
func (_Staker *StakerSession) Claim() (*types.Transaction, error) {
	return _Staker.Contract.Claim(&_Staker.TransactOpts)
}

// Claim is a paid mutator transaction binding the contract method 0x4e71d92d.
//
// Solidity: function claim() returns()
func (_Staker *StakerTransactorSession) Claim() (*types.Transaction, error) {
	return _Staker.Contract.Claim(&_Staker.TransactOpts)
}

// Exit is a paid mutator transaction binding the contract method 0xe9fad8ee.
//
// Solidity: function exit() returns()
func (_Staker *StakerTransactor) Exit(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "exit")
}

// Exit is a paid mutator transaction binding the contract method 0xe9fad8ee.
//
// Solidity: function exit() returns()
func (_Staker *StakerSession) Exit() (*types.Transaction, error) {
	return _Staker.Contract.Exit(&_Staker.TransactOpts)
}

// Exit is a paid mutator transaction binding the contract method 0xe9fad8ee.
//
// Solidity: function exit() returns()
func (_Staker *StakerTransactorSession) Exit() (*types.Transaction, error) {
	return _Staker.Contract.Exit(&_Staker.TransactOpts)
}

// ExitAndStake is a paid mutator transaction binding the contract method 0x5999e473.
//
// Solidity: function exitAndStake(address _stakePool) returns()
func (_Staker *StakerTransactor) ExitAndStake(opts *bind.TransactOpts, _stakePool common.Address) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "exitAndStake", _stakePool)
}

// ExitAndStake is a paid mutator transaction binding the contract method 0x5999e473.
//
// Solidity: function exitAndStake(address _stakePool) returns()
func (_Staker *StakerSession) ExitAndStake(_stakePool common.Address) (*types.Transaction, error) {
	return _Staker.Contract.ExitAndStake(&_Staker.TransactOpts, _stakePool)
}

// ExitAndStake is a paid mutator transaction binding the contract method 0x5999e473.
//
// Solidity: function exitAndStake(address _stakePool) returns()
func (_Staker *StakerTransactorSession) ExitAndStake(_stakePool common.Address) (*types.Transaction, error) {
	return _Staker.Contract.ExitAndStake(&_Staker.TransactOpts, _stakePool)
}

// ExitAndTransfer is a paid mutator transaction binding the contract method 0x2240e63c.
//
// Solidity: function exitAndTransfer(address transferTo) returns()
func (_Staker *StakerTransactor) ExitAndTransfer(opts *bind.TransactOpts, transferTo common.Address) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "exitAndTransfer", transferTo)
}

// ExitAndTransfer is a paid mutator transaction binding the contract method 0x2240e63c.
//
// Solidity: function exitAndTransfer(address transferTo) returns()
func (_Staker *StakerSession) ExitAndTransfer(transferTo common.Address) (*types.Transaction, error) {
	return _Staker.Contract.ExitAndTransfer(&_Staker.TransactOpts, transferTo)
}

// ExitAndTransfer is a paid mutator transaction binding the contract method 0x2240e63c.
//
// Solidity: function exitAndTransfer(address transferTo) returns()
func (_Staker *StakerTransactorSession) ExitAndTransfer(transferTo common.Address) (*types.Transaction, error) {
	return _Staker.Contract.ExitAndTransfer(&_Staker.TransactOpts, transferTo)
}

// ExitAndUnlock is a paid mutator transaction binding the contract method 0x3411ef51.
//
// Solidity: function exitAndUnlock() returns()
func (_Staker *StakerTransactor) ExitAndUnlock(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "exitAndUnlock")
}

// ExitAndUnlock is a paid mutator transaction binding the contract method 0x3411ef51.
//
// Solidity: function exitAndUnlock() returns()
func (_Staker *StakerSession) ExitAndUnlock() (*types.Transaction, error) {
	return _Staker.Contract.ExitAndUnlock(&_Staker.TransactOpts)
}

// ExitAndUnlock is a paid mutator transaction binding the contract method 0x3411ef51.
//
// Solidity: function exitAndUnlock() returns()
func (_Staker *StakerTransactorSession) ExitAndUnlock() (*types.Transaction, error) {
	return _Staker.Contract.ExitAndUnlock(&_Staker.TransactOpts)
}

// Extend is a paid mutator transaction binding the contract method 0x20e67c76.
//
// Solidity: function extend(uint256 _endBlock, uint256[] _rewardsPerBlock, uint256[] _currentRemainingRewards, uint256[] _newRemainingRewards) returns()
func (_Staker *StakerTransactor) Extend(opts *bind.TransactOpts, _endBlock *big.Int, _rewardsPerBlock []*big.Int, _currentRemainingRewards []*big.Int, _newRemainingRewards []*big.Int) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "extend", _endBlock, _rewardsPerBlock, _currentRemainingRewards, _newRemainingRewards)
}

// Extend is a paid mutator transaction binding the contract method 0x20e67c76.
//
// Solidity: function extend(uint256 _endBlock, uint256[] _rewardsPerBlock, uint256[] _currentRemainingRewards, uint256[] _newRemainingRewards) returns()
func (_Staker *StakerSession) Extend(_endBlock *big.Int, _rewardsPerBlock []*big.Int, _currentRemainingRewards []*big.Int, _newRemainingRewards []*big.Int) (*types.Transaction, error) {
	return _Staker.Contract.Extend(&_Staker.TransactOpts, _endBlock, _rewardsPerBlock, _currentRemainingRewards, _newRemainingRewards)
}

// Extend is a paid mutator transaction binding the contract method 0x20e67c76.
//
// Solidity: function extend(uint256 _endBlock, uint256[] _rewardsPerBlock, uint256[] _currentRemainingRewards, uint256[] _newRemainingRewards) returns()
func (_Staker *StakerTransactorSession) Extend(_endBlock *big.Int, _rewardsPerBlock []*big.Int, _currentRemainingRewards []*big.Int, _newRemainingRewards []*big.Int) (*types.Transaction, error) {
	return _Staker.Contract.Extend(&_Staker.TransactOpts, _endBlock, _rewardsPerBlock, _currentRemainingRewards, _newRemainingRewards)
}

// SetLockSchemes is a paid mutator transaction binding the contract method 0xc8523c1d.
//
// Solidity: function setLockSchemes(address[] _lockSchemes) returns()
func (_Staker *StakerTransactor) SetLockSchemes(opts *bind.TransactOpts, _lockSchemes []common.Address) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "setLockSchemes", _lockSchemes)
}

// SetLockSchemes is a paid mutator transaction binding the contract method 0xc8523c1d.
//
// Solidity: function setLockSchemes(address[] _lockSchemes) returns()
func (_Staker *StakerSession) SetLockSchemes(_lockSchemes []common.Address) (*types.Transaction, error) {
	return _Staker.Contract.SetLockSchemes(&_Staker.TransactOpts, _lockSchemes)
}

// SetLockSchemes is a paid mutator transaction binding the contract method 0xc8523c1d.
//
// Solidity: function setLockSchemes(address[] _lockSchemes) returns()
func (_Staker *StakerTransactorSession) SetLockSchemes(_lockSchemes []common.Address) (*types.Transaction, error) {
	return _Staker.Contract.SetLockSchemes(&_Staker.TransactOpts, _lockSchemes)
}

// SetReceiverWhitelisted is a paid mutator transaction binding the contract method 0xa861a7a3.
//
// Solidity: function setReceiverWhitelisted(address receiver, bool whitelisted) returns()
func (_Staker *StakerTransactor) SetReceiverWhitelisted(opts *bind.TransactOpts, receiver common.Address, whitelisted bool) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "setReceiverWhitelisted", receiver, whitelisted)
}

// SetReceiverWhitelisted is a paid mutator transaction binding the contract method 0xa861a7a3.
//
// Solidity: function setReceiverWhitelisted(address receiver, bool whitelisted) returns()
func (_Staker *StakerSession) SetReceiverWhitelisted(receiver common.Address, whitelisted bool) (*types.Transaction, error) {
	return _Staker.Contract.SetReceiverWhitelisted(&_Staker.TransactOpts, receiver, whitelisted)
}

// SetReceiverWhitelisted is a paid mutator transaction binding the contract method 0xa861a7a3.
//
// Solidity: function setReceiverWhitelisted(address receiver, bool whitelisted) returns()
func (_Staker *StakerTransactorSession) SetReceiverWhitelisted(receiver common.Address, whitelisted bool) (*types.Transaction, error) {
	return _Staker.Contract.SetReceiverWhitelisted(&_Staker.TransactOpts, receiver, whitelisted)
}

// Stake is a paid mutator transaction binding the contract method 0xa694fc3a.
//
// Solidity: function stake(uint256 _tokenAmount) returns()
func (_Staker *StakerTransactor) Stake(opts *bind.TransactOpts, _tokenAmount *big.Int) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "stake", _tokenAmount)
}

// Stake is a paid mutator transaction binding the contract method 0xa694fc3a.
//
// Solidity: function stake(uint256 _tokenAmount) returns()
func (_Staker *StakerSession) Stake(_tokenAmount *big.Int) (*types.Transaction, error) {
	return _Staker.Contract.Stake(&_Staker.TransactOpts, _tokenAmount)
}

// Stake is a paid mutator transaction binding the contract method 0xa694fc3a.
//
// Solidity: function stake(uint256 _tokenAmount) returns()
func (_Staker *StakerTransactorSession) Stake(_tokenAmount *big.Int) (*types.Transaction, error) {
	return _Staker.Contract.Stake(&_Staker.TransactOpts, _tokenAmount)
}

// StakeAndLock is a paid mutator transaction binding the contract method 0x4715a949.
//
// Solidity: function stakeAndLock(uint256 _tokenAmount, address _lockScheme) returns()
func (_Staker *StakerTransactor) StakeAndLock(opts *bind.TransactOpts, _tokenAmount *big.Int, _lockScheme common.Address) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "stakeAndLock", _tokenAmount, _lockScheme)
}

// StakeAndLock is a paid mutator transaction binding the contract method 0x4715a949.
//
// Solidity: function stakeAndLock(uint256 _tokenAmount, address _lockScheme) returns()
func (_Staker *StakerSession) StakeAndLock(_tokenAmount *big.Int, _lockScheme common.Address) (*types.Transaction, error) {
	return _Staker.Contract.StakeAndLock(&_Staker.TransactOpts, _tokenAmount, _lockScheme)
}

// StakeAndLock is a paid mutator transaction binding the contract method 0x4715a949.
//
// Solidity: function stakeAndLock(uint256 _tokenAmount, address _lockScheme) returns()
func (_Staker *StakerTransactorSession) StakeAndLock(_tokenAmount *big.Int, _lockScheme common.Address) (*types.Transaction, error) {
	return _Staker.Contract.StakeAndLock(&_Staker.TransactOpts, _tokenAmount, _lockScheme)
}

// UpdateRewardMultipliers is a paid mutator transaction binding the contract method 0xdd2da220.
//
// Solidity: function updateRewardMultipliers() returns()
func (_Staker *StakerTransactor) UpdateRewardMultipliers(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "updateRewardMultipliers")
}

// UpdateRewardMultipliers is a paid mutator transaction binding the contract method 0xdd2da220.
//
// Solidity: function updateRewardMultipliers() returns()
func (_Staker *StakerSession) UpdateRewardMultipliers() (*types.Transaction, error) {
	return _Staker.Contract.UpdateRewardMultipliers(&_Staker.TransactOpts)
}

// UpdateRewardMultipliers is a paid mutator transaction binding the contract method 0xdd2da220.
//
// Solidity: function updateRewardMultipliers() returns()
func (_Staker *StakerTransactorSession) UpdateRewardMultipliers() (*types.Transaction, error) {
	return _Staker.Contract.UpdateRewardMultipliers(&_Staker.TransactOpts)
}

// Withdraw is a paid mutator transaction binding the contract method 0x2e1a7d4d.
//
// Solidity: function withdraw(uint256 _tokenAmount) returns()
func (_Staker *StakerTransactor) Withdraw(opts *bind.TransactOpts, _tokenAmount *big.Int) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "withdraw", _tokenAmount)
}

// Withdraw is a paid mutator transaction binding the contract method 0x2e1a7d4d.
//
// Solidity: function withdraw(uint256 _tokenAmount) returns()
func (_Staker *StakerSession) Withdraw(_tokenAmount *big.Int) (*types.Transaction, error) {
	return _Staker.Contract.Withdraw(&_Staker.TransactOpts, _tokenAmount)
}

// Withdraw is a paid mutator transaction binding the contract method 0x2e1a7d4d.
//
// Solidity: function withdraw(uint256 _tokenAmount) returns()
func (_Staker *StakerTransactorSession) Withdraw(_tokenAmount *big.Int) (*types.Transaction, error) {
	return _Staker.Contract.Withdraw(&_Staker.TransactOpts, _tokenAmount)
}

// WithdrawLPRewards is a paid mutator transaction binding the contract method 0xa1002a0f.
//
// Solidity: function withdrawLPRewards(address recipient, address lpTokenContract) returns()
func (_Staker *StakerTransactor) WithdrawLPRewards(opts *bind.TransactOpts, recipient common.Address, lpTokenContract common.Address) (*types.Transaction, error) {
	return _Staker.contract.Transact(opts, "withdrawLPRewards", recipient, lpTokenContract)
}

// WithdrawLPRewards is a paid mutator transaction binding the contract method 0xa1002a0f.
//
// Solidity: function withdrawLPRewards(address recipient, address lpTokenContract) returns()
func (_Staker *StakerSession) WithdrawLPRewards(recipient common.Address, lpTokenContract common.Address) (*types.Transaction, error) {
	return _Staker.Contract.WithdrawLPRewards(&_Staker.TransactOpts, recipient, lpTokenContract)
}

// WithdrawLPRewards is a paid mutator transaction binding the contract method 0xa1002a0f.
//
// Solidity: function withdrawLPRewards(address recipient, address lpTokenContract) returns()
func (_Staker *StakerTransactorSession) WithdrawLPRewards(recipient common.Address, lpTokenContract common.Address) (*types.Transaction, error) {
	return _Staker.Contract.WithdrawLPRewards(&_Staker.TransactOpts, recipient, lpTokenContract)
}

// StakerBonusTransferredIterator is returned from FilterBonusTransferred and is used to iterate over the raw logs and unpacked data for BonusTransferred events raised by the Staker contract.
type StakerBonusTransferredIterator struct {
	Event *StakerBonusTransferred // Event containing the contract specifics and raw log

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
func (it *StakerBonusTransferredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakerBonusTransferred)
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
		it.Event = new(StakerBonusTransferred)
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
func (it *StakerBonusTransferredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakerBonusTransferredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakerBonusTransferred represents a BonusTransferred event raised by the Staker contract.
type StakerBonusTransferred struct {
	UserAddress common.Address
	BonusAmount *big.Int
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterBonusTransferred is a free log retrieval operation binding the contract event 0x9e40dbc4af813371d457949ccb8f04e60076420f1659f45d6bc93588c0dd82df.
//
// Solidity: event BonusTransferred(address indexed _userAddress, uint256 _bonusAmount)
func (_Staker *StakerFilterer) FilterBonusTransferred(opts *bind.FilterOpts, _userAddress []common.Address) (*StakerBonusTransferredIterator, error) {

	var _userAddressRule []interface{}
	for _, _userAddressItem := range _userAddress {
		_userAddressRule = append(_userAddressRule, _userAddressItem)
	}

	logs, sub, err := _Staker.contract.FilterLogs(opts, "BonusTransferred", _userAddressRule)
	if err != nil {
		return nil, err
	}
	return &StakerBonusTransferredIterator{contract: _Staker.contract, event: "BonusTransferred", logs: logs, sub: sub}, nil
}

// WatchBonusTransferred is a free log subscription operation binding the contract event 0x9e40dbc4af813371d457949ccb8f04e60076420f1659f45d6bc93588c0dd82df.
//
// Solidity: event BonusTransferred(address indexed _userAddress, uint256 _bonusAmount)
func (_Staker *StakerFilterer) WatchBonusTransferred(opts *bind.WatchOpts, sink chan<- *StakerBonusTransferred, _userAddress []common.Address) (event.Subscription, error) {

	var _userAddressRule []interface{}
	for _, _userAddressItem := range _userAddress {
		_userAddressRule = append(_userAddressRule, _userAddressItem)
	}

	logs, sub, err := _Staker.contract.WatchLogs(opts, "BonusTransferred", _userAddressRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakerBonusTransferred)
				if err := _Staker.contract.UnpackLog(event, "BonusTransferred", log); err != nil {
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

// ParseBonusTransferred is a log parse operation binding the contract event 0x9e40dbc4af813371d457949ccb8f04e60076420f1659f45d6bc93588c0dd82df.
//
// Solidity: event BonusTransferred(address indexed _userAddress, uint256 _bonusAmount)
func (_Staker *StakerFilterer) ParseBonusTransferred(log types.Log) (*StakerBonusTransferred, error) {
	event := new(StakerBonusTransferred)
	if err := _Staker.contract.UnpackLog(event, "BonusTransferred", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakerClaimedIterator is returned from FilterClaimed and is used to iterate over the raw logs and unpacked data for Claimed events raised by the Staker contract.
type StakerClaimedIterator struct {
	Event *StakerClaimed // Event containing the contract specifics and raw log

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
func (it *StakerClaimedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakerClaimed)
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
		it.Event = new(StakerClaimed)
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
func (it *StakerClaimedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakerClaimedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakerClaimed represents a Claimed event raised by the Staker contract.
type StakerClaimed struct {
	User   common.Address
	Amount *big.Int
	Token  common.Address
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterClaimed is a free log retrieval operation binding the contract event 0x7e6632ca16a0ac6cf28448500b1a17d96c8b8163ad4c4a9b44ef5386cc02779e.
//
// Solidity: event Claimed(address indexed user, uint256 amount, address token)
func (_Staker *StakerFilterer) FilterClaimed(opts *bind.FilterOpts, user []common.Address) (*StakerClaimedIterator, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Staker.contract.FilterLogs(opts, "Claimed", userRule)
	if err != nil {
		return nil, err
	}
	return &StakerClaimedIterator{contract: _Staker.contract, event: "Claimed", logs: logs, sub: sub}, nil
}

// WatchClaimed is a free log subscription operation binding the contract event 0x7e6632ca16a0ac6cf28448500b1a17d96c8b8163ad4c4a9b44ef5386cc02779e.
//
// Solidity: event Claimed(address indexed user, uint256 amount, address token)
func (_Staker *StakerFilterer) WatchClaimed(opts *bind.WatchOpts, sink chan<- *StakerClaimed, user []common.Address) (event.Subscription, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Staker.contract.WatchLogs(opts, "Claimed", userRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakerClaimed)
				if err := _Staker.contract.UnpackLog(event, "Claimed", log); err != nil {
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

// ParseClaimed is a log parse operation binding the contract event 0x7e6632ca16a0ac6cf28448500b1a17d96c8b8163ad4c4a9b44ef5386cc02779e.
//
// Solidity: event Claimed(address indexed user, uint256 amount, address token)
func (_Staker *StakerFilterer) ParseClaimed(log types.Log) (*StakerClaimed, error) {
	event := new(StakerClaimed)
	if err := _Staker.contract.UnpackLog(event, "Claimed", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakerExitedIterator is returned from FilterExited and is used to iterate over the raw logs and unpacked data for Exited events raised by the Staker contract.
type StakerExitedIterator struct {
	Event *StakerExited // Event containing the contract specifics and raw log

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
func (it *StakerExitedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakerExited)
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
		it.Event = new(StakerExited)
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
func (it *StakerExitedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakerExitedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakerExited represents a Exited event raised by the Staker contract.
type StakerExited struct {
	User   common.Address
	Amount *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterExited is a free log retrieval operation binding the contract event 0x920bb94eb3842a728db98228c375ff6b00c5bc5a54fac6736155517a0a20a61a.
//
// Solidity: event Exited(address indexed user, uint256 amount)
func (_Staker *StakerFilterer) FilterExited(opts *bind.FilterOpts, user []common.Address) (*StakerExitedIterator, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Staker.contract.FilterLogs(opts, "Exited", userRule)
	if err != nil {
		return nil, err
	}
	return &StakerExitedIterator{contract: _Staker.contract, event: "Exited", logs: logs, sub: sub}, nil
}

// WatchExited is a free log subscription operation binding the contract event 0x920bb94eb3842a728db98228c375ff6b00c5bc5a54fac6736155517a0a20a61a.
//
// Solidity: event Exited(address indexed user, uint256 amount)
func (_Staker *StakerFilterer) WatchExited(opts *bind.WatchOpts, sink chan<- *StakerExited, user []common.Address) (event.Subscription, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Staker.contract.WatchLogs(opts, "Exited", userRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakerExited)
				if err := _Staker.contract.UnpackLog(event, "Exited", log); err != nil {
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

// ParseExited is a log parse operation binding the contract event 0x920bb94eb3842a728db98228c375ff6b00c5bc5a54fac6736155517a0a20a61a.
//
// Solidity: event Exited(address indexed user, uint256 amount)
func (_Staker *StakerFilterer) ParseExited(log types.Log) (*StakerExited, error) {
	event := new(StakerExited)
	if err := _Staker.contract.UnpackLog(event, "Exited", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakerExitedAndUnlockedIterator is returned from FilterExitedAndUnlocked and is used to iterate over the raw logs and unpacked data for ExitedAndUnlocked events raised by the Staker contract.
type StakerExitedAndUnlockedIterator struct {
	Event *StakerExitedAndUnlocked // Event containing the contract specifics and raw log

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
func (it *StakerExitedAndUnlockedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakerExitedAndUnlocked)
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
		it.Event = new(StakerExitedAndUnlocked)
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
func (it *StakerExitedAndUnlockedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakerExitedAndUnlockedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakerExitedAndUnlocked represents a ExitedAndUnlocked event raised by the Staker contract.
type StakerExitedAndUnlocked struct {
	UserAddress common.Address
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterExitedAndUnlocked is a free log retrieval operation binding the contract event 0x73d36a08b171571d289bbb4c400b9c74176d5be660fae67a23ed20ba1120d583.
//
// Solidity: event ExitedAndUnlocked(address indexed _userAddress)
func (_Staker *StakerFilterer) FilterExitedAndUnlocked(opts *bind.FilterOpts, _userAddress []common.Address) (*StakerExitedAndUnlockedIterator, error) {

	var _userAddressRule []interface{}
	for _, _userAddressItem := range _userAddress {
		_userAddressRule = append(_userAddressRule, _userAddressItem)
	}

	logs, sub, err := _Staker.contract.FilterLogs(opts, "ExitedAndUnlocked", _userAddressRule)
	if err != nil {
		return nil, err
	}
	return &StakerExitedAndUnlockedIterator{contract: _Staker.contract, event: "ExitedAndUnlocked", logs: logs, sub: sub}, nil
}

// WatchExitedAndUnlocked is a free log subscription operation binding the contract event 0x73d36a08b171571d289bbb4c400b9c74176d5be660fae67a23ed20ba1120d583.
//
// Solidity: event ExitedAndUnlocked(address indexed _userAddress)
func (_Staker *StakerFilterer) WatchExitedAndUnlocked(opts *bind.WatchOpts, sink chan<- *StakerExitedAndUnlocked, _userAddress []common.Address) (event.Subscription, error) {

	var _userAddressRule []interface{}
	for _, _userAddressItem := range _userAddress {
		_userAddressRule = append(_userAddressRule, _userAddressItem)
	}

	logs, sub, err := _Staker.contract.WatchLogs(opts, "ExitedAndUnlocked", _userAddressRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakerExitedAndUnlocked)
				if err := _Staker.contract.UnpackLog(event, "ExitedAndUnlocked", log); err != nil {
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

// ParseExitedAndUnlocked is a log parse operation binding the contract event 0x73d36a08b171571d289bbb4c400b9c74176d5be660fae67a23ed20ba1120d583.
//
// Solidity: event ExitedAndUnlocked(address indexed _userAddress)
func (_Staker *StakerFilterer) ParseExitedAndUnlocked(log types.Log) (*StakerExitedAndUnlocked, error) {
	event := new(StakerExitedAndUnlocked)
	if err := _Staker.contract.UnpackLog(event, "ExitedAndUnlocked", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakerExtendedIterator is returned from FilterExtended and is used to iterate over the raw logs and unpacked data for Extended events raised by the Staker contract.
type StakerExtendedIterator struct {
	Event *StakerExtended // Event containing the contract specifics and raw log

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
func (it *StakerExtendedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakerExtended)
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
		it.Event = new(StakerExtended)
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
func (it *StakerExtendedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakerExtendedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakerExtended represents a Extended event raised by the Staker contract.
type StakerExtended struct {
	NewEndBlock        *big.Int
	NewRewardsPerBlock []*big.Int
	Raw                types.Log // Blockchain specific contextual infos
}

// FilterExtended is a free log retrieval operation binding the contract event 0x137c92cc7579cc4d6a2b109467cd475c205d1c136363ca854cc46d72f840d5de.
//
// Solidity: event Extended(uint256 newEndBlock, uint256[] newRewardsPerBlock)
func (_Staker *StakerFilterer) FilterExtended(opts *bind.FilterOpts) (*StakerExtendedIterator, error) {

	logs, sub, err := _Staker.contract.FilterLogs(opts, "Extended")
	if err != nil {
		return nil, err
	}
	return &StakerExtendedIterator{contract: _Staker.contract, event: "Extended", logs: logs, sub: sub}, nil
}

// WatchExtended is a free log subscription operation binding the contract event 0x137c92cc7579cc4d6a2b109467cd475c205d1c136363ca854cc46d72f840d5de.
//
// Solidity: event Extended(uint256 newEndBlock, uint256[] newRewardsPerBlock)
func (_Staker *StakerFilterer) WatchExtended(opts *bind.WatchOpts, sink chan<- *StakerExtended) (event.Subscription, error) {

	logs, sub, err := _Staker.contract.WatchLogs(opts, "Extended")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakerExtended)
				if err := _Staker.contract.UnpackLog(event, "Extended", log); err != nil {
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

// ParseExtended is a log parse operation binding the contract event 0x137c92cc7579cc4d6a2b109467cd475c205d1c136363ca854cc46d72f840d5de.
//
// Solidity: event Extended(uint256 newEndBlock, uint256[] newRewardsPerBlock)
func (_Staker *StakerFilterer) ParseExtended(log types.Log) (*StakerExtended, error) {
	event := new(StakerExtended)
	if err := _Staker.contract.UnpackLog(event, "Extended", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakerStakedIterator is returned from FilterStaked and is used to iterate over the raw logs and unpacked data for Staked events raised by the Staker contract.
type StakerStakedIterator struct {
	Event *StakerStaked // Event containing the contract specifics and raw log

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
func (it *StakerStakedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakerStaked)
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
		it.Event = new(StakerStaked)
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
func (it *StakerStakedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakerStakedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakerStaked represents a Staked event raised by the Staker contract.
type StakerStaked struct {
	User   common.Address
	Amount *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterStaked is a free log retrieval operation binding the contract event 0x9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d.
//
// Solidity: event Staked(address indexed user, uint256 amount)
func (_Staker *StakerFilterer) FilterStaked(opts *bind.FilterOpts, user []common.Address) (*StakerStakedIterator, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Staker.contract.FilterLogs(opts, "Staked", userRule)
	if err != nil {
		return nil, err
	}
	return &StakerStakedIterator{contract: _Staker.contract, event: "Staked", logs: logs, sub: sub}, nil
}

// WatchStaked is a free log subscription operation binding the contract event 0x9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d.
//
// Solidity: event Staked(address indexed user, uint256 amount)
func (_Staker *StakerFilterer) WatchStaked(opts *bind.WatchOpts, sink chan<- *StakerStaked, user []common.Address) (event.Subscription, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Staker.contract.WatchLogs(opts, "Staked", userRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakerStaked)
				if err := _Staker.contract.UnpackLog(event, "Staked", log); err != nil {
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

// ParseStaked is a log parse operation binding the contract event 0x9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d.
//
// Solidity: event Staked(address indexed user, uint256 amount)
func (_Staker *StakerFilterer) ParseStaked(log types.Log) (*StakerStaked, error) {
	event := new(StakerStaked)
	if err := _Staker.contract.UnpackLog(event, "Staked", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakerStakedAndLockedIterator is returned from FilterStakedAndLocked and is used to iterate over the raw logs and unpacked data for StakedAndLocked events raised by the Staker contract.
type StakerStakedAndLockedIterator struct {
	Event *StakerStakedAndLocked // Event containing the contract specifics and raw log

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
func (it *StakerStakedAndLockedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakerStakedAndLocked)
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
		it.Event = new(StakerStakedAndLocked)
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
func (it *StakerStakedAndLockedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakerStakedAndLockedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakerStakedAndLocked represents a StakedAndLocked event raised by the Staker contract.
type StakerStakedAndLocked struct {
	UserAddress common.Address
	TokenAmount *big.Int
	LockScheme  common.Address
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterStakedAndLocked is a free log retrieval operation binding the contract event 0x5ae9eac9eae389addf073e8e829ae488ab31d186b6234575446951ba6e53390e.
//
// Solidity: event StakedAndLocked(address indexed _userAddress, uint256 _tokenAmount, address _lockScheme)
func (_Staker *StakerFilterer) FilterStakedAndLocked(opts *bind.FilterOpts, _userAddress []common.Address) (*StakerStakedAndLockedIterator, error) {

	var _userAddressRule []interface{}
	for _, _userAddressItem := range _userAddress {
		_userAddressRule = append(_userAddressRule, _userAddressItem)
	}

	logs, sub, err := _Staker.contract.FilterLogs(opts, "StakedAndLocked", _userAddressRule)
	if err != nil {
		return nil, err
	}
	return &StakerStakedAndLockedIterator{contract: _Staker.contract, event: "StakedAndLocked", logs: logs, sub: sub}, nil
}

// WatchStakedAndLocked is a free log subscription operation binding the contract event 0x5ae9eac9eae389addf073e8e829ae488ab31d186b6234575446951ba6e53390e.
//
// Solidity: event StakedAndLocked(address indexed _userAddress, uint256 _tokenAmount, address _lockScheme)
func (_Staker *StakerFilterer) WatchStakedAndLocked(opts *bind.WatchOpts, sink chan<- *StakerStakedAndLocked, _userAddress []common.Address) (event.Subscription, error) {

	var _userAddressRule []interface{}
	for _, _userAddressItem := range _userAddress {
		_userAddressRule = append(_userAddressRule, _userAddressItem)
	}

	logs, sub, err := _Staker.contract.WatchLogs(opts, "StakedAndLocked", _userAddressRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakerStakedAndLocked)
				if err := _Staker.contract.UnpackLog(event, "StakedAndLocked", log); err != nil {
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

// ParseStakedAndLocked is a log parse operation binding the contract event 0x5ae9eac9eae389addf073e8e829ae488ab31d186b6234575446951ba6e53390e.
//
// Solidity: event StakedAndLocked(address indexed _userAddress, uint256 _tokenAmount, address _lockScheme)
func (_Staker *StakerFilterer) ParseStakedAndLocked(log types.Log) (*StakerStakedAndLocked, error) {
	event := new(StakerStakedAndLocked)
	if err := _Staker.contract.UnpackLog(event, "StakedAndLocked", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakerWithdrawLPRewardsIterator is returned from FilterWithdrawLPRewards and is used to iterate over the raw logs and unpacked data for WithdrawLPRewards events raised by the Staker contract.
type StakerWithdrawLPRewardsIterator struct {
	Event *StakerWithdrawLPRewards // Event containing the contract specifics and raw log

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
func (it *StakerWithdrawLPRewardsIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakerWithdrawLPRewards)
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
		it.Event = new(StakerWithdrawLPRewards)
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
func (it *StakerWithdrawLPRewardsIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakerWithdrawLPRewardsIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakerWithdrawLPRewards represents a WithdrawLPRewards event raised by the Staker contract.
type StakerWithdrawLPRewards struct {
	RewardsAmount *big.Int
	Recipient     common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterWithdrawLPRewards is a free log retrieval operation binding the contract event 0xdf1b625465761dd1a4330a9b3a21d4943183f301036528a3544f8d891fdce2c2.
//
// Solidity: event WithdrawLPRewards(uint256 indexed rewardsAmount, address indexed recipient)
func (_Staker *StakerFilterer) FilterWithdrawLPRewards(opts *bind.FilterOpts, rewardsAmount []*big.Int, recipient []common.Address) (*StakerWithdrawLPRewardsIterator, error) {

	var rewardsAmountRule []interface{}
	for _, rewardsAmountItem := range rewardsAmount {
		rewardsAmountRule = append(rewardsAmountRule, rewardsAmountItem)
	}
	var recipientRule []interface{}
	for _, recipientItem := range recipient {
		recipientRule = append(recipientRule, recipientItem)
	}

	logs, sub, err := _Staker.contract.FilterLogs(opts, "WithdrawLPRewards", rewardsAmountRule, recipientRule)
	if err != nil {
		return nil, err
	}
	return &StakerWithdrawLPRewardsIterator{contract: _Staker.contract, event: "WithdrawLPRewards", logs: logs, sub: sub}, nil
}

// WatchWithdrawLPRewards is a free log subscription operation binding the contract event 0xdf1b625465761dd1a4330a9b3a21d4943183f301036528a3544f8d891fdce2c2.
//
// Solidity: event WithdrawLPRewards(uint256 indexed rewardsAmount, address indexed recipient)
func (_Staker *StakerFilterer) WatchWithdrawLPRewards(opts *bind.WatchOpts, sink chan<- *StakerWithdrawLPRewards, rewardsAmount []*big.Int, recipient []common.Address) (event.Subscription, error) {

	var rewardsAmountRule []interface{}
	for _, rewardsAmountItem := range rewardsAmount {
		rewardsAmountRule = append(rewardsAmountRule, rewardsAmountItem)
	}
	var recipientRule []interface{}
	for _, recipientItem := range recipient {
		recipientRule = append(recipientRule, recipientItem)
	}

	logs, sub, err := _Staker.contract.WatchLogs(opts, "WithdrawLPRewards", rewardsAmountRule, recipientRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakerWithdrawLPRewards)
				if err := _Staker.contract.UnpackLog(event, "WithdrawLPRewards", log); err != nil {
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

// ParseWithdrawLPRewards is a log parse operation binding the contract event 0xdf1b625465761dd1a4330a9b3a21d4943183f301036528a3544f8d891fdce2c2.
//
// Solidity: event WithdrawLPRewards(uint256 indexed rewardsAmount, address indexed recipient)
func (_Staker *StakerFilterer) ParseWithdrawLPRewards(log types.Log) (*StakerWithdrawLPRewards, error) {
	event := new(StakerWithdrawLPRewards)
	if err := _Staker.contract.UnpackLog(event, "WithdrawLPRewards", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakerWithdrawnIterator is returned from FilterWithdrawn and is used to iterate over the raw logs and unpacked data for Withdrawn events raised by the Staker contract.
type StakerWithdrawnIterator struct {
	Event *StakerWithdrawn // Event containing the contract specifics and raw log

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
func (it *StakerWithdrawnIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakerWithdrawn)
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
		it.Event = new(StakerWithdrawn)
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
func (it *StakerWithdrawnIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakerWithdrawnIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakerWithdrawn represents a Withdrawn event raised by the Staker contract.
type StakerWithdrawn struct {
	User   common.Address
	Amount *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterWithdrawn is a free log retrieval operation binding the contract event 0x7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d5.
//
// Solidity: event Withdrawn(address indexed user, uint256 amount)
func (_Staker *StakerFilterer) FilterWithdrawn(opts *bind.FilterOpts, user []common.Address) (*StakerWithdrawnIterator, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Staker.contract.FilterLogs(opts, "Withdrawn", userRule)
	if err != nil {
		return nil, err
	}
	return &StakerWithdrawnIterator{contract: _Staker.contract, event: "Withdrawn", logs: logs, sub: sub}, nil
}

// WatchWithdrawn is a free log subscription operation binding the contract event 0x7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d5.
//
// Solidity: event Withdrawn(address indexed user, uint256 amount)
func (_Staker *StakerFilterer) WatchWithdrawn(opts *bind.WatchOpts, sink chan<- *StakerWithdrawn, user []common.Address) (event.Subscription, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Staker.contract.WatchLogs(opts, "Withdrawn", userRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakerWithdrawn)
				if err := _Staker.contract.UnpackLog(event, "Withdrawn", log); err != nil {
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

// ParseWithdrawn is a log parse operation binding the contract event 0x7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d5.
//
// Solidity: event Withdrawn(address indexed user, uint256 amount)
func (_Staker *StakerFilterer) ParseWithdrawn(log types.Log) (*StakerWithdrawn, error) {
	event := new(StakerWithdrawn)
	if err := _Staker.contract.UnpackLog(event, "Withdrawn", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
