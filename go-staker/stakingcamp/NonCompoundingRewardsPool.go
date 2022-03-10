// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package stakingcamp

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

// StakingcampMetaData contains all meta data concerning the Stakingcamp contract.
var StakingcampMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"contractIERC20Detailed\",\"name\":\"_stakingToken\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_startBlock\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"_endBlock\",\"type\":\"uint256\"},{\"internalType\":\"address[]\",\"name\":\"_rewardsTokens\",\"type\":\"address[]\"},{\"internalType\":\"uint256[]\",\"name\":\"_rewardPerBlock\",\"type\":\"uint256[]\"},{\"internalType\":\"uint256\",\"name\":\"_stakeLimit\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"_throttleRoundBlocks\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"_throttleRoundCap\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"_treasury\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_externalRewardToken\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_contractStakeLimit\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"}],\"name\":\"Claimed\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"stake\",\"type\":\"uint256\"}],\"name\":\"ExitCompleted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"exitBlock\",\"type\":\"uint256\"}],\"name\":\"ExitRequested\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"Exited\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"newEndBlock\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256[]\",\"name\":\"newRewardsPerBlock\",\"type\":\"uint256[]\"}],\"name\":\"Extended\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"token\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"reward\",\"type\":\"uint256\"}],\"name\":\"ExternalRewardsAdded\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"address\",\"name\":\"receiver\",\"type\":\"address\"}],\"name\":\"ExternalRewardsClaimed\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"StakeWithdrawn\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"Staked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"rewardsAmount\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"}],\"name\":\"WithdrawLPRewards\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"Withdrawn\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"accumulatedRewardMultiplier\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"claim\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"completeExit\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"contractStakeLimit\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"staker\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"stake\",\"type\":\"uint256\"}],\"name\":\"delegateStake\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"endBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"exit\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"transferTo\",\"type\":\"address\"}],\"name\":\"exitAndTransfer\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"exitInfo\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"exitBlock\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"exitStake\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_endBlock\",\"type\":\"uint256\"},{\"internalType\":\"uint256[]\",\"name\":\"_rewardsPerBlock\",\"type\":\"uint256[]\"},{\"internalType\":\"uint256[]\",\"name\":\"_currentRemainingRewards\",\"type\":\"uint256[]\"},{\"internalType\":\"uint256[]\",\"name\":\"_newRemainingRewards\",\"type\":\"uint256[]\"}],\"name\":\"extend\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"externalRewardToken\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"externalRewards\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenIndex\",\"type\":\"uint256\"}],\"name\":\"getPendingReward\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getRewardTokensCount\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenIndex\",\"type\":\"uint256\"}],\"name\":\"getUserAccumulatedReward\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_index\",\"type\":\"uint256\"}],\"name\":\"getUserOwedTokens\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_index\",\"type\":\"uint256\"}],\"name\":\"getUserRewardDebt\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"getUserRewardDebtLength\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_userAddress\",\"type\":\"address\"}],\"name\":\"getUserTokensOwedLength\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"hasStakingStarted\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"lastRewardBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"lockEndBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"nextAvailableExitBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"nextAvailableRoundExitVolume\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"reward\",\"type\":\"uint256\"}],\"name\":\"notifyExternalReward\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"receiversWhitelist\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"rewardPerBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"rewardsPoolFactory\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"rewardsTokens\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"receiver\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"whitelisted\",\"type\":\"bool\"}],\"name\":\"setReceiverWhitelisted\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_tokenAmount\",\"type\":\"uint256\"}],\"name\":\"stake\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"stakeLimit\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"stakingToken\",\"outputs\":[{\"internalType\":\"contractIERC20Detailed\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"startBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"throttleRoundBlocks\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"throttleRoundCap\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"totalStaked\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"treasury\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"updateRewardMultipliers\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"userInfo\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"firstStakedBlockNumber\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"amountStaked\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_tokenAmount\",\"type\":\"uint256\"}],\"name\":\"withdraw\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"lpTokenContract\",\"type\":\"address\"}],\"name\":\"withdrawLPRewards\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"withdrawStake\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
}

// StakingcampABI is the input ABI used to generate the binding from.
// Deprecated: Use StakingcampMetaData.ABI instead.
var StakingcampABI = StakingcampMetaData.ABI

// Stakingcamp is an auto generated Go binding around an Ethereum contract.
type Stakingcamp struct {
	StakingcampCaller     // Read-only binding to the contract
	StakingcampTransactor // Write-only binding to the contract
	StakingcampFilterer   // Log filterer for contract events
}

// StakingcampCaller is an auto generated read-only Go binding around an Ethereum contract.
type StakingcampCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StakingcampTransactor is an auto generated write-only Go binding around an Ethereum contract.
type StakingcampTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StakingcampFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type StakingcampFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StakingcampSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type StakingcampSession struct {
	Contract     *Stakingcamp      // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// StakingcampCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type StakingcampCallerSession struct {
	Contract *StakingcampCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts      // Call options to use throughout this session
}

// StakingcampTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type StakingcampTransactorSession struct {
	Contract     *StakingcampTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts      // Transaction auth options to use throughout this session
}

// StakingcampRaw is an auto generated low-level Go binding around an Ethereum contract.
type StakingcampRaw struct {
	Contract *Stakingcamp // Generic contract binding to access the raw methods on
}

// StakingcampCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type StakingcampCallerRaw struct {
	Contract *StakingcampCaller // Generic read-only contract binding to access the raw methods on
}

// StakingcampTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type StakingcampTransactorRaw struct {
	Contract *StakingcampTransactor // Generic write-only contract binding to access the raw methods on
}

