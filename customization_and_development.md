[← Back to main documentation](README.md)

# Customization and Development Guide

This guide provides detailed instructions for customizing and developing the Gridlock CLI.

## Prerequisites

Setting up the CLI requires three essential components:

1. **Docker Network**: Required for local development and testing

   ```sh
   docker network create gridlock-net
   ```

   Note: This is only needed if you're running other containers locally (Guardian Nodes, MongoDB, NATS). If you're connecting to internet-based services, you don't need this network.

2. **Orchestration Node**: Required for network operations

   - Follow the [Orch Node Setup Guide](https://github.com/GridlockNetwork/orch-node) to get started

3. **Guardian Nodes**: Required for key management
   - Follow the [Guardian Node Setup Guide](https://github.com/GridlockNetwork/guardian-node) to get started

## Configuration

The CLI supports two configuration options:

1. Default config (baked into the image)
2. User config (overrides default)

We recommend storing your config file at the absolute path: `/Users/USERNAME/.gridlock-cli/.env` (replace `USERNAME` with your actual username).

To run with a custom configuration:

```sh
docker run --rm --name gridlock-cli \
  -v /Users/USERNAME/.gridlock-cli/.env:/app/.env \
  gridlocknetwork/gridlock-cli:latest
```

## Local Development Setup

To run the project locally, copy and run these commands:

```sh
npm install
npm run build
npm link
```

When developing the CLI, you must use `npm run dev` to automatically rebuild the project when you make changes. This is crucial because:

1. The global `gridlock` command is linked to your project directory
2. Changes to your code will NOT be reflected in the CLI unless you are actively running `npm run dev`
3. You must keep the `npm run dev` process running while making changes

## Customizing Docker Compose

The default docker-compose setup uses standard configurations. To customize:

1. Create a `docker-compose.override.yml` file
2. Add your custom configurations
3. Run `docker compose up`

Example override file:

```yaml
version: '3.8'
services:
  guardian-node-1:
    environment:
      - CUSTOM_ENV_VAR=value
    volumes:
      - ./custom-storage:/var/lib/gridlock/node
  orch-node:
    environment:
      - API_KEY=your-api-key
      - BASE_URL=your-base-url
```

## Running the Example

The example demonstrates a complete workflow. To run it:

1. Configure `exampleUsage.ts` with your guardian details:

```ts
USER_EMAIL = 'your-email@example.com';
USER_PASSWORD = 'your-password';
USER_NAME = 'Your Name';
RECOVERY_PASSWORD = 'your-recovery-password';
BLOCKCHAINS = ['solana'];
CLOUD_GUARDIANS = [
  {
    nodeId: 'your-node-id',
    networkingPublicKey: 'your-networking-key',
    e2ePublicKey: 'your-e2e-key',
  },
  // Add more guardians as needed
];
```

2. Run the example:

```sh
gridlock run-example -i
```

## Advanced Configuration

For more advanced configuration options, see:

- [Orch Node Configuration Guide](https://github.com/GridlockNetwork/orch-node)
- [Guardian Node Configuration Guide](https://github.com/GridlockNetwork/guardian-node)
- [System Overview](SystemOverview.md)
