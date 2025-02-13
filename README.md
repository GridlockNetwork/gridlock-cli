# Gridlock CLI Getting Started

The CLI is a command line tool for integrating with the Gridlock network. This CLI has examples that show how to interact with the network.

## Setup SDK

The SDK is used to connect a client, like the CLI or another client of your making, to the Gridlock system. It ensures that the client has an easier time integrating with the system.

```sh
git clone https://github.com/GridlockNetwork/gridlock-sdk
cd gridlock-sdk
yarn
yarn link
yarn build:watch
```

## Setup CLI

```sh
git clone https://github.com/GridlockNetwork/gridlock-cli
cd gridlock-cli
yarn link gridlock-sdk
yarn
yarn build:watch
```

## Setup Orchestration Node

The orchestration node is the heart of the Gridlock network. It passes information between clients and guardians and facilitates complex interactions to create new wallets or sign transactions. As the name implies, the orchestration node makes the complex system work, but it is NOT a gatekeeper and cannot see any of the information being passed back and forth.

#### 1. Install GMP and Node version 18

**MacOS:**

```sh
brew install gmp
brew install n
n 18
```

## Run orch node

```sh
git clone https://github.com/GridlockNetwork/gridlock-orch-node
# add environment file .env with correct parameters to repo (see below)
yarn
yarn compile
yarn run dev
```

## Run guardian containers

Next, you need to create guardians that will be part of the network. To do this, run Docker containers that handle guardian tasks. These containers can run on any computer, either locally or in the cloud.

### Prerequisites

Before running the guardian containers, ensure that Docker is installed on your system.

#### Install Docker

**MacOS:**

```sh
brew install --cask docker
open --background -a Docker
```

#### Get personal access token from Github (PAT)

1. create a classic github token with ful repo permissions and read:packages
   https://github.com/settings/tokens

2. login with your terminal

```sh
echo YOUR_GITHUB_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

3. start running docker containers for various guardians. Be sure to watch for the begging of the logs to find the node ID and public key of the guardian node. You will need this later. The output will look like this.

```sh
INFO node: Retrieved node identity: node id: d1095ffb-de97-40ac-89e2-e10169ce3881, public key: "UBEFDYW24MU74YNMVOG5GGQUFJFFVLEAAL4VWYFTMUC3XZKNYQ54ZE4H"
```

Start the first container for the owner guardian. This represents you

```sh
docker run --name owner-guardian -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
```

Start another container for "guardian1" which is ideally a guardian you are running on a different computer.

```sh
docker run --name guardian1 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
```

Start another container for "guardian2"

```sh
docker run --name guardian2 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
```

You now have three guardians running. You can see the logs by running one of these commands

```sh
docker start owner-guardian && docker logs -f partner-nodes-1
docker start guardian-1 && docker logs -f partner-nodes-1
docker start guardian-1 && docker logs -f partner-nodes-1
```

Now you can start messing with the CLI

```sh
 node dist/gridlock.js help
```

Read the [commands documentation](./commands.md) for information on how to run commands.
