# Gridlock Network Setup Guide

This guide will walk you through setting up the complete Gridlock network infrastructure, including the orchestration node, guardian nodes, and CLI.

## 1. Setting Up the Orchestration Node

The orchestration node handles overall network management, including the database and NATS distributed networking framework.

```bash
# Download setup files
curl -o orch-node-compose.yml https://raw.githubusercontent.com/GridlockNetwork/orch-node/main/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/GridlockNetwork/orch-node/main/example.env
curl -o nats-server.conf https://raw.githubusercontent.com/GridlockNetwork/orch-node/main/nats-server.conf

# Create a local network so all processes can talk to each other
docker network create gridlock-net 2>/dev/null || true

# Start the orchestration node, database, and networking layer
docker compose -f orch-node-compose.yml -p gridlock-orch-stack up
```

## 2. Setting Up Guardian Nodes

Run three guardian nodes at once to test a minimum setup

```bash
# Download the guardian nodes setup files
curl -o guardian-nodes-compose.yml https://raw.githubusercontent.com/GridlockNetwork/guardian-node/main/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/GridlockNetwork/guardian-node/main/example.env

# Start the guardian nodes
docker compose -f guardian-nodes-compose.yml up
```

## 3. Setting Up the CLI

Set up the Gridlock CLI to interact with the network:

1. Download the setup files for the CLI demo:

```bash
curl -o demo.env https://raw.githubusercontent.com/GridlockNetwork/gridlock-cli/refs/heads/main/demo.env
```

2. Configure your guardians for the demo:
   - Look for the guardian configuration details in the output logs from step 2
   - Edit the `demo.json` file, replacing the placeholder values with your guardian information:

```json
{
  "guardians": [
    {
      "name": "GUARDIAN_1_NAME",
      "nodeId": "GUARDIAN_1_NODE_ID",
      "networkingPublicKey": "GUARDIAN_1_NETWORKING_PUBLIC_KEY",
      "e2ePublicKey": "GUARDIAN_1_E2E_PUBLIC_KEY"
    }
  ]
}
```

3. Install and run the CLI:

```bash
npm install -g gridlock-cli
gridlock run-example
```

## Next Steps

For advanced configuration options, see the [Customization and Development Guide](./customization_and_development.md).
