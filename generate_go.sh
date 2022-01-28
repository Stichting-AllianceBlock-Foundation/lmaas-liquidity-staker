#!/bin/bash

mkdir -p /out/staker
abigen --abi=./build/LiquidityMiningCampaign.abi --pkg=staker --out=/out/staker/LiquidityMiningCampaign.go

mkdir -p /out/staker/lock
abigen --abi=./build/LockScheme.abi --pkg=lock --out=/out/staker/lock/LockScheme.go

#for f in `ls ./build/*.abi`; do 
#    abigen --abi=$f --pkg=staker --out=/out/staker/$(echo $f | cut -d'/' -f3 | cut -d'.' -f1).go
#done

