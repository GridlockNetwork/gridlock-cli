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

When starting each guardian, you will see important information needed for use later when adding guardians. The information you are looking for looks like this:

```
INFO node: Retrieved node identity: node id: 0d9c4dec-11b0-4e25-816b-ee285e8fc7c7, public key: "UBUKP574NFLPW37V5XBVDVIKNTY2XQCBNS3HNNTZFTLLI6SRRIYIDIGV", E2E public key: "+ekhdwTEHWZK2pXfTZ4uYiPDHi2lLaEN15qBdFiMgXs="
```

#### 1. Start three guardian containers

```sh
for i in {1..3}; do
  docker run -d --name guardian-$i \
    -e STORAGE_DIR=./node \
    -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 \
    guardian-node
done
```

#### 2. See the tops of the logs of the guardian containers to determine the node IDs and public keys

View logs for any guardian using:

```sh
for i in {1..3}; do
  echo "Logs for guardian-$i:"
  docker logs guardian-$i | head -n 3
  echo "------------------------"
done
```

## Using the CLI

To see available commands:

```sh
node dist/gridlock.js help
```

For detailed information about available commands, see the [commands documentation](./commands.md).
