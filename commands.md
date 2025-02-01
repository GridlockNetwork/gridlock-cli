# Start guardian containers

create new containers

```bash
docker run --name owner-guardian -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
docker run --name guardian1 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
docker run --name guardian2 -e STORAGE_DIR=./backend/test/data -e NODE_DB=/var/lib/gridlock/node/node.db -e NATS_ADDRESS=nats://stagingnats.gridlock.network:4222 ghcr.io/gridlocknetwork/mvp/partner-node:latest
```

or start existing containers

```bash
docker start owner-guardian && docker logs -f owner-guardian
docker start guardian1 && docker logs -f guardian1
docker start guardian2 && docker logs -f guardian2
```

# Create a user

```bash
clear && node dist/gridlock.js create-user -n "Bertram Gilfoyle" -e 1@1.com -p password
```

# Add a guardian to a user

This function adds a guardian to the user. First add a guardian and label it the owner guardian, then add two more.

```bash
clear && node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n ownerGuardian -i f08f4833-3ce1-4e0b-9de2-96cd969df434 -k s6VTHsJ5uqnFjrFVqerBjgGPcw5zZ2cVdKwj9XEyLUU -o
node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n guardian1 -i 40ffd6a1-8191-4bc5-a1ba-ec300c8da1c6 -k 7l9XVjtAax40b7gfbBohR5IgU7D2Polnta/YI0FfplE=
node dist/gridlock.js add-guardian -e 1@1.com -p password -t cloud -n guardian2 -i e2bb515f-31e6-4f12-a80d-a4bd8a1215d8 -k Zos8ukwJEL7TFvrtinuV9AQNC2if3rwcb55HJLnpIlQ=
```

# Create a wallet

Create a wallet for a user.

```bash
clear && node dist/gridlock.js create-wallet -e 1@1.com -p password -b solana
```

# Sign message

Sign a message for the user.

```bash
clear && node dist/gridlock.js sign -e 1@1.com -p password -a AaNcUWwzQ8ZBZR2nBdADXYqEq5PZo7ashBpmhiDWZ7S8 -m hello
```

# Verify signature

verify signature

```bash
clear && node dist/gridlock.js verify -e 1@1.com -p password -a 84hdoEcAKgEyydnubEbUM7zVDUaYy1PhFxhaXvFSEviM -m hello -b solana -s ecce166f0fc01130c7dbd8d7ecc5cdc8f80fdcc3af75789ca609519f6450400cd42fd7732f5677ddf15b6f9c77a3e081d3995ae0085e3e3a3e26cbc746b00406
```

# Extra debug functions

Functions for testing that will be removed.

## Show network

```bash
clear && node dist/gridlock.js show-network -e 1@1.com
```

```bash
clear && node dist/gridlock-utils.js test -i "vYtCNyzl0+ScCGICSci/+/sBPGOfgi9wGBId3CkPQKk=" -p password -m "y8PHxBAzYSaaOLK2cvwag51xmtR+4JCR5H8UVYrtqwnxrW1BdnOFXTstYzH5m0A8ptG/NAe7C/bmNAyaySsm0ybjnB10OPTBLSzKm1qgnf+35zCC'" -s "ImoxPRAF6qAmeS38suP1hYxsoR09YK+UN4hlptPVqUk="
```
