# Gridlock CLI Getting Started

The Gridlock CLI is a command-line tool for interacting with the Gridlock network. This guide will help you set up and run the necessary components.

## Components Overview

You'll need to set up four main components:

1. Gridlock SDK - Core library for interacting with the network
2. Gridlock CLI - Command-line interface tool
3. Orchestration Node - Central node for coordinating network operations
4. Guardian Nodes - Network participants that help secure operations

## 1. Setting Up the SDK

The SDK provides the foundation for connecting clients to the Gridlock system:

```sh
git clone https://github.com/GridlockNetwork/gridlock-sdk
cd gridlock-sdk
yarn
yarn link
yarn build:watch
```

## 2. Setting Up the CLI

```sh
git clone https://github.com/GridlockNetwork/gridlock-cli
cd gridlock-cli
yarn link gridlock-sdk
yarn
yarn build:watch
```

## 3. Setting Up the Orchestration Node

The orchestration node coordinates communication between clients and guardians. While it facilitates interactions, it cannot access the encrypted information being transmitted.

### Prerequisites

#### Install GMP and Node.js 18

**MacOS:**

```sh
brew install gmp
brew install n
n 18
```

### Running the Orchestration Node

```sh
git clone https://github.com/GridlockNetwork/gridlock-orch-node
# Create a .env file with required parameters
yarn
yarn compile
yarn run dev
```

## 4. Setting Up Guardian Nodes

Guardians are essential network participants that help secure operations. You'll need to run multiple guardian nodes using Docker containers.

### Prerequisites

#### Install Docker (MacOS)

```sh
brew install --cask docker
open --background -a Docker
```

#### Configure GitHub Access

1. Create a classic GitHub token with full repo permissions and read:packages at:
   https://github.com/settings/tokens

2. Login to the GitHub Container Registry:

```sh
echo YOUR_GITHUB_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### Running Guardian Containers

When starting each guardian, note the node ID and public key from the initial logs - you will need these values later for configuration:

```
INFO node: Retrieved node identity: node id: d1095ffb-de97-40ac-89e2-e10169ce3881, public key: "UBEFDYW24MU74YNMVOG5GGQUFJFFVLEAAL4VWYFTMUC3XZKNYQ54ZE4H"
```

Be sure to save these values as they appear in the logs when you first start each guardian container.

#### 1. Start Owner Guardian

```sh
docker run --name owner-guardian \
  -e STORAGE_DIR=./backend/test/data \
  -e NODE_DB=/var/lib/gridlock/node/node.db \
  -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 \
  ghcr.io/gridlocknetwork/mvp/partner-node:latest
```

#### 2. Start First Guardian

```sh
docker run --name guardian1 \
  -e STORAGE_DIR=./backend/test/data \
  -e NODE_DB=/var/lib/gridlock/node/node.db \
  -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 \
  ghcr.io/gridlocknetwork/mvp/partner-node:latest
```

#### 3. Start Second Guardian

```sh
docker run --name guardian2 \
  -e STORAGE_DIR=./backend/test/data \
  -e NODE_DB=/var/lib/gridlock/node/node.db \
  -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 \
  ghcr.io/gridlocknetwork/mvp/partner-node:latest
```

### Monitoring Guardian Logs

View logs for any guardian using:

```sh
docker start owner-guardian && docker logs -f owner-guardian
docker start guardian1 && docker logs -f guardian1
docker start guardian2 && docker logs -f guardian2
```

## Using the CLI

To see available commands:

```sh
node dist/gridlock.js help
```

For detailed information about available commands, see the [commands documentation](./commands.md).