// NewStakingcamp creates a new instance of Stakingcamp, bound to a specific deployed contract.
func NewStakingcamp(address common.Address, backend bind.ContractBackend) (*Stakingcamp, error) {
	contract, err := bindStakingcamp(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Stakingcamp{StakingcampCaller: StakingcampCaller{contract: contract}, StakingcampTransactor: StakingcampTransactor{contract: contract}, StakingcampFilterer: StakingcampFilterer{contract: contract}}, nil
}

// NewStakingcampCaller creates a new read-only instance of Stakingcamp, bound to a specific deployed contract.
func NewStakingcampCaller(address common.Address, caller bind.ContractCaller) (*StakingcampCaller, error) {
	contract, err := bindStakingcamp(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &StakingcampCaller{contract: contract}, nil
}

// NewStakingcampTransactor creates a new write-only instance of Stakingcamp, bound to a specific deployed contract.
func NewStakingcampTransactor(address common.Address, transactor bind.ContractTransactor) (*StakingcampTransactor, error) {
	contract, err := bindStakingcamp(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &StakingcampTransactor{contract: contract}, nil
}

// NewStakingcampFilterer creates a new log filterer instance of Stakingcamp, bound to a specific deployed contract.
func NewStakingcampFilterer(address common.Address, filterer bind.ContractFilterer) (*StakingcampFilterer, error) {
	contract, err := bindStakingcamp(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &StakingcampFilterer{contract: contract}, nil
}

// bindStakingcamp binds a generic wrapper to an already deployed contract.
func bindStakingcamp(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(StakingcampABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Stakingcamp *StakingcampRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Stakingcamp.Contract.StakingcampCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Stakingcamp *StakingcampRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Stakingcamp.Contract.StakingcampTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Stakingcamp *StakingcampRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Stakingcamp.Contract.StakingcampTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Stakingcamp *StakingcampCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Stakingcamp.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Stakingcamp *StakingcampTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Stakingcamp.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Stakingcamp *StakingcampTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Stakingcamp.Contract.contract.Transact(opts, method, params...)
}

// AccumulatedRewardMultiplier is a free data retrieval call binding the contract method 0xfb58cad1.
//
// Solidity: function accumulatedRewardMultiplier(uint256 ) view returns(uint256)
func (_Stakingcamp *StakingcampCaller) AccumulatedRewardMultiplier(opts *bind.CallOpts, arg0 *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "accumulatedRewardMultiplier", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AccumulatedRewardMultiplier is a free data retrieval call binding the contract method 0xfb58cad1.
//
// Solidity: function accumulatedRewardMultiplier(uint256 ) view returns(uint256)
func (_Stakingcamp *StakingcampSession) AccumulatedRewardMultiplier(arg0 *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.AccumulatedRewardMultiplier(&_Stakingcamp.CallOpts, arg0)
}

// AccumulatedRewardMultiplier is a free data retrieval call binding the contract method 0xfb58cad1.
//
// Solidity: function accumulatedRewardMultiplier(uint256 ) view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) AccumulatedRewardMultiplier(arg0 *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.AccumulatedRewardMultiplier(&_Stakingcamp.CallOpts, arg0)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address _userAddress) view returns(uint256)
func (_Stakingcamp *StakingcampCaller) BalanceOf(opts *bind.CallOpts, _userAddress common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "balanceOf", _userAddress)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address _userAddress) view returns(uint256)
func (_Stakingcamp *StakingcampSession) BalanceOf(_userAddress common.Address) (*big.Int, error) {
	return _Stakingcamp.Contract.BalanceOf(&_Stakingcamp.CallOpts, _userAddress)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address _userAddress) view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) BalanceOf(_userAddress common.Address) (*big.Int, error) {
	return _Stakingcamp.Contract.BalanceOf(&_Stakingcamp.CallOpts, _userAddress)
}

// ContractStakeLimit is a free data retrieval call binding the contract method 0x03d1dae0.
//
// Solidity: function contractStakeLimit() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) ContractStakeLimit(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "contractStakeLimit")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// ContractStakeLimit is a free data retrieval call binding the contract method 0x03d1dae0.
//
// Solidity: function contractStakeLimit() view returns(uint256)
func (_Stakingcamp *StakingcampSession) ContractStakeLimit() (*big.Int, error) {
	return _Stakingcamp.Contract.ContractStakeLimit(&_Stakingcamp.CallOpts)
}

// ContractStakeLimit is a free data retrieval call binding the contract method 0x03d1dae0.
//
// Solidity: function contractStakeLimit() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) ContractStakeLimit() (*big.Int, error) {
	return _Stakingcamp.Contract.ContractStakeLimit(&_Stakingcamp.CallOpts)
}

// EndBlock is a free data retrieval call binding the contract method 0x083c6323.
//
// Solidity: function endBlock() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) EndBlock(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "endBlock")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// EndBlock is a free data retrieval call binding the contract method 0x083c6323.
//
// Solidity: function endBlock() view returns(uint256)
func (_Stakingcamp *StakingcampSession) EndBlock() (*big.Int, error) {
	return _Stakingcamp.Contract.EndBlock(&_Stakingcamp.CallOpts)
}

// EndBlock is a free data retrieval call binding the contract method 0x083c6323.
//
// Solidity: function endBlock() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) EndBlock() (*big.Int, error) {
	return _Stakingcamp.Contract.EndBlock(&_Stakingcamp.CallOpts)
}

// ExitInfo is a free data retrieval call binding the contract method 0x94f66417.
//
// Solidity: function exitInfo(address ) view returns(uint256 exitBlock, uint256 exitStake)
func (_Stakingcamp *StakingcampCaller) ExitInfo(opts *bind.CallOpts, arg0 common.Address) (struct {
	ExitBlock *big.Int
	ExitStake *big.Int
}, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "exitInfo", arg0)

	outstruct := new(struct {
		ExitBlock *big.Int
		ExitStake *big.Int
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.ExitBlock = *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	outstruct.ExitStake = *abi.ConvertType(out[1], new(*big.Int)).(**big.Int)

	return *outstruct, err

}

// ExitInfo is a free data retrieval call binding the contract method 0x94f66417.
//
// Solidity: function exitInfo(address ) view returns(uint256 exitBlock, uint256 exitStake)
func (_Stakingcamp *StakingcampSession) ExitInfo(arg0 common.Address) (struct {
	ExitBlock *big.Int
	ExitStake *big.Int
}, error) {
	return _Stakingcamp.Contract.ExitInfo(&_Stakingcamp.CallOpts, arg0)
}

// ExitInfo is a free data retrieval call binding the contract method 0x94f66417.
//
// Solidity: function exitInfo(address ) view returns(uint256 exitBlock, uint256 exitStake)
func (_Stakingcamp *StakingcampCallerSession) ExitInfo(arg0 common.Address) (struct {
	ExitBlock *big.Int
	ExitStake *big.Int
}, error) {
	return _Stakingcamp.Contract.ExitInfo(&_Stakingcamp.CallOpts, arg0)
}

// ExternalRewardToken is a free data retrieval call binding the contract method 0x333609b6.
//
// Solidity: function externalRewardToken() view returns(address)
func (_Stakingcamp *StakingcampCaller) ExternalRewardToken(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "externalRewardToken")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// ExternalRewardToken is a free data retrieval call binding the contract method 0x333609b6.
//
// Solidity: function externalRewardToken() view returns(address)
func (_Stakingcamp *StakingcampSession) ExternalRewardToken() (common.Address, error) {
	return _Stakingcamp.Contract.ExternalRewardToken(&_Stakingcamp.CallOpts)
}

// ExternalRewardToken is a free data retrieval call binding the contract method 0x333609b6.
//
// Solidity: function externalRewardToken() view returns(address)
func (_Stakingcamp *StakingcampCallerSession) ExternalRewardToken() (common.Address, error) {
	return _Stakingcamp.Contract.ExternalRewardToken(&_Stakingcamp.CallOpts)
}

// ExternalRewards is a free data retrieval call binding the contract method 0x9c3705c7.
//
// Solidity: function externalRewards(address ) view returns(uint256)
func (_Stakingcamp *StakingcampCaller) ExternalRewards(opts *bind.CallOpts, arg0 common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "externalRewards", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// ExternalRewards is a free data retrieval call binding the contract method 0x9c3705c7.
//
// Solidity: function externalRewards(address ) view returns(uint256)
func (_Stakingcamp *StakingcampSession) ExternalRewards(arg0 common.Address) (*big.Int, error) {
	return _Stakingcamp.Contract.ExternalRewards(&_Stakingcamp.CallOpts, arg0)
}

// ExternalRewards is a free data retrieval call binding the contract method 0x9c3705c7.
//
// Solidity: function externalRewards(address ) view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) ExternalRewards(arg0 common.Address) (*big.Int, error) {
	return _Stakingcamp.Contract.ExternalRewards(&_Stakingcamp.CallOpts, arg0)
}

// GetPendingReward is a free data retrieval call binding the contract method 0x7211bbc9.
//
// Solidity: function getPendingReward(uint256 tokenIndex) view returns(uint256)
func (_Stakingcamp *StakingcampCaller) GetPendingReward(opts *bind.CallOpts, tokenIndex *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "getPendingReward", tokenIndex)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetPendingReward is a free data retrieval call binding the contract method 0x7211bbc9.
//
// Solidity: function getPendingReward(uint256 tokenIndex) view returns(uint256)
func (_Stakingcamp *StakingcampSession) GetPendingReward(tokenIndex *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.GetPendingReward(&_Stakingcamp.CallOpts, tokenIndex)
}

// GetPendingReward is a free data retrieval call binding the contract method 0x7211bbc9.
//
// Solidity: function getPendingReward(uint256 tokenIndex) view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) GetPendingReward(tokenIndex *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.GetPendingReward(&_Stakingcamp.CallOpts, tokenIndex)
}

// GetRewardTokensCount is a free data retrieval call binding the contract method 0x2d9e88e1.
//
// Solidity: function getRewardTokensCount() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) GetRewardTokensCount(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "getRewardTokensCount")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetRewardTokensCount is a free data retrieval call binding the contract method 0x2d9e88e1.
//
// Solidity: function getRewardTokensCount() view returns(uint256)
func (_Stakingcamp *StakingcampSession) GetRewardTokensCount() (*big.Int, error) {
	return _Stakingcamp.Contract.GetRewardTokensCount(&_Stakingcamp.CallOpts)
}

// GetRewardTokensCount is a free data retrieval call binding the contract method 0x2d9e88e1.
//
// Solidity: function getRewardTokensCount() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) GetRewardTokensCount() (*big.Int, error) {
	return _Stakingcamp.Contract.GetRewardTokensCount(&_Stakingcamp.CallOpts)
}

// GetUserAccumulatedReward is a free data retrieval call binding the contract method 0xdf9d777f.
//
// Solidity: function getUserAccumulatedReward(address _userAddress, uint256 tokenIndex) view returns(uint256)
func (_Stakingcamp *StakingcampCaller) GetUserAccumulatedReward(opts *bind.CallOpts, _userAddress common.Address, tokenIndex *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "getUserAccumulatedReward", _userAddress, tokenIndex)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserAccumulatedReward is a free data retrieval call binding the contract method 0xdf9d777f.
//
// Solidity: function getUserAccumulatedReward(address _userAddress, uint256 tokenIndex) view returns(uint256)
func (_Stakingcamp *StakingcampSession) GetUserAccumulatedReward(_userAddress common.Address, tokenIndex *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.GetUserAccumulatedReward(&_Stakingcamp.CallOpts, _userAddress, tokenIndex)
}

// GetUserAccumulatedReward is a free data retrieval call binding the contract method 0xdf9d777f.
//
// Solidity: function getUserAccumulatedReward(address _userAddress, uint256 tokenIndex) view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) GetUserAccumulatedReward(_userAddress common.Address, tokenIndex *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.GetUserAccumulatedReward(&_Stakingcamp.CallOpts, _userAddress, tokenIndex)
}

// GetUserOwedTokens is a free data retrieval call binding the contract method 0xce415302.
//
// Solidity: function getUserOwedTokens(address _userAddress, uint256 _index) view returns(uint256)
func (_Stakingcamp *StakingcampCaller) GetUserOwedTokens(opts *bind.CallOpts, _userAddress common.Address, _index *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "getUserOwedTokens", _userAddress, _index)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserOwedTokens is a free data retrieval call binding the contract method 0xce415302.
//
// Solidity: function getUserOwedTokens(address _userAddress, uint256 _index) view returns(uint256)
func (_Stakingcamp *StakingcampSession) GetUserOwedTokens(_userAddress common.Address, _index *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.GetUserOwedTokens(&_Stakingcamp.CallOpts, _userAddress, _index)
}

// GetUserOwedTokens is a free data retrieval call binding the contract method 0xce415302.
//
// Solidity: function getUserOwedTokens(address _userAddress, uint256 _index) view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) GetUserOwedTokens(_userAddress common.Address, _index *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.GetUserOwedTokens(&_Stakingcamp.CallOpts, _userAddress, _index)
}

// GetUserRewardDebt is a free data retrieval call binding the contract method 0xf27d0264.
//
// Solidity: function getUserRewardDebt(address _userAddress, uint256 _index) view returns(uint256)
func (_Stakingcamp *StakingcampCaller) GetUserRewardDebt(opts *bind.CallOpts, _userAddress common.Address, _index *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "getUserRewardDebt", _userAddress, _index)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserRewardDebt is a free data retrieval call binding the contract method 0xf27d0264.
//
// Solidity: function getUserRewardDebt(address _userAddress, uint256 _index) view returns(uint256)
func (_Stakingcamp *StakingcampSession) GetUserRewardDebt(_userAddress common.Address, _index *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.GetUserRewardDebt(&_Stakingcamp.CallOpts, _userAddress, _index)
}

// GetUserRewardDebt is a free data retrieval call binding the contract method 0xf27d0264.
//
// Solidity: function getUserRewardDebt(address _userAddress, uint256 _index) view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) GetUserRewardDebt(_userAddress common.Address, _index *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.GetUserRewardDebt(&_Stakingcamp.CallOpts, _userAddress, _index)
}

