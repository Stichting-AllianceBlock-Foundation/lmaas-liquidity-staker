#!/bin/bash

docker build -t node:10.17-mine - << EOF
FROM node:10.17
WORKDIR /.npm
RUN chown -R $(id -u):$(id -g) /.npm
WORKDIR /.config
RUN chown -R $(id -u):$(id -g) /.config
EOF

docker run --rm -ti --user $(id -u):$(id -g) -v $(pwd):/src --workdir /src node:10.17-mine npm install

docker build --no-cache -t abigen:0.1 -f- . << EOF
FROM ethereum/solc:0.6.12 as build

FROM golang:latest

COPY --from=build /usr/bin/solc /usr/bin/
RUN git clone https://github.com/ethereum/go-ethereum
RUN cd ./go-ethereum && make && make devtools

WORKDIR /contracts

COPY . .

RUN chmod a+x ./generate_*.sh

RUN ./generate_abi.sh

ENTRYPOINT ["./generate_go.sh"]
EOF

docker run \
  --rm \
  --user $(id -u):$(id -g) \
  -v $(pwd)/go-staker:/out \
  abigen:0.1 
