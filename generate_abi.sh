#!/bin/bash

/usr/bin/solc openzeppelin-solidity/=./node_modules/openzeppelin-solidity/ --abi ./contracts/LiquidityMiningCampaign.sol --allow-paths '' -o ./build

#for f in `ls ./contracts/*.sol`; do 
#    /usr/bin/solc openzeppelin-solidity/=./node_modules/openzeppelin-solidity/ --abi $f --allow-paths '' -o ./build
#done