// GetUserRewardDebtLength is a free data retrieval call binding the contract method 0x0084c927.
//
// Solidity: function getUserRewardDebtLength(address _userAddress) view returns(uint256)
func (_Stakingcamp *StakingcampCaller) GetUserRewardDebtLength(opts *bind.CallOpts, _userAddress common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "getUserRewardDebtLength", _userAddress)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserRewardDebtLength is a free data retrieval call binding the contract method 0x0084c927.
//
// Solidity: function getUserRewardDebtLength(address _userAddress) view returns(uint256)
func (_Stakingcamp *StakingcampSession) GetUserRewardDebtLength(_userAddress common.Address) (*big.Int, error) {
	return _Stakingcamp.Contract.GetUserRewardDebtLength(&_Stakingcamp.CallOpts, _userAddress)
}

// GetUserRewardDebtLength is a free data retrieval call binding the contract method 0x0084c927.
//
// Solidity: function getUserRewardDebtLength(address _userAddress) view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) GetUserRewardDebtLength(_userAddress common.Address) (*big.Int, error) {
	return _Stakingcamp.Contract.GetUserRewardDebtLength(&_Stakingcamp.CallOpts, _userAddress)
}

// GetUserTokensOwedLength is a free data retrieval call binding the contract method 0xa1292aea.
//
// Solidity: function getUserTokensOwedLength(address _userAddress) view returns(uint256)
func (_Stakingcamp *StakingcampCaller) GetUserTokensOwedLength(opts *bind.CallOpts, _userAddress common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "getUserTokensOwedLength", _userAddress)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetUserTokensOwedLength is a free data retrieval call binding the contract method 0xa1292aea.
//
// Solidity: function getUserTokensOwedLength(address _userAddress) view returns(uint256)
func (_Stakingcamp *StakingcampSession) GetUserTokensOwedLength(_userAddress common.Address) (*big.Int, error) {
	return _Stakingcamp.Contract.GetUserTokensOwedLength(&_Stakingcamp.CallOpts, _userAddress)
}

// GetUserTokensOwedLength is a free data retrieval call binding the contract method 0xa1292aea.
//
// Solidity: function getUserTokensOwedLength(address _userAddress) view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) GetUserTokensOwedLength(_userAddress common.Address) (*big.Int, error) {
	return _Stakingcamp.Contract.GetUserTokensOwedLength(&_Stakingcamp.CallOpts, _userAddress)
}

// HasStakingStarted is a free data retrieval call binding the contract method 0x57b4f01f.
//
// Solidity: function hasStakingStarted() view returns(bool)
func (_Stakingcamp *StakingcampCaller) HasStakingStarted(opts *bind.CallOpts) (bool, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "hasStakingStarted")

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// HasStakingStarted is a free data retrieval call binding the contract method 0x57b4f01f.
//
// Solidity: function hasStakingStarted() view returns(bool)
func (_Stakingcamp *StakingcampSession) HasStakingStarted() (bool, error) {
	return _Stakingcamp.Contract.HasStakingStarted(&_Stakingcamp.CallOpts)
}

// HasStakingStarted is a free data retrieval call binding the contract method 0x57b4f01f.
//
// Solidity: function hasStakingStarted() view returns(bool)
func (_Stakingcamp *StakingcampCallerSession) HasStakingStarted() (bool, error) {
	return _Stakingcamp.Contract.HasStakingStarted(&_Stakingcamp.CallOpts)
}

// LastRewardBlock is a free data retrieval call binding the contract method 0xa9f8d181.
//
// Solidity: function lastRewardBlock() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) LastRewardBlock(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "lastRewardBlock")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// LastRewardBlock is a free data retrieval call binding the contract method 0xa9f8d181.
//
// Solidity: function lastRewardBlock() view returns(uint256)
func (_Stakingcamp *StakingcampSession) LastRewardBlock() (*big.Int, error) {
	return _Stakingcamp.Contract.LastRewardBlock(&_Stakingcamp.CallOpts)
}

// LastRewardBlock is a free data retrieval call binding the contract method 0xa9f8d181.
//
// Solidity: function lastRewardBlock() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) LastRewardBlock() (*big.Int, error) {
	return _Stakingcamp.Contract.LastRewardBlock(&_Stakingcamp.CallOpts)
}

// LockEndBlock is a free data retrieval call binding the contract method 0x8587edbb.
//
// Solidity: function lockEndBlock() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) LockEndBlock(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "lockEndBlock")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// LockEndBlock is a free data retrieval call binding the contract method 0x8587edbb.
//
// Solidity: function lockEndBlock() view returns(uint256)
func (_Stakingcamp *StakingcampSession) LockEndBlock() (*big.Int, error) {
	return _Stakingcamp.Contract.LockEndBlock(&_Stakingcamp.CallOpts)
}

// LockEndBlock is a free data retrieval call binding the contract method 0x8587edbb.
//
// Solidity: function lockEndBlock() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) LockEndBlock() (*big.Int, error) {
	return _Stakingcamp.Contract.LockEndBlock(&_Stakingcamp.CallOpts)
}

// NextAvailableExitBlock is a free data retrieval call binding the contract method 0x1c1f9cc0.
//
// Solidity: function nextAvailableExitBlock() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) NextAvailableExitBlock(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "nextAvailableExitBlock")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// NextAvailableExitBlock is a free data retrieval call binding the contract method 0x1c1f9cc0.
//
// Solidity: function nextAvailableExitBlock() view returns(uint256)
func (_Stakingcamp *StakingcampSession) NextAvailableExitBlock() (*big.Int, error) {
	return _Stakingcamp.Contract.NextAvailableExitBlock(&_Stakingcamp.CallOpts)
}

// NextAvailableExitBlock is a free data retrieval call binding the contract method 0x1c1f9cc0.
//
// Solidity: function nextAvailableExitBlock() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) NextAvailableExitBlock() (*big.Int, error) {
	return _Stakingcamp.Contract.NextAvailableExitBlock(&_Stakingcamp.CallOpts)
}

// NextAvailableRoundExitVolume is a free data retrieval call binding the contract method 0xee483cdf.
//
// Solidity: function nextAvailableRoundExitVolume() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) NextAvailableRoundExitVolume(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "nextAvailableRoundExitVolume")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// NextAvailableRoundExitVolume is a free data retrieval call binding the contract method 0xee483cdf.
//
// Solidity: function nextAvailableRoundExitVolume() view returns(uint256)
func (_Stakingcamp *StakingcampSession) NextAvailableRoundExitVolume() (*big.Int, error) {
	return _Stakingcamp.Contract.NextAvailableRoundExitVolume(&_Stakingcamp.CallOpts)
}

// NextAvailableRoundExitVolume is a free data retrieval call binding the contract method 0xee483cdf.
//
// Solidity: function nextAvailableRoundExitVolume() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) NextAvailableRoundExitVolume() (*big.Int, error) {
	return _Stakingcamp.Contract.NextAvailableRoundExitVolume(&_Stakingcamp.CallOpts)
}

// ReceiversWhitelist is a free data retrieval call binding the contract method 0x363291dc.
//
// Solidity: function receiversWhitelist(address ) view returns(bool)
func (_Stakingcamp *StakingcampCaller) ReceiversWhitelist(opts *bind.CallOpts, arg0 common.Address) (bool, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "receiversWhitelist", arg0)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// ReceiversWhitelist is a free data retrieval call binding the contract method 0x363291dc.
//
// Solidity: function receiversWhitelist(address ) view returns(bool)
func (_Stakingcamp *StakingcampSession) ReceiversWhitelist(arg0 common.Address) (bool, error) {
	return _Stakingcamp.Contract.ReceiversWhitelist(&_Stakingcamp.CallOpts, arg0)
}

// ReceiversWhitelist is a free data retrieval call binding the contract method 0x363291dc.
//
// Solidity: function receiversWhitelist(address ) view returns(bool)
func (_Stakingcamp *StakingcampCallerSession) ReceiversWhitelist(arg0 common.Address) (bool, error) {
	return _Stakingcamp.Contract.ReceiversWhitelist(&_Stakingcamp.CallOpts, arg0)
}

// RewardPerBlock is a free data retrieval call binding the contract method 0x791f39cd.
//
// Solidity: function rewardPerBlock(uint256 ) view returns(uint256)
func (_Stakingcamp *StakingcampCaller) RewardPerBlock(opts *bind.CallOpts, arg0 *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "rewardPerBlock", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// RewardPerBlock is a free data retrieval call binding the contract method 0x791f39cd.
//
// Solidity: function rewardPerBlock(uint256 ) view returns(uint256)
func (_Stakingcamp *StakingcampSession) RewardPerBlock(arg0 *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.RewardPerBlock(&_Stakingcamp.CallOpts, arg0)
}

// RewardPerBlock is a free data retrieval call binding the contract method 0x791f39cd.
//
// Solidity: function rewardPerBlock(uint256 ) view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) RewardPerBlock(arg0 *big.Int) (*big.Int, error) {
	return _Stakingcamp.Contract.RewardPerBlock(&_Stakingcamp.CallOpts, arg0)
}

// RewardsPoolFactory is a free data retrieval call binding the contract method 0x56409b81.
//
// Solidity: function rewardsPoolFactory() view returns(address)
func (_Stakingcamp *StakingcampCaller) RewardsPoolFactory(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "rewardsPoolFactory")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// RewardsPoolFactory is a free data retrieval call binding the contract method 0x56409b81.
//
// Solidity: function rewardsPoolFactory() view returns(address)
func (_Stakingcamp *StakingcampSession) RewardsPoolFactory() (common.Address, error) {
	return _Stakingcamp.Contract.RewardsPoolFactory(&_Stakingcamp.CallOpts)
}

