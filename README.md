# Gridlock SDK CLI

CLI for quick actions: user creation, wallet creation, wallet actions (sign message, verify message), verify user network etc.

### Prerequisite
1. Run the staging server locally and checkout to the branch `gridlock-sdk`.
2. Run `ngrok http 8080` and keep the generated link for later use.

## How to run all on staging:

1. **Run partner guardians:**

   ```sh
   docker run --name partner-nodes-1 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest

   docker run --name partner-nodes-2 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
   ```

2. **Grab the public key and nodeId from the docker logs for both partner guardians and add them to the server:**

   [Link to partnerGuardians.js](https://github.com/GridlockNetwork/gridlock-server-nodejs/blob/56314686564358e3c5d8f77590842d9f930bf8d1/src/store/constants/partnerGuardians.js#L115)

   Just add the nodeId and public Key there. Leave the other properties of the objects untouched.

3. **Create a folder on your local machine and clone the gridlock-pg-sdk repository:**

   ```sh
   git clone https://github.com/GridlockNetwork/gridlock-pg-sdk
   ```

4. **Run the following commands in the gridlock-pg-sdk directory:**

   ```sh
   cd gridlock-pg-sdk
   yarn
   yarn link
   yarn build:watch
   ```

   Leave the terminal running for development.

5. **Using other terminal window checkout and clone the gridlock-sdk-cli repository in the same parent folder as the gridlock-pg-sdk:**

   ```sh
   git clone https://github.com/GridlockNetwork/gridlock-sdk-cli
   cd gridlock-sdk-cli
   yarn
   yarn link "gridlock-pg-sdk"
   ```

6. **Run the CLI:**

   ```sh
   node gridlock-cli.js help
   ```

   Then run:

   ```sh
   node gridlock-cli.js <command-name> -h
   ```

   to see the options for that command.

When you make a modification on the gridlock-pg-sdk side, because the `yarn build:watch` was run, it will automatically reflect in the CLI part without rebuilding.

Test and enjoy!
