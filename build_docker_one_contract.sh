#!/bin/bash

CONTRACT_NAME=NonCompoundingRewardsPool
CONTRACT_PATH=contracts/V2
GO_PKG=contracts

docker build -t node:10.17-mine - << EOF
FROM node:10.17
WORKDIR /.npm
RUN chown -R $(id -u):$(id -g) /.npm
WORKDIR /.config
RUN chown -R $(id -u):$(id -g) /.config
EOF

docker run --rm -ti --user $(id -u):$(id -g) -v $(pwd):/src --workdir /src node:10.17-mine npm install

docker run --rm --user $(id -u):$(id -g) -v $(pwd):/root ethereum/solc:0.6.12 \
  openzeppelin-solidity/=/root/node_modules/openzeppelin-solidity/ --abi /root/${CONTRACT_PATH}/${CONTRACT_NAME}.sol --allow-paths '' -o /root/build

docker build -t abigen:mine - << EOF
FROM ethereum/solc:0.6.12 as build

FROM golang:latest
COPY --from=build /usr/bin/solc /usr/bin/
RUN git clone https://github.com/ethereum/go-ethereum
RUN cd ./go-ethereum && make && make devtools

ENTRYPOINT ["abigen"]
EOF

docker run --rm --user $(id -u):$(id -g) -v $(pwd)/build:/build -v $(pwd)/out:/out abigen:mine --abi=/build/${CONTRACT_NAME}.abi --pkg=${GO_PKG} --out=/out/${CONTRACT_NAME}.go