// RewardsPoolFactory is a free data retrieval call binding the contract method 0x56409b81.
//
// Solidity: function rewardsPoolFactory() view returns(address)
func (_Stakingcamp *StakingcampCallerSession) RewardsPoolFactory() (common.Address, error) {
	return _Stakingcamp.Contract.RewardsPoolFactory(&_Stakingcamp.CallOpts)
}

// RewardsTokens is a free data retrieval call binding the contract method 0xb6d0dcd8.
//
// Solidity: function rewardsTokens(uint256 ) view returns(address)
func (_Stakingcamp *StakingcampCaller) RewardsTokens(opts *bind.CallOpts, arg0 *big.Int) (common.Address, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "rewardsTokens", arg0)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// RewardsTokens is a free data retrieval call binding the contract method 0xb6d0dcd8.
//
// Solidity: function rewardsTokens(uint256 ) view returns(address)
func (_Stakingcamp *StakingcampSession) RewardsTokens(arg0 *big.Int) (common.Address, error) {
	return _Stakingcamp.Contract.RewardsTokens(&_Stakingcamp.CallOpts, arg0)
}

// RewardsTokens is a free data retrieval call binding the contract method 0xb6d0dcd8.
//
// Solidity: function rewardsTokens(uint256 ) view returns(address)
func (_Stakingcamp *StakingcampCallerSession) RewardsTokens(arg0 *big.Int) (common.Address, error) {
	return _Stakingcamp.Contract.RewardsTokens(&_Stakingcamp.CallOpts, arg0)
}

// StakeLimit is a free data retrieval call binding the contract method 0x45ef79af.
//
// Solidity: function stakeLimit() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) StakeLimit(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "stakeLimit")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// StakeLimit is a free data retrieval call binding the contract method 0x45ef79af.
//
// Solidity: function stakeLimit() view returns(uint256)
func (_Stakingcamp *StakingcampSession) StakeLimit() (*big.Int, error) {
	return _Stakingcamp.Contract.StakeLimit(&_Stakingcamp.CallOpts)
}

// StakeLimit is a free data retrieval call binding the contract method 0x45ef79af.
//
// Solidity: function stakeLimit() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) StakeLimit() (*big.Int, error) {
	return _Stakingcamp.Contract.StakeLimit(&_Stakingcamp.CallOpts)
}

// StakingToken is a free data retrieval call binding the contract method 0x72f702f3.
//
// Solidity: function stakingToken() view returns(address)
func (_Stakingcamp *StakingcampCaller) StakingToken(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "stakingToken")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// StakingToken is a free data retrieval call binding the contract method 0x72f702f3.
//
// Solidity: function stakingToken() view returns(address)
func (_Stakingcamp *StakingcampSession) StakingToken() (common.Address, error) {
	return _Stakingcamp.Contract.StakingToken(&_Stakingcamp.CallOpts)
}

// StakingToken is a free data retrieval call binding the contract method 0x72f702f3.
//
// Solidity: function stakingToken() view returns(address)
func (_Stakingcamp *StakingcampCallerSession) StakingToken() (common.Address, error) {
	return _Stakingcamp.Contract.StakingToken(&_Stakingcamp.CallOpts)
}

// StartBlock is a free data retrieval call binding the contract method 0x48cd4cb1.
//
// Solidity: function startBlock() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) StartBlock(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "startBlock")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// StartBlock is a free data retrieval call binding the contract method 0x48cd4cb1.
//
// Solidity: function startBlock() view returns(uint256)
func (_Stakingcamp *StakingcampSession) StartBlock() (*big.Int, error) {
	return _Stakingcamp.Contract.StartBlock(&_Stakingcamp.CallOpts)
}

// StartBlock is a free data retrieval call binding the contract method 0x48cd4cb1.
//
// Solidity: function startBlock() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) StartBlock() (*big.Int, error) {
	return _Stakingcamp.Contract.StartBlock(&_Stakingcamp.CallOpts)
}

// ThrottleRoundBlocks is a free data retrieval call binding the contract method 0x6eb957df.
//
// Solidity: function throttleRoundBlocks() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) ThrottleRoundBlocks(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "throttleRoundBlocks")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// ThrottleRoundBlocks is a free data retrieval call binding the contract method 0x6eb957df.
//
// Solidity: function throttleRoundBlocks() view returns(uint256)
func (_Stakingcamp *StakingcampSession) ThrottleRoundBlocks() (*big.Int, error) {
	return _Stakingcamp.Contract.ThrottleRoundBlocks(&_Stakingcamp.CallOpts)
}

// ThrottleRoundBlocks is a free data retrieval call binding the contract method 0x6eb957df.
//
// Solidity: function throttleRoundBlocks() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) ThrottleRoundBlocks() (*big.Int, error) {
	return _Stakingcamp.Contract.ThrottleRoundBlocks(&_Stakingcamp.CallOpts)
}

// ThrottleRoundCap is a free data retrieval call binding the contract method 0x4ff3306f.
//
// Solidity: function throttleRoundCap() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) ThrottleRoundCap(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "throttleRoundCap")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// ThrottleRoundCap is a free data retrieval call binding the contract method 0x4ff3306f.
//
// Solidity: function throttleRoundCap() view returns(uint256)
func (_Stakingcamp *StakingcampSession) ThrottleRoundCap() (*big.Int, error) {
	return _Stakingcamp.Contract.ThrottleRoundCap(&_Stakingcamp.CallOpts)
}

// ThrottleRoundCap is a free data retrieval call binding the contract method 0x4ff3306f.
//
// Solidity: function throttleRoundCap() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) ThrottleRoundCap() (*big.Int, error) {
	return _Stakingcamp.Contract.ThrottleRoundCap(&_Stakingcamp.CallOpts)
}

// TotalStaked is a free data retrieval call binding the contract method 0x817b1cd2.
//
// Solidity: function totalStaked() view returns(uint256)
func (_Stakingcamp *StakingcampCaller) TotalStaked(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "totalStaked")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// TotalStaked is a free data retrieval call binding the contract method 0x817b1cd2.
//
// Solidity: function totalStaked() view returns(uint256)
func (_Stakingcamp *StakingcampSession) TotalStaked() (*big.Int, error) {
	return _Stakingcamp.Contract.TotalStaked(&_Stakingcamp.CallOpts)
}

// TotalStaked is a free data retrieval call binding the contract method 0x817b1cd2.
//
// Solidity: function totalStaked() view returns(uint256)
func (_Stakingcamp *StakingcampCallerSession) TotalStaked() (*big.Int, error) {
	return _Stakingcamp.Contract.TotalStaked(&_Stakingcamp.CallOpts)
}

// Treasury is a free data retrieval call binding the contract method 0x61d027b3.
//
// Solidity: function treasury() view returns(address)
func (_Stakingcamp *StakingcampCaller) Treasury(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "treasury")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Treasury is a free data retrieval call binding the contract method 0x61d027b3.
//
// Solidity: function treasury() view returns(address)
func (_Stakingcamp *StakingcampSession) Treasury() (common.Address, error) {
	return _Stakingcamp.Contract.Treasury(&_Stakingcamp.CallOpts)
}

// Treasury is a free data retrieval call binding the contract method 0x61d027b3.
//
// Solidity: function treasury() view returns(address)
func (_Stakingcamp *StakingcampCallerSession) Treasury() (common.Address, error) {
	return _Stakingcamp.Contract.Treasury(&_Stakingcamp.CallOpts)
}

// UserInfo is a free data retrieval call binding the contract method 0x1959a002.
//
// Solidity: function userInfo(address ) view returns(uint256 firstStakedBlockNumber, uint256 amountStaked)
func (_Stakingcamp *StakingcampCaller) UserInfo(opts *bind.CallOpts, arg0 common.Address) (struct {
	FirstStakedBlockNumber *big.Int
	AmountStaked           *big.Int
}, error) {
	var out []interface{}
	err := _Stakingcamp.contract.Call(opts, &out, "userInfo", arg0)

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
func (_Stakingcamp *StakingcampSession) UserInfo(arg0 common.Address) (struct {
	FirstStakedBlockNumber *big.Int
	AmountStaked           *big.Int
}, error) {
	return _Stakingcamp.Contract.UserInfo(&_Stakingcamp.CallOpts, arg0)
}

// UserInfo is a free data retrieval call binding the contract method 0x1959a002.
//
// Solidity: function userInfo(address ) view returns(uint256 firstStakedBlockNumber, uint256 amountStaked)
func (_Stakingcamp *StakingcampCallerSession) UserInfo(arg0 common.Address) (struct {
	FirstStakedBlockNumber *big.Int
	AmountStaked           *big.Int
}, error) {
	return _Stakingcamp.Contract.UserInfo(&_Stakingcamp.CallOpts, arg0)
}

// Claim is a paid mutator transaction binding the contract method 0x4e71d92d.
//
// Solidity: function claim() returns()
func (_Stakingcamp *StakingcampTransactor) Claim(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "claim")
}

// Claim is a paid mutator transaction binding the contract method 0x4e71d92d.
//
// Solidity: function claim() returns()
func (_Stakingcamp *StakingcampSession) Claim() (*types.Transaction, error) {
	return _Stakingcamp.Contract.Claim(&_Stakingcamp.TransactOpts)
}

// Claim is a paid mutator transaction binding the contract method 0x4e71d92d.
//
// Solidity: function claim() returns()
func (_Stakingcamp *StakingcampTransactorSession) Claim() (*types.Transaction, error) {
	return _Stakingcamp.Contract.Claim(&_Stakingcamp.TransactOpts)
}

// CompleteExit is a paid mutator transaction binding the contract method 0xb01eb660.
//
// Solidity: function completeExit() returns()
func (_Stakingcamp *StakingcampTransactor) CompleteExit(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "completeExit")
}

