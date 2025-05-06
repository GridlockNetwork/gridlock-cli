# Gridlock CLI

The Gridlock CLI is your command-line interface to the Gridlock Network. It provides a simple way to interact with the network, manage your guardians, and handle your crypto assets securely.

The CLI works in conjunction with the [Orchestration Node](https://github.com/GridlockNetwork/orch-node) and [Guardian Nodes](https://github.com/GridlockNetwork/guardian-node) to provide a complete, secure crypto management solution.

To understand how the full system works, see [System Overview](./SystemOverview.md).  
Related: [Orch Node](https://github.com/GridlockNetwork/orch-node) | [Guardian Node](https://github.com/GridlockNetwork/guardian-node) | [SDK](https://github.com/GridlockNetwork/gridlock-sdk)

## Quick Start

1. Start the Gridlock network infrastructure:

```sh
docker network create gridlock-net
docker compose up
```

This will start:

- The orchestration node (http://localhost:5310)
- Three guardian nodes
- The database (MongoDB)
- The peer-to-peer networking layer

2. In a new terminal, install and run the CLI:

```sh
npm install -g .
gridlock run-example
```

Review the logs from the first terminal for guardian output.

For detailed customization options, local development setup, and advanced configuration, see [Customization and Development Guide](./customization_and_development.md).

## Join the Network

This code is yours to use — but it's even better when you're part of the official Gridlock network.

By running [guardian nodes](https://github.com/GridlockNetwork/guardian-node), you can earn rewards while helping secure the network.

Join the community: [gridlock.network/join](https://gridlock.network/join)