// CompleteExit is a paid mutator transaction binding the contract method 0xb01eb660.
//
// Solidity: function completeExit() returns()
func (_Stakingcamp *StakingcampSession) CompleteExit() (*types.Transaction, error) {
	return _Stakingcamp.Contract.CompleteExit(&_Stakingcamp.TransactOpts)
}

// CompleteExit is a paid mutator transaction binding the contract method 0xb01eb660.
//
// Solidity: function completeExit() returns()
func (_Stakingcamp *StakingcampTransactorSession) CompleteExit() (*types.Transaction, error) {
	return _Stakingcamp.Contract.CompleteExit(&_Stakingcamp.TransactOpts)
}

// DelegateStake is a paid mutator transaction binding the contract method 0x3c323a1b.
//
// Solidity: function delegateStake(address staker, uint256 stake) returns()
func (_Stakingcamp *StakingcampTransactor) DelegateStake(opts *bind.TransactOpts, staker common.Address, stake *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "delegateStake", staker, stake)
}

// DelegateStake is a paid mutator transaction binding the contract method 0x3c323a1b.
//
// Solidity: function delegateStake(address staker, uint256 stake) returns()
func (_Stakingcamp *StakingcampSession) DelegateStake(staker common.Address, stake *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.DelegateStake(&_Stakingcamp.TransactOpts, staker, stake)
}

// DelegateStake is a paid mutator transaction binding the contract method 0x3c323a1b.
//
// Solidity: function delegateStake(address staker, uint256 stake) returns()
func (_Stakingcamp *StakingcampTransactorSession) DelegateStake(staker common.Address, stake *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.DelegateStake(&_Stakingcamp.TransactOpts, staker, stake)
}

// Exit is a paid mutator transaction binding the contract method 0xe9fad8ee.
//
// Solidity: function exit() returns()
func (_Stakingcamp *StakingcampTransactor) Exit(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "exit")
}

// Exit is a paid mutator transaction binding the contract method 0xe9fad8ee.
//
// Solidity: function exit() returns()
func (_Stakingcamp *StakingcampSession) Exit() (*types.Transaction, error) {
	return _Stakingcamp.Contract.Exit(&_Stakingcamp.TransactOpts)
}

// Exit is a paid mutator transaction binding the contract method 0xe9fad8ee.
//
// Solidity: function exit() returns()
func (_Stakingcamp *StakingcampTransactorSession) Exit() (*types.Transaction, error) {
	return _Stakingcamp.Contract.Exit(&_Stakingcamp.TransactOpts)
}

// ExitAndTransfer is a paid mutator transaction binding the contract method 0x2240e63c.
//
// Solidity: function exitAndTransfer(address transferTo) returns()
func (_Stakingcamp *StakingcampTransactor) ExitAndTransfer(opts *bind.TransactOpts, transferTo common.Address) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "exitAndTransfer", transferTo)
}

// ExitAndTransfer is a paid mutator transaction binding the contract method 0x2240e63c.
//
// Solidity: function exitAndTransfer(address transferTo) returns()
func (_Stakingcamp *StakingcampSession) ExitAndTransfer(transferTo common.Address) (*types.Transaction, error) {
	return _Stakingcamp.Contract.ExitAndTransfer(&_Stakingcamp.TransactOpts, transferTo)
}

// ExitAndTransfer is a paid mutator transaction binding the contract method 0x2240e63c.
//
// Solidity: function exitAndTransfer(address transferTo) returns()
func (_Stakingcamp *StakingcampTransactorSession) ExitAndTransfer(transferTo common.Address) (*types.Transaction, error) {
	return _Stakingcamp.Contract.ExitAndTransfer(&_Stakingcamp.TransactOpts, transferTo)
}

// Extend is a paid mutator transaction binding the contract method 0x20e67c76.
//
// Solidity: function extend(uint256 _endBlock, uint256[] _rewardsPerBlock, uint256[] _currentRemainingRewards, uint256[] _newRemainingRewards) returns()
func (_Stakingcamp *StakingcampTransactor) Extend(opts *bind.TransactOpts, _endBlock *big.Int, _rewardsPerBlock []*big.Int, _currentRemainingRewards []*big.Int, _newRemainingRewards []*big.Int) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "extend", _endBlock, _rewardsPerBlock, _currentRemainingRewards, _newRemainingRewards)
}

// Extend is a paid mutator transaction binding the contract method 0x20e67c76.
//
// Solidity: function extend(uint256 _endBlock, uint256[] _rewardsPerBlock, uint256[] _currentRemainingRewards, uint256[] _newRemainingRewards) returns()
func (_Stakingcamp *StakingcampSession) Extend(_endBlock *big.Int, _rewardsPerBlock []*big.Int, _currentRemainingRewards []*big.Int, _newRemainingRewards []*big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.Extend(&_Stakingcamp.TransactOpts, _endBlock, _rewardsPerBlock, _currentRemainingRewards, _newRemainingRewards)
}

// Extend is a paid mutator transaction binding the contract method 0x20e67c76.
//
// Solidity: function extend(uint256 _endBlock, uint256[] _rewardsPerBlock, uint256[] _currentRemainingRewards, uint256[] _newRemainingRewards) returns()
func (_Stakingcamp *StakingcampTransactorSession) Extend(_endBlock *big.Int, _rewardsPerBlock []*big.Int, _currentRemainingRewards []*big.Int, _newRemainingRewards []*big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.Extend(&_Stakingcamp.TransactOpts, _endBlock, _rewardsPerBlock, _currentRemainingRewards, _newRemainingRewards)
}

// NotifyExternalReward is a paid mutator transaction binding the contract method 0x50afa34b.
//
// Solidity: function notifyExternalReward(uint256 reward) returns()
func (_Stakingcamp *StakingcampTransactor) NotifyExternalReward(opts *bind.TransactOpts, reward *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "notifyExternalReward", reward)
}

// NotifyExternalReward is a paid mutator transaction binding the contract method 0x50afa34b.
//
// Solidity: function notifyExternalReward(uint256 reward) returns()
func (_Stakingcamp *StakingcampSession) NotifyExternalReward(reward *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.NotifyExternalReward(&_Stakingcamp.TransactOpts, reward)
}

// NotifyExternalReward is a paid mutator transaction binding the contract method 0x50afa34b.
//
// Solidity: function notifyExternalReward(uint256 reward) returns()
func (_Stakingcamp *StakingcampTransactorSession) NotifyExternalReward(reward *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.NotifyExternalReward(&_Stakingcamp.TransactOpts, reward)
}

// SetReceiverWhitelisted is a paid mutator transaction binding the contract method 0xa861a7a3.
//
// Solidity: function setReceiverWhitelisted(address receiver, bool whitelisted) returns()
func (_Stakingcamp *StakingcampTransactor) SetReceiverWhitelisted(opts *bind.TransactOpts, receiver common.Address, whitelisted bool) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "setReceiverWhitelisted", receiver, whitelisted)
}

// SetReceiverWhitelisted is a paid mutator transaction binding the contract method 0xa861a7a3.
//
// Solidity: function setReceiverWhitelisted(address receiver, bool whitelisted) returns()
func (_Stakingcamp *StakingcampSession) SetReceiverWhitelisted(receiver common.Address, whitelisted bool) (*types.Transaction, error) {
	return _Stakingcamp.Contract.SetReceiverWhitelisted(&_Stakingcamp.TransactOpts, receiver, whitelisted)
}

// SetReceiverWhitelisted is a paid mutator transaction binding the contract method 0xa861a7a3.
//
// Solidity: function setReceiverWhitelisted(address receiver, bool whitelisted) returns()
func (_Stakingcamp *StakingcampTransactorSession) SetReceiverWhitelisted(receiver common.Address, whitelisted bool) (*types.Transaction, error) {
	return _Stakingcamp.Contract.SetReceiverWhitelisted(&_Stakingcamp.TransactOpts, receiver, whitelisted)
}

// Stake is a paid mutator transaction binding the contract method 0xa694fc3a.
//
// Solidity: function stake(uint256 _tokenAmount) returns()
func (_Stakingcamp *StakingcampTransactor) Stake(opts *bind.TransactOpts, _tokenAmount *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "stake", _tokenAmount)
}

// Stake is a paid mutator transaction binding the contract method 0xa694fc3a.
//
// Solidity: function stake(uint256 _tokenAmount) returns()
func (_Stakingcamp *StakingcampSession) Stake(_tokenAmount *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.Stake(&_Stakingcamp.TransactOpts, _tokenAmount)
}

// Stake is a paid mutator transaction binding the contract method 0xa694fc3a.
//
// Solidity: function stake(uint256 _tokenAmount) returns()
func (_Stakingcamp *StakingcampTransactorSession) Stake(_tokenAmount *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.Stake(&_Stakingcamp.TransactOpts, _tokenAmount)
}

// UpdateRewardMultipliers is a paid mutator transaction binding the contract method 0xdd2da220.
//
// Solidity: function updateRewardMultipliers() returns()
func (_Stakingcamp *StakingcampTransactor) UpdateRewardMultipliers(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "updateRewardMultipliers")
}

// UpdateRewardMultipliers is a paid mutator transaction binding the contract method 0xdd2da220.
//
// Solidity: function updateRewardMultipliers() returns()
func (_Stakingcamp *StakingcampSession) UpdateRewardMultipliers() (*types.Transaction, error) {
	return _Stakingcamp.Contract.UpdateRewardMultipliers(&_Stakingcamp.TransactOpts)
}

// UpdateRewardMultipliers is a paid mutator transaction binding the contract method 0xdd2da220.
//
// Solidity: function updateRewardMultipliers() returns()
func (_Stakingcamp *StakingcampTransactorSession) UpdateRewardMultipliers() (*types.Transaction, error) {
	return _Stakingcamp.Contract.UpdateRewardMultipliers(&_Stakingcamp.TransactOpts)
}

// Withdraw is a paid mutator transaction binding the contract method 0x2e1a7d4d.
//
// Solidity: function withdraw(uint256 _tokenAmount) returns()
func (_Stakingcamp *StakingcampTransactor) Withdraw(opts *bind.TransactOpts, _tokenAmount *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "withdraw", _tokenAmount)
}

// Withdraw is a paid mutator transaction binding the contract method 0x2e1a7d4d.
//
// Solidity: function withdraw(uint256 _tokenAmount) returns()
func (_Stakingcamp *StakingcampSession) Withdraw(_tokenAmount *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.Withdraw(&_Stakingcamp.TransactOpts, _tokenAmount)
}

// Withdraw is a paid mutator transaction binding the contract method 0x2e1a7d4d.
//
// Solidity: function withdraw(uint256 _tokenAmount) returns()
func (_Stakingcamp *StakingcampTransactorSession) Withdraw(_tokenAmount *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.Withdraw(&_Stakingcamp.TransactOpts, _tokenAmount)
}

// WithdrawLPRewards is a paid mutator transaction binding the contract method 0xa1002a0f.
//
// Solidity: function withdrawLPRewards(address recipient, address lpTokenContract) returns()
func (_Stakingcamp *StakingcampTransactor) WithdrawLPRewards(opts *bind.TransactOpts, recipient common.Address, lpTokenContract common.Address) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "withdrawLPRewards", recipient, lpTokenContract)
}

// WithdrawLPRewards is a paid mutator transaction binding the contract method 0xa1002a0f.
//
// Solidity: function withdrawLPRewards(address recipient, address lpTokenContract) returns()
func (_Stakingcamp *StakingcampSession) WithdrawLPRewards(recipient common.Address, lpTokenContract common.Address) (*types.Transaction, error) {
	return _Stakingcamp.Contract.WithdrawLPRewards(&_Stakingcamp.TransactOpts, recipient, lpTokenContract)
}

// WithdrawLPRewards is a paid mutator transaction binding the contract method 0xa1002a0f.
//
// Solidity: function withdrawLPRewards(address recipient, address lpTokenContract) returns()
func (_Stakingcamp *StakingcampTransactorSession) WithdrawLPRewards(recipient common.Address, lpTokenContract common.Address) (*types.Transaction, error) {
	return _Stakingcamp.Contract.WithdrawLPRewards(&_Stakingcamp.TransactOpts, recipient, lpTokenContract)
}

// WithdrawStake is a paid mutator transaction binding the contract method 0x25d5971f.
//
// Solidity: function withdrawStake(uint256 amount) returns()
func (_Stakingcamp *StakingcampTransactor) WithdrawStake(opts *bind.TransactOpts, amount *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.contract.Transact(opts, "withdrawStake", amount)
}

// WithdrawStake is a paid mutator transaction binding the contract method 0x25d5971f.
//
// Solidity: function withdrawStake(uint256 amount) returns()
func (_Stakingcamp *StakingcampSession) WithdrawStake(amount *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.WithdrawStake(&_Stakingcamp.TransactOpts, amount)
}

// WithdrawStake is a paid mutator transaction binding the contract method 0x25d5971f.
//
// Solidity: function withdrawStake(uint256 amount) returns()
func (_Stakingcamp *StakingcampTransactorSession) WithdrawStake(amount *big.Int) (*types.Transaction, error) {
	return _Stakingcamp.Contract.WithdrawStake(&_Stakingcamp.TransactOpts, amount)
}

// StakingcampClaimedIterator is returned from FilterClaimed and is used to iterate over the raw logs and unpacked data for Claimed events raised by the Stakingcamp contract.
type StakingcampClaimedIterator struct {
	Event *StakingcampClaimed // Event containing the contract specifics and raw log

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
func (it *StakingcampClaimedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampClaimed)
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
		it.Event = new(StakingcampClaimed)
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
func (it *StakingcampClaimedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampClaimedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampClaimed represents a Claimed event raised by the Stakingcamp contract.
type StakingcampClaimed struct {
	User   common.Address
	Amount *big.Int
	Token  common.Address
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterClaimed is a free log retrieval operation binding the contract event 0x7e6632ca16a0ac6cf28448500b1a17d96c8b8163ad4c4a9b44ef5386cc02779e.
//
// Solidity: event Claimed(address indexed user, uint256 amount, address token)
func (_Stakingcamp *StakingcampFilterer) FilterClaimed(opts *bind.FilterOpts, user []common.Address) (*StakingcampClaimedIterator, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "Claimed", userRule)
	if err != nil {
		return nil, err
	}
	return &StakingcampClaimedIterator{contract: _Stakingcamp.contract, event: "Claimed", logs: logs, sub: sub}, nil
}

// WatchClaimed is a free log subscription operation binding the contract event 0x7e6632ca16a0ac6cf28448500b1a17d96c8b8163ad4c4a9b44ef5386cc02779e.
//
// Solidity: event Claimed(address indexed user, uint256 amount, address token)
func (_Stakingcamp *StakingcampFilterer) WatchClaimed(opts *bind.WatchOpts, sink chan<- *StakingcampClaimed, user []common.Address) (event.Subscription, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "Claimed", userRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampClaimed)
				if err := _Stakingcamp.contract.UnpackLog(event, "Claimed", log); err != nil {
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
func (_Stakingcamp *StakingcampFilterer) ParseClaimed(log types.Log) (*StakingcampClaimed, error) {
	event := new(StakingcampClaimed)
	if err := _Stakingcamp.contract.UnpackLog(event, "Claimed", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakingcampExitCompletedIterator is returned from FilterExitCompleted and is used to iterate over the raw logs and unpacked data for ExitCompleted events raised by the Stakingcamp contract.
type StakingcampExitCompletedIterator struct {
	Event *StakingcampExitCompleted // Event containing the contract specifics and raw log

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
func (it *StakingcampExitCompletedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampExitCompleted)
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
		it.Event = new(StakingcampExitCompleted)
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
func (it *StakingcampExitCompletedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampExitCompletedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampExitCompleted represents a ExitCompleted event raised by the Stakingcamp contract.
type StakingcampExitCompleted struct {
	User  common.Address
	Stake *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterExitCompleted is a free log retrieval operation binding the contract event 0x548aea05c5e3b6ba34acdf7b3ad06c7bb667ed71d1761e2c177167be0a9eb059.
//
// Solidity: event ExitCompleted(address user, uint256 stake)
func (_Stakingcamp *StakingcampFilterer) FilterExitCompleted(opts *bind.FilterOpts) (*StakingcampExitCompletedIterator, error) {

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "ExitCompleted")
	if err != nil {
		return nil, err
	}
	return &StakingcampExitCompletedIterator{contract: _Stakingcamp.contract, event: "ExitCompleted", logs: logs, sub: sub}, nil
}

// WatchExitCompleted is a free log subscription operation binding the contract event 0x548aea05c5e3b6ba34acdf7b3ad06c7bb667ed71d1761e2c177167be0a9eb059.
//
// Solidity: event ExitCompleted(address user, uint256 stake)
func (_Stakingcamp *StakingcampFilterer) WatchExitCompleted(opts *bind.WatchOpts, sink chan<- *StakingcampExitCompleted) (event.Subscription, error) {

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "ExitCompleted")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampExitCompleted)
				if err := _Stakingcamp.contract.UnpackLog(event, "ExitCompleted", log); err != nil {
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

// ParseExitCompleted is a log parse operation binding the contract event 0x548aea05c5e3b6ba34acdf7b3ad06c7bb667ed71d1761e2c177167be0a9eb059.
//
// Solidity: event ExitCompleted(address user, uint256 stake)
func (_Stakingcamp *StakingcampFilterer) ParseExitCompleted(log types.Log) (*StakingcampExitCompleted, error) {
	event := new(StakingcampExitCompleted)
	if err := _Stakingcamp.contract.UnpackLog(event, "ExitCompleted", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakingcampExitRequestedIterator is returned from FilterExitRequested and is used to iterate over the raw logs and unpacked data for ExitRequested events raised by the Stakingcamp contract.
type StakingcampExitRequestedIterator struct {
	Event *StakingcampExitRequested // Event containing the contract specifics and raw log

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
func (it *StakingcampExitRequestedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampExitRequested)
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
		it.Event = new(StakingcampExitRequested)
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
func (it *StakingcampExitRequestedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampExitRequestedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampExitRequested represents a ExitRequested event raised by the Stakingcamp contract.
type StakingcampExitRequested struct {
	User      common.Address
	ExitBlock *big.Int
	Raw       types.Log // Blockchain specific contextual infos
}

// FilterExitRequested is a free log retrieval operation binding the contract event 0xd9217a461a0f7f84171a8866118c3d92e943ba7c1ba89b819371f729b5cabcbc.
//
// Solidity: event ExitRequested(address user, uint256 exitBlock)
func (_Stakingcamp *StakingcampFilterer) FilterExitRequested(opts *bind.FilterOpts) (*StakingcampExitRequestedIterator, error) {

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "ExitRequested")
	if err != nil {
		return nil, err
	}
	return &StakingcampExitRequestedIterator{contract: _Stakingcamp.contract, event: "ExitRequested", logs: logs, sub: sub}, nil
}

// WatchExitRequested is a free log subscription operation binding the contract event 0xd9217a461a0f7f84171a8866118c3d92e943ba7c1ba89b819371f729b5cabcbc.
//
// Solidity: event ExitRequested(address user, uint256 exitBlock)
func (_Stakingcamp *StakingcampFilterer) WatchExitRequested(opts *bind.WatchOpts, sink chan<- *StakingcampExitRequested) (event.Subscription, error) {

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "ExitRequested")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampExitRequested)
				if err := _Stakingcamp.contract.UnpackLog(event, "ExitRequested", log); err != nil {
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

// ParseExitRequested is a log parse operation binding the contract event 0xd9217a461a0f7f84171a8866118c3d92e943ba7c1ba89b819371f729b5cabcbc.
//
// Solidity: event ExitRequested(address user, uint256 exitBlock)
func (_Stakingcamp *StakingcampFilterer) ParseExitRequested(log types.Log) (*StakingcampExitRequested, error) {
	event := new(StakingcampExitRequested)
	if err := _Stakingcamp.contract.UnpackLog(event, "ExitRequested", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakingcampExitedIterator is returned from FilterExited and is used to iterate over the raw logs and unpacked data for Exited events raised by the Stakingcamp contract.
type StakingcampExitedIterator struct {
	Event *StakingcampExited // Event containing the contract specifics and raw log

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
func (it *StakingcampExitedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampExited)
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
		it.Event = new(StakingcampExited)
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
func (it *StakingcampExitedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampExitedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampExited represents a Exited event raised by the Stakingcamp contract.
type StakingcampExited struct {
	User   common.Address
	Amount *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterExited is a free log retrieval operation binding the contract event 0x920bb94eb3842a728db98228c375ff6b00c5bc5a54fac6736155517a0a20a61a.
//
// Solidity: event Exited(address indexed user, uint256 amount)
func (_Stakingcamp *StakingcampFilterer) FilterExited(opts *bind.FilterOpts, user []common.Address) (*StakingcampExitedIterator, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "Exited", userRule)
	if err != nil {
		return nil, err
	}
	return &StakingcampExitedIterator{contract: _Stakingcamp.contract, event: "Exited", logs: logs, sub: sub}, nil
}

// WatchExited is a free log subscription operation binding the contract event 0x920bb94eb3842a728db98228c375ff6b00c5bc5a54fac6736155517a0a20a61a.
//
// Solidity: event Exited(address indexed user, uint256 amount)
func (_Stakingcamp *StakingcampFilterer) WatchExited(opts *bind.WatchOpts, sink chan<- *StakingcampExited, user []common.Address) (event.Subscription, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "Exited", userRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampExited)
				if err := _Stakingcamp.contract.UnpackLog(event, "Exited", log); err != nil {
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
func (_Stakingcamp *StakingcampFilterer) ParseExited(log types.Log) (*StakingcampExited, error) {
	event := new(StakingcampExited)
	if err := _Stakingcamp.contract.UnpackLog(event, "Exited", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakingcampExtendedIterator is returned from FilterExtended and is used to iterate over the raw logs and unpacked data for Extended events raised by the Stakingcamp contract.
type StakingcampExtendedIterator struct {
	Event *StakingcampExtended // Event containing the contract specifics and raw log

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
func (it *StakingcampExtendedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampExtended)
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
		it.Event = new(StakingcampExtended)
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
func (it *StakingcampExtendedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampExtendedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampExtended represents a Extended event raised by the Stakingcamp contract.
type StakingcampExtended struct {
	NewEndBlock        *big.Int
	NewRewardsPerBlock []*big.Int
	Raw                types.Log // Blockchain specific contextual infos
}

// FilterExtended is a free log retrieval operation binding the contract event 0x137c92cc7579cc4d6a2b109467cd475c205d1c136363ca854cc46d72f840d5de.
//
// Solidity: event Extended(uint256 newEndBlock, uint256[] newRewardsPerBlock)
func (_Stakingcamp *StakingcampFilterer) FilterExtended(opts *bind.FilterOpts) (*StakingcampExtendedIterator, error) {

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "Extended")
	if err != nil {
		return nil, err
	}
	return &StakingcampExtendedIterator{contract: _Stakingcamp.contract, event: "Extended", logs: logs, sub: sub}, nil
}

// WatchExtended is a free log subscription operation binding the contract event 0x137c92cc7579cc4d6a2b109467cd475c205d1c136363ca854cc46d72f840d5de.
//
// Solidity: event Extended(uint256 newEndBlock, uint256[] newRewardsPerBlock)
func (_Stakingcamp *StakingcampFilterer) WatchExtended(opts *bind.WatchOpts, sink chan<- *StakingcampExtended) (event.Subscription, error) {

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "Extended")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampExtended)
				if err := _Stakingcamp.contract.UnpackLog(event, "Extended", log); err != nil {
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
func (_Stakingcamp *StakingcampFilterer) ParseExtended(log types.Log) (*StakingcampExtended, error) {
	event := new(StakingcampExtended)
	if err := _Stakingcamp.contract.UnpackLog(event, "Extended", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakingcampExternalRewardsAddedIterator is returned from FilterExternalRewardsAdded and is used to iterate over the raw logs and unpacked data for ExternalRewardsAdded events raised by the Stakingcamp contract.
type StakingcampExternalRewardsAddedIterator struct {
	Event *StakingcampExternalRewardsAdded // Event containing the contract specifics and raw log

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
func (it *StakingcampExternalRewardsAddedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampExternalRewardsAdded)
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
		it.Event = new(StakingcampExternalRewardsAdded)
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
func (it *StakingcampExternalRewardsAddedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampExternalRewardsAddedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampExternalRewardsAdded represents a ExternalRewardsAdded event raised by the Stakingcamp contract.
type StakingcampExternalRewardsAdded struct {
	From   common.Address
	Token  common.Address
	Reward *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterExternalRewardsAdded is a free log retrieval operation binding the contract event 0x3ca3e2b750b23b0fb33120646ef2418edd82a6576afaa67069cfb626f08ca7dc.
//
// Solidity: event ExternalRewardsAdded(address indexed from, address token, uint256 reward)
func (_Stakingcamp *StakingcampFilterer) FilterExternalRewardsAdded(opts *bind.FilterOpts, from []common.Address) (*StakingcampExternalRewardsAddedIterator, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "ExternalRewardsAdded", fromRule)
	if err != nil {
		return nil, err
	}
	return &StakingcampExternalRewardsAddedIterator{contract: _Stakingcamp.contract, event: "ExternalRewardsAdded", logs: logs, sub: sub}, nil
}

// WatchExternalRewardsAdded is a free log subscription operation binding the contract event 0x3ca3e2b750b23b0fb33120646ef2418edd82a6576afaa67069cfb626f08ca7dc.
//
// Solidity: event ExternalRewardsAdded(address indexed from, address token, uint256 reward)
func (_Stakingcamp *StakingcampFilterer) WatchExternalRewardsAdded(opts *bind.WatchOpts, sink chan<- *StakingcampExternalRewardsAdded, from []common.Address) (event.Subscription, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "ExternalRewardsAdded", fromRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampExternalRewardsAdded)
				if err := _Stakingcamp.contract.UnpackLog(event, "ExternalRewardsAdded", log); err != nil {
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

// ParseExternalRewardsAdded is a log parse operation binding the contract event 0x3ca3e2b750b23b0fb33120646ef2418edd82a6576afaa67069cfb626f08ca7dc.
//
// Solidity: event ExternalRewardsAdded(address indexed from, address token, uint256 reward)
func (_Stakingcamp *StakingcampFilterer) ParseExternalRewardsAdded(log types.Log) (*StakingcampExternalRewardsAdded, error) {
	event := new(StakingcampExternalRewardsAdded)
	if err := _Stakingcamp.contract.UnpackLog(event, "ExternalRewardsAdded", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakingcampExternalRewardsClaimedIterator is returned from FilterExternalRewardsClaimed and is used to iterate over the raw logs and unpacked data for ExternalRewardsClaimed events raised by the Stakingcamp contract.
type StakingcampExternalRewardsClaimedIterator struct {
	Event *StakingcampExternalRewardsClaimed // Event containing the contract specifics and raw log

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
func (it *StakingcampExternalRewardsClaimedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampExternalRewardsClaimed)
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
		it.Event = new(StakingcampExternalRewardsClaimed)
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
func (it *StakingcampExternalRewardsClaimedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampExternalRewardsClaimedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampExternalRewardsClaimed represents a ExternalRewardsClaimed event raised by the Stakingcamp contract.
type StakingcampExternalRewardsClaimed struct {
	Receiver common.Address
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterExternalRewardsClaimed is a free log retrieval operation binding the contract event 0xb926cf6e0741528b1fa5617945fc3cf155c845682fe4057a501526892348a6c2.
//
// Solidity: event ExternalRewardsClaimed(address receiver)
func (_Stakingcamp *StakingcampFilterer) FilterExternalRewardsClaimed(opts *bind.FilterOpts) (*StakingcampExternalRewardsClaimedIterator, error) {

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "ExternalRewardsClaimed")
	if err != nil {
		return nil, err
	}
	return &StakingcampExternalRewardsClaimedIterator{contract: _Stakingcamp.contract, event: "ExternalRewardsClaimed", logs: logs, sub: sub}, nil
}

// WatchExternalRewardsClaimed is a free log subscription operation binding the contract event 0xb926cf6e0741528b1fa5617945fc3cf155c845682fe4057a501526892348a6c2.
//
// Solidity: event ExternalRewardsClaimed(address receiver)
func (_Stakingcamp *StakingcampFilterer) WatchExternalRewardsClaimed(opts *bind.WatchOpts, sink chan<- *StakingcampExternalRewardsClaimed) (event.Subscription, error) {

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "ExternalRewardsClaimed")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampExternalRewardsClaimed)
				if err := _Stakingcamp.contract.UnpackLog(event, "ExternalRewardsClaimed", log); err != nil {
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

// ParseExternalRewardsClaimed is a log parse operation binding the contract event 0xb926cf6e0741528b1fa5617945fc3cf155c845682fe4057a501526892348a6c2.
//
// Solidity: event ExternalRewardsClaimed(address receiver)
func (_Stakingcamp *StakingcampFilterer) ParseExternalRewardsClaimed(log types.Log) (*StakingcampExternalRewardsClaimed, error) {
	event := new(StakingcampExternalRewardsClaimed)
	if err := _Stakingcamp.contract.UnpackLog(event, "ExternalRewardsClaimed", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakingcampStakeWithdrawnIterator is returned from FilterStakeWithdrawn and is used to iterate over the raw logs and unpacked data for StakeWithdrawn events raised by the Stakingcamp contract.
type StakingcampStakeWithdrawnIterator struct {
	Event *StakingcampStakeWithdrawn // Event containing the contract specifics and raw log

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
func (it *StakingcampStakeWithdrawnIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampStakeWithdrawn)
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
		it.Event = new(StakingcampStakeWithdrawn)
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
func (it *StakingcampStakeWithdrawnIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampStakeWithdrawnIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampStakeWithdrawn represents a StakeWithdrawn event raised by the Stakingcamp contract.
type StakingcampStakeWithdrawn struct {
	Amount *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterStakeWithdrawn is a free log retrieval operation binding the contract event 0xa78b9f12a7da0df7ced737c5f83d0c05723bb5f43aab37e233b8627104148472.
//
// Solidity: event StakeWithdrawn(uint256 amount)
func (_Stakingcamp *StakingcampFilterer) FilterStakeWithdrawn(opts *bind.FilterOpts) (*StakingcampStakeWithdrawnIterator, error) {

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "StakeWithdrawn")
	if err != nil {
		return nil, err
	}
	return &StakingcampStakeWithdrawnIterator{contract: _Stakingcamp.contract, event: "StakeWithdrawn", logs: logs, sub: sub}, nil
}

// WatchStakeWithdrawn is a free log subscription operation binding the contract event 0xa78b9f12a7da0df7ced737c5f83d0c05723bb5f43aab37e233b8627104148472.
//
// Solidity: event StakeWithdrawn(uint256 amount)
func (_Stakingcamp *StakingcampFilterer) WatchStakeWithdrawn(opts *bind.WatchOpts, sink chan<- *StakingcampStakeWithdrawn) (event.Subscription, error) {

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "StakeWithdrawn")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampStakeWithdrawn)
				if err := _Stakingcamp.contract.UnpackLog(event, "StakeWithdrawn", log); err != nil {
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

// ParseStakeWithdrawn is a log parse operation binding the contract event 0xa78b9f12a7da0df7ced737c5f83d0c05723bb5f43aab37e233b8627104148472.
//
// Solidity: event StakeWithdrawn(uint256 amount)
func (_Stakingcamp *StakingcampFilterer) ParseStakeWithdrawn(log types.Log) (*StakingcampStakeWithdrawn, error) {
	event := new(StakingcampStakeWithdrawn)
	if err := _Stakingcamp.contract.UnpackLog(event, "StakeWithdrawn", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakingcampStakedIterator is returned from FilterStaked and is used to iterate over the raw logs and unpacked data for Staked events raised by the Stakingcamp contract.
type StakingcampStakedIterator struct {
	Event *StakingcampStaked // Event containing the contract specifics and raw log

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
func (it *StakingcampStakedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampStaked)
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
		it.Event = new(StakingcampStaked)
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
func (it *StakingcampStakedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampStakedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampStaked represents a Staked event raised by the Stakingcamp contract.
type StakingcampStaked struct {
	User   common.Address
	Amount *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterStaked is a free log retrieval operation binding the contract event 0x9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d.
//
// Solidity: event Staked(address indexed user, uint256 amount)
func (_Stakingcamp *StakingcampFilterer) FilterStaked(opts *bind.FilterOpts, user []common.Address) (*StakingcampStakedIterator, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "Staked", userRule)
	if err != nil {
		return nil, err
	}
	return &StakingcampStakedIterator{contract: _Stakingcamp.contract, event: "Staked", logs: logs, sub: sub}, nil
}

// WatchStaked is a free log subscription operation binding the contract event 0x9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d.
//
// Solidity: event Staked(address indexed user, uint256 amount)
func (_Stakingcamp *StakingcampFilterer) WatchStaked(opts *bind.WatchOpts, sink chan<- *StakingcampStaked, user []common.Address) (event.Subscription, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "Staked", userRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampStaked)
				if err := _Stakingcamp.contract.UnpackLog(event, "Staked", log); err != nil {
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
func (_Stakingcamp *StakingcampFilterer) ParseStaked(log types.Log) (*StakingcampStaked, error) {
	event := new(StakingcampStaked)
	if err := _Stakingcamp.contract.UnpackLog(event, "Staked", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakingcampWithdrawLPRewardsIterator is returned from FilterWithdrawLPRewards and is used to iterate over the raw logs and unpacked data for WithdrawLPRewards events raised by the Stakingcamp contract.
type StakingcampWithdrawLPRewardsIterator struct {
	Event *StakingcampWithdrawLPRewards // Event containing the contract specifics and raw log

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
func (it *StakingcampWithdrawLPRewardsIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampWithdrawLPRewards)
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
		it.Event = new(StakingcampWithdrawLPRewards)
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
func (it *StakingcampWithdrawLPRewardsIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampWithdrawLPRewardsIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampWithdrawLPRewards represents a WithdrawLPRewards event raised by the Stakingcamp contract.
type StakingcampWithdrawLPRewards struct {
	RewardsAmount *big.Int
	Recipient     common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterWithdrawLPRewards is a free log retrieval operation binding the contract event 0xdf1b625465761dd1a4330a9b3a21d4943183f301036528a3544f8d891fdce2c2.
//
// Solidity: event WithdrawLPRewards(uint256 indexed rewardsAmount, address indexed recipient)
func (_Stakingcamp *StakingcampFilterer) FilterWithdrawLPRewards(opts *bind.FilterOpts, rewardsAmount []*big.Int, recipient []common.Address) (*StakingcampWithdrawLPRewardsIterator, error) {

	var rewardsAmountRule []interface{}
	for _, rewardsAmountItem := range rewardsAmount {
		rewardsAmountRule = append(rewardsAmountRule, rewardsAmountItem)
	}
	var recipientRule []interface{}
	for _, recipientItem := range recipient {
		recipientRule = append(recipientRule, recipientItem)
	}

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "WithdrawLPRewards", rewardsAmountRule, recipientRule)
	if err != nil {
		return nil, err
	}
	return &StakingcampWithdrawLPRewardsIterator{contract: _Stakingcamp.contract, event: "WithdrawLPRewards", logs: logs, sub: sub}, nil
}

// WatchWithdrawLPRewards is a free log subscription operation binding the contract event 0xdf1b625465761dd1a4330a9b3a21d4943183f301036528a3544f8d891fdce2c2.
//
// Solidity: event WithdrawLPRewards(uint256 indexed rewardsAmount, address indexed recipient)
func (_Stakingcamp *StakingcampFilterer) WatchWithdrawLPRewards(opts *bind.WatchOpts, sink chan<- *StakingcampWithdrawLPRewards, rewardsAmount []*big.Int, recipient []common.Address) (event.Subscription, error) {

	var rewardsAmountRule []interface{}
	for _, rewardsAmountItem := range rewardsAmount {
		rewardsAmountRule = append(rewardsAmountRule, rewardsAmountItem)
	}
	var recipientRule []interface{}
	for _, recipientItem := range recipient {
		recipientRule = append(recipientRule, recipientItem)
	}

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "WithdrawLPRewards", rewardsAmountRule, recipientRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampWithdrawLPRewards)
				if err := _Stakingcamp.contract.UnpackLog(event, "WithdrawLPRewards", log); err != nil {
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
func (_Stakingcamp *StakingcampFilterer) ParseWithdrawLPRewards(log types.Log) (*StakingcampWithdrawLPRewards, error) {
	event := new(StakingcampWithdrawLPRewards)
	if err := _Stakingcamp.contract.UnpackLog(event, "WithdrawLPRewards", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StakingcampWithdrawnIterator is returned from FilterWithdrawn and is used to iterate over the raw logs and unpacked data for Withdrawn events raised by the Stakingcamp contract.
type StakingcampWithdrawnIterator struct {
	Event *StakingcampWithdrawn // Event containing the contract specifics and raw log

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
func (it *StakingcampWithdrawnIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StakingcampWithdrawn)
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
		it.Event = new(StakingcampWithdrawn)
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
func (it *StakingcampWithdrawnIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StakingcampWithdrawnIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StakingcampWithdrawn represents a Withdrawn event raised by the Stakingcamp contract.
type StakingcampWithdrawn struct {
	User   common.Address
	Amount *big.Int
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterWithdrawn is a free log retrieval operation binding the contract event 0x7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d5.
//
// Solidity: event Withdrawn(address indexed user, uint256 amount)
func (_Stakingcamp *StakingcampFilterer) FilterWithdrawn(opts *bind.FilterOpts, user []common.Address) (*StakingcampWithdrawnIterator, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Stakingcamp.contract.FilterLogs(opts, "Withdrawn", userRule)
	if err != nil {
		return nil, err
	}
	return &StakingcampWithdrawnIterator{contract: _Stakingcamp.contract, event: "Withdrawn", logs: logs, sub: sub}, nil
}

// WatchWithdrawn is a free log subscription operation binding the contract event 0x7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d5.
//
// Solidity: event Withdrawn(address indexed user, uint256 amount)
func (_Stakingcamp *StakingcampFilterer) WatchWithdrawn(opts *bind.WatchOpts, sink chan<- *StakingcampWithdrawn, user []common.Address) (event.Subscription, error) {

	var userRule []interface{}
	for _, userItem := range user {
		userRule = append(userRule, userItem)
	}

	logs, sub, err := _Stakingcamp.contract.WatchLogs(opts, "Withdrawn", userRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StakingcampWithdrawn)
				if err := _Stakingcamp.contract.UnpackLog(event, "Withdrawn", log); err != nil {
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
func (_Stakingcamp *StakingcampFilterer) ParseWithdrawn(log types.Log) (*StakingcampWithdrawn, error) {
	event := new(StakingcampWithdrawn)
	if err := _Stakingcamp.contract.UnpackLog(event, "Withdrawn", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
